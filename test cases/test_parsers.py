import asyncio
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.document_parser import extract_text_from_document
from app.services.image_parser import extract_text_from_image

async def test():
    print("Testing document_parser...")
    try:
        with open("docs/samples/good_resume.pdf", "rb") as f:
            content = f.read()
        res = await extract_text_from_document(content, "good_resume.pdf")
        print("Success:", res[:100])
    except Exception as e:
        print("Error parsing PDF:", e)

    print("\nTesting image_parser...")
    try:
        with open("docs/samples/good_resume.pdf", "rb") as f:  # Just sending a PDF to see if image_parser fails cleanly
            content = f.read()
        res = await extract_text_from_image(content, "good_resume.jpg")
        print("Success:", res[:100])
    except Exception as e:
        print("Error parsing Image:", e)

asyncio.run(test())
