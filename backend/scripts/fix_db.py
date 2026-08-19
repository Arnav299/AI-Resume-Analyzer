import sqlite3
conn = sqlite3.connect('resume_analyzer.db')
conn.execute("UPDATE skills SET category = 'Other' WHERE category = 'technical'")
conn.commit()
conn.close()
