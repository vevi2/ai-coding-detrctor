"""
SkillSense AI - Database Connection and Initialization
Manages SQLite connection, schema provisioning, and seed data initialization.
"""

import sqlite3
import os
import json

DB_FILE = os.path.join(os.path.dirname(__file__), 'skillsense.db')
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), 'schema.sql')

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db(force_reseed=False):
    """Initializes tables and seeds base records if empty or force_reseed is True."""
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
        cursor.executescript(f.read())

    # Check if student already exists
    cursor.execute("SELECT COUNT(*) FROM students WHERE id = 'student-alex'")
    has_data = cursor.fetchone()[0] > 0

    if not has_data or force_reseed:
        seed_data(conn)

    conn.commit()
    conn.close()

def seed_data(conn):
    """Seeds initial dataset representing Alex Rivera's student learning profile."""
    cursor = conn.cursor()

    # 1. Student profile
    cursor.execute("""
        INSERT OR REPLACE INTO students (id, name, email, cohort, overall_score, streak_days, personal_best_streak, last_active)
        VALUES ('student-alex', 'Alex Rivera', 'alex.rivera@university.edu', 'CS Sophomore', 72, 6, 9, CURRENT_TIMESTAMP)
    """)

    # 2. Problem Bank
    problems = [
        (
            'prob-even-sum',
            'find-sum-even-numbers',
            'Find the Sum of Even Numbers',
            'Algorithmic Math',
            'Loops & Iteration',
            'Easy',
            'Write a function sum_even_numbers(numbers: list[int]) -> int that accepts a list of integers and calculates the cumulative sum of all even numbers present. If the list contains no even numbers or is entirely empty, your function must return 0.',
            'Input: A list of integers numbers where 0 <= len(numbers) <= 10^4.\nOutput: A single integer value representing the cumulative sum.',
            json.dumps([
                {"input": "[1, 2, 3, 4, 5, 6]", "output": "12", "explanation": "The even values are 2, 4, and 6. Cumulative sum: 2 + 4 + 6 = 12."},
                {"input": "[1, 3, 5]", "output": "0", "explanation": "No even numbers present, returns fallback 0."},
                {"input": "[-2, 4, -6, 7]", "output": "-4", "explanation": "Negative evens are included: (-2) + 4 + (-6) = -4."}
            ]),
            json.dumps([
                {"input": [1, 2, 3, 4, 5, 6], "expected": 12},
                {"input": [1, 3, 5], "expected": 0},
                {"input": [], "expected": 0},
                {"input": [-2, 4, -6, 7], "expected": -4}
            ]),
            """def sum_even_numbers(numbers: list[int]) -> int:
    # Initialize accumulator
    total_sum = 0
    
    # Iterate through each element in the input list
    for i in range(len(numbers)):
        if numbers[i] % 2 == 0:
            total_sum += numbers[i]
            
    return total_sum
""",
            """def sum_even_numbers(numbers: list[int]) -> int:
    return sum(num for num in numbers if num % 2 == 0)
""",
            'O(N)',
            'O(1)',
            10
        ),
        (
            'prob-two-sum-sorted',
            'two-sum-sorted-array',
            'Two Sum II - Input Array Is Sorted',
            'Two Pointers',
            'Loops & Iteration',
            'Medium',
            'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Return the indices of the two numbers, 1-indexed, as an integer array [index1, index2] of length 2.',
            'Input: numbers = [2,7,11,15], target = 9\nOutput: [1,2]\nConstraints: 2 <= numbers.length <= 3 * 10^4',
            json.dumps([
                {"input": "numbers = [2,7,11,15], target = 9", "output": "[1,2]", "explanation": "The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2]."},
                {"input": "numbers = [2,3,4], target = 6", "output": "[1,3]", "explanation": "The sum of 2 and 4 is 6. Therefore index1 = 1, index2 = 3. We return [1, 3]."},
                {"input": "numbers = [-1,0], target = -1", "output": "[1,2]", "explanation": "The sum of -1 and 0 is -1. We return [1, 2]."}
            ]),
            json.dumps([
                {"input": {"numbers": [2, 7, 11, 15], "target": 9}, "expected": [1, 2]},
                {"input": {"numbers": [2, 3, 4], "target": 6}, "expected": [1, 3]},
                {"input": {"numbers": [-1, 0], "target": -1}, "expected": [1, 2]}
            ]),
            """def twoSum(numbers: list[int], target: int) -> list[int]:
    # Alexandre's attempt with off-by-one boundary
    for i in range(len(numbers) + 1):
        for j in range(i + 1, len(numbers)):
            if numbers[i] + numbers[j] == target:
                return [i + 1, j + 1]
    return []
""",
            """def twoSum(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    while left < right:
        cur = numbers[left] + numbers[right]
        if cur == target:
            return [left + 1, right + 1]
        elif cur < target:
            left += 1
        else:
            right -= 1
    return []
""",
            'O(N)',
            'O(1)',
            15
        ),
        (
            'prob-merge-sorted-lists',
            'merge-two-sorted-lists',
            'Merge Two Sorted Lists',
            'Pointers & Slicing',
            'Data Structures (Lists, Dictionaries)',
            'Easy',
            'You are given two sorted integer arrays nums1 and nums2. Merge nums2 into nums1 as one sorted array. Handle 0-based bounds and avoiding IndexError.',
            'Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]',
            json.dumps([
                {"input": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", "output": "[1,2,2,3,5,6]", "explanation": "Merged in-place."}
            ]),
            json.dumps([
                {"input": {"nums1": [1, 2, 3], "nums2": [2, 5, 6]}, "expected": [1, 2, 2, 3, 5, 6]}
            ]),
            """def merge(nums1: list[int], nums2: list[int]) -> list[int]:
    # Common error: indexing len(nums1) directly
    res = []
    i = 0
    while i <= len(nums1):
        res.append(nums1[i])
        i += 1
    return sorted(res + nums2)
""",
            """def merge(nums1: list[int], nums2: list[int]) -> list[int]:
    return sorted(nums1 + nums2)
""",
            'O(N log N)',
            'O(N)',
            15
        ),
        (
            'prob-valid-parentheses',
            'valid-parentheses-stack',
            'Valid Parentheses Stack',
            'Linear Data Structures',
            'Data Structures (Lists, Dictionaries)',
            'Easy',
            'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
            'Input: s = "()[]{}"\nOutput: true',
            json.dumps([
                {"input": 's = "()[]{}"', "output": "true", "explanation": "Matching brackets closed in order."},
                {"input": 's = "(]"', "output": "false", "explanation": "Mismatched brackets."}
            ]),
            json.dumps([
                {"input": "()[]{}", "expected": True},
                {"input": "(]", "expected": False},
                {"input": "([)]", "expected": False}
            ]),
            """def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack
""",
            """def isValid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    return len(stack) == 0
""",
            'O(N)',
            'O(N)',
            10
        ),
        (
            'prob-binary-search-bounds',
            'binary-search-first-last-position',
            'Binary Search: Find First and Last Position of Element',
            'Searching & Sorting',
            'Algorithms & Problem Solving',
            'Medium',
            'Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value. If target is not found, return [-1, -1]. Must run in O(log n) runtime complexity.',
            'Input: nums = [5,7,7,8,8,10], target = 8\nOutput: [3,4]',
            json.dumps([
                {"input": "nums = [5,7,7,8,8,10], target = 8", "output": "[3,4]", "explanation": "Target 8 appears at indices 3 and 4."},
                {"input": "nums = [5,7,7,8,8,10], target = 6", "output": "[-1,-1]", "explanation": "Target 6 is not in the array."}
            ]),
            json.dumps([
                {"input": {"nums": [5, 7, 7, 8, 8, 10], "target": 8}, "expected": [3, 4]},
                {"input": {"nums": [5, 7, 7, 8, 8, 10], "target": 6}, "expected": [-1, -1]}
            ]),
            """def searchRange(nums: list[int], target: int) -> list[int]:
    # Common error: while left <= right with wrong midpoint bounds
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return [mid, mid]
        elif nums[mid] < target:
            left = mid
        else:
            right = mid
    return [-1, -1]
""",
            """def searchRange(nums: list[int], target: int) -> list[int]:
    def find_bound(is_first):
        left, right = 0, len(nums) - 1
        boundary = -1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                boundary = mid
                if is_first:
                    right = mid - 1
                else:
                    left = mid + 1
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return boundary
    return [find_bound(True), find_bound(False)]
""",
            'O(log N)',
            'O(1)',
            20
        ),
        (
            'prob-max-depth-tree',
            'maximum-depth-of-binary-tree',
            'Maximum Depth of Binary Tree',
            'Recursion & Trees',
            'Algorithms & Problem Solving',
            'Easy',
            'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
            'Input: root = [3,9,20,null,null,15,7]\nOutput: 3',
            json.dumps([
                {"input": "root = [3,9,20,null,null,15,7]", "output": "3", "explanation": "Depth from 3 to 15 or 7 is 3 nodes."}
            ]),
            json.dumps([
                {"input": "tree", "expected": 3}
            ]),
            """def maxDepth(root) -> int:
    # Common bug: missing terminal sentinel guard
    return 1 + max(maxDepth(root.left), maxDepth(root.right))
""",
            """def maxDepth(root) -> int:
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))
""",
            'O(N)',
            'O(H)',
            15
        ),
        (
            'prob-longest-consecutive',
            'longest-consecutive-sequence',
            'Longest Consecutive Sequence',
            'Hash Set Lookups',
            'Data Structures (Lists, Dictionaries)',
            'Medium',
            'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.',
            'Input: nums = [100,4,200,1,3,2]\nOutput: 4\nExplanation: The longest consecutive sequence is [1, 2, 3, 4].',
            json.dumps([
                {"input": "nums = [100,4,200,1,3,2]", "output": "4", "explanation": "Consecutive elements are [1, 2, 3, 4], length 4."}
            ]),
            json.dumps([
                {"input": [100, 4, 200, 1, 3, 2], "expected": 4}
            ]),
            """def longestConsecutive(nums: list[int]) -> int:
    # Common error: accidental quadratic scan with 'in list'
    max_len = 0
    for num in nums:
        curr = num
        curr_len = 1
        while (curr + 1) in nums:  # O(N) lookup inside loop -> O(N^2)
            curr += 1
            curr_len += 1
        max_len = max(max_len, curr_len)
    return max_len
""",
            """def longestConsecutive(nums: list[int]) -> int:
    num_set = set(nums)
    max_len = 0
    for num in num_set:
        if num - 1 not in num_set:
            curr = num
            curr_len = 1
            while curr + 1 in num_set:
                curr += 1
                curr_len += 1
            max_len = max(max_len, curr_len)
    return max_len
""",
            'O(N)',
            'O(N)',
            25
        )
    ]

    for p in problems:
        cursor.execute("""
            INSERT OR REPLACE INTO problems (
                id, slug, title, category, concept, difficulty, description, specifications,
                sample_cases, test_cases, starter_code, reference_solution,
                optimal_time_complexity, optimal_space_complexity, estimated_time_minutes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)

    # 3. Skill Assessments across the 9 core concepts
    skills = [
        ('student-alex', 'syntax', 'Syntax & Fundamentals', 'Core', 88, 35, 31, 0, 'Stable', 'Proficient'),
        ('student-alex', 'variables', 'Variables & Data Types', 'Core', 84, 24, 21, 0, '+2% trend', 'Proficient'),
        ('student-alex', 'conditionals', 'Conditional Logic', 'Core', 81, 19, 16, 0, 'Stable', 'Proficient'),
        ('student-alex', 'functions', 'Functions & Scope', 'Core', 75, 15, 12, 1, '+8% trend', 'Proficient'),
        ('student-alex', 'loops', 'Loops & Iteration', 'Core', 62, 28, 17, 4, '+11% trend', 'Developing'),
        ('student-alex', 'data_structures', 'Data Structures (Lists, Dictionaries)', 'Core', 54, 22, 12, 5, '+6% trend', 'Developing'),
        ('student-alex', 'search_sort', 'Searching & Sorting', 'Algorithmic', 52, 11, 5, 3, '+4% trend', 'Critical Weakness'),
        ('student-alex', 'algorithms', 'Algorithms & Problem Solving', 'Algorithmic', 48, 17, 8, 6, '-2% trend', 'Critical Weakness'),
        ('student-alex', 'complexity', 'Time & Space Complexity', 'Algorithmic', 42, 8, 3, 4, '+3% trend', 'Critical Weakness')
    ]

    for s in skills:
        cursor.execute("""
            INSERT OR REPLACE INTO skill_assessments (
                id, student_id, concept_key, concept_name, category, proficiency_percentage,
                attempts_count, success_count, recurring_mistakes_count, trend, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (f"{s[0]}_{s[1]}", *s))

    # 4. Recent Submissions
    submissions = [
        (
            'sub-101',
            'student-alex',
            'prob-even-sum',
            """def sum_even_numbers(numbers: list[int]) -> int:
    total_sum = 0
    for i in range(len(numbers)):
        if numbers[i] % 2 == 0:
            total_sum += numbers[i]
    return total_sum
""",
            'python3',
            'Accepted',
            38.0,
            14.2,
            100,
            'Loops & Conditionals',
            'All 4 base and edge test cases passed.',
            '2026-10-14 14:15:00'
        ),
        (
            'sub-102',
            'student-alex',
            'prob-two-sum-sorted',
            """from typing import List

class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        # Search for two indices summing to target in sorted array
        for i in range(len(numbers) + 1):
            current = numbers[i]
            needed = target - current
            # Linear scan check across remainder
            for j in range(i + 1, len(numbers)):
                if numbers[j] == needed:
                    return [i + 1, j + 1]
        return []
""",
            'python3',
            'Needs Improvement',
            52.0,
            15.1,
            68,
            'Off-by-one Loop Bounds',
            'IndexError on size-2 edge cases; Suboptimal O(N^2) complexity on sorted data.',
            '2026-10-13 20:40:00'
        ),
        (
            'sub-103',
            'student-alex',
            'prob-merge-sorted-lists',
            """def merge(nums1: list[int], nums2: list[int]) -> list[int]:
    res = []
    for i in range(len(nums1) + 1):
        res.append(nums1[i])
    return res
""",
            'python3',
            'IndexError',
            45.0,
            14.8,
            40,
            'List Index vs Length',
            'IndexError: list index out of range at line 4.',
            '2026-10-11 11:10:00'
        ),
        (
            'sub-104',
            'student-alex',
            'prob-valid-parentheses',
            """def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return len(stack) == 0
""",
            'python3',
            'Accepted',
            32.0,
            14.0,
            100,
            'Stack Data Structure',
            'All tests passed cleanly with optimal O(N) memory.',
            '2026-10-09 16:05:00'
        )
    ]

    for sub in submissions:
        cursor.execute("""
            INSERT OR REPLACE INTO submissions (
                id, student_id, problem_id, code, language, status, execution_time_ms,
                memory_mb, score, detected_concept, result_summary, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sub)

    # 5. Analysis results for sub-102 (Two Sum II)
    cursor.execute("""
        INSERT OR REPLACE INTO analysis_results (
            id, submission_id, status, syntax_valid, issues_detected, time_complexity,
            space_complexity, ast_signature, code_style_grade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'analysis-102', 'sub-102', 'Needs Improvement', 1, 3, 'O(N^2)', 'O(1)',
        "For.iter -> Call(func=Name('range'), args=[BinOp(left=Call(func=Name('len')), op=Add(), right=Constant(1))])", 'B-'
    ))

    # 6. Detected errors for analysis-102
    errors = [
        (
            'err-102-1',
            'analysis-102',
            'Runtime Exception',
            'Loops & Iteration',
            6,
            'Loop Invariant / Bounds',
            'Critical',
            'Off-by-One Array Boundary (Confirmed)',
            'You used range(len(numbers) + 1). Because range(N) already iterates from 0 to N - 1, adding + 1 forces an extra iteration with i = N, causing IndexError: list index out of range.',
            'range(len(numbers))',
            0.98,
            '#ERR_IDX_BOUND_04'
        ),
        (
            'err-102-2',
            'analysis-102',
            'Algorithmic Complexity',
            'Complexity & Runtime',
            10,
            'Nested Sequential Scan',
            'High',
            'O(N^2) Complexity on Pre-Sorted Data',
            'By running a nested linear loop, you miss out on the sorted precondition. When an array is sorted, comparing elements from opposing ends allows narrowing the search space in O(1) decisions per step.',
            'Two-pointer approach (while left < right)',
            0.94,
            '#ERR_QUADRATIC_NESTED_02'
        ),
        (
            'err-102-3',
            'analysis-102',
            'Code Style',
            'Syntax & Fundamentals',
            6,
            'Unidiomatic Traversal',
            'Low',
            'Unidiomatic Index-Only Traversal',
            'Using range(len(numbers)) followed by numbers[i] is anti-idiomatic in Python when index and value are both needed. Prefer enumerate(numbers) or direct element traversal.',
            'for i, val in enumerate(numbers):',
            0.89,
            '#STYLE_UNIDIOMATIC_ITER_01'
        )
    ]

    for err in errors:
        cursor.execute("""
            INSERT OR REPLACE INTO detected_errors (
                id, analysis_id, error_class, error_category, line_number, concept,
                severity, message, explanation, suggested_correction, confidence, ast_pattern_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, err)

    # 7. Recommendations
    recommendations = [
        (
            'rec-1',
            'student-alex',
            'prob-binary-search-bounds',
            'Loop Boundary Invariants & Half-Open Intervals',
            'Addresses your 57% recurrence rate of range(len + 1) and off-by-one errors in sorted collections. Target goal: Master invariant while left <= right vs while left < right.',
            1,
            12,
            20,
            0
        ),
        (
            'rec-2',
            'student-alex',
            'prob-two-sum-sorted',
            'Two Pointers & Bounds Invariants',
            'You previously used O(N^2) nested loops in 4 submissions. This problem trains the O(N) convergent two-pointer invariant.',
            2,
            8,
            15,
            0
        ),
        (
            'rec-3',
            'student-alex',
            'prob-merge-sorted-lists',
            'Slicing & List Indexing Bounds',
            'Reinforces zero-indexed list pointers without triggering IndexError on boundary edge conditions.',
            3,
            5,
            10,
            0
        ),
        (
            'rec-4',
            'student-alex',
            'prob-max-depth-tree',
            'Recursion Base Cases',
            'Targeting your detected Missing Base Case recurrence in recent tree submissions leading to recursion depth exhaustion.',
            4,
            9,
            15,
            0
        ),
        (
            'rec-5',
            'student-alex',
            'prob-longest-consecutive',
            'Hash Set Lookups vs Quadratic Scans',
            'Eliminates accidental quadratic lookups by replacing sequential list scanning with O(1) hash tables and boundary checks.',
            5,
            11,
            25,
            0
        )
    ]

    for rec in recommendations:
        cursor.execute("""
            INSERT OR REPLACE INTO recommendations (
                id, student_id, problem_id, target_concept, reason, priority_rank,
                impact_points, est_time_minutes, completed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, rec)

    # 8. Feedback records
    cursor.execute("""
        INSERT OR REPLACE INTO feedback_records (
            id, submission_id, student_id, concept, title, what_went_wrong, why_it_happened,
            mental_rules, side_by_side, socratic_question, is_ai_generated
        ) VALUES (
            'feed-101', 'sub-102', 'student-alex', 'Loops & Iteration',
            'Deconstructing Off-by-One Loop Invariants & 0-Indexed Boundaries',
            'In your recent attempts, you wrote range(len(numbers) + 1) or indexed arr[len(arr)]. Python arrays use 0-based indexing: an array of size N has valid positions strictly from 0 to N - 1. Iterating up to len(numbers) + 1 executes N + 1 iterations, attempting to read numbers[N] which triggers a fatal IndexError.',
            'This stems from conflating cardinal counting (human natural numbers: 1, 2, 3...) with zero-based pointer offsets (distance from start of memory block). In Python, range(0, N) creates a half-open interval [0, N) that naturally stops at N - 1.',
            ?, ?, ?, 0
        )
    """, (
        json.dumps([
            {"rule": "Rule 1: Direct Iteration", "description": "If you only need element values without modifying indices, use for item in items."},
            {"rule": "Rule 2: Enumerate", "description": "When both index and value are required, use for i, item in enumerate(items)."},
            {"rule": "Rule 3: Trust len()", "description": "range(len(items)) stops exactly at index len - 1. Never add + 1 to loop bounds."}
        ]),
        json.dumps({
            "flawed": "for i in range(len(nums) + 1):\n    total += nums[i]  # IndexError!",
            "pythonic": "for val in nums:\n    total += val  # Bounds-safe & idiomatic"
        }),
        json.dumps({
            "question": "Given data = ['a', 'b', 'c'], which statement traverses all elements without raising an IndexError?",
            "options": [
                "for i in range(1, len(data) + 1): print(data[i])",
                "for i in range(len(data)): print(data[i])",
                "for item in data: print(item)"
            ],
            "correct_index": 2,
            "explanation": "Direct iteration eliminates index book-keeping entirely, removing any possibility of boundary violation."
        })
    ))

    # 9. Progress History
    progress = [
        ('prog-1', 'student-alex', 'Oct 01', 64, 32, 0.68, 'Diagnostic baseline established'),
        ('prog-2', 'student-alex', 'Oct 08', 66, 36, 0.71, 'Conditional branching mastery'),
        ('prog-3', 'student-alex', 'Oct 15', 68, 40, 0.74, 'Off-by-one error reduction verified'),
        ('prog-4', 'student-alex', 'Oct 22', 70, 44, 0.78, 'List comprehension mastered'),
        ('prog-5', 'student-alex', 'Today', 72, 48, 0.82, '6-day streak maintained')
    ]

    for pr in progress:
        cursor.execute("""
            INSERT OR REPLACE INTO progress_history (
                id, student_id, date, overall_score, problems_solved, accuracy_rate, milestone_note
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, pr)

if __name__ == '__main__':
    print("Initializing SkillSense AI SQLite Database...")
    init_db(force_reseed=True)
    print(f"Database initialized successfully at {DB_FILE}")
