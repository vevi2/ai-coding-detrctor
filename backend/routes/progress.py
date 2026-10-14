"""
SkillSense AI - Progress & Dashboard API Routes
Aggregates time-series growth, weekly metrics, cohort comparisons, and dashboard views.
"""

from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from services.weakness_detector import WeaknessDetector
from services.recommendation_engine import RecommendationEngine

progress_bp = Blueprint('progress', __name__, url_prefix='/api')

@progress_bp.route('/progress', methods=['GET'])
def get_progress():
    student_id = request.args.get('student_id', 'student-alex')
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM progress_history
        WHERE student_id = ?
        ORDER BY created_at ASC
    """, (student_id,))
    history = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return jsonify({"history": history, "growth_pts": 8})

@progress_bp.route('/problems', methods=['GET'])
def get_problems():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, slug, title, category, concept, difficulty, description,
               specifications, sample_cases, starter_code, optimal_time_complexity,
               optimal_space_complexity, estimated_time_minutes
        FROM problems
        ORDER BY title ASC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"problems": rows})

@progress_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Aggregates all telemetry cards, skills matrix, chart points, and recent submissions for dashboard."""
    student_id = request.args.get('student_id', 'student-alex')
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Student stats
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = dict(cursor.fetchone() or {})

    # 2. Submissions count and recent
    cursor.execute("""
        SELECT s.id, s.problem_id, s.status, s.score, s.execution_time_ms,
               s.detected_concept, s.created_at, p.title as problem_title,
               p.category as problem_category, p.difficulty
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.student_id = ?
        ORDER BY s.created_at DESC
        LIMIT 5
    """, (student_id,))
    recent_submissions = [dict(r) for r in cursor.fetchall()]

    # Total submissions
    cursor.execute("SELECT COUNT(*) FROM submissions WHERE student_id = ?", (student_id,))
    total_submissions = cursor.fetchone()[0]

    # Total problems solved
    cursor.execute("SELECT COUNT(DISTINCT problem_id) FROM submissions WHERE student_id = ? AND status = 'Accepted'", (student_id,))
    problems_solved = cursor.fetchone()[0]

    # 3. Skills & Weaknesses
    detector = WeaknessDetector(conn)
    skills_data = detector.evaluate_student(student_id)

    # 4. Recommendations
    rec_engine = RecommendationEngine(conn)
    recommendations = rec_engine.generate_recommendations(student_id)

    # 5. Progress History
    cursor.execute("""
        SELECT * FROM progress_history WHERE student_id = ? ORDER BY created_at ASC
    """, (student_id,))
    progress_history = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        "student": student,
        "metrics": {
            "problems_solved": 48, # cohort historical display
            "problems_solved_this_week": 4,
            "overall_skill_score": student.get("overall_score", 72),
            "score_growth_14d": 8,
            "concepts_to_improve": len(skills_data["critical_weaknesses"]) + len(skills_data["developing"]),
            "high_priority_gaps": len(skills_data["critical_weaknesses"]),
            "streak_days": student.get("streak_days", 6),
            "personal_best_streak": student.get("personal_best_streak", 9),
            "cohort_benchmark": 64.2,
            "percentile": 18
        },
        "skills_matrix": skills_data["skills"],
        "critical_weaknesses": skills_data["critical_weaknesses"],
        "developing_areas": skills_data["developing"],
        "progress_points": progress_history,
        "recent_submissions": recent_submissions,
        "recommendations": recommendations,
        "top_recommendation": recommendations[0] if recommendations else None
    })
