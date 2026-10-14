#!/usr/bin/env python3
"""
SkillSense AI - Python Backend Bridge CLI
Allows Express (server.ts) to communicate directly with the Python service layer,
executing AST analyses, database queries, and test case evaluation safely.
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(__file__))

from database.db import get_db_connection, init_db
from services.code_analyzer import CodeAnalyzer
from services.error_classifier import ErrorClassifier
from services.code_executor import CodeExecutor
from services.weakness_detector import WeaknessDetector
from services.recommendation_engine import RecommendationEngine
from services.feedback_service import FeedbackService
import uuid

def handle_get_dashboard(args):
    student_id = args[0] if args else 'student-alex'
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student_row = cursor.fetchone()
    student = dict(student_row) if student_row else {"name": "Alex Rivera", "cohort": "CS Sophomore"}

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

    detector = WeaknessDetector(conn)
    skills_data = detector.evaluate_student(student_id)

    rec_engine = RecommendationEngine(conn)
    recommendations = rec_engine.generate_recommendations(student_id)

    cursor.execute("""
        SELECT * FROM progress_history WHERE student_id = ? ORDER BY created_at ASC
    """, (student_id,))
    progress_history = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "student": student,
        "metrics": {
            "problems_solved": 48,
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
    }

def handle_get_submissions(args):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.id, s.problem_id, s.code, s.language, s.status, s.execution_time_ms,
               s.memory_mb, s.score, s.detected_concept, s.result_summary, s.created_at,
               p.title as problem_title, p.category as problem_category, p.difficulty
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        ORDER BY s.created_at DESC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"submissions": rows, "count": len(rows)}

def handle_get_submission(args):
    sub_id = args[0] if args else ""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s.*, p.title as problem_title, p.category as problem_category,
               p.difficulty, p.slug as problem_slug, p.optimal_time_complexity,
               p.optimal_space_complexity, p.description as problem_description,
               p.specifications, p.sample_cases, p.test_cases, p.starter_code
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.id = ?
    """, (sub_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return {"error": "Submission not found"}

    sub = dict(row)

    cursor.execute("SELECT * FROM analysis_results WHERE submission_id = ?", (sub_id,))
    analysis_row = cursor.fetchone()
    analysis = dict(analysis_row) if analysis_row else None

    errors = []
    if analysis:
        cursor.execute("SELECT * FROM detected_errors WHERE analysis_id = ? ORDER BY line_number ASC", (analysis["id"],))
        errors = [dict(e) for e in cursor.fetchall()]

    conn.close()
    return {"submission": sub, "analysis": analysis, "errors": errors}

def handle_submit_code(args):
    payload = json.loads(sys.stdin.read().strip())
    code = payload.get("code", "")
    problem_id = payload.get("problem_id", "prob-even-sum")
    student_id = payload.get("student_id", "student-alex")
    language = payload.get("language", "python3")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM problems WHERE id = ? OR slug = ?", (problem_id, problem_id))
    prob = cursor.fetchone()
    if not prob:
        cursor.execute("SELECT * FROM problems LIMIT 1")
        prob = cursor.fetchone()

    test_cases = json.loads(prob["test_cases"]) if prob["test_cases"] else []

    # 1. AST Analysis
    analyzer = CodeAnalyzer()
    analysis = analyzer.analyze(code)

    # 2. Error Classifier
    classifier = ErrorClassifier()
    analysis["issues"] = classifier.classify_all(analysis.get("issues", []))

    # 3. Dynamic Execution
    executor = CodeExecutor(timeout_seconds=2.0)
    exec_results = executor.execute_test_cases(code, prob["slug"], test_cases)

    # Status & scoring
    if not analysis["syntax_valid"]:
        status = "SyntaxError"
        score = 0
    elif not exec_results["all_passed"]:
        if "IndexError" in (exec_results.get("stderr") or "") or any(i.get("error_class") == "Runtime Exception" for i in analysis["issues"]):
            status = "IndexError"
            score = 50
        else:
            status = "Needs Improvement"
            score = 68
    else:
        status = "Accepted"
        score = 100 if analysis["code_style_grade"].startswith("A") else 92

    submission_id = f"sub-{uuid.uuid4().hex[:8]}"
    detected_concept = analysis["detected_concept"] or prob["concept"]
    summary = f"Passed {exec_results['passed_count']}/{exec_results['total_count']} unit test cases."

    cursor.execute("""
        INSERT INTO submissions (
            id, student_id, problem_id, code, language, status, execution_time_ms,
            memory_mb, score, detected_concept, result_summary, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (
        submission_id, student_id, prob["id"], code, language, status,
        exec_results["runtime_ms"], exec_results["memory_mb"], score,
        detected_concept, summary
    ))

    analysis_id = f"analysis-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO analysis_results (
            id, submission_id, status, syntax_valid, issues_detected, time_complexity,
            space_complexity, ast_signature, code_style_grade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        analysis_id, submission_id, status, 1 if analysis["syntax_valid"] else 0,
        len(analysis["issues"]), analysis["time_complexity"], analysis["space_complexity"],
        analysis["ast_signature"], analysis["code_style_grade"]
    ))

    for issue in analysis["issues"]:
        err_id = f"err-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO detected_errors (
                id, analysis_id, error_class, error_category, line_number, concept,
                severity, message, explanation, suggested_correction, confidence, ast_pattern_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            err_id, analysis_id, issue.get("error_class", "Logic Error"),
            issue.get("error_category", "General"), issue.get("line_number", 1),
            issue.get("concept", "General"), issue.get("severity", "Medium"),
            issue.get("message", ""), issue.get("explanation", ""),
            issue.get("suggested_correction", ""), issue.get("confidence", 0.9),
            issue.get("ast_pattern_id", "")
        ))

    conn.commit()
    conn.close()

    return {
        "submission_id": submission_id,
        "analysis_id": analysis_id,
        "status": status,
        "score": score,
        "execution": exec_results,
        "analysis": analysis,
        "detected_concept": detected_concept
    }

def handle_get_skills(args):
    student_id = args[0] if args else 'student-alex'
    conn = get_db_connection()
    detector = WeaknessDetector(conn)
    result = detector.evaluate_student(student_id)
    conn.close()
    return result

def handle_get_recommendations(args):
    student_id = args[0] if args else 'student-alex'
    conn = get_db_connection()
    rec_engine = RecommendationEngine(conn)
    recs = rec_engine.generate_recommendations(student_id)
    conn.close()
    return {"recommendations": recs, "count": len(recs)}

def handle_complete_recommendation(args):
    rec_id = args[0] if args else ""
    conn = get_db_connection()
    rec_engine = RecommendationEngine(conn)
    ok = rec_engine.mark_completed(rec_id)
    conn.close()
    return {"success": ok}

def handle_get_feedback(args):
    student_id = args[0] if args else 'student-alex'
    conn = get_db_connection()
    service = FeedbackService(conn)
    data = service.get_latest_feedback(student_id)
    conn.close()
    return {"feedback": data}

def handle_get_problems(args):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM problems ORDER BY title ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"problems": rows}

def handle_get_progress(args):
    student_id = args[0] if args else 'student-alex'
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM progress_history WHERE student_id = ? ORDER BY created_at ASC", (student_id,))
    history = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"history": history, "growth_pts": 8}

def handle_live_analyze(args):
    payload = json.loads(sys.stdin.read().strip())
    code = payload.get("code", "")
    analyzer = CodeAnalyzer()
    analysis = analyzer.analyze(code)
    classifier = ErrorClassifier()
    analysis["issues"] = classifier.classify_all(analysis.get("issues", []))
    return analysis

COMMANDS = {
    "get_dashboard": handle_get_dashboard,
    "get_submissions": handle_get_submissions,
    "get_submission": handle_get_submission,
    "submit_code": handle_submit_code,
    "get_skills": handle_get_skills,
    "get_recommendations": handle_get_recommendations,
    "complete_recommendation": handle_complete_recommendation,
    "get_feedback": handle_get_feedback,
    "get_problems": handle_get_problems,
    "get_progress": handle_get_progress,
    "live_analyze": handle_live_analyze,
}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd in COMMANDS:
        try:
            res = COMMANDS[cmd](args)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
    else:
        print(json.dumps({"error": f"Unknown command {cmd}"}))
        sys.exit(1)
