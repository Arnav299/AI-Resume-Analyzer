-- =============================================================================
-- AI Resume Analyzer & Career Recommendation Portal
-- PostgreSQL Schema — 01_schema.sql
-- Version: 1.0.0
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
CREATE TYPE upload_status AS ENUM ('uploaded', 'processing', 'analyzed', 'failed');
CREATE TYPE gap_type AS ENUM ('matched', 'missing', 'recommended');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE skill_category AS ENUM (
    'Programming',
    'Database',
    'Cloud',
    'AI/ML',
    'Data Analytics',
    'Frontend',
    'Backend',
    'DevOps',
    'Soft Skills',
    'Other'
);
CREATE TYPE extraction_source AS ENUM ('rule_based', 'ai_extraction', 'manual');

-- =============================================================================
-- TABLE 1: users
-- =============================================================================

CREATE TABLE users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name        VARCHAR(255)        NOT NULL,
    email            VARCHAR(320)        NOT NULL,
    password_hash    TEXT                NOT NULL,
    role             user_role           NOT NULL DEFAULT 'student',
    is_active        BOOLEAN             NOT NULL DEFAULT TRUE,
    last_login       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_role   ON users (role);
CREATE INDEX idx_users_active ON users (is_active);

COMMENT ON TABLE  users              IS 'Platform users: students, mentors, and admins';
COMMENT ON COLUMN users.role         IS 'Enum: student | mentor | admin';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash — never store plaintext';

-- =============================================================================
-- TABLE 2: career_roles  (no FK deps — seed early)
-- =============================================================================

CREATE TABLE career_roles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name         VARCHAR(150)    NOT NULL,
    description       TEXT,
    industry_category VARCHAR(100),
    is_active         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_career_roles_name UNIQUE (role_name)
);

CREATE INDEX idx_career_roles_name ON career_roles (role_name);

COMMENT ON TABLE career_roles IS 'Target career roles students can map themselves against';

-- =============================================================================
-- TABLE 3: skills
-- =============================================================================

CREATE TABLE skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name  VARCHAR(150)   NOT NULL,
    category    skill_category NOT NULL DEFAULT 'Other',
    is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_skills_name UNIQUE (skill_name)
);

CREATE INDEX idx_skills_name     ON skills (skill_name);
CREATE INDEX idx_skills_category ON skills (category);

COMMENT ON TABLE skills IS 'Master skill library — referenced across resume extraction and role mapping';

-- =============================================================================
-- TABLE 4: role_skills  (career_roles ⟷ skills many-to-many with weight)
-- =============================================================================

CREATE TABLE role_skills (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id           UUID           NOT NULL REFERENCES career_roles (id) ON DELETE CASCADE,
    skill_id          UUID           NOT NULL REFERENCES skills (id)        ON DELETE CASCADE,
    importance_weight SMALLINT       NOT NULL DEFAULT 5
                          CHECK (importance_weight BETWEEN 1 AND 10),

    CONSTRAINT uq_role_skills UNIQUE (role_id, skill_id)
);

CREATE INDEX idx_role_skills_role  ON role_skills (role_id);
CREATE INDEX idx_role_skills_skill ON role_skills (skill_id);

COMMENT ON TABLE  role_skills                  IS 'Required skills per career role with importance weighting (1–10)';
COMMENT ON COLUMN role_skills.importance_weight IS '10 = must-have, 1 = nice-to-have';

-- =============================================================================
-- TABLE 5: student_profiles
-- =============================================================================

CREATE TABLE student_profiles (
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                      UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    college_name                 VARCHAR(255),
    degree                       VARCHAR(150),
    branch                       VARCHAR(150),
    year_of_study                SMALLINT      CHECK (year_of_study BETWEEN 1 AND 6),
    graduation_year              SMALLINT      CHECK (graduation_year BETWEEN 2000 AND 2040),
    phone                        VARCHAR(20),
    linkedin_url                 TEXT,
    github_url                   TEXT,
    target_role_id               UUID          REFERENCES career_roles (id) ON DELETE SET NULL,
    profile_completion_percentage SMALLINT     NOT NULL DEFAULT 0
                                      CHECK (profile_completion_percentage BETWEEN 0 AND 100),
    created_at                   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_profiles_user UNIQUE (user_id)
);

CREATE INDEX idx_student_profiles_user        ON student_profiles (user_id);
CREATE INDEX idx_student_profiles_target_role ON student_profiles (target_role_id);

COMMENT ON TABLE student_profiles IS '1:1 extension of users for student-specific data';

