#!/usr/bin/env python3
"""
SkillSense AI - AST Analyzer & Execution CLI
Standalone command-line bridge for AST analysis and code execution.
Reads JSON payload from stdin or argument and outputs JSON analysis.
"""

import sys
import json
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.code_analyzer import CodeAnalyzer
from services.error_classifier import ErrorClassifier
from services.code_executor import CodeExecutor

def main():
    try:
        raw_input = sys.stdin.read().strip()
        if not raw_input:
            print(json.dumps({"error": "No input payload provided"}))
            sys.exit(1)

        payload = json.loads(raw_input)
        code = payload.get("code", "")
        test_cases = payload.get("test_cases", [])
        problem_slug = payload.get("problem_slug", "")

        # 1. AST Static Analysis
        analyzer = CodeAnalyzer()
        analysis = analyzer.analyze(code)

        # 2. Error Classification
        classifier = ErrorClassifier()
        analysis["issues"] = classifier.classify_all(analysis.get("issues", []))

        # 3. Dynamic Test Case Execution
        executor = CodeExecutor(timeout_seconds=2.0)
        exec_results = executor.execute_test_cases(code, problem_slug, test_cases)

        output = {
            "analysis": analysis,
            "execution": exec_results
        }
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "analysis": {
                "syntax_valid": False,
                "issues": [],
                "status": "SystemError"
            },
            "execution": {
                "all_passed": False,
                "status": "SystemError",
                "test_cases": []
            }
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
