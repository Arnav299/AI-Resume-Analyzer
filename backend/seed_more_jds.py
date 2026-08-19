#!/usr/bin/env python3
"""
Seed 15 additional Job Descriptions into the database for JD Studio.
Run from the backend/ directory:
  python seed_more_jds.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.models.jd import JobDescription
from sqlalchemy import select

MORE_JDS = [
    # ── Cybersecurity ─────────────────────────────────────────────────────────
    {
        "title": "Cybersecurity Analyst",
        "domain": "Cybersecurity",
        "department": "IT Security",
        "location": "Bangalore, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Mid-Level",
        "salary": "18-30 LPA",
        "education": "B.Tech in CS/IT or equivalent; CEH / CISSP preferred",
        "skills": ["SIEM", "Penetration Testing", "Network Security", "Firewalls", "Incident Response", "Python", "Vulnerability Assessment"],
        "preferred_skills": ["Splunk", "CrowdStrike", "Zero Trust Architecture", "Threat Intelligence"],
        "certifications": ["CEH", "CompTIA Security+"],
        "description": "We are looking for a sharp Cybersecurity Analyst to protect our digital assets. You will monitor networks for security breaches, investigate incidents, and implement security best practices across the organization.",
        "requirements": "3+ years in information security. Hands-on experience with SIEM tools and penetration testing frameworks. Strong analytical and problem-solving skills.",
        "benefits": "Certification sponsorship, 24/7 security tooling budget, health insurance, performance bonus",
        "ai_matching_threshold": 72,
        "selected_threshold": 88,
        "waiting_threshold": 68,
        "status": "Active",
    },

    # ── UI/UX Design ──────────────────────────────────────────────────────────
    {
        "title": "Senior UI/UX Designer",
        "domain": "Design",
        "department": "Product Design",
        "location": "Remote",
        "employment_type": "Full-time",
        "work_mode": "Remote",
        "experience_level": "Senior",
        "salary": "20-35 LPA",
        "education": "Degree in Design, HCI, or equivalent portfolio",
        "skills": ["Figma", "User Research", "Wireframing", "Prototyping", "Usability Testing", "Design Systems", "Adobe XD"],
        "preferred_skills": ["Framer", "Motion Design", "HTML/CSS", "Accessibility (WCAG)"],
        "certifications": ["Google UX Design Certificate"],
        "description": "Join our product design team to craft beautiful, intuitive experiences for millions of users. You will own end-to-end design — from discovery workshops and user research to high-fidelity prototypes and developer handoff.",
        "requirements": "5+ years of UX/UI design experience. A strong portfolio demonstrating user-centred design process. Expert-level Figma skills and ability to work closely with engineering teams.",
        "benefits": "Fully remote, top-tier design tools budget, team retreats, health coverage, 24 days PTO",
        "ai_matching_threshold": 70,
        "selected_threshold": 85,
        "waiting_threshold": 65,
        "status": "Active",
    },

    # ── Data Engineering ──────────────────────────────────────────────────────
    {
        "title": "Data Engineer",
        "domain": "Data Engineering",
        "department": "Data Platform",
        "location": "Hyderabad, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Mid-Level",
        "salary": "20-32 LPA",
        "education": "B.Tech/M.Tech in CS, Statistics, or related field",
        "skills": ["Apache Spark", "Kafka", "Python", "SQL", "Airflow", "dbt", "AWS S3", "Redshift"],
        "preferred_skills": ["Snowflake", "Delta Lake", "Databricks", "Terraform"],
        "certifications": ["AWS Certified Data Analytics"],
        "description": "We're building the next-generation data platform and need a talented Data Engineer. You'll design, build, and maintain scalable data pipelines that power analytics and ML workflows across the company.",
        "requirements": "3+ years building production-grade data pipelines. Strong SQL and Python skills. Experience with distributed processing frameworks (Spark, Flink).",
        "benefits": "Flexible hours, remote work option 3 days/week, health insurance, skill development budget",
        "ai_matching_threshold": 73,
        "selected_threshold": 87,
        "waiting_threshold": 68,
        "status": "Active",
    },

    # ── Mobile Development ────────────────────────────────────────────────────
    {
        "title": "React Native Developer",
        "domain": "Mobile Development",
        "department": "Engineering",
        "location": "Pune, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Mid-Level",
        "salary": "14-22 LPA",
        "education": "B.Tech in CS or equivalent",
        "skills": ["React Native", "JavaScript", "TypeScript", "Redux", "REST APIs", "iOS", "Android", "Git"],
        "preferred_skills": ["Expo", "Firebase", "GraphQL", "App Store / Play Store deployment"],
        "certifications": [],
        "description": "We're looking for a passionate React Native Developer to build cross-platform mobile apps used by hundreds of thousands of users. You'll collaborate with designers and backend engineers to deliver polished, performant experiences.",
        "requirements": "2+ years of React Native experience. Published at least one app on App Store or Play Store. Strong understanding of mobile UX patterns.",
        "benefits": "Device allowance, flexible hours, health insurance, stock options, 20 days PTO",
        "ai_matching_threshold": 68,
        "selected_threshold": 84,
        "waiting_threshold": 63,
        "status": "Active",
    },

    # ── Cloud Architecture ────────────────────────────────────────────────────
    {
        "title": "Cloud Solutions Architect",
        "domain": "Cloud & Infrastructure",
        "department": "Architecture",
        "location": "Chennai, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Senior",
        "salary": "35-55 LPA",
        "education": "B.Tech/M.Tech in CS/IT or equivalent",
        "skills": ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Microservices", "Networking", "Security Best Practices"],
        "preferred_skills": ["Service Mesh (Istio)", "FinOps", "Multi-cloud strategy", "Cost Optimization"],
        "certifications": ["AWS Solutions Architect Professional", "Google Professional Cloud Architect"],
        "description": "As a Cloud Solutions Architect, you will design and govern our multi-cloud strategy, ensure high availability and security, and guide engineering teams on cloud-native best practices.",
        "requirements": "7+ years in cloud/infrastructure roles. Deep expertise in at least two major cloud providers. Strong understanding of enterprise architecture patterns.",
        "benefits": "High compensation, certification sponsorship, conference budget, health coverage, ESOPs",
        "ai_matching_threshold": 80,
        "selected_threshold": 92,
        "waiting_threshold": 76,
        "status": "Active",
    },

    # ── Business Analyst ──────────────────────────────────────────────────────
    {
        "title": "Business Analyst – FinTech",
        "domain": "Business Analysis",
        "department": "Strategy & Operations",
        "location": "Mumbai, India",
        "employment_type": "Full-time",
        "work_mode": "On-site",
        "experience_level": "Mid-Level",
        "salary": "12-20 LPA",
        "education": "MBA / B.Tech with relevant experience",
        "skills": ["Requirements Gathering", "SQL", "Power BI", "Process Mapping", "Stakeholder Management", "User Stories", "Excel"],
        "preferred_skills": ["JIRA", "Tableau", "API Understanding", "Banking/Payments domain knowledge"],
        "certifications": ["CBAP", "PMI-PBA"],
        "description": "We are seeking a Business Analyst with FinTech domain expertise to bridge the gap between business needs and technology solutions. You'll gather requirements, model processes, and work closely with product and engineering teams.",
        "requirements": "3+ years of BA experience, preferably in FinTech or Banking. Proficiency in SQL and data visualization tools. Excellent documentation and communication skills.",
        "benefits": "Performance bonus, health insurance, learning budget, flexible hours",
        "ai_matching_threshold": 65,
        "selected_threshold": 82,
        "waiting_threshold": 60,
        "status": "Active",
    },

    # ── QA / Testing ──────────────────────────────────────────────────────────
    {
        "title": "QA Automation Engineer",
        "domain": "Quality Assurance",
        "department": "Engineering – QA",
        "location": "Bangalore, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Mid-Level",
        "salary": "12-20 LPA",
        "education": "B.Tech in CS or equivalent",
        "skills": ["Selenium", "Playwright", "Python", "REST API Testing", "CI/CD", "TestNG", "JIRA", "Postman"],
        "preferred_skills": ["Cypress", "k6 (Load Testing)", "BDD/Gherkin", "Mobile Testing"],
        "certifications": ["ISTQB CTFL"],
        "description": "We need a detail-oriented QA Automation Engineer to build and maintain our test suite and ensure product quality. You'll design automated test frameworks, integrate them into CI/CD pipelines, and champion quality across the team.",
        "requirements": "3+ years of QA automation experience. Strong Python/JS skills. Experience integrating tests in CI/CD pipelines (GitHub Actions, Jenkins).",
        "benefits": "Health insurance, flexible hours, performance bonus, remote 2 days/week",
        "ai_matching_threshold": 68,
        "selected_threshold": 84,
        "waiting_threshold": 63,
        "status": "Active",
    },

    # ── Marketing & Growth ────────────────────────────────────────────────────
    {
        "title": "Growth Marketing Manager",
        "domain": "Marketing",
        "department": "Growth & Marketing",
        "location": "Delhi NCR, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Mid-Level",
        "salary": "15-25 LPA",
        "education": "MBA in Marketing or equivalent",
        "skills": ["SEO/SEM", "Google Analytics", "Performance Marketing", "A/B Testing", "Email Marketing", "CRM", "Content Strategy"],
        "preferred_skills": ["HubSpot", "Mixpanel", "Affiliate Marketing", "Paid Social (Meta/LinkedIn Ads)"],
        "certifications": ["Google Ads Certification", "HubSpot Content Marketing"],
        "description": "We're looking for a data-driven Growth Marketing Manager to own user acquisition, retention, and revenue growth initiatives. You'll run multi-channel campaigns, optimize funnels, and collaborate with product and sales teams.",
        "requirements": "4+ years of growth/digital marketing experience. Proven track record of scaling user acquisition. Strong analytical mindset with experience in marketing analytics tools.",
        "benefits": "Flexible hours, marketing tools budget, health insurance, performance incentives",
        "ai_matching_threshold": 65,
        "selected_threshold": 82,
        "waiting_threshold": 60,
        "status": "Active",
    },

    # ── Blockchain ────────────────────────────────────────────────────────────
    {
        "title": "Blockchain Developer",
        "domain": "Blockchain & Web3",
        "department": "Engineering – Web3",
        "location": "Remote",
        "employment_type": "Full-time",
        "work_mode": "Remote",
        "experience_level": "Senior",
        "salary": "35-60 LPA",
        "education": "B.Tech in CS or equivalent with strong portfolio",
        "skills": ["Solidity", "Ethereum", "Web3.js", "Hardhat", "Smart Contracts", "DeFi Protocols", "IPFS", "TypeScript"],
        "preferred_skills": ["Layer 2 (Polygon, Arbitrum)", "Rust (Solana)", "ZK Proofs", "NFT Standards (ERC-721/1155)"],
        "certifications": [],
        "description": "Join our Web3 team to build decentralised applications and smart contracts. You'll architect secure, gas-efficient smart contracts, integrate with frontends, and stay on the cutting edge of blockchain technology.",
        "requirements": "3+ years of blockchain development experience. Deep Solidity knowledge and understanding of EVM. Experience with DeFi protocols and security audits.",
        "benefits": "Token grants, fully remote, top hardware, conference budget, competitive compensation",
        "ai_matching_threshold": 78,
        "selected_threshold": 90,
        "waiting_threshold": 73,
        "status": "Active",
    },

    # ── HR / People Ops ───────────────────────────────────────────────────────
    {
        "title": "HR Business Partner – Tech",
        "domain": "Human Resources",
        "department": "People & Culture",
        "location": "Bangalore, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Mid-Level",
        "salary": "12-20 LPA",
        "education": "MBA in HR or equivalent",
        "skills": ["Talent Acquisition", "Performance Management", "Employee Relations", "HR Analytics", "Compensation & Benefits", "HRIS"],
        "preferred_skills": ["Workday", "Darwinbox", "OKR Frameworks", "DEI Initiatives"],
        "certifications": ["SHRM-CP", "PHR"],
        "description": "We need an HR Business Partner who understands the fast pace of tech companies. You'll partner with engineering and product leaders to drive talent strategy, performance cycles, and a culture of continuous growth.",
        "requirements": "4+ years of HR experience, with at least 2 years supporting tech teams. Strong stakeholder management skills. Data-driven approach to people decisions.",
        "benefits": "Health + dental, team offsites, learning budget, flexible hours, parental leave",
        "ai_matching_threshold": 62,
        "selected_threshold": 80,
        "waiting_threshold": 58,
        "status": "Active",
    },

    # ── SRE ───────────────────────────────────────────────────────────────────
    {
        "title": "Site Reliability Engineer (SRE)",
        "domain": "DevOps & Cloud",
        "department": "Platform Engineering",
        "location": "Hyderabad, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Senior",
        "salary": "28-45 LPA",
        "education": "B.Tech in CS/IT or equivalent",
        "skills": ["Kubernetes", "Prometheus", "Grafana", "Python", "Go", "Linux", "Incident Management", "SLO/SLA Definition"],
        "preferred_skills": ["Chaos Engineering", "eBPF", "OpenTelemetry", "ArgoCD"],
        "certifications": ["CKA", "Google SRE Foundation"],
        "description": "As an SRE, you'll own the reliability, scalability, and performance of our production systems. You'll build automation to eliminate toil, design runbooks, and lead on-call incident response for our high-traffic platform.",
        "requirements": "5+ years in SRE or platform engineering. Strong Kubernetes and observability stack expertise. Experience defining and tracking SLIs/SLOs.",
        "benefits": "Competitive salary, on-call compensation, remote options, health insurance, certification sponsorship",
        "ai_matching_threshold": 78,
        "selected_threshold": 90,
        "waiting_threshold": 74,
        "status": "Active",
    },

    # ── Content / Technical Writing ────────────────────────────────────────────
    {
        "title": "Technical Content Writer",
        "domain": "Content & Documentation",
        "department": "Marketing – Content",
        "location": "Remote",
        "employment_type": "Full-time",
        "work_mode": "Remote",
        "experience_level": "Mid-Level",
        "salary": "8-14 LPA",
        "education": "Degree in English, Journalism, CS, or equivalent",
        "skills": ["Technical Writing", "API Documentation", "Markdown", "SEO Writing", "Developer Tutorials", "Git", "Confluence"],
        "preferred_skills": ["OpenAPI/Swagger", "Video Scripting", "Content Management Systems", "Python basics"],
        "certifications": ["Google Technical Writing"],
        "description": "We're looking for a Technical Content Writer who can translate complex engineering concepts into clear, developer-friendly documentation and blog posts. You'll own our docs site and content calendar.",
        "requirements": "3+ years of technical writing experience. Ability to read and understand code (Python/JS). Portfolio of published developer documentation or tutorials.",
        "benefits": "Fully remote, writing tools budget, health insurance, flexible schedule",
        "ai_matching_threshold": 60,
        "selected_threshold": 78,
        "waiting_threshold": 55,
        "status": "Active",
    },

    # ── Finance & Accounting ──────────────────────────────────────────────────
    {
        "title": "Finance Analyst – FP&A",
        "domain": "Finance",
        "department": "Finance & Accounting",
        "location": "Mumbai, India",
        "employment_type": "Full-time",
        "work_mode": "On-site",
        "experience_level": "Mid-Level",
        "salary": "10-18 LPA",
        "education": "CA / MBA Finance / CFA Level II+",
        "skills": ["Financial Modeling", "Excel (Advanced)", "Budgeting", "Variance Analysis", "SQL", "Power BI", "P&L Management"],
        "preferred_skills": ["Tableau", "SAP", "NetSuite", "Investor Relations"],
        "certifications": ["CFA", "CA"],
        "description": "Join our FP&A team to drive financial planning, forecasting, and business performance analysis. You'll build financial models, prepare management reporting, and partner with business leaders on strategic decisions.",
        "requirements": "3+ years in FP&A or corporate finance. Expert-level Excel and financial modeling skills. Strong communication skills to present insights to leadership.",
        "benefits": "Performance bonus, health insurance, team retreats, learning allowance",
        "ai_matching_threshold": 65,
        "selected_threshold": 83,
        "waiting_threshold": 60,
        "status": "Active",
    },

    # ── Computer Vision ───────────────────────────────────────────────────────
    {
        "title": "Computer Vision Engineer",
        "domain": "Artificial Intelligence",
        "department": "R&D – Vision AI",
        "location": "Bangalore, India",
        "employment_type": "Full-time",
        "work_mode": "On-site",
        "experience_level": "Senior",
        "salary": "28-48 LPA",
        "education": "M.Tech/PhD in CS, EE, or related field",
        "skills": ["Python", "OpenCV", "PyTorch", "TensorFlow", "CNNs", "Object Detection (YOLO)", "Image Segmentation", "CUDA"],
        "preferred_skills": ["ONNX", "TensorRT", "3D Vision", "Edge AI", "Depth Estimation"],
        "certifications": [],
        "description": "We are building state-of-the-art computer vision systems for real-world applications. As a CV Engineer, you'll develop and productionise deep learning models for detection, segmentation, and tracking tasks.",
        "requirements": "4+ years in computer vision or deep learning. Strong publication record or GitHub portfolio. Experience optimising models for embedded/edge devices is a plus.",
        "benefits": "Top-tier GPU hardware, research publication support, health insurance, conference travel",
        "ai_matching_threshold": 78,
        "selected_threshold": 91,
        "waiting_threshold": 73,
        "status": "Active",
    },

    # ── Sales ─────────────────────────────────────────────────────────────────
    {
        "title": "Enterprise Sales Executive",
        "domain": "Sales & Business Development",
        "department": "Sales",
        "location": "Delhi NCR, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Senior",
        "salary": "20-35 LPA + commission",
        "education": "MBA or equivalent",
        "skills": ["B2B Sales", "Account Management", "CRM (Salesforce)", "Pipeline Management", "Negotiation", "Solution Selling", "Forecasting"],
        "preferred_skills": ["SaaS Sales", "Enterprise Contract Negotiation", "HubSpot", "Cold Outreach Automation"],
        "certifications": ["Salesforce Sales Cloud Consultant"],
        "description": "We're scaling our enterprise sales team and need a results-driven Sales Executive with a track record of closing large B2B deals. You'll own the full sales cycle — from prospecting to closing and account expansion.",
        "requirements": "5+ years of enterprise B2B sales experience. Consistent track record of meeting or exceeding quota. Experience selling SaaS solutions to CXO-level stakeholders.",
        "benefits": "Uncapped commission, car allowance, health insurance, annual President's Club trip, ESOPs",
        "ai_matching_threshold": 65,
        "selected_threshold": 83,
        "waiting_threshold": 60,
        "status": "Active",
    },
]


async def seed_more_jds():
    async with AsyncSessionLocal() as db:
        existing_result = await db.execute(select(JobDescription))
        existing_count = len(existing_result.scalars().all())
        print(f"Found {existing_count} existing JDs in database.\n")

        added = 0
        skipped = 0
        for jd_data in MORE_JDS:
            result = await db.execute(
                select(JobDescription).where(JobDescription.title == jd_data["title"])
            )
            if result.scalar_one_or_none():
                print(f"  [SKIP] '{jd_data['title']}' already exists")
                skipped += 1
                continue

            jd = JobDescription(**jd_data)
            db.add(jd)
            added += 1
            print(f"  [ADD]  '{jd_data['title']}' ({jd_data['domain']})")

        await db.commit()
        print(f"\n[DONE] Added {added} new JDs, skipped {skipped}. Total: {existing_count + added}")


if __name__ == "__main__":
    asyncio.run(seed_more_jds())
