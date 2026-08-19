import sys
import asyncio
sys.path.append('backend')
from fastapi.testclient import TestClient
from app.main import app
from app.routers.deps import get_current_user
from app.models.user import User, UserRole
import uuid

# Mock the user
mock_user = User(
    id=str(uuid.uuid4()),
    email="test@example.com",
    role=UserRole.recruiter,
    is_active=True
)

app.dependency_overrides[get_current_user] = lambda: mock_user

client = TestClient(app)

resp = client.post('/api/jd/', json={
    'title': 'Test JD',
    'company': 'Company',
    'location': 'Location',
    'employmentType': 'Full-time',
    'salary': '100k',
    'experienceLevel': 'Mid-Level',
    'description': 'Desc',
    'requirements': 'Req',
    'skills': ['React'],
    'weights': {}
})

print("Status:", resp.status_code)
print("Response:", resp.text)
