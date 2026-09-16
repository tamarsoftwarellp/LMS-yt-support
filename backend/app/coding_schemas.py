from typing import Any

from pydantic import BaseModel, Field


class CodingTestCaseIn(BaseModel):
    input: list[Any] = Field(default_factory=list, max_length=20)
    expected: Any = None


class CodingChallengeUpsertIn(BaseModel):
    instructions: str = Field(min_length=1, max_length=5000)
    function_name: str = Field(default="solve", min_length=1, max_length=80, pattern=r"^[A-Za-z_][A-Za-z0-9_]*$")
    starter_code: str = Field(min_length=1, max_length=20000)
    maximum_attempts: int = Field(default=10, ge=1, le=100)
    test_cases: list[CodingTestCaseIn] = Field(default_factory=list, min_length=1, max_length=50)


class CodingSubmitIn(BaseModel):
    code: str = Field(min_length=1, max_length=20000)
    passed_count: int = Field(ge=0)
    total_count: int = Field(ge=0)
