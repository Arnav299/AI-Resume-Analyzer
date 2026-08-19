-- Initialize Schema for PostgreSQL / Supabase
-- This script sets up the basic tables required for the AI Resume Analyzer

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    ats_score INTEGER,
    extracted_data JSONB,
    skill_gaps JSONB,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed basic role data if there is a roles table
-- CREATE TABLE IF NOT EXISTS roles ( id SERIAL PRIMARY KEY, role_name VARCHAR(50) );
-- INSERT INTO roles (role_name) VALUES ('Admin'), ('User') ON CONFLICT DO NOTHING;
