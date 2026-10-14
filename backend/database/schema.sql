-- SkillSense AI - SQLite Database Schema
-- Normalized relational schema for student programming telemetry, AST analysis, and recommendations

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cohort TEXT NOT NULL DEFAULT 'CS Sophomore',
    overall_score INTEGER NOT NULL DEFAULT 72,
    streak_days INTEGER NOT NULL DEFAULT 6,
    personal_best_streak INTEGER NOT NULL DEFAULT 9,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problems (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    concept TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
    description TEXT NOT NULL,
    specifications TEXT NOT NULL,
    sample_cases TEXT NOT NULL, -- JSON array of [{input, output, explanation}]
    test_cases TEXT NOT NULL,   -- JSON array of [{input, expected}]
    starter_code TEXT NOT NULL,
    reference_solution TEXT,
    optimal_time_complexity TEXT NOT NULL DEFAULT 'O(N)',
    optimal_space_complexity TEXT NOT NULL DEFAULT 'O(1)',
    estimated_time_minutes INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'python3',
    status TEXT NOT NULL CHECK(status IN ('Accepted', 'Needs Improvement', 'IndexError', 'RuntimeError', 'SyntaxError', 'Wrong Answer')),
    execution_time_ms REAL NOT NULL DEFAULT 38.0,
    memory_mb REAL NOT NULL DEFAULT 14.2,
    score INTEGER NOT NULL DEFAULT 70,
    detected_concept TEXT,
    result_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analysis_results (
    id TEXT PRIMARY KEY,
    submission_id TEXT UNIQUE NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    syntax_valid BOOLEAN NOT NULL DEFAULT 1,
    issues_detected INTEGER NOT NULL DEFAULT 0,
    time_complexity TEXT DEFAULT 'O(N)',
    space_complexity TEXT DEFAULT 'O(1)',
    ast_signature TEXT,
    code_style_grade TEXT DEFAULT 'A',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detected_errors (
    id TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
    error_class TEXT NOT NULL,
    error_category TEXT NOT NULL,
    line_number INTEGER,
    concept TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('Critical', 'High', 'Medium', 'Low', 'Info')),
    message TEXT NOT NULL,
    explanation TEXT NOT NULL,
    suggested_correction TEXT,
    confidence REAL NOT NULL DEFAULT 0.95,
    ast_pattern_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_assessments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    concept_key TEXT NOT NULL,
    concept_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Core', 'Algorithmic')),
    proficiency_percentage INTEGER NOT NULL DEFAULT 50,
    attempts_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    recurring_mistakes_count INTEGER NOT NULL DEFAULT 0,
    trend TEXT DEFAULT '+0% trend',
    status TEXT NOT NULL CHECK(status IN ('Critical Weakness', 'Weak', 'Needs Attention', 'Developing', 'Proficient')),
    last_tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, concept_key)
);

CREATE TABLE IF NOT EXISTS feedback_records (
    id TEXT PRIMARY KEY,
    submission_id TEXT REFERENCES submissions(id) ON DELETE SET NULL,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    concept TEXT NOT NULL,
    title TEXT NOT NULL,
    what_went_wrong TEXT NOT NULL,
    why_it_happened TEXT NOT NULL,
    mental_rules TEXT NOT NULL, -- JSON array of rules
    side_by_side TEXT NOT NULL, -- JSON object {flawed, pythonic}
    socratic_question TEXT NOT NULL, -- JSON object {question, options, correct_index, explanation}
    is_ai_generated BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    target_concept TEXT NOT NULL,
    reason TEXT NOT NULL,
    priority_rank INTEGER NOT NULL DEFAULT 1,
    impact_points INTEGER NOT NULL DEFAULT 8,
    est_time_minutes INTEGER NOT NULL DEFAULT 15,
    completed BOOLEAN NOT NULL DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress_history (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    problems_solved INTEGER NOT NULL,
    accuracy_rate REAL NOT NULL,
    milestone_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid query access
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_detected_errors_analysis ON detected_errors(analysis_id);
CREATE INDEX IF NOT EXISTS idx_skills_student ON skill_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_student ON recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON progress_history(student_id);
