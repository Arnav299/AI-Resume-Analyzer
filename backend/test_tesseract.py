import sys

def main():
    try:
        import pytesseract
        print(f"pytesseract version: {pytesseract.__version__}")
        print(f"tesseract cmd: {pytesseract.pytesseract.tesseract_cmd}")
        print(pytesseract.get_tesseract_version())
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    main()
