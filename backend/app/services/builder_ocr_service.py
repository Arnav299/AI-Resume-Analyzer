"""
Builder OCR Service
===================
A robust, production-ready text extraction service tailored for the resume builder.
Uses OpenCV for advanced preprocessing (denoising, contrast enhancement, orientation correction)
and pytesseract for OCR with confidence scoring.
"""
from __future__ import annotations

import io
import os
import time
import structlog
from typing import Dict, Any, Tuple
from fastapi import HTTPException

# Dependency guards
try:
    import numpy as np
    _NUMPY_AVAILABLE = True
except ImportError:
    _NUMPY_AVAILABLE = False

try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False

try:
    import pytesseract
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

try:
    from PIL import Image as PILImage
    _PIL_AVAILABLE = True
except ImportError:
    _PIL_AVAILABLE = False

logger = structlog.get_logger(__name__)

SUPPORTED_EXTENSIONS = (".png", ".jpg", ".jpeg")
MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

class OCRError(Exception):
    """Custom exception for OCR-related errors."""
    pass


def load_image_from_bytes(content: bytes, filename: str) -> "np.ndarray":
    """Decodes raw bytes into a cv2 BGR numpy array."""
    if not _CV2_AVAILABLE or not _NUMPY_AVAILABLE:
        raise OCRError("OpenCV or numpy not installed.")

    np_array = np.frombuffer(content, dtype=np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    if image is None:
        if _PIL_AVAILABLE:
            try:
                pil_img = PILImage.open(io.BytesIO(content)).convert("RGB")
                image = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            except Exception as exc:
                raise OCRError(f"Unable to decode image '{filename}': {exc}")
        else:
            raise OCRError(f"Unable to decode image '{filename}'. Invalid file or unsupported format.")
            
    return image


def fix_orientation(image: "np.ndarray") -> "np.ndarray":
    """
    Detects and corrects image orientation using pytesseract OSD.
    """
    if not _TESSERACT_AVAILABLE:
        return image
        
    try:
        # Convert to RGB for pytesseract
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        # Get orientation data
        osd = pytesseract.image_to_osd(rgb)
        
        # Parse rotation angle from OSD output
        angle = 0
        for line in osd.split('\n'):
            if line.startswith('Rotate:'):
                angle = int(line.split(':')[1].strip())
                break
                
        if angle == 90:
            image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
            logger.info("Rotated image 90 degrees clockwise.")
        elif angle == 180:
            image = cv2.rotate(image, cv2.ROTATE_180)
            logger.info("Rotated image 180 degrees.")
        elif angle == 270:
            image = cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)
            logger.info("Rotated image 90 degrees counter-clockwise.")
            
        return image
    except pytesseract.TesseractError:
        # OSD might fail if there's not enough text, continue with original image
        logger.warning("OSD failed to detect orientation. Proceeding with original orientation.")
        return image
    except Exception as e:
        logger.warning(f"Error during orientation check: {e}")
        return image


def preprocess_image(image: "np.ndarray") -> "np.ndarray":
    """
    Advanced preprocessing for better OCR accuracy.
    """
    # 1. Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 2. Contrast Limited Adaptive Histogram Equalization (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    contrast_enhanced = clahe.apply(gray)
    
    # 3. Denoising
    denoised = cv2.fastNlMeansDenoising(contrast_enhanced, h=30)
    
    # 4. Adaptive Thresholding
    processed = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 15
    )
    
    return processed


def extract_data(image: "np.ndarray") -> Tuple[str, float, int]:
    """
    Extracts text, calculates average confidence and word count using image_to_data.
    """
    if not _TESSERACT_AVAILABLE:
        raise OCRError("Tesseract not available.")
        
    config = r"--oem 3 --psm 3" # PSM 3: Fully automatic page segmentation
    
    # Run image_to_data which returns a TSV-like string
    try:
        data = pytesseract.image_to_data(image, lang="eng", config=config, output_type=pytesseract.Output.DICT)
    except Exception as e:
        raise OCRError(f"Tesseract OCR failed: {e}")
        
    words = []
    confidences = []
    
    # Iterate through the returned data
    for i in range(len(data['text'])):
        text_block = data['text'][i].strip()
        conf = int(data['conf'][i])
        
        # Filter out empty text and low confidence noise (-1 means no text)
        if text_block and conf != -1:
            words.append(text_block)
            confidences.append(conf)
            
    text = " ".join(words)
    word_count = len(words)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    
    return text, round(avg_confidence, 2), word_count


async def process_ocr_image(content: bytes, filename: str) -> Dict[str, Any]:
    """
    Full robust pipeline to extract text from a resume image.
    """
    start_time = time.time()
    logger.info(f"Starting OCR process for file: {filename}")
    
    # 1. File size validation
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        logger.error(f"File size {len(content)} exceeds 10MB limit.")
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")
        
    # 2. Extension validation
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        logger.error(f"Unsupported extension: {ext}")
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image format. Allowed formats: {', '.join(SUPPORTED_EXTENSIONS)}"
        )
        
    # Pipeline execution
    try:
        # Load
        image = load_image_from_bytes(content, filename)
        
        # Orientation correction
        image = fix_orientation(image)
        
        # Preprocess
        processed_image = preprocess_image(image)
        
        # Extract
        text, confidence, word_count = extract_data(processed_image)
        
        # Check for blank / unreadable images
        if word_count < 5 or confidence < 20.0:
            logger.warning("Low confidence or too few words extracted. Image might be blank or corrupted.")
            raise OCRError("Could not extract meaningful text. The image might be blank, blurry, or unreadable.")
            
        processing_time_ms = int((time.time() - start_time) * 1000)
        logger.info("OCR process completed successfully.", word_count=word_count, confidence=confidence, time_ms=processing_time_ms)
        
        return {
            "success": True,
            "text": text,
            "confidence": confidence,
            "word_count": word_count,
            "processing_time_ms": processing_time_ms
        }
        
    except HTTPException:
        raise
    except OCRError as e:
        logger.error(f"OCR Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during OCR processing.")
        raise HTTPException(status_code=500, detail="Internal server error during image processing.")
