import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models.user import User
from app.models.jd import JobDescription

async def add_jds():
    async with AsyncSessionLocal() as db:
        # Get the first org or recruiter user
        result = await db.execute(select(User).where(User.role.in_(["organization", "recruiter"])))
        user = result.scalars().first()
        if not user:
            print("No org/recruiter user found!")
            await engine.dispose()
            return

        jds_data = [
            {
                "title": "Senior Data Scientist",
                "company": "Innovant",
                "domain": "Data Science",
                "department": "Analytics",
                "location": "Remote",
                "employment_type": "Full-time",
                "work_mode": "Remote",
                "salary": "$140k - $170k",
                "experience_level": "Senior",
                "education": "Master's or PhD in Statistics, CS, or related field",
                "description": "Drive advanced analytics and predictive modeling to solve complex business problems.",
                "requirements": "Build machine learning models, perform statistical analysis, and collaborate with product teams.",
                "benefits": "Flexible PTO, remote work stipend, health insurance.",
                "skills": ["Python", "R", "SQL", "Machine Learning", "Statistical Modeling", "Pandas"],
                "preferred_skills": ["PyTorch", "Spark", "AWS"],
                "certifications": [],
                "ai_matching_threshold": 80,
                "selected_threshold": 90,
                "waiting_threshold": 75,
                "status": "Active"
            },
            {
                "title": "Cloud Solutions Architect",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "Infrastructure",
                "location": "Seattle, WA",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "$150k - $190k",
                "experience_level": "Senior",
                "education": "Bachelor's in CS or equivalent",
                "description": "Design and deploy scalable, highly available, and fault-tolerant systems on AWS/Azure.",
                "requirements": "Lead cloud migration projects, optimize cloud costs, and mentor junior engineers.",
                "benefits": "Competitive equity, 401k match, health/dental/vision.",
                "skills": ["AWS", "Azure", "Terraform", "Kubernetes", "Linux", "System Design"],
                "preferred_skills": ["GCP", "Python", "Go"],
                "certifications": ["AWS Certified Solutions Architect - Professional"],
                "ai_matching_threshold": 80,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "DevOps Engineer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "Platform",
                "location": "Chicago, IL",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "$120k - $150k",
                "experience_level": "Mid-Level",
                "education": "Bachelor's in CS",
                "description": "Streamline our deployment pipelines and manage our cloud infrastructure.",
                "requirements": "Maintain CI/CD pipelines, monitor system health, and implement infrastructure as code.",
                "benefits": "Commuter benefits, gym membership, flexible hours.",
                "skills": ["CI/CD", "Docker", "Kubernetes", "Jenkins", "AWS", "Bash"],
                "preferred_skills": ["Ansible", "Prometheus", "Grafana"],
                "certifications": ["Certified Kubernetes Administrator (CKA)"],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "Cybersecurity Analyst",
                "company": "Innovant",
                "domain": "Security",
                "department": "IT Security",
                "location": "Washington, DC",
                "employment_type": "Full-time",
                "work_mode": "On-site",
                "salary": "$100k - $130k",
                "experience_level": "Mid-Level",
                "education": "Bachelor's in Cybersecurity, CS, or IT",
                "description": "Monitor and protect our network infrastructure against security threats and vulnerabilities.",
                "requirements": "Conduct vulnerability assessments, monitor security logs, and respond to incidents.",
                "benefits": "Health insurance, continuing education stipend.",
                "skills": ["Network Security", "SIEM", "Vulnerability Assessment", "Firewalls", "Python"],
                "preferred_skills": ["Penetration Testing", "Cloud Security"],
                "certifications": ["CISSP", "CompTIA Security+"],
                "ai_matching_threshold": 80,
                "selected_threshold": 85,
                "waiting_threshold": 75,
                "status": "Active"
            },
            {
                "title": "Full Stack Engineer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "Product",
                "location": "Denver, CO",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "$110k - $140k",
                "experience_level": "Mid-Level",
                "education": "Bachelor's in CS or equivalent",
                "description": "Develop scalable web applications from the database to the user interface.",
                "requirements": "Build robust APIs with Node.js/Express and craft responsive UIs with React.",
                "benefits": "Unlimited PTO, home office stipend.",
                "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Express", "PostgreSQL"],
                "preferred_skills": ["GraphQL", "Docker", "AWS"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "iOS Developer",
                "company": "Innovant",
                "domain": "Mobile",
                "department": "Engineering",
                "location": "San Francisco, CA",
                "employment_type": "Full-time",
                "work_mode": "On-site",
                "salary": "$130k - $160k",
                "experience_level": "Senior",
                "education": "Bachelor's in CS",
                "description": "Lead the development of our flagship iOS application used by millions.",
                "requirements": "Design and build native iOS apps using Swift and SwiftUI, ensure performance and quality.",
                "benefits": "Catered lunches, equity packages.",
                "skills": ["Swift", "SwiftUI", "Objective-C", "iOS SDK", "Core Data"],
                "preferred_skills": ["Combine", "XCTest", "CI/CD for Mobile"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "Android Developer",
                "company": "Innovant",
                "domain": "Mobile",
                "department": "Engineering",
                "location": "Remote",
                "employment_type": "Full-time",
                "work_mode": "Remote",
                "salary": "$120k - $150k",
                "experience_level": "Mid-Level",
                "education": "Bachelor's in CS",
                "description": "Build high-quality Android applications focused on performance and user experience.",
                "requirements": "Develop features using Kotlin, interact with RESTful APIs, and manage state.",
                "benefits": "Remote work allowance, flexible schedule.",
                "skills": ["Kotlin", "Android SDK", "Jetpack Compose", "Coroutines", "Retrofit"],
                "preferred_skills": ["RxJava", "Dagger/Hilt", "Firebase"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "Data Engineer",
                "company": "Innovant",
                "domain": "Data Science",
                "department": "Data",
                "location": "Boston, MA",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "$125k - $155k",
                "experience_level": "Mid-Level",
                "education": "Bachelor's in CS, IT, or related",
                "description": "Design, build, and optimize large-scale data pipelines and infrastructure.",
                "requirements": "Create ETL pipelines, manage data warehouses, and ensure data quality.",
                "benefits": "401k match, health/dental, professional development budget.",
                "skills": ["Python", "SQL", "Spark", "Airflow", "Snowflake", "AWS"],
                "preferred_skills": ["Kafka", "Hadoop", "dbt"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "AI/NLP Engineer",
                "company": "Innovant",
                "domain": "Data Science",
                "department": "AI Research",
                "location": "Remote",
                "employment_type": "Full-time",
                "work_mode": "Remote",
                "salary": "$140k - $180k",
                "experience_level": "Senior",
                "education": "Master's or PhD in AI, CS, or Linguistics",
                "description": "Research and develop advanced NLP models for natural language understanding and generation.",
                "requirements": "Fine-tune LLMs, build scalable NLP pipelines, and integrate AI features into products.",
                "benefits": "Competitive salary, stock options, remote flexibility.",
                "skills": ["Python", "PyTorch", "Transformers", "NLP", "LLMs", "TensorFlow"],
                "preferred_skills": ["LangChain", "Vector Databases", "ONNX"],
                "certifications": [],
                "ai_matching_threshold": 85,
                "selected_threshold": 95,
                "waiting_threshold": 80,
                "status": "Active"
            },
            {
                "title": "Quality Assurance (QA) Automation Engineer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "QA",
                "location": "Dallas, TX",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "$90k - $120k",
                "experience_level": "Mid-Level",
                "education": "Bachelor's in CS or IT",
                "description": "Ensure software quality by developing and maintaining automated test suites.",
                "requirements": "Write automated end-to-end and API tests, integrate with CI/CD, and report bugs.",
                "benefits": "Health insurance, paid time off, 401k.",
                "skills": ["Selenium", "Cypress", "Python", "Java", "Test Automation", "API Testing"],
                "preferred_skills": ["Appium", "Postman", "Jenkins"],
                "certifications": ["ISTQB"],
                "ai_matching_threshold": 70,
                "selected_threshold": 80,
                "waiting_threshold": 65,
                "status": "Active"
            },
            {
                "title": "Embedded Systems Engineer",
                "company": "Innovant",
                "domain": "Hardware",
                "department": "Engineering",
                "location": "San Jose, CA",
                "employment_type": "Full-time",
                "work_mode": "On-site",
                "salary": "$135k - $165k",
                "experience_level": "Senior",
                "education": "Bachelor's/Master's in Electrical Engineering or CS",
                "description": "Develop firmware and software for cutting-edge IoT devices.",
                "requirements": "Design and test embedded software in C/C++, interface with hardware components.",
                "benefits": "Competitive equity, health benefits, hardware lab access.",
                "skills": ["C", "C++", "Embedded Systems", "RTOS", "Microcontrollers", "IoT"],
                "preferred_skills": ["Python", "Hardware Debugging", "Bluetooth/Wi-Fi protocols"],
                "certifications": [],
                "ai_matching_threshold": 80,
                "selected_threshold": 90,
                "waiting_threshold": 75,
                "status": "Active"
            },
            {
                "title": "UI/UX Designer",
                "company": "Innovant",
                "domain": "Design",
                "department": "Product",
                "location": "Remote",
                "employment_type": "Full-time",
                "work_mode": "Remote",
                "salary": "$100k - $130k",
                "experience_level": "Mid-Level",
                "education": "Bachelor's in Design, HCI, or related",
                "description": "Create intuitive and visually stunning user interfaces for our web and mobile applications.",
                "requirements": "Conduct user research, create wireframes and prototypes, and collaborate with developers.",
                "benefits": "Flexible PTO, remote setup budget, continuing education.",
                "skills": ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing", "UI Design"],
                "preferred_skills": ["Adobe Creative Suite", "HTML/CSS basics", "Interaction Design"],
                "certifications": [],
                "ai_matching_threshold": 70,
                "selected_threshold": 80,
                "waiting_threshold": 65,
                "status": "Active"
            }
        ]

        for data in jds_data:
            jd = JobDescription(user_id=user.id, **data)
            db.add(jd)
        
        await db.commit()
        print(f"Added {len(jds_data)} new Job Descriptions successfully!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_jds())
