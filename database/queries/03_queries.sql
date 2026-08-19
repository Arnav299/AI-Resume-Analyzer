-- =============================================================================
-- AI Resume Analyzer — Analytical & Dashboard Queries
-- 03_queries.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SECTION 1: READINESS SCORE REPORTING
-- ---------------------------------------------------------------------------

-- 1.1  Latest readiness score per student
SELECT
    u.full_name,
    u.email,
    cr.role_name                       AS target_role,
    ar.readiness_score,
    ar.skill_score,
    ar.project_score,
    ar.professional_presence_score,
    ar.analyzed_at
FROM analysis_results ar
JOIN resumes          r   ON r.id  = ar.resume_id
JOIN student_profiles sp  ON sp.id = r.student_profile_id
JOIN users            u   ON u.id  = sp.user_id
JOIN career_roles     cr  ON cr.id = ar.target_role_id
WHERE ar.analyzed_at = (
    -- Most recent analysis for this student
    SELECT MAX(ar2.analyzed_at)
    FROM analysis_results ar2
    JOIN resumes r2 ON r2.id = ar2.resume_id
    WHERE r2.student_profile_id = sp.id
)
ORDER BY ar.readiness_score DESC;

-- 1.2  Score distribution histogram (10-point buckets)
SELECT
    FLOOR(readiness_score / 10) * 10  AS score_bucket,
    COUNT(*)                           AS student_count
FROM analysis_results
GROUP BY score_bucket
ORDER BY score_bucket;

-- 1.3  Average readiness score per target role
SELECT
    cr.role_name,
    COUNT(ar.id)                       AS total_analyses,
    ROUND(AVG(ar.readiness_score), 2)  AS avg_readiness_score,
    ROUND(MAX(ar.readiness_score), 2)  AS max_score,
    ROUND(MIN(ar.readiness_score), 2)  AS min_score
FROM analysis_results ar
JOIN career_roles cr ON cr.id = ar.target_role_id
GROUP BY cr.role_name
ORDER BY avg_readiness_score DESC;

-- 1.4  Score improvement over time for a specific student
--      Replace :student_id with actual UUID
SELECT
    ar.analyzed_at::DATE               AS analysis_date,
    ar.readiness_score,
    ar.skill_score,
    ar.project_score,
    ar.professional_presence_score,
    cr.role_name
FROM analysis_results ar
JOIN resumes          r  ON r.id  = ar.resume_id
JOIN student_profiles sp ON sp.id = r.student_profile_id
JOIN career_roles     cr ON cr.id = ar.target_role_id
WHERE sp.user_id = :student_id
ORDER BY ar.analyzed_at ASC;

-- ---------------------------------------------------------------------------
-- SECTION 2: STUDENT DASHBOARD QUERIES
-- ---------------------------------------------------------------------------

-- 2.1  Full student dashboard snapshot
SELECT
    u.full_name,
    u.email,
    sp.college_name,
    sp.branch,
    sp.year_of_study,
    sp.graduation_year,
    sp.profile_completion_percentage,
    cr.role_name                        AS target_role,
    sdm.total_resumes_uploaded,
    sdm.latest_score,
    sdm.average_score,
    sdm.strongest_skill,
    sdm.weakest_skill,
    sdm.last_updated
FROM student_profiles            sp
JOIN users                       u   ON u.id   = sp.user_id
LEFT JOIN career_roles           cr  ON cr.id  = sp.target_role_id
LEFT JOIN student_dashboard_metrics sdm ON sdm.student_id = sp.id
WHERE sp.user_id = :student_id;

-- 2.2  All resumes for a student with their analysis status
SELECT
    r.id                               AS resume_id,
    r.original_filename,
    r.upload_status,
    r.uploaded_at,
    ar.readiness_score,
    ar.analyzed_at,
    cr.role_name                       AS analyzed_for_role
FROM resumes          r
JOIN student_profiles sp ON sp.id = r.student_profile_id
LEFT JOIN analysis_results ar ON ar.resume_id = r.id
LEFT JOIN career_roles     cr ON cr.id = ar.target_role_id
WHERE sp.user_id = :student_id
ORDER BY r.uploaded_at DESC;

-- 2.3  Skills matched vs missing for the latest analysis
SELECT
    s.skill_name,
    s.category,
    sga.gap_type,
    rs.importance_weight
FROM skill_gap_analysis sga
JOIN skills             s  ON s.id  = sga.skill_id
JOIN analysis_results   ar ON ar.id = sga.analysis_result_id
JOIN role_skills        rs ON rs.skill_id = s.id AND rs.role_id = ar.target_role_id
WHERE sga.analysis_result_id = :analysis_id
ORDER BY sga.gap_type, rs.importance_weight DESC;

