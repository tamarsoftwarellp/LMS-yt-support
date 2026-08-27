import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from .database import get_db
from .dependencies import get_current_admin, get_current_student
from .models import (CourseEnrollment, CourseLesson, LessonProgress, Quiz, QuizOption, QuizQuestion,
                     StudentQuizAnswer, StudentQuizAttempt, User)
from .quiz_schemas import QuizSubmitIn, QuizUpsertIn

admin_router = APIRouter(prefix="/api/v1/admin", tags=["Admin Quiz Builder"])
student_router = APIRouter(prefix="/api/v1/students/me", tags=["Student Quiz Attempts"])


def load_quiz(db: Session, quiz_id: uuid.UUID) -> Quiz:
    quiz = db.scalar(select(Quiz).options(selectinload(Quiz.questions).selectinload(QuizQuestion.options)).where(Quiz.id == quiz_id))
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


def admin_payload(quiz: Quiz) -> dict:
    return {"id": quiz.id, "lesson_id": quiz.lesson_id, "instructions": quiz.instructions,
        "passing_percentage": quiz.passing_percentage, "maximum_attempts": quiz.maximum_attempts,
        "time_limit_minutes": quiz.time_limit_minutes, "show_explanations": quiz.show_explanations,
        "status": quiz.status, "questions": [{"id": q.id, "question_text": q.question_text,
            "question_type": q.question_type, "marks": q.marks, "explanation": q.explanation,
            "sequence": q.sequence, "options": [{"id": o.id, "option_text": o.option_text,
                "is_correct": o.is_correct, "sequence": o.sequence} for o in q.options]} for q in quiz.questions]}


