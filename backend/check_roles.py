import sqlite3
conn = sqlite3.connect('resume_analyzer.db')
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM career_roles')
count = c.fetchone()[0]
print(f"Total career roles: {count}")
c.execute('SELECT role_name FROM career_roles ORDER BY role_name')
rows = c.fetchall()
for r in rows:
    print(" -", r[0])
conn.close()
