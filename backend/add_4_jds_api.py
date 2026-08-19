import requests

API_URL = "http://127.0.0.1:8000/api"

def get_token():
    # Login as default recruiter/org user (assuming admin@innovant.ai or recruiter@innovant.ai from typical setup)
    # Actually we can just hit /auth/login with the default org user
    data = {
        "username": "recruiter@rocas.ai",
        "password": "recruiter123"
    }
    response = requests.post(f"{API_URL}/auth/login", data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    
    # Try another typical user
    data["username"] = "admin@innovant.ai"
    response = requests.post(f"{API_URL}/auth/login", data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
        
    print("Could not get token:", response.text)
    return None

def add_jds(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    jds_data = [
        {
            "title": "Machine Learning Engineer",
            "company": "Innovant",
            "domain": "Data Science",
            "department": "Engineering",
            "location": "San Francisco, CA",
            "employmentType": "Full-time",
            "workMode": "Hybrid",
            "salary": "$130k - $160k",
            "experienceLevel": "Mid-Level",
            "education": "Master's in CS or related field",
            "description": "Join our AI team to build and scale machine learning models.",
            "requirements": "Develop NLP and computer vision models, deploy to AWS.",
            "benefits": "Competitive equity, health insurance, flexible hours.",
            "skills": ["Python", "TensorFlow", "PyTorch", "SQL"],
            "preferredSkills": ["Docker", "AWS", "MLflow"],
            "certifications": ["AWS Machine Learning Specialty"],
            "aiMatchingThreshold": 80,
            "selectedThreshold": 90,
            "waitingThreshold": 75,
            "status": "Active"
        },
        {
            "title": "Frontend Developer",
            "company": "Innovant",
            "domain": "Engineering",
            "department": "Product",
            "location": "Austin, TX",
            "employmentType": "Full-time",
            "workMode": "Remote",
            "salary": "$100k - $120k",
            "experienceLevel": "Mid-Level",
            "education": "Bachelor's in CS or equivalent",
            "description": "We are looking for an experienced frontend developer to craft beautiful UIs.",
            "requirements": "Build responsive web applications using React and Tailwind CSS.",
            "benefits": "Unlimited PTO, remote work stipend.",
            "skills": ["React", "JavaScript", "TypeScript", "Tailwind CSS"],
            "preferredSkills": ["Next.js", "Redux", "Figma"],
            "certifications": [],
            "aiMatchingThreshold": 75,
            "selectedThreshold": 85,
            "waitingThreshold": 70,
            "status": "Active"
        },
        {
            "title": "Backend Software Engineer",
            "company": "Innovant",
            "domain": "Engineering",
            "department": "Infrastructure",
            "location": "New York, NY",
            "employmentType": "Full-time",
            "workMode": "On-site",
            "salary": "$120k - $150k",
            "experienceLevel": "Senior",
            "education": "Bachelor's in CS",
            "description": "Design and maintain high-performance microservices.",
            "requirements": "Build RESTful APIs and manage database scalability.",
            "benefits": "401k match, free lunches, gym membership.",
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "preferredSkills": ["Kubernetes", "Redis", "Kafka"],
            "certifications": ["AWS Certified Solutions Architect"],
            "aiMatchingThreshold": 75,
            "selectedThreshold": 90,
            "waitingThreshold": 80,
            "status": "Active"
        },
        {
            "title": "Product Manager",
            "company": "Innovant",
            "domain": "Product",
            "department": "Management",
            "location": "Seattle, WA",
            "employmentType": "Full-time",
            "workMode": "Hybrid",
            "salary": "$140k - $170k",
            "experienceLevel": "Senior",
            "education": "MBA or Bachelor's in Business/CS",
            "description": "Lead the product vision and work closely with engineering and design.",
            "requirements": "Define product roadmap, gather user feedback, and manage sprints.",
            "benefits": "Stock options, comprehensive health coverage.",
            "skills": ["Agile", "Scrum", "Jira", "Product Strategy"],
            "preferredSkills": ["Data Analysis", "UX Principles"],
            "certifications": ["Certified Scrum Product Owner (CSPO)"],
            "aiMatchingThreshold": 70,
            "selectedThreshold": 85,
            "waitingThreshold": 75,
            "status": "Active"
        }
    ]

    for data in jds_data:
        response = requests.post(f"{API_URL}/jd/", json=data, headers=headers)
        if response.status_code == 201:
            print(f"Added JD: {data['title']}")
        else:
            print(f"Failed to add {data['title']}: {response.text}")

if __name__ == "__main__":
    token = get_token()
    if token:
        add_jds(token)
