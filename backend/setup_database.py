"""
=============================================================================
backend/setup_database.py  —  Full DB setup + rich seed data
=============================================================================
Covers ALL 20 models:
  users, student_profiles, career_roles, skills, role_skills,
  resumes, resume_parsed_data, resume_skills, analysis_results,
  skill_gap_analysis, career_recommendations, learning_paths,
  learning_path_skills, user_recommendations, mentor_feedbacks,
  student_dashboard_metrics, activity_logs, ai_recommendation_logs,
  interview_scorecards, pipeline_entries

Run from the backend/ folder:
    python setup_database.py
=============================================================================
"""
import asyncio, sys, os, uuid
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app.core.config import get_settings
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    get_settings().DATABASE_URL,
)

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# ── Import every model so metadata is fully populated ────────────────────
from app.models import (
    Base, User, CareerRole, Skill, RoleSkill, StudentProfile,
    Resume, ResumeParsedData, ResumeSkill, AnalysisResult,
    SkillGapAnalysis, CareerRecommendation, LearningPath,
    LearningPathSkill, UserRecommendation, MentorFeedback,
    StudentDashboardMetrics, ActivityLog, AIRecommendationLog,
    InterviewScorecard, PipelineEntry, JobDescription,
)
from app.models.user import UserRole
from app.models.skill import SkillCategory
from app.models.resume import UploadStatus
from app.models.skill_gap_analysis import GapType
from app.models.resume_skill import ExtractionSource
from app.models.learning_path import DifficultyLevel
from app.models.user_recommendation import PriorityLevel
from app.core.security import get_password_hash

# ── Engine ────────────────────────────────────────────────────────────────
_is_sqlite = DATABASE_URL.startswith("sqlite")
_engine_kw = {"echo": False}
if not _is_sqlite:
    _engine_kw.update({"pool_size": 5, "max_overflow": 5, "pool_pre_ping": True})

engine          = create_async_engine(DATABASE_URL, **_engine_kw)
AsyncSession_   = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# ── Tiny helpers ──────────────────────────────────────────────────────────
def uid():   return str(uuid.uuid4())
def now():   return datetime.now(timezone.utc)
def ago(**k):return now() - timedelta(**k)


# =============================================================================
# REFERENCE DATA
# =============================================================================

CAREER_ROLES = [
    ("Frontend Developer",        "Build UIs with React / Vue / Angular",                 "Software Engineering"),
    ("Backend Developer",         "Server-side logic, APIs, databases",                    "Software Engineering"),
    ("Full Stack Developer",      "End-to-end web development",                            "Software Engineering"),
    ("Data Analyst",              "Explore data, build dashboards and insights",           "Data & Analytics"),
    ("Data Scientist",            "ML models, statistical analysis, predictions",          "Data & Analytics"),
    ("Machine Learning Engineer", "Design and deploy ML pipelines at scale",               "AI/ML"),
    ("DevOps Engineer",           "CI/CD, infrastructure, cloud automation",               "Infrastructure"),
    ("Cloud Architect",           "AWS/GCP/Azure design and cost optimisation",            "Infrastructure"),
    ("UI/UX Designer",            "User research, wireframing, prototyping",               "Design"),
    ("Mobile App Developer",      "iOS and Android application development",               "Software Engineering"),
    ("QA Engineer",               "Automated and manual testing, quality assurance",       "Quality"),
    ("Cybersecurity Analyst",     "Threat detection, vulnerability assessment",            "Security"),
    ("Database Administrator",    "Schema design, query optimisation, backups",            "Data & Analytics"),
    ("Product Manager",           "Roadmap, stakeholder management, delivery",             "Product"),
    ("Business Analyst",          "Requirements gathering, process modelling",             "Business"),
]