-- 2.4  Recommendations for an analysis, ordered by priority
SELECT
    ur.recommendation_text,
    ur.priority_level,
    ur.is_completed,
    lp.title                           AS learning_path,
    lp.estimated_duration,
    lp.difficulty_level
FROM user_recommendations ur
LEFT JOIN learning_paths lp ON lp.id = ur.learning_path_id
WHERE ur.analysis_result_id = :analysis_id
ORDER BY
    CASE ur.priority_level
        WHEN 'high'   THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low'    THEN 3
    END,
    ur.created_at;

-- 2.5  Top career role matches for a student's latest analysis
SELECT
    cr.role_name,
    crec.match_percentage,
    crec.rank_position
FROM career_recommendations crec
JOIN career_roles            cr  ON cr.id = crec.recommended_role_id
WHERE crec.analysis_result_id = :analysis_id
ORDER BY crec.rank_position ASC;

-- ---------------------------------------------------------------------------
-- SECTION 3: MENTOR DASHBOARD QUERIES
-- ---------------------------------------------------------------------------

-- 3.1  Mentor dashboard — all assigned students with latest scores
SELECT
    u_s.full_name                      AS student_name,
    u_s.email                          AS student_email,
    sp.college_name,
    sp.branch,
    sp.year_of_study,
    cr.role_name                       AS target_role,
    sdm.latest_score,
    sdm.average_score,
    sdm.total_resumes_uploaded,
    -- Has the mentor already given feedback on the latest analysis?
    CASE WHEN mf.id IS NOT NULL THEN TRUE ELSE FALSE END AS feedback_given
FROM student_profiles            sp
JOIN users                       u_s ON u_s.id = sp.user_id
LEFT JOIN career_roles           cr  ON cr.id  = sp.target_role_id
LEFT JOIN student_dashboard_metrics sdm ON sdm.student_id = sp.id
-- Latest analysis per student
LEFT JOIN LATERAL (
    SELECT ar.id AS analysis_id
    FROM resumes          r
    JOIN analysis_results ar ON ar.resume_id = r.id
    WHERE r.student_profile_id = sp.id
    ORDER BY ar.analyzed_at DESC
    LIMIT 1
) latest_ar ON TRUE
LEFT JOIN mentor_feedback mf
    ON mf.analysis_result_id = latest_ar.analysis_id
    AND mf.mentor_id = :mentor_id
ORDER BY sdm.latest_score DESC NULLS LAST;

-- 3.2  Feedback history by mentor
SELECT
    u_s.full_name                      AS student_name,
    cr.role_name                       AS analyzed_role,
    ar.readiness_score,
    mf.rating,
    mf.comments,
    mf.improvement_actions,
    mf.created_at                      AS feedback_date
FROM mentor_feedback  mf
JOIN analysis_results ar  ON ar.id  = mf.analysis_result_id
JOIN resumes          r   ON r.id   = ar.resume_id
JOIN student_profiles sp  ON sp.id  = r.student_profile_id
JOIN users            u_s ON u_s.id = sp.user_id
JOIN career_roles     cr  ON cr.id  = ar.target_role_id
WHERE mf.mentor_id = :mentor_id
ORDER BY mf.created_at DESC;

-- 3.3  Mentor's average rating given per role
SELECT
    cr.role_name,
    COUNT(mf.id)                       AS feedbacks_given,
    ROUND(AVG(mf.rating), 2)           AS avg_rating_given
FROM mentor_feedback  mf
JOIN analysis_results ar ON ar.id = mf.analysis_result_id
JOIN career_roles     cr ON cr.id = ar.target_role_id
WHERE mf.mentor_id = :mentor_id
GROUP BY cr.role_name
ORDER BY avg_rating_given DESC;

-- ---------------------------------------------------------------------------
-- SECTION 4: AI RECOMMENDATION QUERIES
-- ---------------------------------------------------------------------------

-- 4.1  Retrieve latest AI recommendation log for an analysis
SELECT
    arl.model_name,
    arl.prompt_used,
    arl.ai_response,
    arl.token_usage,
    arl.generated_at
FROM ai_recommendation_logs arl
WHERE arl.analysis_result_id = :analysis_id
ORDER BY arl.generated_at DESC
LIMIT 1;

