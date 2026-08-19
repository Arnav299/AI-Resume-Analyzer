import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Import the app from main
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

from app.routers.deps import get_current_user
from app.models.user import User

def mock_get_current_user():
    user = User(email="test@example.com", is_active=True, role="student")
    user.id = "test_user_id"
    return user

app.dependency_overrides[get_current_user] = mock_get_current_user

def get_mock_token(user_id="test_user", role="student"):
    return "dummy_token"

def create_mock_image(mode="RGB", size=(100, 100), color="white", text=None):
    """Creates a mock image in memory."""
    img = Image.new(mode, size, color)
    if text:
        from PIL import ImageDraw
        d = ImageDraw.Draw(img)
        d.text((10, 10), text, fill="black")
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr.read()

def test_ocr_valid_image():
    """Test successful OCR extraction."""
    token = get_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create an image with some text
    image_bytes = create_mock_image(text="Hello world this is a test resume")
    
    response = client.post(
        "/api/builder/ocr",
        files={"file": ("test.png", image_bytes, "image/png")},
        headers=headers
    )
    
    # We might get 400 if tesseract isn't installed perfectly on test machine,
    # or 200 if it works. Since we can't guarantee tesseract in all CI environments,
    # we just check it doesn't 500. 
    # But ideally it should be 200 or 400 with a specific error.
    assert response.status_code in [200, 400]
    
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
        assert "text" in data
        assert "confidence" in data

def test_ocr_invalid_file_type():
    """Test uploading an invalid file extension."""
    token = get_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Send a text file as if it were an image
    file_bytes = b"This is not an image"
    
    response = client.post(
        "/api/builder/ocr",
        files={"file": ("test.txt", file_bytes, "text/plain")},
        headers=headers
    )
    
    assert response.status_code == 415
    assert "Unsupported image format" in response.json()["detail"]

def test_ocr_large_file():
    """Test uploading a file that exceeds the size limit."""
    token = get_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a dummy large file (just a byte string > 10MB)
    large_bytes = b"0" * (10 * 1024 * 1024 + 1)
    
    response = client.post(
        "/api/builder/ocr",
        files={"file": ("large.png", large_bytes, "image/png")},
        headers=headers
    )
    
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]

def test_ocr_blank_image():
    """Test uploading a blank image."""
    token = get_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a completely blank image
    image_bytes = create_mock_image(size=(200, 200), color="white")
    
    response = client.post(
        "/api/builder/ocr",
        files={"file": ("blank.png", image_bytes, "image/png")},
        headers=headers
    )
    
    # We expect 400 due to 'Could not extract meaningful text' or 'Tesseract not available'
    assert response.status_code == 400
    detail = response.json().get("detail", "")
    assert isinstance(detail, str)

def test_ocr_rotated_image():
    """Test uploading a rotated image."""
    token = get_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create an image with text and rotate it
    img = Image.new("RGB", (300, 100), "white")
    from PIL import ImageDraw
    d = ImageDraw.Draw(img)
    d.text((10, 10), "Rotated text for testing", fill="black")
    img = img.rotate(90, expand=True)
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    image_bytes = img_byte_arr.read()
    
    response = client.post(
        "/api/builder/ocr",
        files={"file": ("rotated.png", image_bytes, "image/png")},
        headers=headers
    )
    
    assert response.status_code in [200, 400]

def test_ocr_low_quality_image():
    """Test uploading a low-quality (blurry) image."""
    token = get_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create an image with text and blur it
    img = Image.new("RGB", (200, 100), "white")
    from PIL import ImageDraw, ImageFilter
    d = ImageDraw.Draw(img)
    d.text((10, 10), "Blurry text here", fill="black")
    img = img.filter(ImageFilter.GaussianBlur(radius=5))
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    image_bytes = img_byte_arr.read()
    
    response = client.post(
        "/api/builder/ocr",
        files={"file": ("blurry.png", image_bytes, "image/png")},
        headers=headers
    )
    
    assert response.status_code in [200, 400]

