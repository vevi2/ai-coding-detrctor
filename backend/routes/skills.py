"""
SkillSense AI - Skills and Weaknesses API Routes
Provides concept mastery radar metrics, competency matrices, and recurring failure modes.
"""

from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from services.weakness_detector import WeaknessDetector

skills_bp = Blueprint('skills', __name__, url_prefix='/api/skills')

@skills_bp.route('', methods=['GET'])
def get_skills():
    student_id = request.args.get('student_id', 'student-alex')
    conn = get_db_connection()
    detector = WeaknessDetector(conn)
    result = detector.evaluate_student(student_id)
    conn.close()
    return jsonify(result)

@skills_bp.route('/weaknesses', methods=['GET'])
def get_weaknesses():
    student_id = request.args.get('student_id', 'student-alex')
    conn = get_db_connection()
    detector = WeaknessDetector(conn)
    result = detector.evaluate_student(student_id)
    conn.close()
    return jsonify({
        "critical_weaknesses": result["critical_weaknesses"],
        "developing": result["developing"],
        "recurring_patterns": result["recurring_patterns"]
    })
