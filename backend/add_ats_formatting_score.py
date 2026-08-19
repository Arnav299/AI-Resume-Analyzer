"""
Migration script: Add ats_formatting_score column to analysis_results table.
Run from the backend directory.
"""
import sqlite3
import os

dbs = ['resume_analyzer.db', 'ai_resume_analyzer.db', 'app.db', 'ai_resume.db', 'rocas.db']

for db_name in dbs:
    if os.path.exists(db_name):
        try:
            conn = sqlite3.connect(db_name)
            cursor = conn.cursor()
            tables_result = cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
            tables = [r[0] for r in tables_result]
            if 'analysis_results' in tables:
                cursor.execute('PRAGMA table_info(analysis_results)')
                cols = [row[1] for row in cursor.fetchall()]
                if 'ats_formatting_score' not in cols:
                    cursor.execute('ALTER TABLE analysis_results ADD COLUMN ats_formatting_score REAL NOT NULL DEFAULT 0')
                    conn.commit()
                    print(f'[OK] Added ats_formatting_score to {db_name}')
                else:
                    print(f'[SKIP] ats_formatting_score already exists in {db_name}')
            else:
                print(f'[SKIP] analysis_results table not found in {db_name}')
            conn.close()
        except Exception as e:
            print(f'[ERR] {db_name}: {e}')
    else:
        print(f'[SKIP] {db_name} not found')

print('Migration complete.')
