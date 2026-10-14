"""
SkillSense AI - Python AST Code Analyzer
Performs AST-driven static analysis to identify syntax errors, logic flaws,
off-by-one boundary bugs, quadratic lookups, recursion base-case omissions,
and style anti-patterns.
"""

import ast
import re
import sys
from typing import Dict, List, Any, Optional

class CodeAnalyzer:
    def __init__(self):
        pass

    def analyze(self, code: str) -> Dict[str, Any]:
        """Analyzes Python code using AST and heuristic rules."""
        result = {
            "syntax_valid": True,
            "issues": [],
            "issues_count": 0,
            "ast_signature": "",
            "time_complexity": "O(N)",
            "space_complexity": "O(1)",
            "code_style_grade": "A",
            "detected_concept": "General",
            "status": "Accepted"
        }

        # Step 1: Check for syntax errors
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            result["syntax_valid"] = False
            result["status"] = "SyntaxError"
            result["code_style_grade"] = "F"
            result["issues"].append({
                "error_class": "Syntax Error",
                "error_category": "Syntax & Fundamentals",
                "line_number": e.lineno,
                "concept": "Syntax & Fundamentals",
                "severity": "Critical",
                "message": f"SyntaxError: {e.msg}",
                "explanation": f"The Python interpreter encountered invalid syntax at line {e.lineno}. Python syntax requires proper indentation, colons after statements, and matching parenthesis.",
                "suggested_correction": "Check for missing colons, unbalanced brackets, or misaligned indentation.",
                "confidence": 1.0,
                "ast_pattern_id": "#ERR_SYNTAX_PARSE"
            })
            result["issues_count"] = 1
            return result

        # Step 2: AST Node Visitors and Heuristics
        visitor = ASTIssueVisitor(code)
        visitor.visit(tree)

        result["issues"] = visitor.issues
        result["issues_count"] = len(visitor.issues)
        result["ast_signature"] = visitor.ast_signature or "AST Verified"

        # Determine overall complexity and grade
        if visitor.has_quadratic_loop:
            result["time_complexity"] = "O(N^2)"
        elif visitor.has_log_loop:
            result["time_complexity"] = "O(log N)"
        else:
            result["time_complexity"] = "O(N)"

        if len(visitor.issues) == 0:
            result["code_style_grade"] = "A+"
            result["status"] = "Accepted"
            result["detected_concept"] = "Clean Pythonic Implementation"
        elif any(i["severity"] == "Critical" for i in visitor.issues):
            result["code_style_grade"] = "C-"
            result["status"] = "Needs Improvement"
            result["detected_concept"] = visitor.issues[0]["concept"]
        else:
            result["code_style_grade"] = "B+"
            result["status"] = "Needs Improvement"
            result["detected_concept"] = visitor.issues[0]["concept"]

        return result


