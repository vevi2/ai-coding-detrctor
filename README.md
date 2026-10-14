# SkillSense AI — Personalized Coding Skill Analysis and Recommendation System

SkillSense AI is an intelligent programming learning platform designed for CS students and educators. It captures Python submissions, evaluates test cases in an isolated execution sandbox, performs deep Abstract Syntax Tree (AST) static analysis to detect cognitive misconceptions and boundary bugs, tracks skill degradation and growth over time, and generates personalized Socratic feedback and practice problem recommendations.

---

## 🌟 Key Architecture & Capabilities

1. **Stitch-Preserved High-Fidelity UI**:
   - Modern Material Design 3 / Stitch palette with custom typography (`Inter` & `JetBrains Mono`).
   - Persistent responsive sidebar navigation with interactive user profile menu.
   - Comprehensive telemetry views:
     - **Student Dashboard**: Live skill radar scores, growth trajectory, weak concepts, recent submissions, and quick-start recommendations.
     - **Code Practice Workspace**: Python code editor with syntax highlighting, live test case execution, memory and runtime profiling, and AST feedback notes.
     - **Code Analysis**: In-depth AST code disassembly, side-by-side diffs, bug severity ratings, line-number annotations, and cognitive root cause analysis.
     - **My Skills & Weakness Detection**: Diagnostic radar metrics, competency matrices, error frequency histograms, and PDF export.
     - **AI Feedback & Socratic Guidance**: Socratic interactive questions, side-by-side anti-pattern vs. idiomatic comparisons, and AI tutor explanations.
     - **Personalized Recommendations**: Priority-ranked problem queue filtered by targeted weaknesses, difficulty, and impact score.
     - **Progress Tracking**: Learning velocity tracking, cohort percentiles, and comparative before-and-after recommendation gains.
     - **Submission History**: Searchable, filterable audit trail of student code submissions and run logs.
     - **Settings**: Student profile and AST parser strictness preferences.

2. **AST Static Code Analysis Engine (`backend/services/code_analyzer.py`)**:
   - Uses CPython's standard `ast` library to parse and traverse Python syntax trees safely.
   - Identifies:
     - Off-by-one boundary bugs (`range(len(arr) + 1)` and `range(1, len(arr) + 1)`).
     - Dangerous index access patterns (`arr[i]` vs. direct iterators).
     - Missing recursion base cases (`if not root:`).
     - Inefficient quadratic memberships (`if item in list` inside loops).
     - Missing return statements or unreachable code blocks.
     - AST structure signatures and style grades (`A+` to `D`).

3. **Secure Sandbox Code Execution (`backend/services/code_executor.py`)**:
   - Executes student submissions in an isolated subprocess with strict timeouts and memory isolation.
   - Evaluates automated unit tests with structured assertions.

4. **Normalized SQLite Relational Database (`backend/database/schema.sql`)**:
   - Tables: `students`, `problems`, `submissions`, `analysis_results`, `detected_errors`, `skill_assessments`, `recommendations`, `feedback_records`, `progress_history`.
   - Seeded with comprehensive real-world student telemetry (`Alex Rivera`, CS Sophomore).

5. **Dual-Backend Support**:
   - **Unified Dev Server (`server.ts`)**: Node Express server running on port 3000 hosting Vite middlewares and dispatching API requests to Python services via `backend/bridge.py` and Gemini API (`gemini-3.8-flash`).
   - **Standalone Flask REST API (`backend/app.py`)**: Clean modular Flask app ready for independent deployment with `backend/requirements.txt`.

---

## 🚀 Running the Application

### 1. Unified Development Server (AI Studio Default)
```bash
npm run dev
# Starts server.ts on http://localhost:3000 with Vite middleware & Python AST bridge
```

### 2. Standalone Flask Backend (Optional Local Python Deployment)
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs Flask REST API on http://127.0.0.1:5000
```

### 3. Running Backend Unit Tests
```bash
python3 -m unittest backend/tests/test_backend.py
```
