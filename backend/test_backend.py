import os
import io
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Set up test database environment before importing app
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_resume_analyzer.db"

from app.main import app
from app.models.base import Base
from app.core.database import get_db
from app.models import User, StudentProfile, Resume, CareerRole, AnalysisResult, MentorFeedback

# Setup test database connection
engine = create_engine("sqlite:///./test_resume_analyzer.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    print("TEST_DB: Base metadata tables before create_all:", list(Base.metadata.tables.keys()))
    Base.metadata.create_all(bind=engine)
    print("TEST_DB: Base metadata tables after create_all:", list(Base.metadata.tables.keys()))
    
    # Seed data using TestingSessionLocal
    db = TestingSessionLocal()
    try:
        from seed_skills import SKILLS, ROLE_SKILLS
        from app.models.skill import Skill
        from app.models.role_skill import RoleSkill
        
        skill_map = {}
        for skill_name, category in SKILLS:
            skill = db.query(Skill).filter(Skill.skill_name == skill_name).first()
            if not skill:
                skill = Skill(skill_name=skill_name, category=category)
                db.add(skill)
                db.commit()
                db.refresh(skill)
            skill_map[skill_name.lower()] = str(skill.id)
            
        for role_key, skill_weights in ROLE_SKILLS.items():
            role_name = role_key.title()
            role = db.query(CareerRole).filter(CareerRole.role_name == role_name).first()
            if not role:
                role = CareerRole(role_name=role_name)
                db.add(role)
                db.commit()
                db.refresh(role)
            
            for skill_name, weight in skill_weights:
                skill_id = skill_map.get(skill_name.lower())
                if skill_id:
                    existing = db.query(RoleSkill).filter(
                        RoleSkill.role_id == str(role.id),
                        RoleSkill.skill_id == skill_id
                    ).first()
                    if not existing:
                        db.add(RoleSkill(role_id=str(role.id), skill_id=skill_id, importance_weight=weight))
        db.commit()
                
        # Seed users
        from app.core.security import get_password_hash
        test_users = [
            {"email": "student_test@example.com", "password": "password", "role": "student", "full_name": "Test Student"},
            {"email": "mentor_test@example.com", "password": "password", "role": "mentor", "full_name": "Test Mentor"},
            {"email": "admin_test@example.com", "password": "password", "role": "admin", "full_name": "Test Admin"}
        ]
        for user_data in test_users:
            user = db.query(User).filter(User.email == user_data["email"]).first()
            if not user:
                new_user = User(
                    email=user_data["email"],
                    password_hash=get_password_hash(user_data["password"]),
                    role=user_data["role"],
                    full_name=user_data["full_name"]
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                
                if user_data["role"] == "student":
                    profile = StudentProfile(user_id=new_user.id)
                    db.add(profile)
        db.commit()
    finally:
        db.close()
        
    yield
    
    # Tear down tables and remove db file
    try:
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("./test_resume_analyzer.db"):
            os.remove("./test_resume_analyzer.db")
    except PermissionError:
        pass  # Windows file lock workaround

async_engine = create_async_engine("sqlite+aiosqlite:///./test_resume_analyzer.db", connect_args={"check_same_thread": False})
TestingAsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

# Override db dependency
async def override_get_db():
    async with TestingAsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_login_success():
    response = client.post(
        "/api/auth/login",
        data={"username": "student_test@example.com", "password": "password"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "student"

def test_login_failure():
    response = client.post(
        "/api/auth/login",
        data={"username": "student_test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_rbac_restrictions():
    # Login as student
    student_login = client.post(
        "/api/auth/login",
        data={"username": "student_test@example.com", "password": "password"}
    ).json()
    student_token = student_login["access_token"]
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Try accessing mentor dashboard (should fail with 403)
    response = client.get("/api/dashboard/mentor", headers=headers)
    assert response.status_code == 403

def test_resume_upload_and_analysis_flow():
    # 1. Login as student
    student_login = client.post(
        "/api/auth/login",
        data={"username": "student_test@example.com", "password": "password"}
    ).json()
    student_token = student_login["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    # 2. Get profile to find student ID
    me_resp = client.get("/api/auth/me", headers=student_headers)
    assert me_resp.status_code == 200
    student_id = me_resp.json()["id"]
    
    # 3. Dynamically generate a simple PDF using ReportLab
    import io
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    # Content has: email, phone, skills (Python, SQL, Git, React), education, experience, achievements, and LinkedIn link
    resume_text = (
        "Jane Doe\n"
        "Email: jane@example.com\n"
        "Phone: 999-999-9999\n"
        "LinkedIn: linkedin.com/in/janedoe\n"
        "GitHub: github.com/janedoe\n"
        "\n"
        "Education:\n"
        "Bachelor of Science in Computer Science - GPA 3.9\n"
        "\n"
        "Skills:\n"
        "Python, SQL, React, Git, Teamwork, Leadership\n"
        "\n"
        "Projects:\n"
        "Built a Full Stack Web Application. Managed git repo for collaboration.\n"
        "\n"
        "Experience:\n"
        "Software Engineering Intern at Tech Corp.\n"
        "\n"
        "Certifications:\n"
        "AWS Certified Cloud Practitioner\n"
        "\n"
        "Achievements:\n"
        "Winner of Local Hackathon 2025\n"
    )
    y = 800
    for line in resume_text.split("\n"):
        c.drawString(50, y, line)
        y -= 15
    c.save()
    pdf_bytes = buf.getvalue()
    
    # 4. Upload resume
    file_payload = {"file": ("jane_resume.pdf", pdf_bytes, "application/pdf")}
    upload_resp = client.post("/api/resumes/upload", files=file_payload, headers=student_headers)
    assert upload_resp.status_code == 200
    resume_data = upload_resp.json()
    assert resume_data["filename"] == "jane_resume.pdf"
    resume_id = resume_data["id"]
    
    # 5. Fetch Career Roles to get Full Stack Developer Role ID
    roles_resp = client.get("/api/career-roles", headers=student_headers)
    assert roles_resp.status_code == 200
    roles = roles_resp.json()
    full_stack_role = next(r for r in roles if r["role_name"] == "Full Stack Developer")
    role_id = full_stack_role["id"]
    
    # 6. Analyze resume for Full Stack Developer target role (queues background task)
    analyze_resp = client.post(
        f"/api/resumes/{resume_id}/analyze",
        json={"resume_id": resume_id, "target_role_id": role_id},
        headers=student_headers
    )
    assert analyze_resp.status_code == 200
    job_info = analyze_resp.json()
    assert "job_id" in job_info
    job_id = job_info["job_id"]

    # Fetch job status result (background task runs immediately when using TestClient)
    job_status_resp = client.get(f"/api/jobs/{job_id}", headers=student_headers)
    assert job_status_resp.status_code == 200
    job_status = job_status_resp.json()
    assert job_status["status"] == "Completed"
    analysis_data = job_status["result"]

    # Verify values
    assert analysis_data["resume_id"] == resume_id
    assert analysis_data["target_role_id"] == role_id
    
    # Skills check: Python, SQL, React, Git are technical skills in our predefined library
    # required for Full Stack are: HTML, CSS, JavaScript, React, Node.js, Git
    # Matched skills should contain React, Git (since Python, SQL are in library but not Full Stack required)
    assert "react" in analysis_data["matched_skills"]
    assert "git" in analysis_data["matched_skills"]
    assert "html" in analysis_data["missing_skills"]
    
    # Readiness Score should be positive
    # Expected score depends on full seed data (now ~46.67)
    assert analysis_data["readiness_score"] > 40.0
    
    # Completeness is calculated internally but not exposed in AnalysisDetailResponse
    
    # Soft skills should contain Leadership, Teamwork
    assert "leadership" in analysis_data["soft_skills"]
    assert "teamwork" in analysis_data["soft_skills"]
    
    # Recommendations should be present
    assert "learning_plan" in analysis_data
    assert len(analysis_data["learning_plan"]) > 0
    
    # 7. Access student dashboard
    dash_resp = client.get("/api/dashboard/student", headers=student_headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["latest_analysis"]["id"] == analysis_data["id"]
    
    # Verify opportunity cost exists on dashboard
    assert "opportunity_cost" in dash_data
    assert isinstance(dash_data["opportunity_cost"], list)
    
    # 8. Mentor actions
    mentor_login = client.post(
        "/api/auth/login",
        data={"username": "mentor_test@example.com", "password": "password"}
    ).json()
    mentor_token = mentor_login["access_token"]
    mentor_headers = {"Authorization": f"Bearer {mentor_token}"}
    
    # Submit Feedback
    feedback_resp = client.post(
        "/api/feedback",
        json={
            "analysis_result_id": analysis_data["id"],
            "rating": 5,
            "comments": "Excellent resume structure. Just need to pick up HTML/CSS/JavaScript.",
            "improvement_actions": ["Take the recommend courses for HTML/CSS."]
        },
        headers=mentor_headers
    )
    assert feedback_resp.status_code == 201
    feedback_data = feedback_resp.json()
    assert feedback_data["rating"] == 5
    
    # Check mentor dashboard
    mentor_dash_resp = client.get("/api/dashboard/mentor", headers=mentor_headers)
    assert mentor_dash_resp.status_code == 200
    mentor_dash_data = mentor_dash_resp.json()
    
    # Find test student in list
    student_record = next(s for s in mentor_dash_data["students"] if s["email"] == "student_test@example.com")
    assert student_record["analysis_status"] == "Completed"
    assert student_record["feedback_status"] == "Completed"
    assert student_record["latest_readiness_score"] == analysis_data["readiness_score"]


def test_jd_studio_crud_flow():
    # Login as mentor / recruiter or student to test JD Studio endpoints
    login_resp = client.post(
        "/api/auth/login",
        data={"username": "student_test@example.com", "password": "password"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a Job Description
    create_payload = {
        "title": "Senior Python Backend Engineer",
        "company": "Innovant AI",
        "location": "Remote",
        "employmentType": "Full-time",
        "salary": "$130k - $160k",
        "experienceLevel": "Senior",
        "description": "Lead the API development and database architecture.",
        "requirements": "Strong expertise in FastAPI and SQLAlchemy.",
        "skills": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker"],
        "weights": {"technical": 50, "soft_skills": 30, "experience": 20}
    }
    resp = client.post("/api/jd/", json=create_payload, headers=headers)
    assert resp.status_code == 201
    jd_data = resp.json()
    assert jd_data["title"] == "Senior Python Backend Engineer"
    assert jd_data["company"] == "Innovant AI"
    jd_id = jd_data["id"]

    # 2. Get all JDs for current user
    list_resp = client.get("/api/jd/", headers=headers)
    assert list_resp.status_code == 200
    jds = list_resp.json()
    assert len(jds) >= 1
    assert any(j["id"] == jd_id for j in jds)

    # 3. Get single JD by ID
    get_resp = client.get(f"/api/jd/{jd_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Senior Python Backend Engineer"

    # 4. Update JD
    update_resp = client.put(
        f"/api/jd/{jd_id}",
        json={"title": "Lead Python Backend Engineer", "salary": "$150k - $180k"},
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Lead Python Backend Engineer"
    assert update_resp.json()["salary"] == "$150k - $180k"

    # 5. Delete JD
    del_resp = client.delete(f"/api/jd/{jd_id}", headers=headers)
    assert del_resp.status_code == 204

    # Verify deletion
    verify_resp = client.get(f"/api/jd/{jd_id}", headers=headers)
    assert verify_resp.status_code == 404
