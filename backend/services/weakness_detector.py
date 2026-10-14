"""
SkillSense AI - Weakness Detector Service
Analyzes historical submission telemetry to calculate concept-wise accuracy,
identify recurring error patterns, and flag critical weaknesses across multiple attempts.
"""

from typing import Dict, List, Any
import sqlite3

class WeaknessDetector:
    def __init__(self, db_conn: sqlite3.Connection):
        self.conn = db_conn

    def evaluate_student(self, student_id: str) -> Dict[str, Any]:
        """Calculates multi-dimensional weakness metrics for the student."""
        cursor = self.conn.cursor()

        # Query all skill assessments
        cursor.execute("""
            SELECT concept_key, concept_name, category, proficiency_percentage,
                   attempts_count, success_count, recurring_mistakes_count, trend, status
            FROM skill_assessments
            WHERE student_id = ?
            ORDER BY proficiency_percentage ASC
        """, (student_id,))
        rows = cursor.fetchall()

        skills = []
        critical_weaknesses = []
        developing = []
        proficient = []

        total_score_sum = 0

        for r in rows:
            skill = {
                "concept_key": r["concept_key"],
                "concept_name": r["concept_name"],
                "category": r["category"],
                "proficiency_percentage": r["proficiency_percentage"],
                "attempts_count": r["attempts_count"],
                "success_count": r["success_count"],
                "recurring_mistakes_count": r["recurring_mistakes_count"],
                "trend": r["trend"],
                "status": r["status"]
            }
            skills.append(skill)
            total_score_sum += skill["proficiency_percentage"]

            if skill["status"] in ["Critical Weakness", "Weak"]:
                critical_weaknesses.append(skill)
            elif skill["status"] in ["Developing", "Needs Attention"]:
                developing.append(skill)
            else:
                proficient.append(skill)

        overall_score = round(total_score_sum / len(skills)) if skills else 72

        # Query recurring error counts
        cursor.execute("""
            SELECT de.concept, de.error_class, COUNT(*) as frequency
            FROM detected_errors de
            JOIN analysis_results ar ON de.analysis_id = ar.id
            JOIN submissions s ON ar.submission_id = s.id
            WHERE s.student_id = ?
            GROUP BY de.concept, de.error_class
            ORDER BY frequency DESC
        """, (student_id,))
        recurring_patterns = [dict(r) for r in cursor.fetchall()]

        return {
            "overall_score": overall_score,
            "skills": skills,
            "critical_weaknesses": critical_weaknesses,
            "developing": developing,
            "proficient": proficient,
            "recurring_patterns": recurring_patterns,
            "focus_areas_count": len(critical_weaknesses) + len(developing)
        }
