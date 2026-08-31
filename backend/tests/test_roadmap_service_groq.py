import json
from types import SimpleNamespace

from app import resume_builder_service, roadmap_service


def test_groq_roadmap_generation_uses_json_mode(monkeypatch) -> None:
    payload = {
        "title": "Backend Developer Roadmap", "summary": "Learn typed API development.", "duration_weeks": 12,
        "skill_gaps": [{"skill": "FastAPI", "priority": "high", "reason": "Needed for backend APIs"}],
        "phases": [{"sequence": 1, "title": "API Foundations", "duration_weeks": 4,
            "objective": "Build REST APIs", "skills": ["Python", "FastAPI"], "milestones": ["Ship one API"],
            "projects": [{"title": "Task API", "description": "Create a tested task service"}]}],
    }
    captured = {}

    class FakeCompletions:
        def create(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps(payload)))])

    class FakeGroq:
        def __init__(self, **kwargs):
            captured["client"] = kwargs
            self.chat = SimpleNamespace(completions=FakeCompletions())

    monkeypatch.setattr(roadmap_service, "Groq", FakeGroq)
    monkeypatch.setattr(roadmap_service, "get_settings", lambda: SimpleNamespace(
        groq_api_key="test-key", groq_model="openai/gpt-oss-20b"))
    draft, model = roadmap_service.generate_roadmap({"career_goal": {"target_role": "Backend Developer"}})

    assert draft.title == "Backend Developer Roadmap"
    assert model == "openai/gpt-oss-20b"
    assert captured["response_format"] == {"type": "json_object"}
    assert captured["client"]["api_key"] == "test-key"


def test_resume_generation_uses_strict_schema(monkeypatch) -> None:
    captured = {}
    payload = {"professional_summary": "Backend developer student with verified Python project experience and API development skills.", "skills": ["Python"], "educations": [], "experiences": [], "projects": [], "certifications": [], "achievements": [], "languages": []}

    class FakeCompletions:
        def create(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps(payload)))])

    class FakeGroq:
        def __init__(self, **kwargs): self.chat = SimpleNamespace(completions=FakeCompletions())

    monkeypatch.setattr(resume_builder_service, "Groq", FakeGroq)
    monkeypatch.setattr(resume_builder_service, "get_settings", lambda: SimpleNamespace(groq_api_key="test-key", groq_model="openai/gpt-oss-20b"))
    draft, model = resume_builder_service.generate_resume_content({"target_role": "Backend Developer", "confirmed_skills": ["Python"]})
    assert draft.skills == ["Python"]
    assert model == "openai/gpt-oss-20b"
    assert captured["response_format"]["type"] == "json_schema"
    assert captured["response_format"]["json_schema"]["strict"] is True


def test_resume_generation_falls_back_safely_for_invalid_model_json(monkeypatch) -> None:
    class FakeCompletions:
        def create(self, **kwargs):
            return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content='{"summary":"wrong schema"}'))])

    class FakeGroq:
        def __init__(self, **kwargs): self.chat = SimpleNamespace(completions=FakeCompletions())

    monkeypatch.setattr(resume_builder_service, "Groq", FakeGroq)
    monkeypatch.setattr(resume_builder_service, "get_settings", lambda: SimpleNamespace(groq_api_key="test-key", groq_model="openai/gpt-oss-20b"))
    draft, model = resume_builder_service.generate_resume_content({"target_role": "Backend Developer", "confirmed_skills": ["Python"], "educations": [], "projects": []})
    assert draft.skills == ["Python"]
    assert len(draft.professional_summary) >= 30
    assert model.endswith(":fallback")
