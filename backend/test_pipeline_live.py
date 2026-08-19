"""
Live integration test for the resume analysis pipeline.
Tests the full chain: text → extract_skills → gap_analysis → score_engine → status

Run from backend/ directory:
    python test_pipeline_live.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Fix Windows console encoding for box-drawing characters
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.skill_extractor import extract_skills, extract_skills_from_jd_text
from app.services.gap_analysis import perform_gap_analysis, normalize_skills
from app.services.score_engine import (
    calculate_readiness_score, get_status_from_score,
    THRESHOLD_EXCELLENT, THRESHOLD_GOOD, THRESHOLD_PARTIAL, get_recommendation_label
)

# ─────────────────────────────────────────────────────────────────────────────
# Test 1: Strong match — full-stack resume vs full-stack JD
# Expected: Shortlisted (score >= 75)
# ─────────────────────────────────────────────────────────────────────────────
STRONG_RESUME = """
John Doe | john@email.com | linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Full-Stack Developer with 4 years of experience building web applications using React.js, Node.js, and PostgreSQL.

SKILLS
React, Node.js, JavaScript, TypeScript, PostgreSQL, Docker, AWS, Git, REST API, HTML, CSS, Redux

EXPERIENCE
Senior Full-Stack Developer — TechCorp (2022–Present)
  Built scalable microservices with Node.js and deployed to AWS EC2.
  Developed React dashboards consuming REST APIs.

Full-Stack Developer — StartupXYZ (2020–2022)
  Built PostgreSQL-backed APIs with Express.js.
  Containerized services using Docker.

EDUCATION
Bachelor of Science in Computer Science — State University, 2020

PROJECTS
E-Commerce Platform (github.com/johndoe/ecom)
  Technologies: React, Node.js, PostgreSQL, Docker
  Built and deployed a full-stack e-commerce platform with JWT auth.

Portfolio API (github.com/johndoe/api)
  Technologies: FastAPI, PostgreSQL, Docker
  REST API with Swagger documentation.

CERTIFICATIONS
AWS Certified Developer – Associate (2023)
Docker Certified Associate (2022)
"""

STRONG_JD = """
We are hiring a Full-Stack Developer.
Required Skills: React.js, Node, JavaScript, PostgreSQL, REST APIs, Docker, Git
Preferred Skills: TypeScript, AWS, Redis
Experience: 3+ years building web applications
Education: Bachelor's in Computer Science or related field
"""

# ─────────────────────────────────────────────────────────────────────────────
# Test 2: Partial match — data analyst resume vs full-stack JD
# Expected: Borderline or Rejected (score 40–74)
# ─────────────────────────────────────────────────────────────────────────────
PARTIAL_RESUME = """
Jane Smith | jane@email.com | linkedin.com/in/janesmith

SUMMARY
Data Analyst with 2 years of experience working with Python and SQL.

SKILLS
Python, SQL, Pandas, Tableau, Excel, Power BI

EXPERIENCE
Data Analyst — Analytics Co (2022–Present)
  Wrote complex SQL queries and built Tableau dashboards.
  Used Python/Pandas for ETL pipelines.

EDUCATION
Bachelor of Science in Statistics — City University, 2022

CERTIFICATIONS
Google Data Analytics Certificate (2022)
"""

# ─────────────────────────────────────────────────────────────────────────────
# Test 3: Poor match — unrelated resume
# Expected: Rejected (score < 60)
# ─────────────────────────────────────────────────────────────────────────────
POOR_RESUME = """
Mark Brown | mark@email.com

SUMMARY
Marketing professional with experience in content creation and social media.

SKILLS
Content Writing, Social Media, Adobe Photoshop, Canva, Email Marketing

EXPERIENCE
Marketing Coordinator — BrandCo (2021–Present)
  Managed social media accounts and created email campaigns.

