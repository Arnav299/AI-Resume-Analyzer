import sqlite3

db_path = 'resume_analyzer.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute('PRAGMA table_info(analysis_results)')
cols = [row[1] for row in cursor.fetchall()]
print('Existing columns:', cols)

new_columns = [
    ('ai_rank', 'INTEGER', 'NULL'),
    ('percentile', 'REAL', 'NULL'),
    ('selection_status', 'TEXT', 'NULL'),
]

for col_name, col_type, col_default in new_columns:
    if col_name not in cols:
        try:
            cursor.execute(f'ALTER TABLE analysis_results ADD COLUMN {col_name} {col_type} DEFAULT {col_default}')
            print(f'Added column: {col_name}')
        except Exception as e:
            print(f'Error adding {col_name}: {e}')
    else:
        print(f'Column already exists: {col_name}')

conn.commit()
conn.close()
print('Migration complete.')
