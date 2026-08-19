import sqlite3
db_path = r'c:\Users\TANUJA SOPAN SHELKE\OneDrive\Desktop\Antigrvaity\AI_Resume_Analyzer\backend\resume_analyzer.db'
try:
    conn = sqlite3.connect(db_path, timeout=5)
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*), user_id FROM job_descriptions GROUP BY user_id')
    rows = cur.fetchall()
    print('JDs by User ID:')
    for r in rows:
        cur.execute('SELECT email FROM users WHERE id = ?', (r[1],))
        email = cur.fetchone()[0]
        print(f'Count: {r[0]}, User ID: {r[1]}, Email: {email}')
except Exception as e:
    print('Error:', e)