SKILLS = [
    # Programming
    ("Python",             SkillCategory.Programming),
    ("JavaScript",         SkillCategory.Programming),
    ("TypeScript",         SkillCategory.Programming),
    ("Java",               SkillCategory.Programming),
    ("C++",                SkillCategory.Programming),
    ("Go",                 SkillCategory.Programming),
    ("Kotlin",             SkillCategory.Programming),
    ("Swift",              SkillCategory.Programming),
    # Frontend
    ("React",              SkillCategory.Frontend),
    ("Next.js",            SkillCategory.Frontend),
    ("Vue.js",             SkillCategory.Frontend),
    ("Angular",            SkillCategory.Frontend),
    ("HTML5",              SkillCategory.Frontend),
    ("CSS3",               SkillCategory.Frontend),
    ("Tailwind CSS",       SkillCategory.Frontend),
    ("Redux",              SkillCategory.Frontend),
    # Backend
    ("FastAPI",            SkillCategory.Backend),
    ("Django",             SkillCategory.Backend),
    ("Flask",              SkillCategory.Backend),
    ("Node.js",            SkillCategory.Backend),
    ("Express.js",         SkillCategory.Backend),
    ("Spring Boot",        SkillCategory.Backend),
    ("REST APIs",          SkillCategory.Backend),
    ("GraphQL",            SkillCategory.Backend),
    # Database
    ("PostgreSQL",         SkillCategory.Database),
    ("MySQL",              SkillCategory.Database),
    ("MongoDB",            SkillCategory.Database),
    ("Redis",              SkillCategory.Database),
    ("SQLite",             SkillCategory.Database),
    ("SQLAlchemy",         SkillCategory.Database),
    ("Elasticsearch",      SkillCategory.Database),
    ("SQL",                SkillCategory.Database),
    # Cloud & DevOps
    ("AWS",                SkillCategory.Cloud),
    ("Google Cloud",       SkillCategory.Cloud),
    ("Azure",              SkillCategory.Cloud),
    ("Docker",             SkillCategory.DevOps),
    ("Kubernetes",         SkillCategory.DevOps),
    ("Git",                SkillCategory.DevOps),
    ("GitHub Actions",     SkillCategory.DevOps),
    ("Terraform",          SkillCategory.DevOps),
    ("Linux",              SkillCategory.DevOps),
    ("Nginx",              SkillCategory.DevOps),
    # AI/ML
    ("Machine Learning",   SkillCategory.AI_ML),
    ("Deep Learning",      SkillCategory.AI_ML),
    ("TensorFlow",         SkillCategory.AI_ML),
    ("PyTorch",            SkillCategory.AI_ML),
    ("Scikit-learn",       SkillCategory.AI_ML),
    ("NLP",                SkillCategory.AI_ML),
    ("Computer Vision",    SkillCategory.AI_ML),
    # Data Analytics
    ("Pandas",             SkillCategory.Data_Analytics),
    ("NumPy",              SkillCategory.Data_Analytics),
    ("Power BI",           SkillCategory.Data_Analytics),
    ("Tableau",            SkillCategory.Data_Analytics),
    # Soft Skills
    ("Communication",      SkillCategory.Soft_Skills),
    ("Problem Solving",    SkillCategory.Soft_Skills),
    ("Team Collaboration", SkillCategory.Soft_Skills),
    ("Leadership",         SkillCategory.Soft_Skills),
    ("Agile / Scrum",      SkillCategory.Soft_Skills),
    ("Time Management",    SkillCategory.Soft_Skills),
]

# role_name → [(skill_name, importance_weight 1-10)]
ROLE_SKILLS_MAP = {
    "Frontend Developer":        [("React",9),("JavaScript",10),("TypeScript",8),("HTML5",10),
                                   ("CSS3",9),("Tailwind CSS",7),("Redux",6),("Git",8),("REST APIs",7)],
    "Backend Developer":         [("Python",9),("FastAPI",8),("Django",7),("PostgreSQL",9),
                                   ("REST APIs",10),("Docker",7),("Git",8),("Redis",6),("SQL",8)],
    "Full Stack Developer":      [("React",8),("Node.js",8),("JavaScript",9),("PostgreSQL",7),
                                   ("REST APIs",9),("Git",8),("Docker",6),("TypeScript",7)],
    "Data Analyst":              [("Python",8),("SQL",10),("Pandas",9),("Power BI",8),
                                   ("Tableau",7),("NumPy",7),("Communication",8),("Excel",6)],
    "Data Scientist":            [("Python",10),("Machine Learning",10),("Deep Learning",8),
                                   ("Scikit-learn",9),("Pandas",9),("TensorFlow",7),("SQL",7),("NLP",7)],
    "Machine Learning Engineer": [("Python",10),("TensorFlow",9),("PyTorch",9),("Machine Learning",10),
                                   ("Docker",8),("Kubernetes",7),("AWS",7)],
    "DevOps Engineer":           [("Docker",10),("Kubernetes",10),("AWS",8),("Linux",9),
                                   ("Terraform",8),("GitHub Actions",8),("Python",6),("Nginx",7)],
    "Cloud Architect":           [("AWS",10),("Azure",8),("Google Cloud",8),("Terraform",9),
                                   ("Docker",8),("Kubernetes",9),("Linux",8)],
    "Mobile App Developer":      [("Kotlin",9),("Swift",9),("Java",7),("REST APIs",8),("Git",8)],
    "QA Engineer":               [("Python",6),("SQL",7),("Communication",8),("Agile / Scrum",8),
                                   ("Problem Solving",9)],
}

