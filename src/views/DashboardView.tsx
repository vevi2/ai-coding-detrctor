import React, { useState, useEffect } from 'react';
import { DashboardData, NavigationPath, Submission } from '../types';
import { api } from '../services/api';

interface DashboardViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
  onSelectSubmission?: (submissionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectSubmission,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<'all' | 'core' | 'algo'>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.fetchDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalysis = (sub: Submission) => {
    if (onSelectSubmission) {
      onSelectSubmission(sub.id);
    }
    onNavigate('code-analysis', { submissionId: sub.id });
  };

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-[36px] text-secondary animate-spin">sync</span>
        <span className="text-[14px] text-on-surface-variant font-medium">Loading telemetry engine...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-12 bg-surface-container-lowest rounded-xl shadow-sm text-center space-y-4">
        <span className="material-symbols-outlined text-error text-[48px]">warning</span>
        <h2 className="text-xl font-bold text-on-surface">Unable to load telemetry dashboard</h2>
        <p className="text-on-surface-variant text-sm">{error || 'Unknown error occurred.'}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-container transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { student, metrics, skills_matrix, recent_submissions } = data;

  // Filter skills matrix
  const filteredSkills = skills_matrix.filter((s) => {
    if (skillFilter === 'core') return s.category === 'Core';
    if (skillFilter === 'algo') return s.category === 'Algorithmic';
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full overflow-hidden px-8 pt-6 pb-12 space-y-6 max-w-[1600px] mx-auto">
        {/* Top Ambient Glow Layer */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute -top-10 left-10 w-72 h-72 bg-primary-container/5 rounded-full blur-2xl pointer-events-none -z-10"></div>

        {/* 1. Hero Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Telemetry Engine Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-[11px] font-medium shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-secondary">history</span>
                Last analyzed submission: <strong className="text-on-surface font-semibold">42 mins ago</strong> (Binary Search Tree Traversal)
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary tracking-tight pt-1">
              Welcome back, {student.name.split(' ')[0]}!
            </h1>
            <p className="text-[15px] text-on-surface-variant max-w-2xl">
              Understand your coding patterns. Improve one concept at a time with telemetry-driven diagnosis.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('code-practice')}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-semibold text-[13px] shadow-sm hover:bg-surface-container transition-all border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">upload_file</span>
              <span>Submit Code</span>
            </button>
            <button
              onClick={() => onNavigate('code-practice')}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary-container hover:bg-tertiary-container text-white font-semibold text-[13px] shadow-md transition-all hover:shadow-lg"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">play_circle</span>
              <span>Practice Now</span>
            </button>
          </div>
        </div>

        {/* 2. Row of 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Card 1: Problems Solved */}
          <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all group border border-surface-container/60">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Problems Solved
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-on-surface">{metrics.problems_solved}</span>
                  <span className="text-[12px] font-bold text-secondary">Total</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary-container/40 flex items-center justify-center text-on-secondary-container group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
              </div>
            </div>
            <div className="mt-4 pt-2 flex items-center gap-1.5 text-secondary text-[12px] font-medium border-t border-surface-container/40">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span><strong>+{metrics.problems_solved_this_week}</strong> this week</span>
              <span className="text-on-surface-variant font-normal">· Top {metrics.percentile}% in cohort</span>
            </div>
          </div>

          {/* Card 2: Overall Skill Score */}
          <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all group border border-surface-container/60">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Overall Skill Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-on-surface">{metrics.overall_skill_score}</span>
                  <span className="text-[13px] text-on-surface-variant font-medium">/ 100</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
            </div>
            <div className="mt-4 pt-2 flex items-center gap-1.5 text-secondary text-[12px] font-medium border-t border-surface-container/40">
              <span className="material-symbols-outlined text-[16px]">north_east</span>
              <span><strong>+{metrics.score_growth_14d} pts</strong> in last 14 days</span>
              <span className="text-on-surface-variant font-normal">· Stable</span>
            </div>
          </div>

          {/* Card 3: Concepts to Improve */}
          <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all group border border-surface-container/60">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Concepts to Improve
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-on-surface">{metrics.concepts_to_improve}</span>
                  <span className="text-[12px] font-semibold text-on-surface-variant">Flagged</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">error</span>
              </div>
            </div>
            <div className="mt-4 pt-2 flex items-center border-t border-surface-container/40">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                {metrics.high_priority_gaps} High Priority (Loops & Slicing)
              </span>
            </div>
          </div>

          {/* Card 4: Current Learning Streak */}
          <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all group border border-surface-container/60">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Current Learning Streak
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-on-surface">{metrics.streak_days}</span>
                  <span className="text-[14px] text-on-surface-variant font-medium">Days</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 text-error flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-[22px]">🔥</span>
              </div>
            </div>
            <div className="mt-4 pt-2 flex items-center gap-1.5 text-on-surface-variant text-[12px] border-t border-surface-container/40">
              <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
              <span>Personal best: <strong>{metrics.personal_best_streak} days</strong></span>
              <span className="text-secondary font-semibold">· {metrics.personal_best_streak - metrics.streak_days} to tie</span>
            </div>
          </div>
        </div>

        {/* 3. Main Bento Grid (7:5 ratio) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Skill Performance Matrix */}
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm space-y-4 border border-surface-container/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Skill Performance Matrix</h2>
                  <p className="text-[13px] text-on-surface-variant">Continuous telemetry across foundational core competencies</p>
                </div>
                {/* Filters */}
                <div className="inline-flex items-center p-1 bg-surface-container rounded-lg text-[12px] font-semibold">
                  <button
                    onClick={() => setSkillFilter('all')}
                    className={`px-3 py-1 rounded transition-colors ${
                      skillFilter === 'all'
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    All ({skills_matrix.length})
                  </button>
                  <button
                    onClick={() => setSkillFilter('core')}
                    className={`px-3 py-1 rounded transition-colors ${
                      skillFilter === 'core'
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    Core
                  </button>
                  <button
                    onClick={() => setSkillFilter('algo')}
                    className={`px-3 py-1 rounded transition-colors ${
                      skillFilter === 'algo'
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    Algorithmic
                  </button>
                </div>
              </div>

              {/* Progress Bars List */}
              <div className="space-y-4 pt-1">
                {filteredSkills.map((skill) => {
                  let barColor = 'bg-emerald-600';
                  let badgeBg = 'bg-emerald-50 text-emerald-700';

                  if (skill.status === 'Critical Weakness') {
                    barColor = 'bg-error';
                    badgeBg = 'bg-red-50 text-error';
                  } else if (skill.status === 'Weak') {
                    barColor = 'bg-orange-500';
                    badgeBg = 'bg-orange-50 text-orange-800';
                  } else if (skill.status === 'Needs Attention' || skill.status === 'Developing') {
                    barColor = 'bg-amber-500';
                    badgeBg = 'bg-amber-50 text-amber-800';
                  } else if (skill.proficiency_percentage < 80) {
                    barColor = 'bg-secondary';
                    badgeBg = 'bg-secondary-container/60 text-on-secondary-container';
                  }

                  return (
                    <div
                      key={skill.concept_key}
                      onClick={() => onNavigate('my-skills')}
                      className="space-y-1.5 group cursor-pointer hover:bg-surface-container-low/40 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-on-surface group-hover:text-secondary transition-colors">
                            {skill.concept_name}
                          </span>
                          <span className="text-on-surface-variant font-mono text-[11px]">
                            ({skill.attempts_count} attempts {skill.recurring_mistakes_count > 0 ? `· ${skill.recurring_mistakes_count} recurring` : ''})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-on-surface">{skill.proficiency_percentage}%</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeBg}`}>
                            {skill.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                          style={{ width: `${skill.proficiency_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning Progress Trend Chart Card */}
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm space-y-4 border border-surface-container/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-on-surface">Your Learning Progress</h2>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                      +{metrics.score_growth_14d} pts Growth
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant">Composite code diagnostic score over time</p>
                </div>
                {/* Filter Tabs */}
                <div className="inline-flex p-1 bg-surface-container rounded-lg text-[12px] font-semibold">
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-3 py-1 rounded transition-colors ${timeRange === '7d' ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                    type="button"
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setTimeRange('30d')}
                    className={`px-3 py-1 rounded transition-colors ${timeRange === '30d' ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                    type="button"
                  >
                    30 Days
                  </button>
                  <button
                    onClick={() => setTimeRange('90d')}
                    className={`px-3 py-1 rounded transition-colors ${timeRange === '90d' ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                    type="button"
                  >
                    90 Days
                  </button>
                </div>
              </div>

              {/* Trend Chart Visual (Inline SVG matching Stitch) */}
              <div className="relative w-full pt-2">
                <svg className="w-full h-48 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 620 180">
                  <defs>
                    <linearGradient id="scoreAreaGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#106a61" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#106a61" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid reference lines */}
                  <line stroke="#dee9fc" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="620" y1="30" y2="30" />
                  <line stroke="#dee9fc" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="620" y1="80" y2="80" />
                  <line stroke="#dee9fc" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="620" y1="130" y2="130" />
                  {/* Baseline Labels */}
                  <text className="font-mono text-[10px]" fill="#717977" x="6" y="26">80 pts</text>
                  <text className="font-mono text-[10px]" fill="#717977" x="6" y="76">70 pts</text>
                  <text className="font-mono text-[10px]" fill="#717977" x="6" y="126">60 pts</text>
                  {/* Trend Area */}
                  <path
                    d="M 40 115 C 110 120, 160 100, 220 95 C 280 90, 330 105, 390 85 C 450 65, 520 72, 590 52 L 590 160 L 40 160 Z"
                    fill="url(#scoreAreaGradient)"
                  />
                  {/* Trend Curve */}
                  <path
                    d="M 40 115 C 110 120, 160 100, 220 95 C 280 90, 330 105, 390 85 C 450 65, 520 72, 590 52"
                    stroke="#106a61"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                  {/* Point 1 */}
                  <circle cx="40" cy="115" fill="#ffffff" r="4" stroke="#106a61" strokeWidth="2.5" />
                  <text className="font-mono text-[11px]" fill="#414847" x="32" y="140">64</text>
                  {/* Point 2 */}
                  <circle cx="220" cy="95" fill="#ffffff" r="4" stroke="#106a61" strokeWidth="2.5" />
                  <g transform="translate(190, 48)">
                    <rect fill="#eff4ff" height="24" rx="12" stroke="#dee9fc" width="138" x="0" y="0" />
                    <text className="text-[10px] font-semibold" fill="#1b7067" x="8" y="16">✓ Off-by-one error reduction</text>
                  </g>
                  <line stroke="#106a61" strokeDasharray="2 2" strokeWidth="1" x1="220" x2="220" y1="72" y2="92" />
                  {/* Point 3 */}
                  <circle cx="390" cy="85" fill="#ffffff" r="4" stroke="#106a61" strokeWidth="2.5" />
                  <g transform="translate(365, 20)">
                    <rect fill="#d4e7e2" height="24" rx="12" width="146" x="0" y="0" />
                    <text className="text-[10px] font-semibold" fill="#00201d" x="8" y="16">★ List comprehension mastered</text>
                  </g>
                  <line stroke="#106a61" strokeDasharray="2 2" strokeWidth="1" x1="438" x2="438" y1="44" y2="78" />
                  {/* Point 4 Latest */}
                  <circle cx="590" cy="52" fill="#106a61" r="6" stroke="#ffffff" strokeWidth="2.5" />
                  <text className="font-mono font-bold text-[12px]" fill="#106a61" x="560" y="40">72 pts</text>
                </svg>
                <div className="flex justify-between items-center px-6 pt-2 font-mono text-[11px] text-on-surface-variant border-t border-surface-container">
                  <span>Oct 01</span>
                  <span>Oct 08</span>
                  <span>Oct 15</span>
                  <span>Oct 22</span>
                  <span className="font-semibold text-secondary">Today (Oct 28)</span>
                </div>
              </div>
            </div>

            {/* Recent Submissions Table Card */}
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm space-y-4 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Recent Submissions</h2>
                  <p className="text-[13px] text-on-surface-variant">Diagnostics and detected failure modes across recent code submissions</p>
                </div>
                <button
                  onClick={() => onNavigate('submission-history')}
                  className="text-[13px] text-secondary hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  View All ({recent_submissions.length})
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="text-on-surface-variant bg-surface-container-low/70 rounded-lg">
                      <th className="py-2.5 px-3 font-semibold rounded-l-lg">Problem</th>
                      <th className="py-2.5 px-3 font-semibold">Language</th>
                      <th className="py-2.5 px-3 font-semibold">Submitted</th>
                      <th className="py-2.5 px-3 font-semibold">Result</th>
                      <th className="py-2.5 px-3 font-semibold">Detected Concept</th>
                      <th className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {recent_submissions.map((sub) => {
                      const isAccepted = sub.status === 'Accepted';
                      const isIndexErr = sub.status === 'IndexError';
                      return (
                        <tr key={sub.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-on-surface block">{sub.problem_title}</span>
                            <span className="text-[11px] text-on-surface-variant">{sub.problem_category}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-on-surface-variant">Python 3.10</td>
                          <td className="py-3 px-3 text-on-surface-variant">
                            {sub.created_at.includes('14:15') ? 'Today, 2:15 PM' : (sub.created_at.includes('20:40') ? 'Yesterday, 8:40 PM' : 'Oct 24, 11:10 AM')}
                          </td>
                          <td className="py-3 px-3">
                            {isAccepted ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                Accepted
                              </span>
                            ) : isIndexErr ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-error text-[11px] font-semibold">
                                <span className="material-symbols-outlined text-[14px]">cancel</span>
                                IndexError
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold">
                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                Needs Imprv.
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-medium">
                              {sub.detected_concept}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleViewAnalysis(sub)}
                              className={`text-[12px] font-semibold hover:underline ${
                                isIndexErr ? 'text-error' : 'text-secondary'
                              }`}
                              type="button"
                            >
                              {isIndexErr ? 'Debug Code' : (isAccepted ? 'View Analysis' : 'Review Feedback')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Recommended Next Step (Mint Accent Box) */}
            <div className="relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-tertiary-fixed to-surface-container-lowest shadow-md space-y-4 border-l-4 border-secondary border border-surface-container/40">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container text-white text-[11px] font-semibold shadow-xs">
                  <span className="material-symbols-outlined text-[14px] text-secondary-fixed">auto_awesome</span>
                  AI Recommendation #1 Priority
                </span>
                <span className="text-[12px] text-secondary font-bold">+9 pts impact</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-primary leading-snug">
                  Focus on loop boundaries & iteration logic
                </h3>
                <p className="text-[14px] text-on-surface-variant">
                  Repeated off-by-one errors detected in <strong className="text-on-surface font-semibold">4 of your last 7</strong> loop-based submissions. Mastering closed interval indexing will boost your overall score by <strong className="text-secondary font-bold">+9 pts</strong>.
                </p>
              </div>

              {/* Micro Diagnostic Preview Snippet */}
              <div className="p-3 rounded-lg bg-primary-container text-white font-mono text-[12px] space-y-1">
                <div className="flex items-center justify-between text-on-primary-container text-[11px] pb-1 border-b border-tertiary-container">
                  <span>Telemetry Pattern ID: #ERR_IDX_BOUND_04</span>
                  <span>Python 3.x</span>
                </div>
                <div className="pt-1 text-red-300">
                  - for i in range(len(nums) + 1):  <span className="text-on-primary-container"># IndexError</span>
                </div>
                <div className="text-secondary-fixed">
                  + for i in range(len(nums)):      <span className="text-on-primary-container"># Optimal boundary</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={() => onNavigate('code-practice')}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary hover:bg-primary-container text-white text-[13px] font-semibold shadow-sm transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Start Practice (3 targeted problems)</span>
                </button>
                <button
                  onClick={() => onNavigate('ai-feedback')}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-[13px] font-medium transition-all border border-surface-container"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">menu_book</span>
                  <span>Explanation</span>
                </button>
              </div>
            </div>

            {/* Your Focus Areas Card (Recurring Weaknesses) */}
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm space-y-4 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">target</span>
                  <h2 className="text-lg font-bold text-on-surface">Your Focus Areas</h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant font-medium">
                  3 Detected
                </span>
              </div>
              <div className="space-y-3">
                {/* Focus Item 1 */}
                <div className="p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all space-y-2 border border-surface-container/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                      <span className="text-[14px] font-bold text-on-surface">Algorithmic Thinking</span>
                    </div>
                    <span className="font-mono font-bold text-error text-[11px] px-2 py-0.5 rounded bg-red-100/70">
                      48% Mastery
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant">
                    <strong>Detected pattern:</strong> Difficulty formulating base cases in recursive logic and nested loop termination.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[12px]">
                    <span className="text-on-surface-variant">Last tested 2d ago</span>
                    <button
                      onClick={() => onNavigate('code-practice')}
                      className="inline-flex items-center gap-1 text-secondary hover:text-primary font-bold"
                      type="button"
                    >
                      <span>Practice This</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Focus Item 2 */}
                <div className="p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all space-y-2 border border-surface-container/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                      <span className="text-[14px] font-bold text-on-surface">Data Structures</span>
                    </div>
                    <span className="font-mono font-bold text-orange-800 text-[11px] px-2 py-0.5 rounded bg-orange-100/70">
                      54% Mastery
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant">
                    <strong>Detected pattern:</strong> Frequent <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-surface-container">IndexError</code> due to confusion between 0-indexed length and last element access.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[12px]">
                    <span className="text-on-surface-variant">Last tested 4d ago</span>
                    <button
                      onClick={() => onNavigate('code-practice')}
                      className="inline-flex items-center gap-1 text-secondary hover:text-primary font-bold"
                      type="button"
                    >
                      <span>Practice This</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Focus Item 3 */}
                <div className="p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all space-y-2 border border-surface-container/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-[14px] font-bold text-on-surface">Loops & Iteration</span>
                    </div>
                    <span className="font-mono font-bold text-amber-800 text-[11px] px-2 py-0.5 rounded bg-amber-100/70">
                      62% Mastery
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant">
                    <strong>Detected pattern:</strong> Repeated off-by-one errors when using <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-surface-container">range(len(arr))</code> with slice operators.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[12px]">
                    <span className="text-on-surface-variant">Last tested 42m ago</span>
                    <button
                      onClick={() => onNavigate('code-practice')}
                      className="inline-flex items-center gap-1 text-secondary hover:text-primary font-bold"
                      type="button"
                    >
                      <span>Practice This</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Daily Micro-Challenge */}
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm space-y-4 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">⚡</span>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    Daily Micro-Challenge
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
                  5 Min
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-secondary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">bug_report</span>
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-[15px] font-bold text-on-surface">Debug in 5 Minutes</h4>
                  <p className="text-[13px] text-on-surface-variant">
                    Fix the Infinite While Loop in Python binary search logic
                  </p>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[12px]">
                  <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                  <span>Reward: +15 XP & Streak Shield</span>
                </div>
                <button
                  onClick={() => onNavigate('code-practice')}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-on-secondary-container text-white text-[12px] font-semibold transition-all shadow-xs"
                  type="button"
                >
                  <span>Start Challenge</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
