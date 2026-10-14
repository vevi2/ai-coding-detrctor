"""
SkillSense AI - Submissions API Routes
Handles code submissions, execution, persistence, and retrieval.
"""

from flask import Blueprint, request, jsonify
import uuid
import json
from database.db import get_db_connection
from services.code_analyzer import CodeAnalyzer
from services.error_classifier import ErrorClassifier
from services.code_executor import CodeExecutor

submissions_bp = Blueprint('submissions', __name__, url_prefix='/api/submissions')

@submissions_bp.route('', methods=['GET'])
def get_submissions():
    """Returns list of student submissions with optional status/concept filtering."""
    status_filter = request.args.get('status')
    concept_filter = request.args.get('concept')
    search_query = request.args.get('q', '').strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT s.id, s.problem_id, s.code, s.language, s.status, s.execution_time_ms,
               s.memory_mb, s.score, s.detected_concept, s.result_summary, s.created_at,
               p.title as problem_title, p.category as problem_category, p.difficulty
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE 1=1
    """
    params = []

    if status_filter and status_filter != 'All':
        query += " AND s.status = ?"
        params.append(status_filter)

    if concept_filter and concept_filter != 'All':
        query += " AND s.detected_concept LIKE ?"
        params.append(f"%{concept_filter}%")

    if search_query:
        query += " AND (LOWER(p.title) LIKE ? OR LOWER(s.detected_concept) LIKE ?)"
        params.extend([f"%{search_query}%", f"%{search_query}%"])

    query += " ORDER BY s.created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return jsonify({"submissions": [dict(r) for r in rows], "count": len(rows)})


@submissions_bp.route('/<submission_id>', methods=['GET'])
def get_submission_detail(submission_id):
    """Retrieves full submission details including AST analysis and detected errors."""
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
    """, (submission_id,))
    sub_row = cursor.fetchone()

    if not sub_row:
        conn.close()
        return jsonify({"error": "Submission not found"}), 404

    sub_dict = dict(sub_row)

    # Fetch analysis record
    cursor.execute("""
        SELECT * FROM analysis_results WHERE submission_id = ?
    """, (submission_id,))
    analysis_row = cursor.fetchone()
    analysis_dict = dict(analysis_row) if analysis_row else None

    # Fetch detected errors
    errors = []
    if analysis_dict:
        cursor.execute("""
            SELECT * FROM detected_errors WHERE analysis_id = ? ORDER BY line_number ASC
        """, (analysis_dict["id"],))
        errors = [dict(e) for e in cursor.fetchall()]

    conn.close()

    return jsonify({
        "submission": sub_dict,
        "analysis": analysis_dict,
        "errors": errors
    })


@submissions_bp.route('', methods=['POST'])
def submit_code():
    """Receives code submission, runs AST static analysis, executes test cases, and stores results."""
    data = request.get_json() or {}
    code = data.get('code', '').strip()
    problem_id = data.get('problem_id', 'prob-even-sum')
    student_id = data.get('student_id', 'student-alex')
    language = data.get('language', 'python3')

    if not code:
        return jsonify({"error": "Source code cannot be empty"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Look up problem
    cursor.execute("SELECT * FROM problems WHERE id = ? OR slug = ?", (problem_id, problem_id))
    prob = cursor.fetchone()
    if not prob:
        conn.close()
        return jsonify({"error": "Problem not found"}), 404

    test_cases = json.loads(prob["test_cases"]) if prob["test_cases"] else []

    # 1. Static AST Analysis
    analyzer = CodeAnalyzer()
    analysis = analyzer.analyze(code)

    # 2. Error classification
    classifier = ErrorClassifier()
    analysis["issues"] = classifier.classify_all(analysis.get("issues", []))

    # 3. Dynamic Test Case Execution
    executor = CodeExecutor(timeout_seconds=2.0)
    exec_results = executor.execute_test_cases(code, prob["slug"], test_cases)

    # Calculate score & status
    if not analysis["syntax_valid"]:
        status = "SyntaxError"
        score = 0
    elif not exec_results["all_passed"]:
        if "IndexError" in (exec_results.get("stderr") or "") or any(i.get("error_class") == "Runtime Exception" for i in analysis["issues"]):
            status = "IndexError"
            score = 45
        else:
            status = "Needs Improvement"
            score = 65
    else:
        status = "Accepted"
        score = 100 if analysis["code_style_grade"].startswith("A") else 90

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

    # Update student streak & problems count
    cursor.execute("""
        UPDATE students
        SET last_active = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (student_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "submission_id": submission_id,
        "analysis_id": analysis_id,
        "status": status,
        "score": score,
        "execution": exec_results,
        "analysis": analysis,
        "detected_concept": detected_concept
    }), 201
