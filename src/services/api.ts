import {
  DashboardData,
  Submission,
  Problem,
  FeedbackData,
  Recommendation,
  SkillAssessment,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  async fetchDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching dashboard`);
    return res.json();
  },

  async fetchSubmissions(params?: { status?: string; concept?: string; q?: string }): Promise<{ submissions: Submission[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.concept && params.concept !== 'All') query.set('concept', params.concept);
    if (params?.q) query.set('q', params.q);

    const res = await fetch(`${API_BASE}/submissions?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching submissions`);
    return res.json();
  },

  async fetchSubmissionDetail(id: string): Promise<{
    submission: Submission;
    analysis: any;
    errors: any[];
  }> {
    const res = await fetch(`${API_BASE}/submissions/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching submission detail`);
    return res.json();
  },

  async submitCode(payload: {
    code: string;
    problem_id?: string;
    student_id?: string;
    language?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} submitting code`);
    return res.json();
  },

  async liveAnalyze(code: string): Promise<any> {
    const res = await fetch(`${API_BASE}/analysis/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} analyzing code`);
    return res.json();
  },

  async fetchSkills(): Promise<{
    overall_score: number;
    skills: SkillAssessment[];
    critical_weaknesses: SkillAssessment[];
    developing: SkillAssessment[];
    proficient: SkillAssessment[];
    recurring_patterns: any[];
  }> {
    const res = await fetch(`${API_BASE}/skills`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching skills`);
    return res.json();
  },

  async fetchRecommendations(): Promise<{ recommendations: Recommendation[]; count: number }> {
    const res = await fetch(`${API_BASE}/recommendations`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching recommendations`);
    return res.json();
  },

  async completeRecommendation(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/recommendations/${id}/complete`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} completing recommendation`);
    return res.json();
  },

  async fetchFeedback(): Promise<{ feedback: FeedbackData }> {
    const res = await fetch(`${API_BASE}/feedback`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching feedback`);
    return res.json();
  },

  async generateFeedback(payload: {
    code?: string;
    issue_description?: string;
    concept?: string;
  }): Promise<{ feedback: FeedbackData }> {
    const res = await fetch(`${API_BASE}/feedback/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} generating feedback`);
    return res.json();
  },

  async fetchProblems(): Promise<{ problems: Problem[] }> {
    const res = await fetch(`${API_BASE}/problems`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching problems`);
    return res.json();
  },

  async fetchProgress(): Promise<{ history: any[]; growth_pts: number }> {
    const res = await fetch(`${API_BASE}/progress`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching progress`);
    return res.json();
  },
};