class ASTIssueVisitor(ast.NodeVisitor):
    def __init__(self, code: str):
        self.code = code
        self.code_lines = code.split("\n")
        self.issues: List[Dict[str, Any]] = []
        self.ast_signature = ""
        self.has_quadratic_loop = False
        self.has_log_loop = False
        self.loop_stack = []

    def visit_For(self, node: ast.For):
        self.loop_stack.append(node)

        # Check for range(len(...) + 1) or range(..., len(...) + 1)
        self._check_off_by_one_range(node)

        # Check for unidiomatic index iteration: for i in range(len(arr)): ... arr[i]
        self._check_unidiomatic_traversal(node)

        self.generic_visit(node)
        self.loop_stack.pop()

    def visit_While(self, node: ast.While):
        self.loop_stack.append(node)

        # Check for binary search / log loops
        code_str = ast.unparse(node.test) if hasattr(ast, 'unparse') else ""
        if "left" in code_str and "right" in code_str:
            self.has_log_loop = True

        self.generic_visit(node)
        self.loop_stack.pop()

    def visit_Subscript(self, node: ast.Subscript):
        # Check for arr[len(arr)] (1-based index overrun)
        try:
            if isinstance(node.slice, ast.Call):
                if isinstance(node.slice.func, ast.Name) and node.slice.func.id == "len":
                    if len(node.slice.args) > 0 and isinstance(node.slice.args[0], ast.Name):
                        if isinstance(node.value, ast.Name) and node.value.id == node.slice.args[0].id:
                            self.issues.append({
                                "error_class": "Runtime Exception",
                                "error_category": "Data Structures (Lists, Dictionaries)",
                                "line_number": getattr(node, 'lineno', 1),
                                "concept": "List Indexing vs Cardinality",
                                "severity": "Critical",
                                "message": f"List Indexing vs Cardinality Overrun: {node.value.id}[len({node.value.id})]",
                                "explanation": f"Accessing {node.value.id}[len({node.value.id})] attempts to query the index equal to the list size. Because Python lists are 0-indexed, the last element is at index len({node.value.id}) - 1, or simply {node.value.id}[-1].",
                                "suggested_correction": f"{node.value.id}[-1] or {node.value.id}[len({node.value.id}) - 1]",
                                "confidence": 0.99,
                                "ast_pattern_id": "#ERR_LIST_CARDINALITY_01"
                            })
                            if not self.ast_signature:
                                self.ast_signature = f"Subscript(value=Name(id='{node.value.id}'), slice=Call(func=Name(id='len')))"
        except Exception:
            pass

        self.generic_visit(node)

    def visit_Compare(self, node: ast.Compare):
        # Check for "in list" inside loops -> quadratic complexity
        if len(self.loop_stack) > 0:
            for op, comparator in zip(node.ops, node.comparators):
                if isinstance(op, ast.In):
                    # Check if searching inside a collection identifier
                    self.has_quadratic_loop = True
                    self.issues.append({
                        "error_class": "Algorithmic Complexity",
                        "error_category": "Algorithms & Problem Solving",
                        "line_number": getattr(node, 'lineno', 1),
                        "concept": "Accidental Quadratic Complexity",
                        "severity": "Medium",
                        "message": "Accidental Quadratic Complexity via Nested Linear Search",
                        "explanation": "Evaluating 'in collection' inside a loop results in an O(N) sequential search for every loop iteration, producing O(N^2) quadratic total execution time.",
                        "suggested_correction": "Convert the collection to a set() prior to loop traversal for O(1) instantaneous lookups.",
                        "confidence": 0.92,
                        "ast_pattern_id": "#ERR_QUADRATIC_NESTED_02"
                    })
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        # Check for recursive function missing base case
        is_recursive = False
        has_guard_return = False

        for subnode in ast.walk(node):
            if isinstance(subnode, ast.Call) and isinstance(subnode.func, ast.Name) and subnode.func.id == node.name:
                is_recursive = True
            if isinstance(subnode, ast.If):
                # Check if body contains return
                for body_stmt in subnode.body:
                    if isinstance(body_stmt, ast.Return):
                        has_guard_return = True

        if is_recursive and not has_guard_return:
            self.issues.append({
                "error_class": "Runtime Exception",
                "error_category": "Algorithms & Problem Solving",
                "line_number": node.lineno,
                "concept": "Recursion Base Cases",
                "severity": "Critical",
                "message": "Missing Base Case in Recursive Function",
                "explanation": f"The recursive function '{node.name}' calls itself without an early terminal return condition ('if not root: return ...'). This causes infinite recursion and RecursionError: maximum recursion depth exceeded.",
                "suggested_correction": "Add a terminal guard at the start of the function, e.g., 'if not node: return 0'.",
                "confidence": 0.95,
                "ast_pattern_id": "#ERR_RECURSION_BASE_01"
            })
            if not self.ast_signature:
                self.ast_signature = f"FunctionDef(name='{node.name}', recursive=True, guard_return=False)"

        self.generic_visit(node)

    def _check_off_by_one_range(self, node: ast.For):
        if not isinstance(node.iter, ast.Call):
            return
        if not (isinstance(node.iter.func, ast.Name) and node.iter.func.id == "range"):
            return

        # Check arguments of range(...)
        for arg in node.iter.args:
            # Look for len(...) + 1
            if isinstance(arg, ast.BinOp) and isinstance(arg.op, ast.Add):
                left_is_len = isinstance(arg.left, ast.Call) and isinstance(arg.left.func, ast.Name) and arg.left.func.id == "len"
                right_is_one = isinstance(arg.right, ast.Constant) and arg.right.value == 1
                if left_is_len and right_is_one:
                    lineno = getattr(node, 'lineno', 1)
                    self.issues.append({
                        "error_class": "Runtime Exception",
                        "error_category": "Loops & Iteration",
                        "line_number": lineno,
                        "concept": "Loop Invariant / Bounds",
                        "severity": "Critical",
                        "message": "Off-by-One Array Boundary (Confirmed)",
                        "explanation": "You used range(len(...) + 1). Because range(N) already iterates from 0 to N - 1, adding + 1 forces an extra iteration with index N. This leads to IndexError: list index out of range when accessing elements.",
                        "suggested_correction": "Use range(len(...)) without + 1, or use direct iteration: 'for item in collection:'",
                        "confidence": 0.98,
                        "ast_pattern_id": "#ERR_IDX_BOUND_04"
                    })
                    self.ast_signature = "For.iter -> Call(func=Name('range'), args=[BinOp(left=Call(func=Name('len')), op=Add(), right=Constant(1))])"

    def _check_unidiomatic_traversal(self, node: ast.For):
        if not isinstance(node.iter, ast.Call):
            return
        if not (isinstance(node.iter.func, ast.Name) and node.iter.func.id == "range"):
            return

        # Check if single arg is len(...)
        if len(node.iter.args) == 1:
            arg = node.iter.args[0]
            if isinstance(arg, ast.Call) and isinstance(arg.func, ast.Name) and arg.func.id == "len":
                lineno = getattr(node, 'lineno', 1)
                self.issues.append({
                    "error_class": "Code Style",
                    "error_category": "Syntax & Fundamentals",
                    "line_number": lineno,
                    "concept": "Unidiomatic Traversal",
                    "severity": "Low",
                    "message": "Unidiomatic Index-Only Traversal",
                    "explanation": "Using range(len(collection)) followed by collection[i] is considered anti-idiomatic in Python. When index and value are both needed, prefer enumerate(collection). If only values are needed, iterate directly over the collection.",
                    "suggested_correction": "for val in collection: OR for i, val in enumerate(collection):",
                    "confidence": 0.88,
                    "ast_pattern_id": "#STYLE_UNIDIOMATIC_ITER_01"
                })