# ── Users ─────────────────────────────────────────────────────────────────
USERS_DATA = [
    # (full_name, email, password, role)
    ("Admin User",      "admin@rocas.ai",      "admin123",     UserRole.admin),
    ("Priya Sharma",    "priya@example.com",   "student123",   UserRole.student),
    ("Rahul Verma",     "rahul@example.com",   "student123",   UserRole.student),
    ("Ananya Singh",    "ananya@example.com",  "student123",   UserRole.student),
    ("Karan Mehta",     "karan@example.com",   "student123",   UserRole.student),
    ("Sneha Patel",     "sneha@example.com",   "student123",   UserRole.student),
    ("Dr. Amit Kumar",  "mentor@rocas.ai",     "mentor123",    UserRole.mentor),
    ("Prof. Lata Iyer", "mentor2@rocas.ai",    "mentor123",    UserRole.mentor),
    ("Recruiter One",   "recruiter@rocas.ai",  "recruiter123", UserRole.admin),
]

# email → (college, degree, branch, year_of_study, grad_year, phone, linkedin, github, completion%)
STUDENT_PROFILES = {
    "priya@example.com":  ("IIT Delhi",       "B.Tech", "Computer Science",    3, 2026, "+91-9001", "linkedin.com/in/priya",  "github.com/priya",  75),
    "rahul@example.com":  ("BITS Pilani",     "B.E.",   "Electronics",         2, 2027, "+91-9002", "linkedin.com/in/rahul",  "github.com/rahul",  55),
    "ananya@example.com": ("NIT Trichy",      "M.Tech", "Data Science",        1, 2025, "+91-9003", "linkedin.com/in/ananya", "github.com/ananya", 85),
    "karan@example.com":  ("VJTI Mumbai",     "B.Tech", "Information Tech",    4, 2025, "+91-9004", "linkedin.com/in/karan",  "github.com/karan",  65),
    "sneha@example.com":  ("Pune University", "BCA",    "Computer Applications",2,2027, "+91-9005", "linkedin.com/in/sneha",  "github.com/sneha",  40),
}

TARGET_ROLES = {
    "priya@example.com":  "Frontend Developer",
    "rahul@example.com":  "Backend Developer",
    "ananya@example.com": "Data Scientist",
    "karan@example.com":  "DevOps Engineer",
    "sneha@example.com":  "Frontend Developer",
}

# email → (readiness, skill_score, project_score, presence_score)
SCORES = {
    "priya@example.com":  (78, 55, 15, 8),
    "rahul@example.com":  (65, 45, 12, 8),
    "ananya@example.com": (88, 62, 18, 8),
    "karan@example.com":  (72, 50, 14, 8),
    "sneha@example.com":  (42, 28,  8, 6),
}

STUDENT_SKILLS = {
    "priya@example.com":  ["React","JavaScript","TypeScript","HTML5","CSS3","Tailwind CSS","Redux","Git","REST APIs"],
    "rahul@example.com":  ["Python","FastAPI","PostgreSQL","REST APIs","Docker","Git","Linux","SQL"],
    "ananya@example.com": ["Python","Machine Learning","Deep Learning","TensorFlow","PyTorch","Scikit-learn","Pandas","NumPy","SQL","NLP"],
    "karan@example.com":  ["Docker","Kubernetes","AWS","Linux","Terraform","GitHub Actions","Python","Nginx","Git"],
    "sneha@example.com":  ["HTML5","CSS3","JavaScript","MySQL","Python","Git"],
}

