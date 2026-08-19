import sqlite3
import json
import uuid
import os
from datetime import datetime

SKILLS = [
    # Programming
    ("python",              "Programming"),
    ("java",                "Programming"),
    ("javascript",          "Programming"),
    ("typescript",          "Programming"),
    ("c++",                 "Programming"),
    ("c#",                  "Programming"),
    ("go",                  "Programming"),
    ("rust",                "Programming"),
    ("kotlin",              "Programming"),
    ("swift",               "Programming"),
    ("r",                   "Programming"),
    ("matlab",              "Programming"),
    ("bash",                "Programming"),
    ("shell",               "Programming"),
    # Frontend
    ("html",                "Frontend"),
    ("css",                 "Frontend"),
    ("react",               "Frontend"),
    ("angular",             "Frontend"),
    ("vue",                 "Frontend"),
    ("nextjs",              "Frontend"),
    ("tailwindcss",         "Frontend"),
    ("redux",               "Frontend"),
    ("sass",                "Frontend"),
    ("webpack",             "Frontend"),
    ("vite",                "Frontend"),
    # Backend
    ("node.js",             "Backend"),
    ("express",             "Backend"),
    ("fastapi",             "Backend"),
    ("django",              "Backend"),
    ("flask",               "Backend"),
    ("spring boot",         "Backend"),
    ("graphql",             "Backend"),
    ("rest api",            "Backend"),
    ("grpc",                "Backend"),
    ("laravel",             "Backend"),
    # Databases
    ("sql",                 "Database"),
    ("mysql",               "Database"),
    ("postgresql",          "Database"),
    ("mongodb",             "Database"),
    ("redis",               "Database"),
    ("sqlite",              "Database"),
    ("elasticsearch",       "Database"),
    ("firebase",            "Database"),
    ("dynamodb",            "Database"),
    ("cassandra",           "Database"),
    # Cloud & DevOps
    ("aws",                 "Cloud"),
    ("azure",               "Cloud"),
    ("gcp",                 "Cloud"),
    ("docker",              "DevOps"),
    ("kubernetes",          "DevOps"),
    ("terraform",           "DevOps"),
    ("jenkins",             "DevOps"),
    ("github actions",      "DevOps"),
    ("ci/cd",               "DevOps"),
    ("linux",               "DevOps"),
    ("nginx",               "DevOps"),
    ("ansible",             "DevOps"),
    # AI / ML
    ("machine learning",        "AI_ML"),
    ("deep learning",           "AI_ML"),
    ("nlp",                     "AI_ML"),
    ("computer vision",         "AI_ML"),
    ("tensorflow",              "AI_ML"),
    ("pytorch",                 "AI_ML"),
    ("keras",                   "AI_ML"),
    ("scikit-learn",            "AI_ML"),
    ("hugging face",            "AI_ML"),
    ("langchain",               "AI_ML"),
    ("llm",                     "AI_ML"),
    ("rag",                     "AI_ML"),
    ("openai",                  "AI_ML"),
    # Data Analytics
    ("pandas",              "Data_Analytics"),
    ("numpy",               "Data_Analytics"),
    ("matplotlib",          "Data_Analytics"),
    ("power bi",            "Data_Analytics"),
    ("tableau",             "Data_Analytics"),
    ("spark",               "Data_Analytics"),
    ("kafka",               "Data_Analytics"),
    ("airflow",             "Data_Analytics"),
    ("dbt",                 "Data_Analytics"),
    ("etl",                 "Data_Analytics"),
    ("data analysis",       "Data_Analytics"),
    ("data science",        "Data_Analytics"),
    # Tools
    ("git",                 "Other"),
    ("github",              "Other"),
    ("jira",                "Other"),
    ("postman",             "Other"),
    ("figma",               "Other"),
    ("agile",               "Other"),
    ("scrum",               "Other"),
]

