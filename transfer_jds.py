import sqlite3
import time

db_path = r'c:\Users\TANUJA SOPAN SHELKE\OneDrive\Desktop\Antigrvaity\AI_Resume_Analyzer\backend\resume_analyzer.db'
try:
    conn = sqlite3.connect(db_path, timeout=5)
    cur = conn.cursor()
    cur.execute('SELECT id FROM users WHERE email = ?', ('recruiter@rocas.ai',))
    row = cur.fetchone()
    if row:
        demo_recruiter_id = row[0]
        cur.execute('UPDATE job_descriptions SET user_id = ?', (demo_recruiter_id,))
        conn.commit()
        
        cur.execute('SELECT COUNT(*) FROM job_descriptions WHERE user_id = ?', (demo_recruiter_id,))
        count = cur.fetchone()[0]
        print(f'Transferred all JDs to Demo Recruiter (ID: {demo_recruiter_id}). Total JDs for this user: {count}')
    else:
        print('Demo Recruiter not found in DB')
    conn.close()
except Exception as e:
    print('Error:', e)
