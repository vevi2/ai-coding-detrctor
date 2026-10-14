"""
SkillSense AI - Backend Unit Test Suite
Uses standard library unittest to verify database integrity, AST analysis,
classification logic, and weakness detection.
"""

import unittest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db import get_db_connection, init_db
from services.code_analyzer import CodeAnalyzer
from services.error_classifier import ErrorClassifier
from services.weakness_detector import WeaknessDetector
from services.recommendation_engine import RecommendationEngine

class TestSkillSenseBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def test_database_connection_and_seed(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students WHERE id = 'student-alex'")
        student = cursor.fetchone()
        conn.close()

        self.assertIsNotNone(student)
        self.assertEqual(student["name"], "Alex Rivera")
        self.assertEqual(student["cohort"], "CS Sophomore")

    def test_ast_analyzer_valid_code(self):
        analyzer = CodeAnalyzer()
        code = "def add(a, b):\n    return a + b\n"
        res = analyzer.analyze(code)

        self.assertTrue(res["syntax_valid"])
        self.assertEqual(res["status"], "Accepted")
        self.assertEqual(res["code_style_grade"], "A+")

    def test_ast_analyzer_syntax_error(self):
        analyzer = CodeAnalyzer()
        code = "def broken(\n    return 42"
        res = analyzer.analyze(code)

        self.assertFalse(res["syntax_valid"])
        self.assertEqual(res["status"], "SyntaxError")
        self.assertEqual(len(res["issues"]), 1)
        self.assertEqual(res["issues"][0]["error_class"], "Syntax Error")

    def test_ast_analyzer_off_by_one_detection(self):
        analyzer = CodeAnalyzer()
        code = "def traverse(arr):\n    for i in range(len(arr) + 1):\n        print(arr[i])\n"
        res = analyzer.analyze(code)

        self.assertTrue(res["syntax_valid"])
        self.assertGreater(len(res["issues"]), 0)
        found_off_by_one = any(i["concept"] == "Loop Invariant / Bounds" for i in res["issues"])
        self.assertTrue(found_off_by_one)

    def test_ast_analyzer_quadratic_search_detection(self):
        analyzer = CodeAnalyzer()
        code = "def find_items(arr, targets):\n    for t in targets:\n        if t in arr:\n            print(t)\n"
        res = analyzer.analyze(code)

        self.assertTrue(res["syntax_valid"])
        found_quadratic = any("Quadratic" in i["concept"] for i in res["issues"])
        self.assertTrue(found_quadratic)

    def test_error_classifier(self):
        classifier = ErrorClassifier()
        raw_issue = {
            "error_class": "Runtime Exception",
            "concept": "Loop Invariant / Bounds",
            "message": "IndexError: list index out of range"
        }
        classified = classifier.classify(raw_issue)
        self.assertIn("standard_category", classified)
        self.assertEqual(classified["remediation_priority"], "High")

    def test_weakness_detector(self):
        conn = get_db_connection()
        detector = WeaknessDetector(conn)
        result = detector.evaluate_student('student-alex')
        conn.close()

        self.assertIn("overall_score", result)
        self.assertIn("critical_weaknesses", result)
        self.assertGreater(len(result["skills"]), 0)

    def test_recommendation_engine(self):
        conn = get_db_connection()
        engine = RecommendationEngine(conn)
        recs = engine.generate_recommendations('student-alex')
        conn.close()

        self.assertGreater(len(recs), 0)
        self.assertIn("problem_title", recs[0])

if __name__ == '__main__':
    unittest.main()