RESUME_TEXTS = {
    "priya@example.com": "Priya Sharma | IIT Delhi | B.Tech CS 2026\nSKILLS: React, JavaScript, TypeScript, HTML5, CSS3, Tailwind CSS, Redux, Git, REST APIs\nEXP: SDE Intern at Flipkart (2024) — React dashboards\nPROJECTS: E-Commerce Dashboard (React, Node.js, MongoDB); Portfolio (Next.js)",
    "rahul@example.com": "Rahul Verma | BITS Pilani | B.E. Electronics 2027\nSKILLS: Python, FastAPI, PostgreSQL, REST APIs, Docker, Git, Linux, SQL\nEXP: Backend Intern at Razorpay (2024) — payment microservices\nPROJECTS: URL Shortener (Python, Redis); Task API (FastAPI, PostgreSQL)",
    "ananya@example.com":"Ananya Singh | NIT Trichy | M.Tech Data Science 2025\nSKILLS: Python, ML, Deep Learning, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, SQL, NLP\nEXP: Data Science Intern at IBM (2024) — NLP sentiment pipeline\nPROJECTS: Churn Prediction; Image Classifier (TensorFlow)",
    "karan@example.com": "Karan Mehta | VJTI Mumbai | B.Tech IT 2025\nSKILLS: Docker, Kubernetes, AWS, Linux, Terraform, GitHub Actions, Python, Nginx, Git\nEXP: DevOps Intern at Infosys (2024) — AWS EKS clusters\nPROJECTS: CI/CD Pipeline (GitHub Actions, Docker); IaC (Terraform, AWS)",
    "sneha@example.com":  "Sneha Patel | Pune University | BCA 2027\nSKILLS: HTML5, CSS3, JavaScript, MySQL, Python, Git\nPROJECTS: Student Portal (PHP, MySQL); Personal Blog (WordPress)",
}

PIPELINE_STAGES = ["new", "screening", "interview", "offer", "hired"]


# =============================================================================
# MAIN SEED
# =============================================================================

