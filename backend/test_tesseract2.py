import numpy as np
import pytesseract

def main():
    try:
        image = np.zeros((100, 100, 3), dtype=np.uint8)
        text = pytesseract.image_to_string(image)
        print("SUCCESS, text:", repr(text))
    except Exception as e:
        print("ERROR:", e)

if __name__ == '__main__':
    main()