@admin_router.get("/lessons/{lesson_id}/quiz")
def admin_get_quiz(lesson_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    quiz = db.scalar(select(Quiz).options(selectinload(Quiz.questions).selectinload(QuizQuestion.options)).where(Quiz.lesson_id == lesson_id))
    return admin_payload(quiz) if quiz else None


@admin_router.put("/lessons/{lesson_id}/quiz")
def admin_save_quiz(lesson_id: uuid.UUID, payload: QuizUpsertIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    lesson = db.get(CourseLesson, lesson_id)
    if not lesson or lesson.lesson_type != "quiz":
        raise HTTPException(status_code=422, detail="Quiz configuration requires a quiz lesson")
    quiz = db.scalar(select(Quiz).options(selectinload(Quiz.questions)).where(Quiz.lesson_id == lesson_id))
    if quiz and quiz.status == "published" and db.scalar(select(func.count(StudentQuizAttempt.id)).where(StudentQuizAttempt.quiz_id == quiz.id)):
        raise HTTPException(status_code=409, detail="A quiz with student attempts cannot be edited")
    if not quiz:
        quiz = Quiz(lesson_id=lesson_id)
        db.add(quiz)
        db.flush()
    quiz.instructions = payload.instructions.strip()
    quiz.passing_percentage = payload.passing_percentage
    quiz.maximum_attempts = payload.maximum_attempts
    quiz.time_limit_minutes = payload.time_limit_minutes
    quiz.show_explanations = payload.show_explanations
    quiz.status = "draft"
    quiz.questions.clear()
    db.flush()
    for q_index, question_in in enumerate(payload.questions, 1):
        question = QuizQuestion(quiz_id=quiz.id, question_text=question_in.question_text.strip(),
            question_type=question_in.question_type, marks=question_in.marks,
            explanation=question_in.explanation.strip() if question_in.explanation else None, sequence=q_index)
        db.add(question); db.flush()
        for o_index, option_in in enumerate(question_in.options, 1):
            db.add(QuizOption(question_id=question.id, option_text=option_in.option_text.strip(),
                is_correct=option_in.is_correct, sequence=o_index))
    db.commit()
    return admin_payload(load_quiz(db, quiz.id))


@admin_router.post("/quizzes/{quiz_id}/publish")
def admin_publish_quiz(quiz_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    del admin
    quiz = load_quiz(db, quiz_id)
    if not quiz.questions:
        raise HTTPException(status_code=422, detail="Add at least one valid question before publishing")
    quiz.status = "published"
    db.commit()
    return admin_payload(load_quiz(db, quiz.id))


def student_context(db: Session, user_id: uuid.UUID, quiz_id: uuid.UUID) -> tuple[Quiz, CourseEnrollment]:
    quiz = load_quiz(db, quiz_id)
    if quiz.status != "published":
        raise HTTPException(status_code=404, detail="Quiz is not available")
    enrollment = db.scalar(select(CourseEnrollment).where(CourseEnrollment.user_id == user_id,
        CourseEnrollment.course_id == quiz.lesson.section.course_id))
    if not enrollment:
        raise HTTPException(status_code=403, detail="Enroll in this course before taking the quiz")
    return quiz, enrollment


@student_router.get("/lessons/{lesson_id}/quiz")
def student_get_quiz(lesson_id: uuid.UUID, user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    quiz = db.scalar(select(Quiz).where(Quiz.lesson_id == lesson_id, Quiz.status == "published"))
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz is not available")
    quiz, enrollment = student_context(db, user.id, quiz.id)
    attempts = list(db.scalars(select(StudentQuizAttempt).where(StudentQuizAttempt.quiz_id == quiz.id,
        StudentQuizAttempt.enrollment_id == enrollment.id).order_by(StudentQuizAttempt.attempt_number.desc())))
    return {"id": quiz.id, "lesson_id": quiz.lesson_id, "instructions": quiz.instructions,
        "passing_percentage": quiz.passing_percentage, "maximum_attempts": quiz.maximum_attempts,
        "attempts_used": len(attempts), "remaining_attempts": max(0, quiz.maximum_attempts - len(attempts)),
        "time_limit_minutes": quiz.time_limit_minutes, "best_percentage": max([a.percentage for a in attempts] or [0]),
        "passed": any(a.passed for a in attempts), "questions": [{"id": q.id, "question_text": q.question_text,
            "question_type": q.question_type, "marks": q.marks, "sequence": q.sequence,
            "options": [{"id": o.id, "option_text": o.option_text, "sequence": o.sequence} for o in q.options]}
            for q in quiz.questions]}


@student_router.post("/quizzes/{quiz_id}/attempts", status_code=status.HTTP_201_CREATED)
def start_attempt(quiz_id: uuid.UUID, user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    quiz, enrollment = student_context(db, user.id, quiz_id)
    attempts = list(db.scalars(select(StudentQuizAttempt).where(StudentQuizAttempt.quiz_id == quiz.id,
        StudentQuizAttempt.enrollment_id == enrollment.id)))
    active = next((attempt for attempt in attempts if attempt.status == "in_progress"), None)
    if active:
        return {"id": active.id, "attempt_number": active.attempt_number, "started_at": active.started_at}
    if len(attempts) >= quiz.maximum_attempts:
        raise HTTPException(status_code=409, detail="Maximum quiz attempts reached")
    attempt = StudentQuizAttempt(quiz_id=quiz.id, enrollment_id=enrollment.id, attempt_number=len(attempts) + 1)
    db.add(attempt); db.commit(); db.refresh(attempt)
    return {"id": attempt.id, "attempt_number": attempt.attempt_number, "started_at": attempt.started_at}


@student_router.post("/quiz-attempts/{attempt_id}/submit")
def submit_attempt(attempt_id: uuid.UUID, payload: QuizSubmitIn,
                   user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    attempt = db.get(StudentQuizAttempt, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")
    quiz, enrollment = student_context(db, user.id, attempt.quiz_id)
    if attempt.enrollment_id != enrollment.id:
        raise HTTPException(status_code=403, detail="Quiz attempt does not belong to this student")
    if attempt.status != "in_progress":
        raise HTTPException(status_code=409, detail="Quiz attempt was already submitted")
    if quiz.time_limit_minutes and datetime.now(timezone.utc) > attempt.started_at.replace(tzinfo=timezone.utc) + timedelta(minutes=quiz.time_limit_minutes + 1):
        raise HTTPException(status_code=409, detail="Quiz time limit has expired")
    submitted = {answer.question_id: set(answer.selected_option_ids) for answer in payload.answers}
    valid_question_ids = {q.id for q in quiz.questions}
    if not set(submitted).issubset(valid_question_ids):
        raise HTTPException(status_code=422, detail="Submission contains an invalid question")
    total = sum(q.marks for q in quiz.questions); earned = 0
    for question in quiz.questions:
        selected = submitted.get(question.id, set())
        valid_options = {o.id for o in question.options}
        if not selected.issubset(valid_options):
            raise HTTPException(status_code=422, detail="Submission contains an invalid option")
        correct = {o.id for o in question.options if o.is_correct}
        is_correct = selected == correct
        awarded = question.marks if is_correct else 0
        earned += awarded
        db.add(StudentQuizAnswer(attempt_id=attempt.id, question_id=question.id,
            selected_option_ids=[str(value) for value in selected], awarded_marks=awarded, is_correct=is_correct))
    attempt.earned_marks = earned; attempt.total_marks = total
    attempt.percentage = round(earned * 100 / total) if total else 0
    attempt.passed = attempt.percentage >= quiz.passing_percentage
    attempt.status = "submitted"; attempt.submitted_at = datetime.now(timezone.utc)
    if attempt.passed:
        progress = db.scalar(select(LessonProgress).where(LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id == quiz.lesson_id))
        if not progress:
            progress = LessonProgress(enrollment_id=enrollment.id, lesson_id=quiz.lesson_id)
            db.add(progress)
        progress.status = "completed"; progress.completed_at = datetime.now(timezone.utc)
        lesson_ids = [lesson.id for section in enrollment.course.sections for lesson in section.lessons]
        db.flush()
        completed = db.scalar(select(func.count(LessonProgress.id)).where(LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id.in_(lesson_ids), LessonProgress.status == "completed")) or 0
        enrollment.progress_percentage = round(completed * 100 / len(lesson_ids)) if lesson_ids else 0
        enrollment.status = "completed" if lesson_ids and completed == len(lesson_ids) else "in_progress"
    db.commit()
    result = {"attempt_id": attempt.id, "earned_marks": earned, "total_marks": total,
        "percentage": attempt.percentage, "passed": attempt.passed, "attempt_number": attempt.attempt_number}
    if quiz.show_explanations:
        result["review"] = [{"question_id": str(q.id), "explanation": q.explanation,
            "correct_option_ids": [str(o.id) for o in q.options if o.is_correct]} for q in quiz.questions]
    return result