async def seed(session: AsyncSession):
    # ------------------------------------------------------------------
    print("[1/10] Career roles...")
    role_map: dict[str, CareerRole] = {}
    for name, desc, industry in CAREER_ROLES:
        r = CareerRole(id=uid(), role_name=name, description=desc,
                       industry_category=industry, is_active=True)
        session.add(r); role_map[name] = r
    await session.flush()

    # ------------------------------------------------------------------
    print("[2/10] Skills...")
    skill_map: dict[str, Skill] = {}
    for name, cat in SKILLS:
        s = Skill(id=uid(), skill_name=name, category=cat, is_active=True)
        session.add(s); skill_map[name] = s
    await session.flush()

    # ------------------------------------------------------------------
    print("[3/10] Role-skill mappings...")
    for role_name, pairs in ROLE_SKILLS_MAP.items():
        if role_name not in role_map:
            continue
        for skill_name, weight in pairs:
            if skill_name not in skill_map:
                s = Skill(id=uid(), skill_name=skill_name,
                          category=SkillCategory.Other, is_active=True)
                session.add(s); skill_map[skill_name] = s
                await session.flush()
            session.add(RoleSkill(
                id=uid(),
                role_id=role_map[role_name].id,
                skill_id=skill_map[skill_name].id,
                importance_weight=weight,
            ))
    await session.flush()

    # ------------------------------------------------------------------
    print("[4/10] Users...")
    user_map: dict[str, User] = {}
    for full_name, email, password, role in USERS_DATA:
        u = User(id=uid(), full_name=full_name, email=email,
                 password_hash=get_password_hash(password),
                 role=role, is_active=True, last_login=ago(days=1))
        session.add(u); user_map[email] = u
    await session.flush()

    # ------------------------------------------------------------------
    print("[5/10] Student profiles...")
    profile_map: dict[str, StudentProfile] = {}
    for email, (college, degree, branch, year, grad_yr,
                phone, linkedin, github, pct) in STUDENT_PROFILES.items():
        trole_id = role_map.get(TARGET_ROLES.get(email, ""), None)
        sp = StudentProfile(
            id=uid(),
            user_id=user_map[email].id,
            college_name=college, degree=degree, branch=branch,
            year_of_study=year, graduation_year=grad_yr,
            phone=phone, linkedin_url=linkedin, github_url=github,
            target_role_id=trole_id.id if trole_id else None,
            profile_completion_percentage=pct,
        )
        session.add(sp); profile_map[email] = sp
    await session.flush()

    # ------------------------------------------------------------------
    print("[6/10] Resumes + parsed data...")
    resume_map: dict[str, Resume] = {}
    for email, raw_text in RESUME_TEXTS.items():
        sp = profile_map[email]
        r = Resume(
            id=uid(),
            student_profile_id=sp.id,
            original_filename=f"{email.split('@')[0]}_resume.pdf",
            file_path=f"uploads/resumes/{email.split('@')[0]}_resume.pdf",
            file_size=len(raw_text.encode()),
            file_type="application/pdf",
            upload_status=UploadStatus.analyzed,
            is_active=True,
            uploaded_at=ago(days=5),
        )
        session.add(r); resume_map[email] = r

        session.add(ResumeParsedData(
            id=uid(),
            resume_id=r.id,
            extracted_name=user_map[email].full_name,
            extracted_email=email,
            extracted_phone=STUDENT_PROFILES[email][4+1],   # phone field
            education_summary=f"{STUDENT_PROFILES[email][1]} {STUDENT_PROFILES[email][2]}, "
                              f"{STUDENT_PROFILES[email][0]}",
            experience_summary="See resume text for full experience summary.",
            projects_summary="Multiple academic and personal projects.",
            certifications_summary="Relevant certifications listed on resume.",
            extracted_text=raw_text.strip(),
            parsed_at=ago(days=5),
        ))
    await session.flush()

    # ------------------------------------------------------------------
    print("[7/10] Resume skills + analysis results...")
    analysis_map: dict[str, AnalysisResult] = {}
    for email in STUDENT_PROFILES:
        resume = resume_map[email]
        target_name = TARGET_ROLES[email]
        target_role = role_map[target_name]

        # ResumeSkills
        for sname in STUDENT_SKILLS[email]:
            if sname in skill_map:
                session.add(ResumeSkill(
                    id=uid(),
                    resume_id=resume.id,
                    skill_id=skill_map[sname].id,
                    confidence_score=0.90,
                    extraction_source=ExtractionSource.rule_based,
                ))

        # AnalysisResult
        readiness, skill_s, project_s, presence_s = SCORES[email]
        ar = AnalysisResult(
            id=uid(),
            resume_id=resume.id,
            target_role_id=target_role.id,
            readiness_score=readiness,
            skill_score=min(float(skill_s), 70.0),
            project_score=min(float(project_s), 20.0),
            professional_presence_score=min(float(presence_s), 10.0),
            strengths=["Relevant skills", "Project experience", "Good communication"],
            weaknesses=["Limited industry experience", "Needs more certifications"],
            recommendation_summary=(
                f"Candidate shows {readiness}% readiness for {target_name}. "
                "Focus on real-world projects and certifications."
            ),
            analyzed_at=ago(days=4),
        )
        session.add(ar); analysis_map[email] = ar
    await session.flush()

    # ------------------------------------------------------------------
    print("[8/10] Skill gaps, learning paths, recommendations, feedbacks, metrics, logs...")
    for email in STUDENT_PROFILES:
        ar = analysis_map[email]
        target_name = TARGET_ROLES[email]
        candidate_skills = set(STUDENT_SKILLS[email])
        role_pairs = ROLE_SKILLS_MAP.get(target_name, [])
        readiness = SCORES[email][0]

        # -- SkillGapAnalysis (matched + missing)
        seen_skill_ids: set[str] = set()
        for sname, _ in role_pairs:
            if sname not in skill_map:
                continue
            sid = skill_map[sname].id
            if sid in seen_skill_ids:
                continue
            seen_skill_ids.add(sid)
            gtype = GapType.matched if sname in candidate_skills else GapType.missing
            session.add(SkillGapAnalysis(
                id=uid(),
                analysis_result_id=ar.id,
                skill_id=sid,
                gap_type=gtype,
            ))

        # -- CareerRecommendation
        session.add(CareerRecommendation(
            id=uid(),
            analysis_result_id=ar.id,
            recommended_role_id=role_map[target_name].id,
            match_percentage=float(readiness),
            rank_position=1,
        ))
        # 2nd recommendation (closest role)
        alt_role_name = "Full Stack Developer" if target_name != "Full Stack Developer" else "Backend Developer"
        if alt_role_name in role_map:
            session.add(CareerRecommendation(
                id=uid(),
                analysis_result_id=ar.id,
                recommended_role_id=role_map[alt_role_name].id,
                match_percentage=max(float(readiness) - 15.0, 10.0),
                rank_position=2,
            ))

        # -- LearningPath (one per student — unique title required)
        lp = LearningPath(
            id=uid(),
            title=f"Path to {target_name} — {email.split('@')[0]}",
            description=f"Structured 12-week plan to achieve {target_name} readiness for {user_map[email].full_name}.",
            estimated_duration="12 weeks",
            difficulty_level=DifficultyLevel.intermediate,
            is_active=True,
        )
        session.add(lp)
        await session.flush()

        # -- LearningPathSkills (up to 5 top skills for role)
        seen_lp_skills: set[str] = set()
        for order, (sname, _) in enumerate(role_pairs[:5], start=1):
            if sname not in skill_map:
                continue
            sid = skill_map[sname].id
            if sid in seen_lp_skills:
                continue
            seen_lp_skills.add(sid)
            session.add(LearningPathSkill(
                id=uid(),
                learning_path_id=lp.id,
                skill_id=sid,
                sequence_order=order,
            ))

        # -- UserRecommendation
        session.add(UserRecommendation(
            id=uid(),
            analysis_result_id=ar.id,
            learning_path_id=lp.id,
            recommendation_text=(
                f"Complete the '{lp.title}' track. "
                f"Focus especially on the top missing skills for {target_name}."
            ),
            priority_level=PriorityLevel.high,
            is_completed=False,
        ))

        # -- MentorFeedback
        mentor = user_map["mentor@rocas.ai"]
        session.add(MentorFeedback(
            id=uid(),
            analysis_result_id=ar.id,
            mentor_id=mentor.id,
            rating=4,
            comments=(
                f"Good effort! Your {target_name} readiness score is {readiness}/100. "
                "Build 2-3 solid projects and push to GitHub."
            ),
            improvement_actions=[
                "Add measurable impact to resume bullet points",
                "Complete at least one industry certification",
                "Contribute to open-source projects",
            ],
        ))

        # -- AIRecommendationLog
        session.add(AIRecommendationLog(
            id=uid(),
            analysis_result_id=ar.id,
            prompt_used=f"Analyze resume for {target_name} role and return JSON scorecard.",
            ai_response='{"score":' + str(readiness) + ',"summary":"See recommendation_summary"}',
            model_name="gemini-1.5-flash",
            token_usage=1800,
            generated_at=ago(days=4),
        ))

        # -- ActivityLog
        session.add(ActivityLog(
            id=uid(),
            user_id=user_map[email].id,
            action_type="resume_analyzed",
            action_description=f"Resume analyzed for {target_name}. Score: {readiness}/100.",
            entity_name="AnalysisResult",
            entity_id=ar.id,
            ip_address="127.0.0.1",
        ))
        session.add(ActivityLog(
            id=uid(),
            user_id=user_map[email].id,
            action_type="resume_uploaded",
            action_description="Resume uploaded successfully.",
            entity_name="Resume",
            entity_id=resume_map[email].id,
            ip_address="127.0.0.1",
        ))

        # -- StudentDashboardMetrics
        session.add(StudentDashboardMetrics(
            id=uid(),
            student_id=profile_map[email].id,
            total_resumes_uploaded=1,
            latest_score=float(readiness),
            average_score=float(readiness),
            strongest_skill=STUDENT_SKILLS[email][0] if STUDENT_SKILLS[email] else None,
            weakest_skill=next(
                (s for s, _ in role_pairs if s not in candidate_skills), "N/A"
            ),
        ))

    await session.flush()

    # ------------------------------------------------------------------
    print("[9/10] Pipeline entries + interview scorecards...")
    for i, email in enumerate(STUDENT_PROFILES):
        resume = resume_map[email]
        stage  = PIPELINE_STAGES[i % len(PIPELINE_STAGES)]

        session.add(PipelineEntry(
            id=uid(), resume_id=resume.id, stage=stage
        ))

        if stage in ("interview", "offer", "hired"):
            readiness = SCORES[email][0]
            session.add(InterviewScorecard(
                id=uid(),
                resume_id=resume.id,
                interviewer_id=user_map["recruiter@rocas.ai"].id,
                ratings={
                    "communication":  4, "technical_depth": 3,
                    "problem_solving":4, "culture_fit":     5, "enthusiasm": 4,
                },
                notes={
                    "communication":  "Clear and articulate",
                    "technical_depth":"Good fundamentals, needs depth",
                    "problem_solving":"Structured approach observed",
                    "culture_fit":    "Great team-player attitude",
                    "enthusiasm":     "Very motivated candidate",
                },
                recommendation="Hire" if stage == "hired" else "Hold",
                overall_notes="Promising. Recommend second round interview.",
                overall_score=round(readiness * 0.9, 2),
                saved_at=ago(days=2),
            ))

    await session.flush()

    # ------------------------------------------------------------------
    print("[10/10] Job Descriptions & Committing...")
    if "recruiter@rocas.ai" in user_map:
        jd = JobDescription(
            id=uid(),
            user_id=user_map["recruiter@rocas.ai"].id,
            title="Senior React Developer",
            company="Tech Corp",
            location="Remote",
            employment_type="Full-time",
            salary="$120k - $150k",
            experience_level="Senior",
            description="Looking for an experienced React developer to lead our frontend dashboard team.",
            requirements="5+ years of React, TypeScript, and modern state management.",
            skills=["React", "TypeScript", "Node.js", "REST APIs", "Git"],
            weights={"technical": 50, "soft_skills": 30, "experience": 20},
        )
        session.add(jd)

    await session.commit()


