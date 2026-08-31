import json
from types import SimpleNamespace

from app import roadmap_service


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
