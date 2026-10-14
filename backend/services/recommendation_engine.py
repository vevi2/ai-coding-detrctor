"""
SkillSense AI - Recommendation Engine Service
Generates targeted practice queues ordered by weakness priority, impact potential,
and historical recurrence.
"""

from typing import Dict, List, Any
import sqlite3

class RecommendationEngine:
    def __init__(self, db_conn: sqlite3.Connection):
        self.conn = db_conn

    def generate_recommendations(self, student_id: str) -> List[Dict[str, Any]]:
        """Retrieves and generates prioritized practice recommendations."""
        cursor = self.conn.cursor()

        cursor.execute("""
            SELECT r.id, r.target_concept, r.reason, r.priority_rank, r.impact_points,
                   r.est_time_minutes, r.completed,
                   p.id as problem_id, p.title as problem_title, p.slug as problem_slug,
                   p.difficulty, p.category, p.optimal_time_complexity, p.optimal_space_complexity
            FROM recommendations r
            JOIN problems p ON r.problem_id = p.id
            WHERE r.student_id = ?
            ORDER BY r.completed ASC, r.priority_rank ASC
        """, (student_id,))

        rows = cursor.fetchall()
        return [dict(r) for r in rows]

    def mark_completed(self, recommendation_id: str) -> bool:
        cursor = self.conn.cursor()
        cursor.execute("""
            UPDATE recommendations
            SET completed = 1, completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (recommendation_id,))
        self.conn.commit()
        return cursor.rowcount > 0