ROLE_SKILLS = {
    "full stack developer": [
        ("python", 7), ("javascript", 9), ("typescript", 8),
        ("react", 9), ("node.js", 8), ("html", 8), ("css", 8),
        ("sql", 7), ("postgresql", 7), ("mongodb", 6),
        ("rest api", 8), ("git", 7), ("docker", 6),
        ("redis", 5), ("nextjs", 6),
    ],
    "frontend developer": [
        ("javascript", 10), ("typescript", 8), ("react", 10),
        ("html", 9), ("css", 9), ("nextjs", 7), ("redux", 7),
        ("tailwindcss", 6), ("sass", 5), ("git", 7),
        ("figma", 6), ("vite", 5), ("webpack", 5),
    ],
    "backend developer": [
        ("python", 8), ("java", 7), ("node.js", 8),
        ("fastapi", 7), ("django", 7), ("spring boot", 6),
        ("sql", 9), ("postgresql", 8), ("mongodb", 7),
        ("redis", 6), ("rest api", 9), ("docker", 7),
        ("git", 8), ("linux", 6), ("ci/cd", 6),
    ],
    "data scientist": [
        ("python", 10), ("machine learning", 10), ("deep learning", 8),
        ("pandas", 9), ("numpy", 9), ("scikit-learn", 9),
        ("tensorflow", 7), ("pytorch", 7), ("sql", 7),
        ("data analysis", 9), ("data science", 10), ("matplotlib", 7),
        ("nlp", 6), ("r", 5),
    ],
    "data analyst": [
        ("sql", 10), ("python", 8), ("pandas", 9),
        ("data analysis", 10), ("tableau", 7), ("power bi", 7),
        ("matplotlib", 6), ("numpy", 7),
        ("git", 5), ("etl", 6), ("postgresql", 6),
    ],
    "ai/ml engineer": [
        ("python", 10), ("machine learning", 10), ("deep learning", 9),
        ("tensorflow", 8), ("pytorch", 9), ("scikit-learn", 8),
        ("nlp", 7), ("computer vision", 6),
        ("docker", 7), ("aws", 6), ("sql", 6),
        ("pandas", 8), ("numpy", 8), ("git", 7),
        ("langchain", 7), ("llm", 8), ("hugging face", 7),
    ],
    "devops engineer": [
        ("docker", 10), ("kubernetes", 9), ("linux", 9),
        ("ci/cd", 10), ("terraform", 8), ("ansible", 7),
        ("aws", 8), ("azure", 6), ("jenkins", 7),
        ("github actions", 7), ("bash", 7), ("git", 8),
        ("nginx", 6), ("python", 5),
    ],
    "cloud solutions architect": [
        ("aws", 10), ("azure", 8), ("gcp", 7),
        ("docker", 8), ("kubernetes", 8), ("terraform", 9),
        ("linux", 8), ("python", 6), ("bash", 7),
        ("ci/cd", 7), ("ansible", 6),
    ],
    "mobile developer": [
        ("kotlin", 8), ("swift", 8), ("java", 7),
        ("react", 6), ("git", 7),
        ("rest api", 8), ("firebase", 7), ("sql", 6),
        ("agile", 5),
    ],
    "ai engineer": [
        ("python", 10), ("machine learning", 9), ("deep learning", 9),
        ("llm", 9), ("langchain", 8), ("rag", 7),
        ("openai", 7), ("hugging face", 8), ("pytorch", 8),
        ("nlp", 8), ("docker", 6), ("aws", 6),
        ("rest api", 7), ("git", 7),
    ],
    "software engineer": [
        ("python", 8), ("java", 7), ("javascript", 7),
        ("sql", 7), ("git", 9), ("rest api", 7),
        ("docker", 6), ("agile", 7), ("scrum", 6),
        ("linux", 5), ("ci/cd", 5),
    ],
    "data engineer": [
        ("python", 9), ("sql", 10), ("spark", 8),
        ("kafka", 7), ("airflow", 7), ("dbt", 6),
        ("etl", 9), ("aws", 7), ("postgresql", 7),
        ("mongodb", 5), ("docker", 6), ("git", 7),
        ("pandas", 7),
    ],
}

def main():
    db_path = "resume_ai.db"
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Check if tables exist
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='skills'")
    if not cur.fetchone():
        print("Database tables not found. Please ensure backend models are created.")
        return
        
    print("Seeding skills...")
    skill_map = {}
    new_skills = 0
    now_str = datetime.utcnow().isoformat()
    
    for skill_name, category in SKILLS:
        cur.execute("SELECT id FROM skills WHERE skill_name = ?", (skill_name,))
        row = cur.fetchone()
        if not row:
            skill_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO skills (id, skill_name, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                (skill_id, skill_name, category, now_str, now_str)
            )
            skill_map[skill_name.lower()] = skill_id
            new_skills += 1
            print(f"  [+] Skill: {skill_name}")
        else:
            skill_map[skill_name.lower()] = row[0]
            
    conn.commit()
    print(f"\n✅ Skills: {new_skills} added | {len(skill_map)} total in library\n")
    
    print("Seeding roles...")
    role_map = {}
    cur.execute("SELECT id, role_name FROM career_roles")
    for r in cur.fetchall():
        role_map[r[1].lower()] = r[0]
        
    new_roles = 0
    new_links = 0
    
    for role_key, skill_weights in ROLE_SKILLS.items():
        role_id = role_map.get(role_key.lower())
        if not role_id:
            role_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO career_roles (id, role_name, industry_category, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (role_id, role_key.title(), "Technology", 1, now_str, now_str)
            )
            role_map[role_key.lower()] = role_id
            new_roles += 1
            print(f"  [+] Role: {role_key.title()}")
            
        for skill_name, weight in skill_weights:
            skill_id = skill_map.get(skill_name.lower())
            if not skill_id:
                print(f"  [!] Skill '{skill_name}' not in library – skipped")
                continue
                
            cur.execute(
                "SELECT role_id FROM role_skills WHERE role_id = ? AND skill_id = ?",
                (role_id, skill_id)
            )
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO role_skills (role_id, skill_id, importance_weight) VALUES (?, ?, ?)",
                    (role_id, skill_id, weight)
                )
                new_links += 1
                
    conn.commit()
    conn.close()
    
    print(f"\n✅ Roles: {new_roles} created | {len(role_map)} total")
    print(f"✅ Role→Skill links: {new_links} added")
    print("\nAll done! Re-run analysis – results will now differ per resume.")

if __name__ == "__main__":
    main()
