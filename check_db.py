import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent / "backend" / "resume_analyzer.db"
conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

# Get table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [t[0] for t in cursor.fetchall()]
print("Tables in database:", tables)

for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table};")
    count = cursor.fetchone()[0]
    print(f"\nTable: {table} ({count} records)")
    
    cursor.execute(f"PRAGMA table_info({table});")
    cols = [col[1] for col in cursor.fetchall()]
    print("  Columns:", cols)
    
    # Print first few rows
    cursor.execute(f"SELECT * FROM {table} LIMIT 3;")
    rows = cursor.fetchall()
    if rows:
        print("  Sample rows:")
        for r in rows:
            print("   ", r)


conn.close()
