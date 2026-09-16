from typing import Literal

from pydantic import BaseModel, Field, model_validator

ALGO_LANGUAGES = {"python", "javascript", "java", "cpp"}


class CodingCheckIn(BaseModel):
    target: Literal["html", "css", "js", "jsx"]
    type: Literal["contains", "not_contains", "regex"]
    value: str = Field(min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=300)


class CodingTestCaseIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    is_hidden: bool = False
    weight: int = Field(default=1, ge=1, le=100)
    stdin: str | None = None
    expected_output: str | None = None
    checks: list[CodingCheckIn] = Field(default_factory=list)


class CodingTestUpsertIn(BaseModel):
    mode: Literal["algorithmic", "web", "react"] = "algorithmic"
    problem_statement: str = Field(min_length=10)
    supported_languages: list[str] = Field(default_factory=list)
    starter_code: dict[str, str] = Field(default_factory=dict)
    maximum_attempts: int = Field(default=5, ge=1, le=50)
    time_limit_minutes: int | None = Field(default=None, ge=1, le=600)
    passing_percentage: int = Field(default=100, ge=1, le=100)
    test_cases: list[CodingTestCaseIn] = Field(min_length=1)

    @model_validator(mode="after")
    def _validate_shape(self) -> "CodingTestUpsertIn":
        if self.mode == "algorithmic":
            if not self.supported_languages or not set(self.supported_languages).issubset(ALGO_LANGUAGES):
                raise ValueError(f"supported_languages must be a non-empty subset of {sorted(ALGO_LANGUAGES)}")
            for case in self.test_cases:
                if not case.expected_output or case.expected_output.strip() == "":
                    raise ValueError(f"Test case '{case.title}' requires an expected_output for algorithmic tests")
        else:
            self.supported_languages = [self.mode]
            for case in self.test_cases:
                if not case.checks:
                    raise ValueError(f"Test case '{case.title}' requires at least one check for {self.mode} tests")
        return self


class CodingRunIn(BaseModel):
    language: str
    source_files: dict[str, str] = Field(default_factory=dict)