-- =============================================================================
-- TABLE 6: resumes
-- =============================================================================

CREATE TABLE resumes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID          NOT NULL REFERENCES student_profiles (id) ON DELETE CASCADE,
    original_filename  VARCHAR(500)  NOT NULL,
    file_path          TEXT          NOT NULL,
    file_size          INTEGER       CHECK (file_size > 0),  -- bytes
    file_type          VARCHAR(50)   NOT NULL DEFAULT 'application/pdf',
    upload_status      upload_status NOT NULL DEFAULT 'uploaded',
    is_active          BOOLEAN       NOT NULL DEFAULT TRUE,
    uploaded_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_resumes_file_type CHECK (file_type IN ('application/pdf','application/docx'))
);

CREATE INDEX idx_resumes_student ON resumes (student_profile_id);
CREATE INDEX idx_resumes_status  ON resumes (upload_status);
CREATE INDEX idx_resumes_active  ON resumes (is_active);

COMMENT ON TABLE resumes IS 'Resume upload metadata — actual file stored on disk/object-storage';

-- =============================================================================
-- TABLE 7: resume_parsed_data
-- =============================================================================

CREATE TABLE resume_parsed_data (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id            UUID        NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    extracted_name       VARCHAR(255),
    extracted_email      VARCHAR(320),
    extracted_phone      VARCHAR(30),
    education_summary    TEXT,
    experience_summary   TEXT,
    projects_summary     TEXT,
    certifications_summary TEXT,
    extracted_text       TEXT,           -- full raw text for AI processing
    parsed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_resume_parsed_data_resume UNIQUE (resume_id)
);

CREATE INDEX idx_resume_parsed_data_resume ON resume_parsed_data (resume_id);

COMMENT ON TABLE resume_parsed_data IS 'Structured data extracted from PDF resume by the parser service';

-- =============================================================================
-- TABLE 8: resume_skills
-- =============================================================================

CREATE TABLE resume_skills (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id         UUID             NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    skill_id          UUID             NOT NULL REFERENCES skills (id)  ON DELETE CASCADE,
    confidence_score  NUMERIC(5,2)     NOT NULL DEFAULT 1.00
                          CHECK (confidence_score BETWEEN 0 AND 1),
    extraction_source extraction_source NOT NULL DEFAULT 'rule_based',
    created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_resume_skills UNIQUE (resume_id, skill_id)
);

CREATE INDEX idx_resume_skills_resume ON resume_skills (resume_id);
CREATE INDEX idx_resume_skills_skill  ON resume_skills (skill_id);

COMMENT ON TABLE  resume_skills                  IS 'Skills identified in a specific resume';
COMMENT ON COLUMN resume_skills.confidence_score  IS '0.0–1.0 confidence from extraction engine';

-- =============================================================================
-- TABLE 9: analysis_results
-- =============================================================================

