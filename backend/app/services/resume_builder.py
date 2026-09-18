import json
import re
import uuid
import logging

from fastapi import HTTPException, status
from groq import AuthenticationError, BadRequestError, Groq, NotFoundError, RateLimitError

from ..config import get_settings
from ..schemas.resume_builder import ResumeContent
from ..models import ResumeBuilderProfile, StudentResume, User
from sqlalchemy import select
from sqlalchemy.orm import Session

PROMPT_VERSION = "resume-groq-v2"

logger = logging.getLogger(__name__)


def _json_safe(value):
    """Recursively convert UUIDs (and similar non-JSON types) to strings."""
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, dict):
        return {k: _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(v) for v in value]
    return value


def _entry_key(entry: dict) -> tuple[str, str]:
    return (str(entry.get("title") or "").strip().casefold(), str(entry.get("subtitle") or "").strip().casefold())


def sync_uploaded_resume_to_builder(user: User, resume: StudentResume, db: Session) -> dict:
    """Merge parsed upload facts once without overwriting student-entered values."""
    parsed = (resume.parsed_data or {}).get("builder") or {}
    profile = db.scalar(select(ResumeBuilderProfile).where(ResumeBuilderProfile.user_id == user.id))
    if not profile:
        student = user.student_profile
        education = [] if not student else [{"title": student.program.name, "subtitle": student.college.name,
            "start_date": None, "end_date": student.current_year, "location": None, "description": None,
            "bullets": [], "technologies": [], "url": None}]
        profile = ResumeBuilderProfile(user_id=user.id, educations=education, experiences=[], projects=[],
            certifications=[], achievements=[], languages=[])
        db.add(profile); db.flush()

    imported = {"fields": [], "entries": 0}
    for field in ("professional_summary", "linkedin_url", "github_url", "portfolio_url"):
        if not getattr(profile, field) and parsed.get(field):
            setattr(profile, field, parsed[field]); imported["fields"].append(field)
    for field in ("educations", "experiences", "projects", "certifications"):
        existing = list(getattr(profile, field) or [])
        keys = {_entry_key(item) for item in existing}
        additions = [item for item in parsed.get(field, []) if _entry_key(item) not in keys and _entry_key(item)[0]]
        if additions:
            setattr(profile, field, existing + additions); imported["entries"] += len(additions)
    for field in ("achievements", "languages"):
        existing = list(getattr(profile, field) or []); seen = {str(x).casefold() for x in existing}
        additions = [x for x in parsed.get(field, []) if str(x).casefold() not in seen]
        if additions:
            setattr(profile, field, existing + additions); imported["entries"] += len(additions)
    resume.parsed_data = {**(resume.parsed_data or {}), "builder_sync": {"status": "synced", **imported}}
    db.flush()
    return imported


def _resume_json_schema() -> dict:
    nullable = {"anyOf": [{"type": "string"}, {"type": "null"}]}
    entry = {
        "type": "object",
        "properties": {
            "title": {"type": "string"}, "subtitle": nullable,
            "start_date": nullable, "end_date": nullable, "location": nullable,
            "description": nullable, "bullets": {"type": "array", "items": {"type": "string"}},
            "technologies": {"type": "array", "items": {"type": "string"}}, "url": nullable,
        },
        "required": ["title", "subtitle", "start_date", "end_date", "location", "description", "bullets", "technologies", "url"],
        "additionalProperties": False,
    }
    return {
        "type": "object",
        "properties": {
            "professional_summary": {"type": "string"},
            "skills": {"type": "array", "items": {"type": "string"}},
            "educations": {"type": "array", "items": entry},
            "experiences": {"type": "array", "items": entry},
            "projects": {"type": "array", "items": entry},
            "certifications": {"type": "array", "items": entry},
            "achievements": {"type": "array", "items": {"type": "string"}},
            "languages": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["professional_summary", "skills", "educations", "experiences", "projects", "certifications", "achievements", "languages"],
        "additionalProperties": False,
    }


def _fact_safe_fallback(snapshot: dict) -> ResumeContent:
    role = (snapshot.get("target_role") or "professional").strip()
    skills = [str(value).strip() for value in snapshot.get("confirmed_skills", []) if str(value).strip()]
    supplied = (snapshot.get("professional_summary") or "").strip()
    if len(supplied) < 30:
        skill_text = f" with verified skills in {', '.join(skills[:6])}" if skills else ""
        supplied = f"Student preparing for a {role} role{skill_text}, with education and project details documented below."
    return ResumeContent.model_validate({
        "professional_summary": supplied, "skills": skills,
        "educations": snapshot.get("educations") or [], "experiences": snapshot.get("experiences") or [],
        "projects": snapshot.get("projects") or [], "certifications": snapshot.get("certifications") or [],
        "achievements": snapshot.get("achievements") or [], "languages": snapshot.get("languages") or [],
    })


def generate_resume_content(snapshot: dict) -> tuple[ResumeContent, str]:
    settings = get_settings()
    snapshot = _json_safe(snapshot)
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="Resume generation is not configured. Add GROQ_API_KEY in backend/.env.")
    client = Groq(api_key=settings.groq_api_key, timeout=90.0, max_retries=2)
    prompt = ("You are an ATS resume writing assistant. Use ONLY facts in the supplied snapshot. Never invent employers, dates, degrees, marks, metrics, links, certifications, technologies, or achievements. "
        "Improve wording using concise action verbs, preserve all factual meaning, and align naturally to target_role. Use null for missing optional entry fields and [] for missing lists. "
        "professional_summary MUST be at least 40 words (roughly 250+ characters) — write a full paragraph covering the candidate's background, key skills, and target_role fit, never a short phrase or single sentence fragment.")
    try:
        response = client.chat.completions.create(model=settings.groq_model,
            messages=[{"role":"system","content":prompt},{"role":"user","content":json.dumps(snapshot,ensure_ascii=False,default=str)}],
            response_format={"type":"json_schema","json_schema":{"name":"ats_resume","strict":True,"schema":_resume_json_schema()}},
            temperature=0.1, max_completion_tokens=3500)
    except BadRequestError as exc:
        logger.warning("Groq rejected structured schema, retrying with json_object mode: %s", exc)
        try:
            response = client.chat.completions.create(model=settings.groq_model,
                messages=[{"role":"system","content":prompt + " Return only one valid JSON object."},{"role":"user","content":json.dumps(snapshot,ensure_ascii=False,default=str)}],
                response_format={"type":"json_object"}, temperature=0.1, max_completion_tokens=3500)
        except Exception as fallback_exc:
            logger.warning("Groq fallback (json_object) also failed, using fact-safe fallback: %s: %s", type(fallback_exc).__name__, fallback_exc)
            return _fact_safe_fallback(snapshot), f"{settings.groq_model}:fallback"
    except NotFoundError as exc:
        logger.error("Groq model not found: %s: %s", settings.groq_model, exc)
        raise HTTPException(status_code=502, detail=f"Groq model '{settings.groq_model}' is unavailable") from exc
    except AuthenticationError as exc:
        logger.error("Groq authentication failed: %s", exc)
        raise HTTPException(status_code=503, detail="Groq rejected the API key") from exc
    except RateLimitError as exc:
        logger.warning("Groq rate limit hit: %s", exc)
        raise HTTPException(status_code=429, detail="Groq Free Tier rate limit reached. Please wait and retry.") from exc
    except Exception as exc:
        logger.exception("Groq resume generation failed unexpectedly: %s: %s", type(exc).__name__, exc)
        raise HTTPException(status_code=502, detail="Resume generation is temporarily unavailable") from exc
    content = response.choices[0].message.content if response.choices else None
    try:
        return ResumeContent.model_validate_json(content or ""), settings.groq_model
    except Exception as exc:
        logger.warning("Groq response failed schema validation, using fact-safe fallback: %s", exc)
        return _fact_safe_fallback(snapshot), f"{settings.groq_model}:fallback"


