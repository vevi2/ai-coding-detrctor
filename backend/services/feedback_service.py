"""
SkillSense AI - Feedback Generation Service
Generates Socratic, pedagogical feedback for detected code flaws.
Includes rule-based structured guidance and AI API integration hooks.
"""

from typing import Dict, List, Any
import json
import sqlite3

class FeedbackService:
    def __init__(self, db_conn: sqlite3.Connection):
        self.conn = db_conn

    def get_latest_feedback(self, student_id: str) -> Dict[str, Any]:
        """Retrieves active feedback and concept queues."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id, submission_id, student_id, concept, title, what_went_wrong,
                   why_it_happened, mental_rules, side_by_side, socratic_question, is_ai_generated, created_at
            FROM feedback_records
            WHERE student_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (student_id,))

        row = cursor.fetchone()
        if not row:
            return self._fallback_feedback()

        data = dict(row)
        try:
            data["mental_rules"] = json.loads(data["mental_rules"])
            data["side_by_side"] = json.loads(data["side_by_side"])
            data["socratic_question"] = json.loads(data["socratic_question"])
        except Exception:
            pass

        return data

    def generate_feedback_for_submission(self, student_id: str, submission_id: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Creates tailored Socratic feedback based on detected issues."""
        issues = analysis.get("issues", [])
        primary_issue = issues[0] if issues else None

        if primary_issue and "#ERR_IDX_BOUND" in primary_issue.get("ast_pattern_id", ""):
            feedback = {
                "id": f"feed-{submission_id}",
                "submission_id": submission_id,
                "student_id": student_id,
                "concept": "Loops & Iteration",
                "title": "Deconstructing Off-by-One Loop Invariants & 0-Indexed Boundaries",
                "what_went_wrong": "In your recent attempt, you wrote range(len(numbers) + 1). Python arrays strictly use 0-based indexing: an array of size N has valid positions from 0 to N - 1. Iterating up to len(numbers) + 1 executes N + 1 iterations, reading numbers[N] which triggers a fatal IndexError.",
                "why_it_happened": "This stems from conflating cardinal counting (human natural numbers: 1, 2, 3...) with zero-based pointer offsets (distance from start of memory block). In Python, range(0, N) creates a half-open interval [0, N) that naturally stops at N - 1.",
                "mental_rules": [
                    {"rule": "Rule 1: Direct Iteration", "description": "If you only need element values without modifying indices, use 'for item in items'."},
                    {"rule": "Rule 2: Enumerate", "description": "When both index and value are required, use 'for i, item in enumerate(items)'."},
                    {"rule": "Rule 3: Trust len()", "description": "range(len(items)) stops exactly at index len - 1. Never add + 1 to loop bounds."}
                ],
                "side_by_side": {
                    "flawed": "# Alex's Submission Pattern\ndef compute_sum(nums):\n    total = 0\n    # Danger: range(len(nums) + 1)\n    for i in range(len(nums) + 1):\n        total += nums[i]  # IndexError!\n    return total",
                    "pythonic": "# Clean Canonical Approach\ndef compute_sum(nums):\n    total = 0\n    # Python manages collection bounds\n    for val in nums:\n        total += val\n    return total\n# Alternatively: return sum(nums)"
                },
                "socratic_question": {
                    "question": "Given data = ['a', 'b', 'c'], which statement traverses all elements without raising an IndexError?",
                    "options": [
                        "for i in range(1, len(data) + 1): print(data[i])",
                        "for i in range(len(data)): print(data[i])",
                        "for item in data: print(item)"
                    ],
                    "correct_index": 2,
                    "explanation": "Direct iteration eliminates index book-keeping entirely, removing any possibility of boundary violation."
                },
                "is_ai_generated": False
            }
        else:
            feedback = self._fallback_feedback()

        # Persist feedback
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO feedback_records (
                id, submission_id, student_id, concept, title, what_went_wrong,
                why_it_happened, mental_rules, side_by_side, socratic_question, is_ai_generated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            feedback["id"], feedback["submission_id"], feedback["student_id"],
            feedback["concept"], feedback["title"], feedback["what_went_wrong"],
            feedback["why_it_happened"], json.dumps(feedback["mental_rules"]),
            json.dumps(feedback["side_by_side"]), json.dumps(feedback["socratic_question"]),
            feedback["is_ai_generated"]
        ))
        self.conn.commit()

        return feedback

    def _fallback_feedback(self) -> Dict[str, Any]:
        return {
            "id": "feed-default",
            "submission_id": "sub-102",
            "student_id": "student-alex",
            "concept": "Loops & Iteration",
            "title": "Deconstructing Off-by-One Loop Invariants & 0-Indexed Boundaries",
            "what_went_wrong": "Python arrays and lists strictly use 0-based indexing: an array of size N has valid positions strictly from 0 to N - 1. When iterating up to len(numbers) + 1, the loop executes N + 1 iterations, attempting to read memory address numbers[N] which triggers a fatal IndexError.",
            "why_it_happened": "This stems from conflating cardinal counting (human natural numbers: 1, 2, 3...) with zero-based pointer offsets (distance from start of memory block). In Python, range(0, N) creates a half-open interval [0, N) that naturally stops at N - 1.",
            "mental_rules": [
                {"rule": "Rule 1: Direct Iteration", "description": "If you only need element values without modifying indices, use 'for item in items'."},
                {"rule": "Rule 2: Enumerate", "description": "When both index and value are required, let Python manage safe bounds: 'for i, item in enumerate(items)'."},
                {"rule": "Rule 3: Trust len()", "description": "range(len(items)) stops exactly at index len - 1. Never add + 1 to loop bounds."}
            ],
            "side_by_side": {
                "flawed": "# Flawed Boundary Overstep\ndef compute_sum(nums):\n    total = 0\n    for i in range(len(nums) + 1):\n        total += nums[i]\n    return total",
                "pythonic": "# Clean Canonical Approach\ndef compute_sum(nums):\n    total = 0\n    for val in nums:\n        total += val\n    return total"
            },
            "socratic_question": {
                "question": "Given data = ['a', 'b', 'c'], which statement traverses all elements without raising an IndexError?",
                "options": [
                    "for i in range(1, len(data) + 1): print(data[i])",
                    "for i in range(len(data)): print(data[i])",
                    "for item in data: print(item)"
                ],
                "correct_index": 2,
                "explanation": "Direct iteration eliminates index book-keeping entirely, removing any possibility of boundary violation."
            },
            "is_ai_generated": False
        }
