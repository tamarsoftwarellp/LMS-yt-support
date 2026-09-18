import uuid
from pydantic import BaseModel, Field, model_validator


class QuizOptionIn(BaseModel):
    option_text: str = Field(min_length=1, max_length=1000)
    is_correct: bool = False


class QuizQuestionIn(BaseModel):
    question_text: str = Field(min_length=1, max_length=3000)
    question_type: str = Field(pattern="^(single_choice|multiple_choice|true_false)$")
    marks: int = Field(default=1, gt=0, le=100)
    explanation: str | None = Field(default=None, max_length=5000)
    options: list[QuizOptionIn] = Field(min_length=2, max_length=10)

    @model_validator(mode="after")
    def correct_options(self):
        correct = sum(option.is_correct for option in self.options)
        if self.question_type in {"single_choice", "true_false"} and correct != 1:
            raise ValueError("Single-choice and true/false questions require exactly one correct option")
        if self.question_type == "multiple_choice" and correct < 1:
            raise ValueError("Multiple-choice questions require at least one correct option")
        if self.question_type == "true_false" and len(self.options) != 2:
            raise ValueError("True/false questions require exactly two options")
        return self


class QuizUpsertIn(BaseModel):
    instructions: str = Field(min_length=1, max_length=5000)
    passing_percentage: int = Field(default=60, ge=1, le=100)
    maximum_attempts: int = Field(default=3, ge=1, le=20)
    time_limit_minutes: int | None = Field(default=None, ge=1, le=300)
    show_explanations: bool = True
    questions: list[QuizQuestionIn] = Field(default_factory=list, max_length=100)


class QuizAnswerIn(BaseModel):
    question_id: uuid.UUID
    selected_option_ids: list[uuid.UUID] = Field(default_factory=list, max_length=10)


class QuizSubmitIn(BaseModel):
    answers: list[QuizAnswerIn] = Field(default_factory=list, max_length=100)
