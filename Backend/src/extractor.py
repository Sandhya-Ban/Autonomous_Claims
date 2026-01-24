import pdfplumber
from pathlib import Path


def read_txt(file_path: str) -> str:
    return Path(file_path).read_text(encoding="utf-8", errors="ignore")


def read_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"
    return text


def load_document(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()

    if ext == ".txt":
        return read_txt(file_path)

    if ext == ".pdf":
        return read_pdf(file_path)

    raise ValueError("Unsupported file type. Only PDF and TXT allowed.")
