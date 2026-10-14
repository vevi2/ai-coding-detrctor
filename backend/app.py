"""
SkillSense AI - Flask REST API Application Entry Point
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys

# Ensure backend root is on path
sys.path.insert(0, os.path.dirname(__file__))

from config import Config
from database.db import init_db
from routes.submissions import submissions_bp
from routes.analysis import analysis_bp
from routes.skills import skills_bp
from routes.feedback import feedback_bp
from routes.recommendations import recommendations_bp
from routes.progress import progress_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable Cross-Origin Resource Sharing
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register API Blueprints
    app.register_blueprint(submissions_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(skills_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(progress_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "SkillSense AI REST API",
            "version": "1.0.0",
            "database": "SQLite Connected",
            "ast_engine": "Python 3.10 CPython AST Active"
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found", "status_code": 404}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error", "status_code": 500}), 500

    return app

if __name__ == '__main__':
    # Initialize database if needed
    init_db()
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting SkillSense AI Flask Backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
