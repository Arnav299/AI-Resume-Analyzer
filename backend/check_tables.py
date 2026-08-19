import sqlite3
conn = sqlite3.connect('ai_resume_analyzer.db')
tables = [row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables:", tables)
users = conn.execute("SELECT id, email, full_name, role, is_active FROM users").fetchall()
print(f"\nUsers ({len(users)}):")
for u in users:
    print(f"  {u}")
conn.close()
