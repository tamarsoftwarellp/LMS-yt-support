import re
from io import BytesIO

from docx import Document
from pypdf import PdfReader


def extract_resume_text(content: bytes, extension: str) -> str:
    if extension == ".pdf":
        reader = PdfReader(BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if extension == ".docx":
        document = Document(BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    raise ValueError("Only PDF and DOCX resumes are supported")


def detect_skills(text: str, known_skills: list[str]) -> list[str]:
    lowered = text.lower()
    return sorted({name for name in known_skills if re.search(rf"(?<!\w){re.escape(name.lower())}(?!\w)", lowered)}, key=str.lower)

