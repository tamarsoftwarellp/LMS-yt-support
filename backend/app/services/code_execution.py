import asyncio
import re

import httpx

from ..config import get_settings

# Piston (https://github.com/engineer-man/piston) is a free, sandboxed multi-language code
# execution engine. The public instance at emkc.org is used by default; self-host it (it ships
# as a single Docker container) and point PISTON_API_URL at it for production-grade reliability
# and rate limits.
PISTON_RUNTIMES = {
    "python": {"language": "python", "version": "3.10.0", "filename": "main.py"},
    "javascript": {"language": "javascript", "version": "18.15.0", "filename": "main.js"},
    "java": {"language": "java", "version": "15.0.2", "filename": "Main.java"},
    "cpp": {"language": "cpp", "version": "10.2.0", "filename": "main.cpp"},
}
ALGORITHMIC_LANGUAGES = set(PISTON_RUNTIMES)
STRUCTURAL_MODES = {"web", "react"}


def _truncate(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[:limit] + "\n... (output truncated)"


async def run_io_case(language: str, source_code: str, stdin: str | None) -> dict:
    """Executes `source_code` against Piston with the given stdin and returns raw run output."""
    settings = get_settings()
    runtime = PISTON_RUNTIMES.get(language)
    if not runtime:
        return {"stdout": "", "stderr": f"Unsupported language: {language}", "code": -1, "signal": None}
    payload = {
        "language": runtime["language"],
        "version": runtime["version"],
        "files": [{"name": runtime["filename"], "content": source_code}],
        "stdin": stdin or "",
        "run_timeout": settings.code_run_timeout_ms,
        "compile_timeout": settings.code_run_timeout_ms,
    }
    try:
        async with httpx.AsyncClient(timeout=settings.code_run_timeout_ms / 1000 + 5) as client:
            response = await client.post(f"{settings.piston_api_url}/execute", json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        return {"stdout": "", "stderr": f"Execution service error: {exc}", "code": -1, "signal": None}
    compile_step = data.get("compile") or {}
    if compile_step.get("code") not in (None, 0):
        return {"stdout": "", "stderr": compile_step.get("stderr") or compile_step.get("output") or "Compilation failed",
                "code": compile_step.get("code"), "signal": None}
    run_step = data.get("run") or {}
    return {"stdout": run_step.get("stdout", ""), "stderr": run_step.get("stderr", ""),
            "code": run_step.get("code"), "signal": run_step.get("signal")}


async def grade_io_test_case(language: str, source_code: str, test_case) -> dict:
    settings = get_settings()
    result = await run_io_case(language, source_code, test_case.stdin)
    expected = (test_case.expected_output or "").strip()
    actual = (result["stdout"] or "").strip()
    passed = result["code"] == 0 and not result["stderr"].strip() and actual == expected
    return {"passed": passed,
            "actual_output": _truncate(result["stdout"] or "", settings.max_coding_output_chars),
            "error_message": _truncate(result["stderr"], settings.max_coding_output_chars) if result["stderr"].strip() else None}


def evaluate_structural_check(files: dict, check: dict) -> tuple[bool, str]:
    target = check.get("target", "")
    kind = check.get("type", "contains")
    value = check.get("value", "")
    content = files.get(target, "") or ""
    if kind == "contains":
        ok = value.lower() in content.lower()
    elif kind == "not_contains":
        ok = value.lower() not in content.lower()
    elif kind == "regex":
        try:
            ok = re.search(value, content, re.IGNORECASE | re.MULTILINE) is not None
        except re.error as exc:
            return False, f"Invalid check pattern: {exc}"
    else:
        return False, f"Unknown check type: {kind}"
    label = check.get("description") or f"{kind} '{value}' in {target or 'source'}"
    return ok, ("Passed: " if ok else "Failed: ") + label


def grade_structural_test_case(files: dict, test_case) -> dict:
    checks = test_case.checks or []
    if not checks:
        return {"passed": False, "actual_output": None, "error_message": "Test case has no checks configured"}
    messages = []
    all_passed = True
    for check in checks:
        ok, message = evaluate_structural_check(files, check)
        all_passed = all_passed and ok
        messages.append(message)
    return {"passed": all_passed, "actual_output": None, "error_message": None if all_passed else "; ".join(messages)}


async def grade_submission(mode: str, language: str, source_files: dict, test_cases: list) -> list[dict]:
    """Runs every test case for a submission and returns a result dict per test case, in order."""
    if mode == "algorithmic":
        source_code = source_files.get("code", "")
        results = await asyncio.gather(*(grade_io_test_case(language, source_code, case) for case in test_cases))
        return list(results)
    return [grade_structural_test_case(source_files, case) for case in test_cases]