# =============================================================================
# ENTRY POINT
# =============================================================================

async def main():
    print("=" * 62)
    print("  AI Resume Analyzer — Full Database Setup & Seed")
    print(f"  DB : {DATABASE_URL}")
    print("=" * 62)

    print("\n[Step 1] Dropping and re-creating all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("  Done — 21 tables created.")

    print("\n[Step 2] Seeding data...")
    async with AsyncSession_() as session:
        await seed(session)

    await engine.dispose()

    tables = [
        "users", "student_profiles", "career_roles", "skills", "role_skills",
        "resumes", "resume_parsed_data", "resume_skills", "analysis_results",
        "skill_gap_analysis", "career_recommendations", "learning_paths",
        "learning_path_skills", "user_recommendations", "mentor_feedback",
        "student_dashboard_metrics", "activity_logs", "ai_recommendation_logs",
        "interview_scorecards", "pipeline_entries", "job_descriptions",
    ]

    print("\n" + "=" * 62)
    print("  DATABASE SETUP COMPLETE")
    print()
    print("  Tables (20):")
    for t in tables:
        print(f"    [OK] {t}")
    print()
    print("  Seed data summary:")
    print("    15  Career roles")
    print("    59  Skills")
    print("     9  Users (1 admin, 5 students, 2 mentors, 1 recruiter)")
    print("     5  Student profiles")
    print("     5  Resumes + parsed data")
    print("     5  Analysis results + skill gaps + learning paths")
    print("     5  Kanban pipeline entries (+ scorecards for 3)")
    print()
    print("  Login credentials:")
    print("    admin@rocas.ai      /  admin123")
    print("    priya@example.com   /  student123  (Frontend Dev, 78%)")
    print("    rahul@example.com   /  student123  (Backend Dev, 65%)")
    print("    ananya@example.com  /  student123  (Data Scientist, 88%)")
    print("    karan@example.com   /  student123  (DevOps, 72%)")
    print("    sneha@example.com   /  student123  (Frontend Dev, 42%)")
    print("    mentor@rocas.ai     /  mentor123")
    print("    recruiter@rocas.ai  /  recruiter123")
    print("=" * 62)


if __name__ == "__main__":
    asyncio.run(main())
