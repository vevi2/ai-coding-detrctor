"""
SkillSense AI - Error Classifier Service
Classifies raw AST findings and execution errors into standardized concept taxonomies.
"""

from typing import Dict, List, Any

TAXONOMY_CATEGORIES = {
    "syntax": "Syntax and Fundamentals",
    "conditionals": "Conditional Logic",
    "loops": "Loops & Iteration",
    "functions": "Functions & Scope",
    "data_structures": "Data Structures (Lists, Dictionaries)",
    "algorithms": "Algorithms & Problem Solving",
    "complexity": "Time & Space Complexity",
    "edge_cases": "Edge-Case Handling",
    "code_quality": "Code Quality"
}

class ErrorClassifier:
    def classify(self, issue: Dict[str, Any]) -> Dict[str, Any]:
        """Classifies an individual issue into taxonomy categories with metadata."""
        error_class = issue.get("error_class", "Logic Error")
        concept = issue.get("concept", "General")
        message = issue.get("message", "")

        category = "Algorithms & Problem Solving"
        tier = "Medium"

        if "SyntaxError" in message or error_class == "Syntax Error":
            category = TAXONOMY_CATEGORIES["syntax"]
            tier = "Critical"
        elif "IndexError" in message or "boundary" in concept.lower() or "off-by-one" in concept.lower():
            category = TAXONOMY_CATEGORIES["loops"]
            tier = "High"
        elif "list" in concept.lower() or "subscript" in concept.lower() or "cardinality" in concept.lower():
            category = TAXONOMY_CATEGORIES["data_structures"]
            tier = "High"
        elif "quadratic" in concept.lower() or "complexity" in concept.lower():
            category = TAXONOMY_CATEGORIES["complexity"]
            tier = "Medium"
        elif "recursion" in concept.lower() or "tree" in concept.lower():
            category = TAXONOMY_CATEGORIES["algorithms"]
            tier = "High"
        elif "unidiomatic" in concept.lower() or error_class == "Code Style":
            category = TAXONOMY_CATEGORIES["code_quality"]
            tier = "Low"

        return {
            **issue,
            "standard_category": category,
            "remediation_priority": tier
        }

    def classify_all(self, issues: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.classify(i) for i in issues]
