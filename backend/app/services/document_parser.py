"""
Document Parser Service
==================
Extracts raw text from PDF and DOCX files.
Features smart detection, PyMuPDF + pdfplumber, mammoth + python-docx,
and OCR fallback for scanned PDFs.
"""
import io
import asyncio
import os
from fastapi import HTTPException

try:
    import filetype
    _FILETYPE_AVAILABLE = True
except ImportError:
    _FILETYPE_AVAILABLE = False

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
    import mammoth
    _MAMMOTH_AVAILABLE = True
except ImportError:
    _MAMMOTH_AVAILABLE = False

try:
    import docx
    _DOCX_AVAILABLE = True
except ImportError:
    _DOCX_AVAILABLE = False

try:
    import pytesseract
    from PIL import Image
    _TESSERACT_AVAILABLE = True
    
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

MAX_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

def _extract_text_sync(content: bytes, filename: str, mime: str) -> str:
    extracted = ""

    if mime == 'application/pdf':
        # 1. Try PyMuPDF
        if _PYMUPDF_AVAILABLE:
            try:
                doc = fitz.open(stream=content, filetype="pdf")
                if doc.needs_pass:
                    raise HTTPException(status_code=403, detail="The PDF file is password protected. Please unlock it and try again.")
                pages_text = [page.get_text() for page in doc]
                doc.close()
                extracted = "\n".join(pages_text).strip()
            except HTTPException:
                raise
            except Exception as exc:
                print(f"[document_parser] PyMuPDF failed: {exc}")
                
        # 2. Try pdfplumber if PyMuPDF failed or didn't get enough text
        if (not extracted or len(extracted) < 20) and _PDFPLUMBER_AVAILABLE:
            try:
                text_parts = []
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_parts.append(page_text)
                plumber_text = "\n".join(text_parts).strip()
                if len(plumber_text) > len(extracted):
                    extracted = plumber_text
            except Exception as exc:
                print(f"[document_parser] pdfplumber failed: {exc}")
                
        if extracted and len(extracted.strip()) >= 20:
            return extracted

        # 3. OCR fallback for scanned PDFs
        if _PYMUPDF_AVAILABLE:
            if not _TESSERACT_AVAILABLE:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        "This PDF appears to be a scanned image with no selectable text. "
                        "Tesseract OCR is not installed on this server, so it cannot be read automatically. "
                        "Please upload a text-based PDF (e.g. exported from Word or Google Docs), "
                        "or install Tesseract OCR on the server to enable scanned PDF support."
                    )
                )

            try:
                print(f"[document_parser] Scanned PDF detected. Running Tesseract OCR fallback for '{filename}'...")
                doc = fitz.open(stream=content, filetype="pdf")
                if doc.needs_pass:
                    raise HTTPException(status_code=403, detail="The PDF file is password protected.")
                ocr_text_parts = []
                for page in doc:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    try:
                        page_text = pytesseract.image_to_string(img, lang="eng", config=r"--oem 3 --psm 6")
                    except pytesseract.TesseractNotFoundError:
                        raise HTTPException(
                            status_code=503,
                            detail=(
                                "Tesseract OCR is not installed or not found on PATH. "
                                "Please upload a text-based PDF instead of a scanned image."
                            )
                        )
                    if page_text:
                        ocr_text_parts.append(page_text)
                doc.close()
                extracted_ocr = "\n".join(ocr_text_parts).strip()

                if extracted_ocr and len(extracted_ocr.strip()) >= 20:
                    print(f"[document_parser] OCR successful for '{filename}'.")
                    return extracted_ocr
                else:
                    raise HTTPException(
                        status_code=422,
                        detail="OCR ran on the scanned PDF but could not detect readable text. Ensure the scan is high quality and clear."
                    )
            except HTTPException:
                raise
            except Exception as exc:
                print(f"[document_parser] OCR fallback failed for '{filename}': {exc}")
                raise HTTPException(status_code=500, detail=f"An error occurred while running OCR on the scanned PDF: {exc}")
                
        return extracted
                
    elif mime in ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']:
        # 1. Try mammoth (superior for DOCX)
        if _MAMMOTH_AVAILABLE and mime == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            try:
                result = mammoth.extract_raw_text(io.BytesIO(content))
                if result.value and len(result.value.strip()) > 10:
                    return result.value.strip()
            except Exception as exc:
                print(f"[document_parser] mammoth failed: {exc}")

        # 2. Try python-docx
        if _DOCX_AVAILABLE:
            try:
                doc = docx.Document(io.BytesIO(content))
                text_parts = [para.text for para in doc.paragraphs]
                extracted = "\n".join(text_parts).strip()
                if extracted:
                    return extracted
            except Exception as exc:
                print(f"[document_parser] python-docx failed: {exc}")
                raise HTTPException(status_code=422, detail="Could not read the Word document. It may be corrupted or in an older format.")
    
    return ""

async def extract_text_from_document(content: bytes, filename: str) -> str:
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' exceeds the 20 MB size limit.",
        )

    # Smart detection using filetype (magic bytes)
    mime = None
    if _FILETYPE_AVAILABLE:
        kind = filetype.guess(content)
        if kind:
            mime = kind.mime
            
    # Fallback to extension if filetype fails or isn't installed
    if not mime:
        ext = filename.lower().split('.')[-1]
        if ext == 'pdf':
            mime = 'application/pdf'
        elif ext == 'docx':
            mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif ext == 'doc':
            mime = 'application/msword'

    allowed_mimes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ]
    
    if mime not in allowed_mimes:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file format detected. Only PDF and DOC/DOCX are allowed. Uploaded: {mime or 'Unknown'}",
        )

    if mime == 'application/pdf':
        if not content.startswith(b"%PDF"):
            raise HTTPException(
                status_code=422,
                detail=f"File '{filename}' is corrupted or not a valid PDF file.",
            )

    extracted = await asyncio.to_thread(_extract_text_sync, content, filename, mime)

    if not extracted or len(extracted.strip()) < 20:
        print(f"[document_parser] Extraction failed for '{filename}'. Cannot parse.")
        raise HTTPException(
            status_code=422, 
            detail="Could not extract any meaningful text from the document. The file may be an empty document or contain unreadable fonts. Please try uploading a different file."
        )

    return extracted
