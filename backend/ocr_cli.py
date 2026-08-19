import cv2
import pytesseract
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


def load_image(image_path):
    """Load image from disk."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Unable to read the image.")

    return image


def preprocess_image(image):
    """Preprocess image for better OCR."""

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    processed = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        15
    )

    return processed


def extract_text(image):
    """Extract text using Tesseract OCR."""

    config = r'--oem 3 --psm 6'

    text = pytesseract.image_to_string(
        image,
        lang='eng',
        config=config
    )

    return text


def save_text(text, filename="extracted_text.txt"):
    """Save extracted text to a file."""

    with open(filename, "w", encoding="utf-8") as f:
        f.write(text)


def main():

    image_path = input("Enter image path: ")

    try:
        image = load_image(image_path)

        processed = preprocess_image(image)

        text = extract_text(processed)

        print("\n========== EXTRACTED TEXT ==========\n")
        print(text)

        save_text(text)

        cv2.imwrite("processed_image.png", processed)

        print("\nText saved as extracted_text.txt")
        print("Processed image saved as processed_image.png")

    except Exception as e:
        print("Error:", e)


if __name__ == "__main__":
    main()
