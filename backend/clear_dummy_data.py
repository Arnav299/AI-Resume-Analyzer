import sqlite3

def clear_data():
    conn = sqlite3.connect('resume_analyzer.db')
    cursor = conn.cursor()
    
    # Tables to clear
    tables = [
        'pipeline_entries',
        'interview_scorecards',
        'analysis_results',
        'resume_parsed_data',
        'resume_skills',
        'resumes',
        'activity_logs',
        'ai_recommendation_logs',
        'student_dashboard_metrics'
    ]
    
    for table in tables:
        print(f"Clearing {table}...")
        cursor.execute(f"DELETE FROM {table};")
        
    # Also clear student profiles for users that aren't the primary dummy accounts
    cursor.execute("DELETE FROM student_profiles WHERE user_id NOT IN (SELECT id FROM users);")
    
    conn.commit()
    conn.close()
    print("Database dummy data cleared!")

if __name__ == '__main__':
    clear_data()
