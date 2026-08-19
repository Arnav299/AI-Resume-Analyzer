import sqlite3
import uuid
import datetime

db_path = r'c:\Users\TANUJA SOPAN SHELKE\OneDrive\Desktop\Antigrvaity\AI_Resume_Analyzer\backend\resume_analyzer.db'
conn = sqlite3.connect(db_path, timeout=5)
c = conn.cursor()

# Get Demo Recruiter ID
c.execute('SELECT id FROM users WHERE email = ?', ('recruiter@rocas.ai',))
user = c.fetchone()
if not user:
    print("User recruiter@rocas.ai not found!")
    exit()
user_id = user[0]

jds_data = [
    {
        "title": "Machine Learning Engineer",
        "company": "Innovant",
        "domain": "Engineering",
        "department": "AI/ML",
        "location": "Various",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "salary": "Not Specified",
        "experience_level": "2-5 years",
        "education": "Bachelor's or Master's in CS or related field",
        "description": "We are looking for a Machine Learning Engineer to join our team and build scalable ML models.",
        "requirements": "Develop and deploy machine learning models. Collaborate with cross-functional teams.",
        "benefits": "Competitive salary, health insurance, flexible hours.",
        "skills": ["Python", "Scikit-learn", "TensorFlow/PyTorch", "Pandas", "NumPy", "SQL", "Machine Learning", "Data Preprocessing"],
        "preferred_skills": ["NLP", "Computer Vision", "MLOps", "FastAPI", "Docker"],
        "certifications": [],
        "ai_matching_threshold": 75,
        "selected_threshold": 85,
        "waiting_threshold": 70,
        "status": "Active"
    },
    {
        "title": "Senior React Developer",
        "company": "Innovant",
        "domain": "Engineering",
        "department": "Frontend",
        "location": "Various",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "salary": "Not Specified",
        "experience_level": "4-7 years",
        "education": "Bachelor's in CS or related field",
        "description": "Seeking an experienced Senior React Developer to lead frontend architecture and development.",
        "requirements": "Design and implement scalable web applications using modern frontend technologies.",
        "benefits": "Competitive salary, health insurance, flexible hours.",
        "skills": ["React.js", "TypeScript", "JavaScript", "HTML", "CSS", "REST APIs", "Git"],
        "preferred_skills": ["Next.js", "Redux", "GraphQL", "Jest", "AWS"],
        "certifications": [],
        "ai_matching_threshold": 75,
        "selected_threshold": 85,
        "waiting_threshold": 70,
        "status": "Active"
    },
    {
        "title": "Senior Backend Systems Engineer",
        "company": "Innovant",
        "domain": "Engineering",
        "department": "Backend",
        "location": "Various",
        "employment_type": "Full-time",
        "work_mode": "Remote",
        "salary": "Not Specified",
        "experience_level": "5-8 years",
        "education": "Bachelor's in CS or related field",
        "description": "We are looking for a Senior Backend Systems Engineer to architect and build robust backend services.",
        "requirements": "Develop scalable backend systems, APIs, and microservices.",
        "benefits": "Competitive salary, health insurance, flexible hours.",
        "skills": ["Python", "Go", "PostgreSQL", "REST APIs", "Docker", "Kubernetes", "Redis"],
        "preferred_skills": ["Kafka", "gRPC", "Elasticsearch", "AWS", "Microservices"],
        "certifications": [],
        "ai_matching_threshold": 75,
        "selected_threshold": 85,
        "waiting_threshold": 70,
        "status": "Active"
    },
    {
        "title": "Machine Learning Engineer – NLP",
        "company": "Innovant",
        "domain": "Engineering",
        "department": "AI/ML",
        "location": "Various",
        "employment_type": "Full-time",
        "work_mode": "On-site",
        "salary": "Not Specified",
        "experience_level": "2-5 years",
        "education": "Bachelor's or Master's in CS or related field",
        "description": "Join our AI team to specialize in Natural Language Processing and build LLM-driven applications.",
        "requirements": "Develop NLP models, fine-tune LLMs, and integrate them into production systems.",
        "benefits": "Competitive salary, health insurance, flexible hours.",
        "skills": ["Python", "PyTorch", "Hugging Face", "NLP", "Transformers", "LLMs"],
        "preferred_skills": ["LangChain", "Vector Databases", "Prompt Engineering"],
        "certifications": [],
        "ai_matching_threshold": 75,
        "selected_threshold": 85,
        "waiting_threshold": 70,
        "status": "Active"
    },
    {
        "title": "Data Engineer (Big Data)",
        "company": "Innovant",
        "domain": "Engineering",
        "department": "Data",
        "location": "Various",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "salary": "Not Specified",
        "experience_level": "3-6 years",
        "education": "Bachelor's in CS or related field",
        "description": "Seeking a Data Engineer to design, build, and maintain scalable data pipelines and architectures.",
        "requirements": "Develop ETL/ELT pipelines, manage data warehouses, and optimize data infrastructure.",
        "benefits": "Competitive salary, health insurance, flexible hours.",
        "skills": ["Python", "SQL", "Spark", "Airflow", "AWS", "ETL", "Data Pipelines"],
        "preferred_skills": ["Snowflake", "Databricks", "Kafka", "dbt"],
        "certifications": [],
        "ai_matching_threshold": 75,
        "selected_threshold": 85,
        "waiting_threshold": 70,
        "status": "Active"
    }
]

import json

for data in jds_data:
    # check if exists
    c.execute('SELECT 1 FROM job_descriptions WHERE user_id = ? AND title = ?', (user_id, data['title']))
    if c.fetchone():
        continue
        
    jd_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    
    # Extract keys and stringify lists/dicts
    insert_data = {
        'id': jd_id,
        'user_id': user_id,
        'title': data.get('title'),
        'company': data.get('company'),
        'domain': data.get('domain'),
        'department': data.get('department'),
        'location': data.get('location'),
        'employment_type': data.get('employment_type'),
        'work_mode': data.get('work_mode'),
        'salary': data.get('salary'),
        'experience_level': data.get('experience_level'),
        'education': data.get('education'),
        'description': data.get('description'),
        'requirements': data.get('requirements'),
        'benefits': data.get('benefits'),
        'skills': json.dumps(data.get('skills', [])),
        'preferred_skills': json.dumps(data.get('preferred_skills', [])),
        'certifications': json.dumps(data.get('certifications', [])),
        'weights': json.dumps(data.get('weights', {})),
        'ai_matching_threshold': data.get('ai_matching_threshold'),
        'selected_threshold': data.get('selected_threshold'),
        'waiting_threshold': data.get('waiting_threshold'),
        'status': data.get('status'),
        'created_at': now,
        'updated_at': now
    }
    
    cols = ', '.join(insert_data.keys())
    placeholders = ', '.join(['?'] * len(insert_data))
    
    c.execute(f'INSERT INTO job_descriptions ({cols}) VALUES ({placeholders})', list(insert_data.values()))

conn.commit()

c.execute('SELECT COUNT(*) FROM job_descriptions WHERE user_id = ?', (user_id,))
count = c.fetchone()[0]
print(f'Added 5 JDs. Total JDs for user: {count}')
conn.close()
