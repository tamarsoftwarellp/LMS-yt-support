import json
import re

from fastapi import HTTPException, status
from groq import AuthenticationError, Groq, NotFoundError, RateLimitError

from .config import get_settings
from .resume_builder_schemas import ResumeContent

PROMPT_VERSION = "resume-groq-v1"


def generate_resume_content(snapshot: dict) -> tuple[ResumeContent, str]:
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="Resume generation is not configured. Add GROQ_API_KEY in backend/.env.")
    client = Groq(api_key=settings.groq_api_key, timeout=90.0, max_retries=2)
    prompt = ("You are an ATS resume writing assistant. Use ONLY facts in the supplied snapshot. Never invent employers, dates, degrees, marks, metrics, links, certifications, technologies, or achievements. "
        "Improve wording using concise action verbs, preserve all factual meaning, and align naturally to target_role. If a fact is missing, omit it. Return one JSON object matching this schema exactly: "
        + json.dumps(ResumeContent.model_json_schema(), ensure_ascii=False))
    try:
        response = client.chat.completions.create(model=settings.groq_model,
            messages=[{"role":"system","content":prompt},{"role":"user","content":json.dumps(snapshot,ensure_ascii=False)}],
            response_format={"type":"json_object"}, temperature=0.1, max_completion_tokens=3500)
    except NotFoundError as exc: raise HTTPException(status_code=502, detail=f"Groq model '{settings.groq_model}' is unavailable") from exc
    except AuthenticationError as exc: raise HTTPException(status_code=503, detail="Groq rejected the API key") from exc
    except RateLimitError as exc: raise HTTPException(status_code=429, detail="Groq Free Tier rate limit reached. Please wait and retry.") from exc
    except Exception as exc: raise HTTPException(status_code=502, detail="Resume generation is temporarily unavailable") from exc
    content = response.choices[0].message.content if response.choices else None
    try: return ResumeContent.model_validate_json(content or ""), settings.groq_model
    except Exception as exc: raise HTTPException(status_code=502, detail="Groq returned an invalid resume structure") from exc


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
