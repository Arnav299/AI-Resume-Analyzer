import asyncio
import sys
sys.path.append('backend')
from fastapi.testclient import TestClient
from app.main import app
from app.routers.deps import get_current_user
from app.models.user import User, UserRole
import uuid

# Mock the user
mock_user = User(
    id="65c2a2c6-3064-4a04-b3de-5ef12eb08094",
    email="test@example.com",
    role=UserRole.recruiter,
    is_active=True
)

app.dependency_overrides[get_current_user] = lambda: mock_user
client = TestClient(app)

# Create one
create_resp = client.post('/api/jd/', json={
    'title': 'Frontend Update Test',
    'employmentType': 'Full-time'
})
print("Create status:", create_resp.status_code)
if create_resp.status_code == 201 or create_resp.status_code == 409:
    # If 409, fetch it
    jd = create_resp.json() if create_resp.status_code == 201 else client.get('/api/jd/').json()[0]
    jd_id = jd['id']
    
    # Simulate frontend update
    payload = {
        **jd,
        'title': 'Frontend Update Test Modified',
        'employmentType': 'Contract',
        'skills': ['React'],
        'preferredSkills': ['Vue']
    }
    
    update_resp = client.put(f'/api/jd/{jd_id}', json=payload)
    print("Update status:", update_resp.status_code)
    print("Update response:", update_resp.text)
else:
    print(create_resp.text)
