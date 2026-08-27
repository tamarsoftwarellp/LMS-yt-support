from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select

from app.database import SessionLocal
from app.models import College, CollegeProgram, Course, CourseLesson, CourseSection, Program, Skill


COLLEGES = [
    "Rajiv Gandhi Institute of IT, Mumbai",
    "Hyderabad Institute of Technology",
    "Delhi Technical University",
    "Anna University, Chennai",
    "BITS Pilani",
]
PROGRAMS = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "MBA / Management",
    "MCA",
]
SKILLS = {
    "HTML": "Frontend", "CSS": "Frontend", "JavaScript": "Programming Language",
    "TypeScript": "Programming Language", "React": "Frontend", "Node.js": "Backend",
    "FastAPI": "Backend", "Python": "Programming Language", "PostgreSQL": "Database",
    "Git": "Tools", "Docker": "DevOps", "REST APIs": "Backend",
}
COURSES = [
    ("Web Foundations", "Build accessible web pages with modern HTML and CSS.", "Beginner", 18, ["HTML", "CSS"]),
    ("Modern JavaScript", "Master ES6+, asynchronous JavaScript and browser APIs.", "Intermediate", 28, ["JavaScript"]),
    ("React Application Development", "Create production React applications with reusable components.", "Intermediate", 32, ["React", "JavaScript", "TypeScript"]),
    ("Backend APIs with Node.js", "Design secure REST APIs and backend services.", "Intermediate", 30, ["Node.js", "REST APIs", "PostgreSQL"]),
    ("Python and FastAPI", "Develop typed, tested APIs using Python and FastAPI.", "Intermediate", 26, ["Python", "FastAPI", "REST APIs"]),
    ("PostgreSQL Essentials", "Model relational data and write efficient SQL queries.", "Beginner", 20, ["PostgreSQL"]),
    ("Git and Docker Workflow", "Use version control and containers in real projects.", "Beginner", 16, ["Git", "Docker"]),
]

CURRICULUM = {
    "Web Foundations": [("HTML Essentials", ["How the web works", "Semantic HTML", "Build an accessible page"]), ("Modern CSS", ["Cascade and selectors", "Flexbox and Grid", "Responsive layout challenge"])],
    "Modern JavaScript": [("Language Foundations", ["Variables and data types", "Functions and scope", "Objects and arrays"]), ("Modern Browser JavaScript", ["Promises and async await", "DOM events", "JavaScript knowledge check"])],
    "React Application Development": [("React Core", ["Components and props", "State and events", "Effects and data fetching"]), ("Production Patterns", ["Reusable hooks", "Routing and forms", "Ship a React application"])],
    "Backend APIs with Node.js": [("API Foundations", ["HTTP and REST", "Express routing", "Validation and errors"]), ("Production Backend", ["PostgreSQL integration", "Authentication basics", "API project checkpoint"])],
    "Python and FastAPI": [("Typed Python APIs", ["Python type hints", "FastAPI routes", "Pydantic validation"]), ("Database and Testing", ["SQLAlchemy sessions", "Authentication dependencies", "Test your API"])],
    "PostgreSQL Essentials": [("Relational Foundations", ["Tables and relationships", "SELECT and filtering", "Joins in practice"]), ("Reliable Data", ["Indexes and query plans", "Transactions", "Schema design exercise"])],
    "Git and Docker Workflow": [("Version Control", ["Commits and branches", "Pull request workflow", "Resolve merge conflicts"]), ("Containers", ["Images and containers", "Docker Compose", "Containerize a project"])],
}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "course"


def seed() -> None:
    with SessionLocal() as db:
        colleges = []
        for name in COLLEGES:
            college = db.scalar(select(College).where(College.name == name)) or College(name=name)
            db.add(college)
            colleges.append(college)
        programs = []
        for name in PROGRAMS:
            program = db.scalar(select(Program).where(Program.name == name)) or Program(name=name)
            db.add(program)
            programs.append(program)
        db.flush()
        existing = set(db.execute(select(CollegeProgram.college_id, CollegeProgram.program_id)).all())
        for college in colleges:
            for program in programs:
                if (college.id, program.id) not in existing:
                    db.add(CollegeProgram(college_id=college.id, program_id=program.id))
        for name, category in SKILLS.items():
            if not db.scalar(select(Skill).where(Skill.name == name)):
                db.add(Skill(name=name, category=category))
        for title, description, level, hours, skills in COURSES:
            course = db.scalar(select(Course).where(Course.title == title))
            if not course:
                course = Course(
                    title=title,
                    slug=slugify(title),
                    description=description,
                    level=level,
                    duration_hours=hours,
                    skills=skills,
                    status="published",
                    published_at=datetime.now(timezone.utc),
                )
                db.add(course)
                db.flush()
            if not course.sections:
                for section_number, (section_title, lessons) in enumerate(CURRICULUM[title], 1):
                    section = CourseSection(course_id=course.id, title=section_title, sequence=section_number)
                    db.add(section)
                    db.flush()
                    for lesson_number, lesson_title in enumerate(lessons, 1):
                        lesson_type = "quiz" if "check" in lesson_title.lower() else ("assignment" if any(word in lesson_title.lower() for word in ["build", "ship", "exercise", "project", "containerize"]) else "article")
                        db.add(CourseLesson(
                            section_id=section.id,
                            title=lesson_title,
                            lesson_type=lesson_type,
                            duration_minutes=15 if lesson_type == "article" else 25,
                            sequence=lesson_number,
                            article_content=f"Learn and practice {lesson_title.lower()} with guided examples and a short hands-on activity.",
                            is_preview=section_number == 1 and lesson_number == 1,
                        ))
        db.commit()


if __name__ == "__main__":
    seed()