CREATE TABLE analysis_results (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id                   UUID         NOT NULL REFERENCES resumes (id)      ON DELETE CASCADE,
    target_role_id              UUID         NOT NULL REFERENCES career_roles (id) ON DELETE CASCADE,
    readiness_score             NUMERIC(5,2) NOT NULL DEFAULT 0
                                    CHECK (readiness_score BETWEEN 0 AND 100),
    skill_score                 NUMERIC(5,2) NOT NULL DEFAULT 0
                                    CHECK (skill_score BETWEEN 0 AND 70),
    project_score               NUMERIC(5,2) NOT NULL DEFAULT 0
                                    CHECK (project_score BETWEEN 0 AND 20),
    professional_presence_score NUMERIC(5,2) NOT NULL DEFAULT 0
                                    CHECK (professional_presence_score BETWEEN 0 AND 10),
    strengths                   TEXT[],           -- array of strength strings
    weaknesses                  TEXT[],           -- array of weakness strings
    recommendation_summary      TEXT,
    analyzed_at                 TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analysis_results_resume      ON analysis_results (resume_id);
CREATE INDEX idx_analysis_results_target_role ON analysis_results (target_role_id);
CREATE INDEX idx_analysis_results_score       ON analysis_results (readiness_score DESC);
CREATE INDEX idx_analysis_results_analyzed_at ON analysis_results (analyzed_at DESC);

COMMENT ON TABLE  analysis_results               IS 'Final scored analysis of a resume against a target career role';
COMMENT ON COLUMN analysis_results.readiness_score IS 'Skill(70) + Project(20) + Presence(10) = max 100';

-- =============================================================================
-- TABLE 10: skill_gap_analysis
-- =============================================================================

CREATE TABLE skill_gap_analysis (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_result_id UUID     NOT NULL REFERENCES analysis_results (id) ON DELETE CASCADE,
    skill_id           UUID     NOT NULL REFERENCES skills (id)            ON DELETE CASCADE,
    gap_type           gap_type NOT NULL,

    CONSTRAINT uq_skill_gap_analysis UNIQUE (analysis_result_id, skill_id)
);

CREATE INDEX idx_skill_gap_analysis_result ON skill_gap_analysis (analysis_result_id);
CREATE INDEX idx_skill_gap_analysis_skill  ON skill_gap_analysis (skill_id);
CREATE INDEX idx_skill_gap_analysis_type   ON skill_gap_analysis (gap_type);

COMMENT ON TABLE  skill_gap_analysis          IS 'Per-skill gap classification for a given analysis';
COMMENT ON COLUMN skill_gap_analysis.gap_type  IS 'matched | missing | recommended';

-- =============================================================================
-- TABLE 11: career_recommendations
-- =============================================================================

CREATE TABLE career_recommendations (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_result_id UUID         NOT NULL REFERENCES analysis_results (id) ON DELETE CASCADE,
    recommended_role_id UUID        NOT NULL REFERENCES career_roles (id)      ON DELETE CASCADE,
    match_percentage   NUMERIC(5,2) NOT NULL DEFAULT 0
                           CHECK (match_percentage BETWEEN 0 AND 100),
    rank_position      SMALLINT     NOT NULL DEFAULT 1
                           CHECK (rank_position BETWEEN 1 AND 10),
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_career_recommendations UNIQUE (analysis_result_id, recommended_role_id)
);

CREATE INDEX idx_career_recommendations_analysis ON career_recommendations (analysis_result_id);
CREATE INDEX idx_career_recommendations_role     ON career_recommendations (recommended_role_id);

COMMENT ON TABLE career_recommendations IS 'Top-N alternative career role matches ranked by score';

-- =============================================================================
-- TABLE 12: learning_paths
-- =============================================================================

CREATE TABLE learning_paths (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title              VARCHAR(255)     NOT NULL,
    description        TEXT,
    estimated_duration VARCHAR(100),    -- e.g. "6 weeks", "3 months"
    difficulty_level   difficulty_level NOT NULL DEFAULT 'beginner',
    is_active          BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_learning_paths_title UNIQUE (title)
);

CREATE INDEX idx_learning_paths_difficulty ON learning_paths (difficulty_level);

COMMENT ON TABLE learning_paths IS 'Curated learning tracks mapped to specific skill gaps';

-- =============================================================================
-- TABLE 13: learning_path_skills
-- =============================================================================

CREATE TABLE learning_path_skills (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths (id) ON DELETE CASCADE,
    skill_id         UUID NOT NULL REFERENCES skills (id)          ON DELETE CASCADE,
    sequence_order   SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT uq_learning_path_skills UNIQUE (learning_path_id, skill_id)
);

CREATE INDEX idx_learning_path_skills_path  ON learning_path_skills (learning_path_id);
CREATE INDEX idx_learning_path_skills_skill ON learning_path_skills (skill_id);

COMMENT ON TABLE learning_path_skills IS 'Skills taught within each learning path, ordered by sequence';

-- =============================================================================
-- TABLE 14: user_recommendations
-- =============================================================================

CREATE TABLE user_recommendations (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_result_id  UUID           NOT NULL REFERENCES analysis_results (id) ON DELETE CASCADE,
    learning_path_id    UUID           REFERENCES learning_paths (id) ON DELETE SET NULL,
    recommendation_text TEXT           NOT NULL,
    priority_level      priority_level NOT NULL DEFAULT 'medium',
    is_completed        BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_recommendations_analysis ON user_recommendations (analysis_result_id);
CREATE INDEX idx_user_recommendations_path     ON user_recommendations (learning_path_id);
CREATE INDEX idx_user_recommendations_priority ON user_recommendations (priority_level);

COMMENT ON TABLE user_recommendations IS 'Actionable recommendations generated per analysis, linked to learning paths';

-- =============================================================================
-- TABLE 15: mentor_feedback
-- =============================================================================

CREATE TABLE mentor_feedback (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_result_id UUID         NOT NULL REFERENCES analysis_results (id) ON DELETE CASCADE,
    mentor_id          UUID         NOT NULL REFERENCES users (id)             ON DELETE CASCADE,
    rating             SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments           TEXT,
    improvement_actions TEXT[],    -- array of action items
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_mentor_feedback UNIQUE (analysis_result_id, mentor_id)
);

CREATE INDEX idx_mentor_feedback_analysis ON mentor_feedback (analysis_result_id);
CREATE INDEX idx_mentor_feedback_mentor   ON mentor_feedback (mentor_id);

COMMENT ON TABLE  mentor_feedback        IS 'Human mentor ratings and comments on analysis results';
COMMENT ON COLUMN mentor_feedback.rating  IS '1 (poor) to 5 (excellent)';

-- =============================================================================
-- TABLE 16: student_dashboard_metrics  (materialized summary — refreshed by trigger)
-- =============================================================================

CREATE TABLE student_dashboard_metrics (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id             UUID         NOT NULL REFERENCES student_profiles (id) ON DELETE CASCADE,
    total_resumes_uploaded INTEGER      NOT NULL DEFAULT 0,
    latest_score           NUMERIC(5,2),
    average_score          NUMERIC(5,2),
    strongest_skill        VARCHAR(150),
    weakest_skill          VARCHAR(150),
    last_updated           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_dashboard_metrics UNIQUE (student_id)
);

CREATE INDEX idx_student_dashboard_metrics_student ON student_dashboard_metrics (student_id);

COMMENT ON TABLE student_dashboard_metrics IS 'Pre-aggregated dashboard summary per student — updated by trigger on analysis_results INSERT';

-- =============================================================================
-- TABLE 17: activity_logs
-- =============================================================================

CREATE TABLE activity_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID         REFERENCES users (id) ON DELETE SET NULL,
    action_type         VARCHAR(100) NOT NULL,
    action_description  TEXT,
    entity_name         VARCHAR(100),
    entity_id           UUID,
    ip_address          INET,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user       ON activity_logs (user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX idx_activity_logs_action     ON activity_logs (action_type);

COMMENT ON TABLE  activity_logs             IS 'Audit log for all significant platform actions';
COMMENT ON COLUMN activity_logs.entity_name  IS 'e.g. resume, analysis_result, mentor_feedback';

-- =============================================================================
-- TABLE 18: ai_recommendation_logs
-- =============================================================================

CREATE TABLE ai_recommendation_logs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_result_id UUID        NOT NULL REFERENCES analysis_results (id) ON DELETE CASCADE,
    prompt_used        TEXT        NOT NULL,
    ai_response        TEXT        NOT NULL,
    model_name         VARCHAR(100) NOT NULL,
    token_usage        INTEGER     CHECK (token_usage >= 0),
    generated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_recommendation_logs_analysis    ON ai_recommendation_logs (analysis_result_id);
CREATE INDEX idx_ai_recommendation_logs_model       ON ai_recommendation_logs (model_name);
CREATE INDEX idx_ai_recommendation_logs_generated_at ON ai_recommendation_logs (generated_at DESC);

COMMENT ON TABLE  ai_recommendation_logs            IS 'Audit trail for AI-generated recommendations — enables prompt tuning';
COMMENT ON COLUMN ai_recommendation_logs.token_usage IS 'Total tokens consumed (prompt + completion)';

-- =============================================================================
-- TRIGGERS — auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TRIGGER trg_student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =============================================================================
-- TRIGGER — refresh student_dashboard_metrics after new analysis
-- =============================================================================

CREATE OR REPLACE FUNCTION trg_refresh_student_dashboard()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- Resolve student from resume
    SELECT sp.id INTO v_student_id
    FROM resumes r
    JOIN student_profiles sp ON sp.id = r.student_profile_id
    WHERE r.id = NEW.resume_id;

    INSERT INTO student_dashboard_metrics (
        student_id,
        total_resumes_uploaded,
        latest_score,
        average_score,
        last_updated
    )
    SELECT
        v_student_id,
        COUNT(DISTINCT r.id),
        MAX(ar.readiness_score),
        ROUND(AVG(ar.readiness_score), 2),
        NOW()
    FROM resumes r
    JOIN analysis_results ar ON ar.resume_id = r.id
    WHERE r.student_profile_id = v_student_id
    ON CONFLICT (student_id) DO UPDATE SET
        total_resumes_uploaded = EXCLUDED.total_resumes_uploaded,
        latest_score           = EXCLUDED.latest_score,
        average_score          = EXCLUDED.average_score,
        last_updated           = NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_analysis_results_dashboard
    AFTER INSERT ON analysis_results
    FOR EACH ROW EXECUTE FUNCTION trg_refresh_student_dashboard();

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