EDUCATION
Bachelor of Arts in Marketing — Arts University, 2021
"""

SEP = "-" * 70


async def analyze_resume(label: str, resume_text: str, jd_text: str):
    print(f"\n{SEP}")
    print(f"  TEST: {label}")
    print(SEP)

    # Step 1: Extract skills from JD
    jd_skills = await extract_skills_from_jd_text(jd_text)
    normalized_required = normalize_skills(jd_skills)
    print(f"  JD required skills  ({len(normalized_required)}): {normalized_required}")

    # Step 2: Extract skills from resume
    extracted_skills = await extract_skills(resume_text)
    print(f"  Resume skills found ({len(extracted_skills)}): {extracted_skills}")

    # Step 3: Gap analysis
    gap = await perform_gap_analysis(extracted_skills, normalized_required)
    matched   = gap["matched_skills"]
    missing   = gap["missing_skills"]
    match_rate = gap["match_rate"]
    print(f"  Matched  ({len(matched)}): {matched}")
    print(f"  Missing  ({len(missing)}): {missing}")
    print(f"  Match rate: {match_rate:.1%}")

    # Step 4: Score
    scores = await calculate_readiness_score(resume_text, matched, normalized_required)
    overall       = scores["readiness_score"]
    skill_score   = scores["skill_score"]
    skill_pct     = scores.get("skill_score_pct", 0)
    exp_score     = scores.get("experience_score", 0)
    edu_score     = scores.get("education_score", 0)
    proj_score    = scores.get("project_cert_score", 0)
    presence      = scores.get("professional_presence_score", 0)

    print(f"\n  -- Scores ------------------------------------------")
    print(f"  Skill score:       {skill_score:.1f}/50  ({skill_pct:.1f}%)")
    print(f"  Experience score:  {exp_score:.1f}/20")
    print(f"  Education score:   {edu_score:.1f}/15")
    print(f"  Project/Certs:     {proj_score:.1f}/10")
    print(f"  Presence score:    {presence:.1f}/5")
    print(f"  TOTAL:             {overall:.1f}/100")

    # Step 5: Recommendation
    label_str = get_recommendation_label(overall)
    status    = get_status_from_score(overall)
    print(f"\n  -- Result ------------------------------------------")
    print(f"  Recommendation:  {label_str}")
    print(f"  Status:          {status}")

    if status == "Rejected":
        print(f"  Rejection reason: Score {overall:.1f} < threshold {THRESHOLD_PARTIAL}")
    elif status == "Borderline":
        print(f"  Note: Partial match. Score {overall:.1f} is in the 'Consider' range ({THRESHOLD_PARTIAL}–{THRESHOLD_GOOD-1})")
    else:
        print(f"  ✅ CANDIDATE SHOULD BE SHORTLISTED")

    return status, overall


async def main():
    print("\n" + "=" * 70)
    print("  RESUME ANALYSIS PIPELINE -- LIVE INTEGRATION TEST")
    print("=" * 70)
    print(f"  Thresholds: Excellent={THRESHOLD_EXCELLENT} | Good={THRESHOLD_GOOD} | Partial={THRESHOLD_PARTIAL}")

    status1, score1 = await analyze_resume("Strong Match (Full-Stack Dev)", STRONG_RESUME, STRONG_JD)
    status2, score2 = await analyze_resume("Partial Match (Data Analyst vs Full-Stack JD)", PARTIAL_RESUME, STRONG_JD)
    status3, score3 = await analyze_resume("Poor Match (Marketing vs Full-Stack JD)", POOR_RESUME, STRONG_JD)

    print(f"\n{SEP}")
    print("  SUMMARY")
    print(SEP)
    print(f"  Strong match  → {status1:12s} (score: {score1:.1f}) {'✅ CORRECT' if status1 == 'Shortlisted' else '❌ WRONG — should be Shortlisted'}")
    print(f"  Partial match → {status2:12s} (score: {score2:.1f}) {'✅ CORRECT' if status2 in ('Borderline','Rejected') else '❌ WRONG'}")
    print(f"  Poor match    → {status3:12s} (score: {score3:.1f}) {'✅ CORRECT' if status3 == 'Rejected' else '⚠️ May need adjustment'}")
    print(SEP)

    # Assertions
    assert score1 > score2, f"Strong match score ({score1}) should be > partial match score ({score2})"
    assert score2 > score3, f"Partial match score ({score2}) should be > poor match score ({score3})"
    assert status1 == "Shortlisted", f"Strong match should be Shortlisted, got: {status1} (score={score1})"
    print("\n  ✅ All assertions passed — pipeline logic is correct!")


if __name__ == "__main__":
    asyncio.run(main())
