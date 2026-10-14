"""
SkillSense AI - Flask Application Configuration
"""

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'skillsense-ai-secret-key-cs-capstone')
    DB_PATH = os.environ.get('DB_PATH', os.path.join(os.path.dirname(__file__), 'database', 'skillsense.db'))
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = os.environ.get('FLASK_DEBUG', '1') == '1'
