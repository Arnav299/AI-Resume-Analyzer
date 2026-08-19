import sqlite3
import sys

def migrate_db(db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if selected_threshold exists
    cursor.execute("PRAGMA table_info(job_descriptions)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'selected_threshold' not in columns:
        print("Adding 'selected_threshold' column to 'job_descriptions'...")
        cursor.execute("ALTER TABLE job_descriptions ADD COLUMN selected_threshold INTEGER NOT NULL DEFAULT 90")
    else:
        print("'selected_threshold' already exists.")
        
    if 'waiting_threshold' not in columns:
        print("Adding 'waiting_threshold' column to 'job_descriptions'...")
        cursor.execute("ALTER TABLE job_descriptions ADD COLUMN waiting_threshold INTEGER NOT NULL DEFAULT 75")
    else:
        print("'waiting_threshold' already exists.")
        
    conn.commit()
    conn.close()
    print("Migration completed successfully.")

if __name__ == "__main__":
    db_path = "rocas.db"
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    migrate_db(db_path)
