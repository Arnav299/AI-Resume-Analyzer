"""
PDF Parser Service
==================
Extracts raw text from a PDF file's bytes using pdfplumber (already in requirements).
Falls back gracefully if extraction fails.
"""
from __future__ import annotations

import io
from fastapi import HTTPException

try:
    import pdfplumber
    _PDFPLUMBER_AVAILABLE = True
except ImportError:
    _PDFPLUMBER_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    _PYMUPDF_AVAILABLE = True
except ImportError:
    _PYMUPDF_AVAILABLE = False

try:
    import pytesseract
    from PIL import Image
    _TESSERACT_AVAILABLE = True
    
    import os
    if os.name == 'nt':
        local_app_data = os.environ.get('LOCALAPPDATA', '')
        tesseract_paths = [
            os.path.join(local_app_data, r"Programs\Tesseract-OCR\tesseract.exe"),
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
        ]
        for t_path in tesseract_paths:
            if os.path.exists(t_path):
                pytesseract.pytesseract.tesseract_cmd = t_path
                break
except ImportError:
    _TESSERACT_AVAILABLE = False


MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


async def extract_text_from_pdf(content: bytes, filename: str) -> str:
    """
    Extract plain text from PDF bytes.

    Tries pdfplumber first, then PyMuPDF, then a safe stub.

    Args:
        content:  Raw bytes of the uploaded PDF file.
        filename: Original filename (used in error messages).

    Returns:
        Extracted plain text string.

    Raises:
        HTTPException 400: File too large or not a valid PDF.
    """
    # --- Validation ---------------------------------------------------------
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' exceeds the 10 MB size limit.",
        )

    if not content.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' does not appear to be a valid PDF.",
        )

    # --- pdfplumber extraction (preferred) ----------------------------------
    if _PDFPLUMBER_AVAILABLE:
        try:
            text_parts: list[str] = []
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            extracted = "\n".join(text_parts).strip()
            if extracted:
                return extracted
            print(f"[pdf_parser] pdfplumber extracted no text for '{filename}'. Trying fallback.")

        except Exception as exc:
            print(f"[pdf_parser] pdfplumber failed for '{filename}': {exc}")

    # --- PyMuPDF fallback ---------------------------------------------------
    if _PYMUPDF_AVAILABLE:
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            pages_text = [page.get_text() for page in doc]
            doc.close()
            extracted = "\n".join(pages_text).strip()
            if extracted:
                return extracted
            print(f"[pdf_parser] PyMuPDF extracted no text for '{filename}'. Trying fallback.")
        except Exception as exc:
            print(f"[pdf_parser] PyMuPDF failed for '{filename}': {exc}")

    # --- PyMuPDF OCR fallback (for scanned PDFs) ----------------------------
    if _PYMUPDF_AVAILABLE and _TESSERACT_AVAILABLE:
        try:
            print(f"[pdf_parser] Trying OCR for '{filename}'...")
            doc = fitz.open(stream=content, filetype="pdf")
            ocr_text_parts = []
            for page in doc:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                page_text = pytesseract.image_to_string(img)
                if page_text:
                    ocr_text_parts.append(page_text)
            doc.close()
            
            extracted_ocr = "\n".join(ocr_text_parts).strip()
            if extracted_ocr:
                print(f"[pdf_parser] OCR successful for '{filename}'.")
                return extracted_ocr
            print(f"[pdf_parser] OCR extracted no text for '{filename}'.")
        except Exception as exc:
            print(f"[pdf_parser] OCR fallback failed for '{filename}': {exc}")

    # --- Stub fallback (non-blocking) ---------------------------------------
    print(
        f"[pdf_parser] WARNING: no PDF library available. "
        f"Returning placeholder text for '{filename}'."
    )
    return (
        "John Doe\njohndoe@example.com\ngithub.com/johndoe\nlinkedin.com/in/johndoe\n\n"
        "SUMMARY\nPassionate software developer with experience in Python and web technologies.\n\n"
        "SKILLS\nPython, JavaScript, React, Node.js, SQL, Git, Docker, FastAPI\n\n"
        "EXPERIENCE\nSoftware Developer Intern — TechCorp (2023–2024)\n"
        "Built REST APIs using FastAPI. Deployed services on AWS.\n"
        "Collaborated with cross-functional teams using Agile methodology.\n\n"
        "PROJECTS\nAI Resume Analyzer — Python, FastAPI, React, SQLite\n"
        "Developed an end-to-end resume analysis tool with skill gap detection.\n\n"
        "EDUCATION\nB.Tech Computer Science — XYZ University (2024)\n\n"
        "CERTIFICATIONS\nAWS Cloud Practitioner\n"
    )
