"""
SkillSense AI - Feedback API Routes
Generates Socratic, pedagogical explanations for students based on AST telemetry.
"""

from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from services.feedback_service import FeedbackService

feedback_bp = Blueprint('feedback', __name__, url_prefix='/api/feedback')

@feedback_bp.route('', methods=['GET'])
def get_feedback():
    student_id = request.args.get('student_id', 'student-alex')
    conn = get_db_connection()
    service = FeedbackService(conn)
    data = service.get_latest_feedback(student_id)
    conn.close()
    return jsonify({"feedback": data})

@feedback_bp.route('/generate', methods=['POST'])
def generate_feedback():
    payload = request.get_json() or {}
    student_id = payload.get('student_id', 'student-alex')
    submission_id = payload.get('submission_id', 'sub-102')
    analysis = payload.get('analysis', {})

    conn = get_db_connection()
    service = FeedbackService(conn)
    result = service.generate_feedback_for_submission(student_id, submission_id, analysis)
    conn.close()

    return jsonify({"feedback": result}), 201
