import re
from io import BytesIO

from docx import Document
from pypdf import PdfReader


def extract_resume_text(content: bytes, extension: str) -> str:
    if extension == ".pdf":
        reader = PdfReader(BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if extension == ".docx":
        document = Document(BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    raise ValueError("Only PDF and DOCX resumes are supported")


def detect_skills(text: str, known_skills: list[str]) -> list[str]:
    lowered = text.lower()
    return sorted({name for name in known_skills if re.search(rf"(?<!\w){re.escape(name.lower())}(?!\w)", lowered)}, key=str.lower)


SECTION_ALIASES = {
    "summary": {"summary", "professional summary", "profile", "career objective", "objective", "about me"},
    "education": {"education", "academic background", "academic qualifications", "qualifications"},
    "experience": {"experience", "work experience", "employment history", "internships", "internship"},
    "projects": {"projects", "academic projects", "personal projects", "project experience"},
    "certifications": {"certifications", "certificates", "courses and certifications", "training"},
    "achievements": {"achievements", "awards", "honors", "accomplishments"},
    "languages": {"languages", "language proficiency"},
}


def _heading(line: str) -> str | None:
    normalized = re.sub(r"[^a-z ]", "", line.casefold()).strip()
    for key, aliases in SECTION_ALIASES.items():
        if normalized in aliases:
            return key
    return None


def _lines_to_entries(lines: list[str]) -> list[dict]:
    """Convert resume section lines into conservative, editable builder entries."""
    groups: list[list[str]] = []
    current: list[str] = []
    for raw in lines:
        line = raw.strip(" \t•-*|")
        if not line:
            if current:
                groups.append(current); current = []
            continue
        if current and (re.search(r"\b(?:19|20)\d{2}\b", line) or len(current) >= 4):
            groups.append(current); current = []
        current.append(line)
    if current:
        groups.append(current)
    entries = []
    for group in groups[:20]:
        entries.append({
            "title": group[0][:220], "subtitle": group[1][:220] if len(group) > 1 else None,
            "start_date": None, "end_date": None, "location": None,
            "description": None, "bullets": group[2:14], "technologies": [], "url": None,
        })
    return entries


def parse_resume_data(text: str, known_skills: list[str]) -> dict:
    """Extract only explicit resume facts; the student can review every value."""
    cleaned = re.sub(r"\r\n?", "\n", text)
    sections: dict[str, list[str]] = {key: [] for key in SECTION_ALIASES}
    preamble: list[str] = []
    active: str | None = None
    for raw in cleaned.splitlines():
        line = re.sub(r"\s+", " ", raw).strip()
        heading = _heading(line)
        if heading:
            active = heading
        elif line:
            (sections[active] if active else preamble).append(line)

    urls = re.findall(r"https?://[^\s|]+", cleaned, flags=re.I)
    linkedin = next((url for url in urls if "linkedin.com" in url.casefold()), None)
    github = next((url for url in urls if "github.com" in url.casefold()), None)
    portfolio = next((url for url in urls if url not in {linkedin, github}), None)
    simple = lambda key: [x.strip(" •-\t") for x in sections[key] if x.strip(" •-\t")]
    summary = " ".join(simple("summary"))[:2500] or None
    return {
        "detected_skills": detect_skills(cleaned, known_skills), "text_length": len(cleaned),
        "builder": {
            "professional_summary": summary,
            "linkedin_url": linkedin, "github_url": github, "portfolio_url": portfolio,
            "educations": _lines_to_entries(sections["education"]),
            "experiences": _lines_to_entries(sections["experience"]),
            "projects": _lines_to_entries(sections["projects"]),
            "certifications": _lines_to_entries(sections["certifications"]),
            "achievements": simple("achievements")[:30], "languages": simple("languages")[:20],
        },
    }


def evaluate_uploaded_resume(parsed_data: dict, text: str) -> dict:
    """Score the student's uploaded resume using transparent ATS-readiness rules."""
    builder = parsed_data.get("builder") or {}
    lowered = text.casefold()
    email = bool(re.search(r"\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b", lowered))
    phone = bool(re.search(r"(?<!\d)(?:\+?\d[\d ()-]{8,}\d)(?!\d)", text))
    links = sum(bool(builder.get(key)) for key in ("linkedin_url", "github_url", "portfolio_url"))
    skills = parsed_data.get("detected_skills") or []
    word_count = len(re.findall(r"\b\w+\b", text))
    bullet_count = len(re.findall(r"(?m)^\s*[•*-]\s+", text))

    breakdown = {
        "contact_details": min(15, (6 if email else 0) + (6 if phone else 0) + min(3, links * 2)),
        "professional_summary": 10 if builder.get("professional_summary") else 0,
        "education": 15 if builder.get("educations") else 0,
        "experience": 15 if builder.get("experiences") else 0,
        "projects": 15 if builder.get("projects") else 0,
        "skills": min(15, len({str(x).casefold() for x in skills}) * 3),
        "certifications_achievements": min(5, len(builder.get("certifications") or []) * 2 + len(builder.get("achievements") or [])),
        "ats_readability": 10 if 150 <= word_count <= 1200 else 6 if word_count >= 60 else 2,
    }
    score = min(100, sum(breakdown.values()))
    issues: list[str] = []
    suggestions: list[str] = []
    strengths: list[str] = []
    if not email or not phone:
        issues.append("Contact details are incomplete")
        suggestions.append("Add a professional email address and phone number")
    if not builder.get("professional_summary"):
        issues.append("Professional summary is missing")
        suggestions.append("Add a concise 2–4 line professional summary")
    if not builder.get("education") and not builder.get("educations"):
        issues.append("Education section was not detected")
    if not builder.get("experiences"):
        suggestions.append("Add internships or relevant work experience when applicable")
    if not builder.get("projects"):
        issues.append("Projects section was not detected")
        suggestions.append("Add projects with role, technologies and measurable outcomes")
    if len(skills) < 5:
        issues.append("Role-relevant skill coverage is limited")
        suggestions.append("Add genuine technical and domain skills as ATS keywords")
    if bullet_count == 0:
        suggestions.append("Use concise bullet points for experience and project achievements")
    if email and phone:
        strengths.append("Email and phone details are ATS-readable")
    if builder.get("educations"):
        strengths.append("Education information is present")
    if builder.get("projects"):
        strengths.append("Projects provide practical evidence")
    grade = "Excellent" if score >= 85 else "Good" if score >= 70 else "Needs Improvement" if score >= 50 else "Incomplete"
    return {"score": score, "grade": grade, "breakdown": breakdown, "strengths": strengths,
            "issues": issues, "suggestions": suggestions, "word_count": word_count}
