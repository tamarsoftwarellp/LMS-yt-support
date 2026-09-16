import json

from fastapi import HTTPException, status
from groq import AuthenticationError, Groq, NotFoundError, RateLimitError

from .career_schemas import RoadmapDraft
from .config import get_settings


PROMPT_VERSION = "groq-v1"


def generate_roadmap(input_snapshot: dict) -> tuple[RoadmapDraft, str]:
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Roadmap generation is not configured. Add GROQ_API_KEY in backend/.env.",
        )
    client = Groq(api_key=settings.groq_api_key, timeout=90.0, max_retries=2)
    system_prompt = (
        "You are a career learning-roadmap planner. Build a practical roadmap only from the supplied student context. "
        "Do not invent credentials or work experience. Keep the total duration aligned with the requested months and weekly hours. "
        "Return ordered phases, measurable milestones, portfolio projects, and explicit skill gaps. "
        "If resume information is absent, rely on confirmed skills and career goal. "
        "Return only one valid JSON object matching this JSON Schema exactly: "
        + json.dumps(RoadmapDraft.model_json_schema(), ensure_ascii=False)
    )
    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(input_snapshot, ensure_ascii=False)},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_completion_tokens=4000,
        )
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                f"Groq model '{settings.groq_model}' is unavailable. "
                "Set GROQ_MODEL=openai/gpt-oss-20b in backend/.env and restart the backend."
            ),
        ) from exc
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Groq rejected the API key. Check GROQ_API_KEY in backend/.env.",
        ) from exc
    except RateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Groq Free Tier rate limit reached. Please wait and try again.",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Roadmap generation is temporarily unavailable. Please try again.",
        ) from exc
    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise HTTPException(status_code=502, detail="The roadmap service returned no usable result")
    try:
        roadmap = RoadmapDraft.model_validate_json(content)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Groq returned an invalid roadmap structure") from exc
    return roadmap, settings.groq_model
