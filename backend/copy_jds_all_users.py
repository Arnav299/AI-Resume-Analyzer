import sqlite3
import uuid

conn = sqlite3.connect('c:/Users/User/Documents/Innovant/Internship/Project Dev/Development/AI-Resume-Analyzer/backend/ai_resume_analyzer.db')
c = conn.cursor()

users = c.execute('SELECT id FROM users').fetchall()
jds = c.execute('SELECT * FROM job_descriptions ORDER BY created_at DESC LIMIT 4').fetchall()

# jds structure (assuming standard columns, we'll fetch column names)
columns = [desc[0] for desc in c.description]

for user in users:
    user_id = user[0]
    
    for jd in jds:
        # Check if JD already exists for this user with same title
        jd_dict = dict(zip(columns, jd))
        
        # Don't duplicate if this JD was originally created by this user
        if jd_dict['user_id'] == user_id:
            continue
            
        title = jd_dict['title']
        exists = c.execute('SELECT 1 FROM job_descriptions WHERE user_id = ? AND title = ?', (user_id, title)).fetchone()
        
        if not exists:
            new_id = str(uuid.uuid4())
            new_jd = list(jd)
            
            # Update id and user_id in the tuple
            id_idx = columns.index('id')
            user_idx = columns.index('user_id')
            
            new_jd[id_idx] = new_id
            new_jd[user_idx] = user_id
            
            placeholders = ','.join(['?'] * len(new_jd))
            c.execute(f'INSERT INTO job_descriptions VALUES ({placeholders})', new_jd)

conn.commit()
print("Copied JDs to all users successfully.")
conn.close()
