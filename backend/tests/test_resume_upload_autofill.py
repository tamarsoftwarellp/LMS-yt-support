from app.resume_service import evaluate_uploaded_resume, parse_resume_data


def test_resume_sections_are_extracted_for_builder():
    text = """PROFESSIONAL SUMMARY
Backend developer building reliable APIs.
EDUCATION
B.Tech Computer Science
Example University
2022 - 2026
EXPERIENCE
Backend Intern
Acme Labs
Built FastAPI services
PROJECTS
Learning Management System
FastAPI, PostgreSQL
CERTIFICATIONS
Python Developer Certificate
LANGUAGES
English
Hindi
https://linkedin.com/in/student
"""
    parsed = parse_resume_data(text, ["Python", "FastAPI", "PostgreSQL"])
    builder = parsed["builder"]
    assert builder["professional_summary"] == "Backend developer building reliable APIs."
    assert builder["educations"][0]["title"] == "B.Tech Computer Science"
    assert builder["experiences"][0]["title"] == "Backend Intern"
    assert builder["projects"][0]["title"] == "Learning Management System"
    assert builder["linkedin_url"] == "https://linkedin.com/in/student"
    assert parsed["detected_skills"] == ["FastAPI", "PostgreSQL", "Python"]


def test_unknown_text_does_not_invent_builder_entries():
    parsed = parse_resume_data("Student Name\nstudent@example.com", ["Python"])
    assert parsed["builder"]["educations"] == []
    assert parsed["builder"]["experiences"] == []
    assert parsed["builder"]["projects"] == []


def test_uploaded_resume_ats_score_is_transparent_and_bounded():
    text = "student@example.com +91 9876543210\n" + " ".join(["resume"] * 180)
    parsed = {"detected_skills": ["Python", "FastAPI"], "builder": {
        "professional_summary": "Backend developer", "educations": [{"title": "B.Tech"}],
        "experiences": [], "projects": [{"title": "LMS"}], "certifications": [],
        "achievements": [], "linkedin_url": None, "github_url": None, "portfolio_url": None,
    }}
    result = evaluate_uploaded_resume(parsed, text)
    assert 0 <= result["score"] <= 100
    assert result["breakdown"]["contact_details"] == 12
    assert result["grade"] in {"Excellent", "Good", "Needs Improvement", "Incomplete"}
    assert result["suggestions"]
