"""
SkillSense AI - Practice Recommendations API Routes
Provides tailored problem queues ranked by student weakness vectors.
"""

from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from services.recommendation_engine import RecommendationEngine

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

@recommendations_bp.route('', methods=['GET'])
def get_recommendations():
    student_id = request.args.get('student_id', 'student-alex')
    conn = get_db_connection()
    engine = RecommendationEngine(conn)
    recs = engine.generate_recommendations(student_id)
    conn.close()
    return jsonify({"recommendations": recs, "count": len(recs)})

@recommendations_bp.route('/<recommendation_id>/complete', methods=['POST'])
def complete_recommendation(recommendation_id):
    conn = get_db_connection()
    engine = RecommendationEngine(conn)
    success = engine.mark_completed(recommendation_id)
    conn.close()

    if not success:
        return jsonify({"error": "Recommendation not found"}), 404

    return jsonify({"success": True, "message": "Recommendation marked as completed"})