def ats_evaluate(snapshot: dict, content: dict) -> dict:
    contact=snapshot.get("contact",{}); target=snapshot.get("target_role","")
    summary=(content.get("professional_summary") or "").strip(); skills=content.get("skills") or []
    education=content.get("educations") or []; experiences=content.get("experiences") or []; projects=content.get("projects") or []
    certs=content.get("certifications") or []; achievements=content.get("achievements") or []
    contact_score=sum([bool(contact.get("email")),bool(contact.get("mobile")),bool(contact.get("location")),bool(contact.get("linkedin_url") or contact.get("github_url"))])*2.5
    summary_score=10 if 50<=len(summary)<=700 else 6 if summary else 0
    education_score=10 if education else 0
    skills_score=min(20, len(set(x.casefold() for x in skills))*2)
    experience_score=min(15, len(experiences)*6 + sum(min(3,len(x.get("bullets") or [])) for x in experiences))
    project_score=min(15, len(projects)*5 + sum(min(2,len(x.get("bullets") or [])) for x in projects))
    words=set(re.findall(r"[a-z0-9+#.]+",json.dumps(content).lower())); target_words=set(re.findall(r"[a-z0-9+#.]+",target.lower())); keyword_score=10 if target_words and target_words<=words else min(10,len(target_words&words)*4)
    formatting_score=5
    extra_score=min(5,len(certs)*2+len(achievements))
    breakdown={"contact_and_links":round(contact_score),"professional_summary":summary_score,"education":education_score,"skills_relevance":skills_score,"experience":experience_score,"projects":project_score,"target_role_keywords":keyword_score,"formatting":formatting_score,"certifications_achievements":extra_score}
    score=min(100,sum(breakdown.values())); issues=[]; suggestions=[]; strengths=[]
    if contact_score<8: issues.append("Contact profile or professional links are incomplete"); suggestions.append("Add location and at least one LinkedIn, GitHub or portfolio link")
    if not education: issues.append("Education section is missing")
    if skills_score<12: issues.append("Technical skills coverage is limited"); suggestions.append("Add verified role-relevant skills you genuinely possess")
    if not projects: issues.append("No project evidence is included"); suggestions.append("Add at least one project with technologies and outcome-focused bullets")
    if keyword_score<8: suggestions.append(f"Use verified keywords relevant to {target} in summary and project bullets")
    if summary_score>=8: strengths.append("Professional summary is concise and ATS-readable")
    if projects: strengths.append("Projects provide practical evidence of skills")
    if education: strengths.append("Education information is present")
    grade="Excellent" if score>=85 else "Good" if score>=70 else "Needs Improvement" if score>=50 else "Incomplete"
    return {"score":score,"grade":grade,"breakdown":breakdown,"strengths":strengths,"issues":issues,"suggestions":suggestions}