"""Test the fixed JD payload pattern mirrors what JDStudio now sends."""
import sys
sys.path.append('backend')
from fastapi.testclient import TestClient
from app.main import app
from app.routers.deps import get_current_user
from app.models.user import User, UserRole

mock_user = User(
    id='65c2a2c6-3064-4a04-b3de-5ef12eb08094',
    email='test@example.com',
    role=UserRole.recruiter,
    is_active=True
)
app.dependency_overrides[get_current_user] = lambda: mock_user
client = TestClient(app)

# 1. CREATE
create_payload = {
    'title': 'Data Scientist',
    'company': 'TechCorp',
    'domain': 'Data',
    'department': 'Engineering',
    'location': 'Pune',
    'employmentType': 'Full-time',
    'workMode': 'Hybrid',
    'salary': '12-18 LPA',
    'experienceLevel': 'Senior',
    'education': "Bachelor's in CS",
    'description': 'We are looking for a Data Scientist...',
    'requirements': '3+ years ML experience',
    'benefits': 'Health, PF',
    'skills': ['Python', 'Machine Learning', 'TensorFlow'],
    'preferredSkills': ['Docker', 'Kubernetes'],
    'certifications': ['AWS Certified ML'],
    'aiMatchingThreshold': 70,
    'selectedThreshold': 90,
    'waitingThreshold': 75,
    'status': 'Active',
}
r = client.post('/api/jd/', json=create_payload)
print("CREATE status:", r.status_code)
assert r.status_code == 201, r.text
jd = r.json()
jd_id = jd['id']
print(f"  → id={jd_id}, employment_type={jd['employment_type']}, experience_level={jd['experience_level']}")

# 2. UPDATE (simulating the edit flow with the FIXED clean payload)
update_payload = {
    'title': 'Senior Data Scientist',
    'company': 'TechCorp Updated',
    'domain': 'Data',
    'department': 'AI Research',
    'location': 'Mumbai',
    'employmentType': 'Contract',   # CHANGED
    'workMode': 'Remote',           # CHANGED
    'salary': '20-25 LPA',
    'experienceLevel': 'Lead / Manager',  # CHANGED
    'education': "Master's in AI",
    'description': 'Updated description',
    'requirements': '5+ years ML',
    'benefits': 'Health, PF, ESOP',
    'skills': ['Python', 'PyTorch', 'MLflow'],
    'preferredSkills': ['Kubernetes'],
    'certifications': [],
    'aiMatchingThreshold': 80,
    'selectedThreshold': 92,
    'waitingThreshold': 78,
    'status': 'Active',
}
r2 = client.put(f'/api/jd/{jd_id}', json=update_payload)
print("UPDATE status:", r2.status_code)
assert r2.status_code == 200, r2.text
updated = r2.json()
print(f"  → title={updated['title']}")
print(f"  → employment_type={updated['employment_type']} (expected: Contract)")
print(f"  → work_mode={updated['work_mode']} (expected: Remote)")
print(f"  → experience_level={updated['experience_level']} (expected: Lead / Manager)")
assert updated['employment_type'] == 'Contract', "Bug: employment_type not updated!"
assert updated['work_mode'] == 'Remote', "Bug: work_mode not updated!"
assert updated['experience_level'] == 'Lead / Manager', "Bug: experience_level not updated!"

# 3. DELETE
r3 = client.delete(f'/api/jd/{jd_id}')
print("DELETE status:", r3.status_code)
assert r3.status_code == 204, r3.text

print("\n✅ All tests PASSED — JD save/update/delete work correctly!")
