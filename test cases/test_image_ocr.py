import httpx
from PIL import Image, ImageDraw, ImageFont

# Create a blank image
img = Image.new('RGB', (200, 100), color = (255, 255, 255))
d = ImageDraw.Draw(img)
d.text((10,10), "Hello World", fill=(0,0,0))
img.save('real_test_image.jpg')

# Now test the endpoint
try:
    with open("real_test_image.jpg", "rb") as f:
        files = {"file": ("real_test_image.jpg", f, "image/jpeg")}
        with httpx.Client() as client:
            resp = client.post("http://localhost:8000/api/resumes/parse-image", files=files)
        print("Status:", resp.status_code)
        if resp.status_code == 200:
            print("Response:", str(resp.json())[:200])
        else:
            print("Response:", resp.text)
except Exception as e:
    print("Error:", e)
