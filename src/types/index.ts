export type NavigationPath =
  | 'dashboard'
  | 'code-practice'
  | 'code-analysis'
  | 'my-skills'
  | 'ai-feedback'
  | 'recommendations'
  | 'progress-tracking'
  | 'submission-history'
  | 'settings';

export interface Student {
  id: string;
  name: string;
  email: string;
  cohort: string;
  overall_score: number;
  streak_days: number;
  personal_best_streak: number;
  last_active?: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  category: string;
  concept: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  specifications: string;
  sample_cases: string | Array<{ input: string; output: string; explanation: string }>;
  test_cases?: string | Array<{ input: any; expected: any }>;
  starter_code: string;
  reference_solution?: string;
  optimal_time_complexity: string;
  optimal_space_complexity: string;
  estimated_time_minutes: number;
}

export interface TestCaseResult {
  case_num: number;
  input: string;
  expected: any;
  output: any;
  passed: boolean;
  runtime_ms: number;
  error?: string | null;
}

export interface DetectedError {
  id?: string;
  error_class: string;
  error_category: string;
  line_number: number;
  concept: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  message: string;
  explanation: string;
  suggested_correction?: string;
  confidence: number;
  ast_pattern_id?: string;
}

export interface AnalysisResult {
  id?: string;
  submission_id?: string;
  status: string;
  syntax_valid: boolean;
  issues_detected: number;
  time_complexity: string;
  space_complexity: string;
  ast_signature: string;
  code_style_grade: string;
  issues?: DetectedError[];
}

export interface Submission {
  id: string;
  student_id: string;
  problem_id: string;
  problem_title?: string;
  problem_category?: string;
  difficulty?: string;
  problem_slug?: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Needs Improvement' | 'IndexError' | 'RuntimeError' | 'SyntaxError' | 'Wrong Answer';
  execution_time_ms: number;
  memory_mb: number;
  score: number;
  detected_concept: string;
  result_summary: string;
  created_at: string;
}

export interface SkillAssessment {
  concept_key: string;
  concept_name: string;
  category: 'Core' | 'Algorithmic';
  proficiency_percentage: number;
  attempts_count: number;
  success_count: number;
  recurring_mistakes_count: number;
  trend: string;
  status: 'Critical Weakness' | 'Weak' | 'Needs Attention' | 'Developing' | 'Proficient';
}

export interface Recommendation {
  id: string;
  problem_id: string;
  problem_title: string;
  problem_slug?: string;
  target_concept: string;
  reason: string;
  priority_rank: number;
  impact_points: number;
  est_time_minutes: number;
  completed: boolean | number;
  difficulty?: string;
  category?: string;
  optimal_time_complexity?: string;
  optimal_space_complexity?: string;
}

export interface FeedbackData {
  id: string;
  submission_id?: string;
  concept: string;
  title: string;
  what_went_wrong: string;
  why_it_happened: string;
  mental_rules: Array<{ rule: string; description: string }>;
  side_by_side: { flawed: string; pythonic: string };
  socratic_question: {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  };
  is_ai_generated?: boolean;
}

export interface DashboardData {
  student: Student;
  metrics: {
    problems_solved: number;
    problems_solved_this_week: number;
    overall_skill_score: number;
    score_growth_14d: number;
    concepts_to_improve: number;
    high_priority_gaps: number;
    streak_days: number;
    personal_best_streak: number;
    cohort_benchmark: number;
    percentile: number;
  };
  skills_matrix: SkillAssessment[];
  critical_weaknesses: SkillAssessment[];
  developing_areas: SkillAssessment[];
  progress_points: Array<{
    id: string;
    date: string;
    overall_score: number;
    problems_solved: number;
    accuracy_rate: number;
    milestone_note?: string;
  }>;
  recent_submissions: Submission[];
  recommendations: Recommendation[];
  top_recommendation?: Recommendation | null;
}
