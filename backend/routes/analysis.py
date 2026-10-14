"""
SkillSense AI - Analysis API Routes
Provides endpoints for deep AST introspection and error telemetry.
"""

from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from services.code_analyzer import CodeAnalyzer
from services.error_classifier import ErrorClassifier

analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')

@analysis_bp.route('/<submission_id>', methods=['GET'])
def get_analysis_by_submission(submission_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ar.*, s.code, s.language, s.status as submission_status, s.score,
               s.execution_time_ms, s.memory_mb, p.title as problem_title,
               p.category as problem_category, p.difficulty, p.slug as problem_slug
        FROM analysis_results ar
        JOIN submissions s ON ar.submission_id = s.id
        JOIN problems p ON s.problem_id = p.id
        WHERE ar.submission_id = ?
    """, (submission_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return jsonify({"error": "Analysis not found"}), 404

    analysis = dict(row)

    cursor.execute("""
        SELECT * FROM detected_errors WHERE analysis_id = ? ORDER BY line_number ASC
    """, (analysis["id"],))
    errors = [dict(e) for e in cursor.fetchall()]

    conn.close()

    return jsonify({
        "analysis": analysis,
        "errors": errors
    })


@analysis_bp.route('/live', methods=['POST'])
def live_analyze_code():
    """Runs immediate in-memory AST analysis without persisting."""
    data = request.get_json() or {}
    code = data.get('code', '')

    analyzer = CodeAnalyzer()
    analysis = analyzer.analyze(code)

    classifier = ErrorClassifier()
    analysis["issues"] = classifier.classify_all(analysis.get("issues", []))

    return jsonify(analysis)