-- 4.2  Token usage summary by model (cost monitoring)
SELECT
    model_name,
    COUNT(*)                           AS total_calls,
    SUM(token_usage)                   AS total_tokens,
    ROUND(AVG(token_usage), 0)         AS avg_tokens_per_call,
    DATE_TRUNC('day', generated_at)    AS day
FROM ai_recommendation_logs
GROUP BY model_name, DATE_TRUNC('day', generated_at)
ORDER BY day DESC, total_tokens DESC;

-- 4.3  Analyses with no AI logs (rule-based only)
SELECT
    ar.id                              AS analysis_id,
    ar.readiness_score,
    ar.analyzed_at,
    cr.role_name
FROM analysis_results ar
JOIN career_roles     cr ON cr.id = ar.target_role_id
WHERE NOT EXISTS (
    SELECT 1 FROM ai_recommendation_logs arl
    WHERE arl.analysis_result_id = ar.id
)
ORDER BY ar.analyzed_at DESC;

-- ---------------------------------------------------------------------------
-- SECTION 5: ADMIN / PLATFORM ANALYTICS
-- ---------------------------------------------------------------------------

-- 5.1  Platform overview (total counts)
SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'student')          AS total_students,
    (SELECT COUNT(*) FROM users WHERE role = 'mentor')           AS total_mentors,
    (SELECT COUNT(*) FROM resumes)                                AS total_resumes,
    (SELECT COUNT(*) FROM analysis_results)                       AS total_analyses,
    (SELECT COUNT(*) FROM mentor_feedback)                        AS total_feedbacks,
    (SELECT ROUND(AVG(readiness_score), 2) FROM analysis_results) AS platform_avg_score;

-- 5.2  Top 10 most common missing skills across all analyses
SELECT
    s.skill_name,
    s.category,
    COUNT(sga.id)                      AS times_missing
FROM skill_gap_analysis sga
JOIN skills             s   ON s.id = sga.skill_id
WHERE sga.gap_type = 'missing'
GROUP BY s.skill_name, s.category
ORDER BY times_missing DESC
LIMIT 10;

-- 5.3  Most popular target roles
SELECT
    cr.role_name,
    COUNT(sp.id)                       AS student_count
FROM student_profiles sp
JOIN career_roles     cr ON cr.id = sp.target_role_id
GROUP BY cr.role_name
ORDER BY student_count DESC;

-- 5.4  Activity log — last 50 platform events
SELECT
    u.full_name,
    u.role,
    al.action_type,
    al.action_description,
    al.entity_name,
    al.created_at
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 50;

-- 5.5  Weekly registration trend (last 8 weeks)
SELECT
    DATE_TRUNC('week', created_at)     AS week_start,
    role,
    COUNT(*)                           AS new_registrations
FROM users
WHERE created_at >= NOW() - INTERVAL '8 weeks'
GROUP BY DATE_TRUNC('week', created_at), role
ORDER BY week_start DESC, role;

-- 5.6  Students at risk — score below 40 and no mentor feedback
SELECT
    u.full_name,
    u.email,
    sp.college_name,
    cr.role_name                       AS target_role,
    ar.readiness_score,
    ar.analyzed_at
FROM analysis_results ar
JOIN resumes          r   ON r.id  = ar.resume_id
JOIN student_profiles sp  ON sp.id = r.student_profile_id
JOIN users            u   ON u.id  = sp.user_id
JOIN career_roles     cr  ON cr.id = ar.target_role_id
WHERE ar.readiness_score < 40
  AND NOT EXISTS (
      SELECT 1 FROM mentor_feedback mf
      WHERE mf.analysis_result_id = ar.id
  )
ORDER BY ar.readiness_score ASC;

-- ---------------------------------------------------------------------------
-- SECTION 6: SKILL GAP AGGREGATE (for visual skill radar charts)
-- ---------------------------------------------------------------------------

-- 6.1  Skill radar data for one analysis — required vs actual score
SELECT
    s.skill_name,
    s.category,
    rs.importance_weight                            AS required_weight,
    COALESCE(resk.confidence_score * 10, 0)         AS student_score,
    sga.gap_type
FROM role_skills rs
JOIN skills      s    ON s.id   = rs.skill_id
JOIN analysis_results ar ON ar.id = :analysis_id
LEFT JOIN resume_skills resk
    ON resk.resume_id = ar.resume_id AND resk.skill_id = s.id
LEFT JOIN skill_gap_analysis sga
    ON sga.analysis_result_id = ar.id AND sga.skill_id = s.id
WHERE rs.role_id = ar.target_role_id
ORDER BY rs.importance_weight DESC;
