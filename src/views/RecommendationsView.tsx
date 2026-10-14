import React, { useState, useEffect } from 'react';
import { NavigationPath, Recommendation } from '../types';
import { api } from '../services/api';

interface RecommendationsViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ onNavigate }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'weakest' | 'easy' | 'medium' | 'hard' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('All Concepts');
  const [sortOption, setSortOption] = useState('impact');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.fetchRecommendations();
      setRecommendations(res.recommendations || []);
    } catch (e) {
      console.warn('Using baseline recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = (rec: Recommendation) => {
    onNavigate('code-practice', { problemSlug: rec.problem_slug });
  };

  const handleComplete = async (recId: string) => {
    try {
      await api.completeRecommendation(recId);
      setToastMessage('Targeted practice task marked as completed! Points awarded.');
      loadRecommendations();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e: any) {
      setToastMessage(`Update failed: ${e.message}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (filterTab === 'easy' && r.difficulty !== 'Easy') return false;
    if (filterTab === 'medium' && r.difficulty !== 'Medium') return false;
    if (filterTab === 'hard' && r.difficulty !== 'Hard') return false;
    if (filterTab === 'weakest' && r.priority_rank > 3) return false;
    if (searchQuery && !r.problem_title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedConcept !== 'All Concepts' && !r.target_concept.toLowerCase().includes(selectedConcept.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2.5 rounded-lg bg-primary-container text-white text-sm font-semibold shadow-lg border border-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="px-8 py-6 flex flex-col gap-6 max-w-[1500px] mx-auto w-full">
        {/* Header & Telemetry Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-3xl">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
              <span>Workspace</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Telemetry & Practice</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-secondary font-bold">Personalized Recommendations</span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">
              Personalized Practice Recommendations
            </h1>
            <p className="text-[14px] text-on-surface-variant">
              Adaptive practice queues curated by SkillSense AST telemetry. Targeted exercises specifically calibrated to eliminate diagnosed mental model flaws.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setToastMessage('Telemetry synced with SQLite database.');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high transition-colors shadow-xs border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">sync</span>
              <span>Sync Telemetry</span>
            </button>
            <button
              onClick={() => {
                setToastMessage('New practice queue generated based on recent telemetry!');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-white text-[13px] font-bold hover:bg-tertiary-container transition-colors shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>Generate New Queue</span>
            </button>
          </div>
        </div>

        {/* Active Weakness Vectors Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low shadow-xs border border-surface-container/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Diagnostic Focus</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="text-[13px] font-bold text-on-surface">3 Active Weakness Vectors Detected</span>
              </div>
              <span className="text-[12px] text-on-surface-variant">
                Targeted remediation: <strong className="text-on-surface">Loop Boundary Invariants</strong>, <strong className="text-on-surface">Recursion Base Cases</strong>, and <strong className="text-on-surface">Quadratic Containment</strong>.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-error-container text-on-error-container">57% Boundary Mistake Rate</span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-container text-on-surface">AST Confidence: 94.8%</span>
          </div>
        </div>

        {/* Featured Recommendation Hero Card */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm border border-secondary/30">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
          <div className="flex flex-col gap-4 relative">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Highest Skill Impact • +12 Skill Points Potential
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium">
                  Primary Remediation
                </span>
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Est. Time: <strong className="text-on-surface">20 mins</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700">Medium</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 flex flex-col gap-2">
                <div>
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Core Concept: Loop Boundary Invariants & Half-Open Intervals
                  </span>
                  <h2 className="text-xl font-bold text-on-surface tracking-tight mt-0.5">
                    Binary Search: Find First and Last Position of Element
                  </h2>
                </div>

                {/* Diagnosis Callout */}
                <div className="p-3.5 rounded-lg bg-surface-container-low flex items-start gap-3 border border-surface-container/60">
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">query_stats</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-on-surface">AST Telemetry Diagnosis</span>
                    <p className="text-[12px] text-on-surface-variant">
                      Addresses your <span className="font-bold text-error">57% recurrence rate</span> of <code className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-mono text-[11px]">range(len + 1)</code> and off-by-one errors in sorted collections.
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                      <span className="text-[12px] text-on-surface font-medium">
                        Target Goal: Master invariant <code className="font-mono text-[11px] bg-surface-container px-1 py-0.5 rounded font-bold">while left &lt;= right</code> vs <code className="font-mono text-[11px] bg-surface-container px-1 py-0.5 rounded font-bold">while left &lt; right</code>.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2 justify-center lg:items-end">
                <button
                  onClick={() => onNavigate('code-practice', { problemSlug: 'binary-search-first-last-position' })}
                  className="w-full h-11 px-6 rounded-lg bg-primary-container text-white text-[13px] font-bold hover:bg-tertiary-container flex items-center justify-center gap-2 shadow-sm transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary-fixed">play_arrow</span>
                  <span>Start Practice Session</span>
                </button>
                <div className="flex items-center gap-2 w-full justify-between">
                  <button
                    onClick={() => onNavigate('code-practice')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Preview Cases (14)</span>
                  </button>
                  <button
                    onClick={() => {
                      setToastMessage('Problem saved to bookmarks.');
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters, Tabs & Sorting Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 text-[12px] font-bold">
            {[
              { id: 'all', label: `All Recommendations (${recommendations.length || 12})` },
              { id: 'weakest', label: 'Weakest Concepts (5)' },
              { id: 'easy', label: 'Easy (4)' },
              { id: 'medium', label: 'Medium (6)' },
              { id: 'hard', label: 'Hard (2)' },
              { id: 'saved', label: 'Saved (3)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterTab === tab.id
                    ? 'bg-secondary-container text-on-secondary-fixed shadow-xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Controls: Selectors & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedConcept}
                onChange={(e) => setSelectedConcept(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface text-[12px] font-semibold appearance-none shadow-xs border border-surface-container cursor-pointer"
              >
                <option>All Concepts</option>
                <option>Loops & Iteration</option>
                <option>Recursion</option>
                <option>Two Pointers</option>
                <option>Hashing & Sets</option>
              </select>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-2.5 top-2.5 pointer-events-none">expand_more</span>
            </div>

            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface text-[12px] font-semibold appearance-none shadow-xs border border-surface-container cursor-pointer"
              >
                <option value="impact">Sort: Highest Skill Impact</option>
                <option value="difficulty">Sort: Difficulty (Ascending)</option>
                <option value="time">Sort: Shortest Time</option>
              </select>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-2.5 top-2.5 pointer-events-none">sort</span>
            </div>

            <div className="relative flex-1 sm:w-48">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute left-2.5 top-2.5">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-container-lowest text-on-surface text-[12px] shadow-xs border border-surface-container placeholder:text-outline"
                placeholder="Filter problems..."
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Two-Column Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Prioritized Queue */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-bold text-on-surface uppercase tracking-wider">
                Prioritized Remediation Queue
              </span>
              <span className="text-[12px] text-on-surface-variant">
                Showing {filteredRecs.length} Adaptive Tasks
              </span>
            </div>

            {filteredRecs.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow border border-surface-container/60 ${
                  rec.completed ? 'opacity-70 bg-surface-container-low/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        rec.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'
                      }`}>
                        {rec.difficulty || 'Medium'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-container text-on-surface-variant">
                        {rec.category || 'Two Pointers'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container/40 text-on-secondary-container">
                        {rec.completed ? 'Completed ✓' : 'Bounds Safe'}
                      </span>
                    </div>
                    <h3
                      onClick={() => handleStartPractice(rec)}
                      className="text-[15px] font-bold text-on-surface hover:text-secondary cursor-pointer transition-colors"
                    >
                      {rec.problem_title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleComplete(rec.id)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                    title={rec.completed ? 'Completed' : 'Mark Complete'}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {rec.completed ? 'check_circle' : 'bookmark'}
                    </span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 border border-surface-container/40">
                  <div className="flex items-center gap-1.5 text-secondary text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
                    <span>Why Recommended (AST Telemetry):</span>
                  </div>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-surface-container/40">
                  <div className="flex items-center gap-3 text-[12px]">
                    <span className="inline-flex items-center gap-1 text-secondary font-bold">
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      +{rec.impact_points} pts {rec.target_concept.split('&')[0]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      {rec.est_time_minutes} mins
                    </span>
                  </div>
                  <button
                    onClick={() => handleStartPractice(rec)}
                    className="h-8 px-3.5 rounded-lg bg-primary text-white text-[12px] font-bold hover:bg-primary-container flex items-center gap-1.5 transition-colors shadow-xs"
                    type="button"
                  >
                    <span>Start Practice</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column (5 cols): Milestone Roadmap & Projections */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Milestone Roadmap */}
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4 border border-surface-container/60">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Milestone Roadmap</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold">35% Complete</span>
                </div>
                <h3 className="text-base font-bold text-on-surface">
                  From Index Traps to Algorithmic Invariants
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  Estimated 4.5 hours to graduate all 3 flagged weakness concepts.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>

              {/* Stepper Pathway */}
              <div className="flex flex-col relative pl-6 gap-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                {/* Stage 1 */}
                <div className="relative flex flex-col gap-0.5">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[12px] font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-on-surface">1. Understand 0-Indexed Memory Bounds</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold">Mastered</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Half-open intervals and base pointer offsets (100% completed).</p>
                </div>

                {/* Stage 2 */}
                <div className="relative flex flex-col gap-0.5">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[11px] font-bold ring-4 ring-secondary-container/40">
                    2
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-secondary">2. Loop Boundary Invariants & Binary Traversal</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">Current (2/4)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Eliminating off-by-one errors in sorted division searches.</p>
                </div>

                {/* Stage 3 */}
                <div className="relative flex flex-col gap-0.5 opacity-70">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-on-surface">3. Slicing & Substring Window Pointers</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">0/3 Solved</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Sliding window dynamic resizing without array overflow.</p>
                </div>

                {/* Stage 4 */}
                <div className="relative flex flex-col gap-0.5 opacity-70">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-on-surface">4. Recursive Base-Case Sentinels</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">0/3 Solved</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Guarding leaf nodes, empty subproblems, and stack depth bounds.</p>
                </div>
              </div>
            </div>

            {/* Predictive Telemetry */}
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-3 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Predictive Telemetry</span>
                  <h3 className="text-base font-bold text-on-surface">Skill Growth Projection</h3>
                </div>
                <span className="material-symbols-outlined text-secondary text-[24px]">insights</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-surface-container-low text-center border border-surface-container/40">
                <div className="flex flex-col items-center p-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Current Score</span>
                  <span className="text-2xl font-extrabold text-on-surface">72<span className="text-[12px] text-on-surface-variant font-normal">/100</span></span>
                  <span className="text-[10px] text-on-surface-variant">Baseline Proficiency</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-surface-container-lowest shadow-xs">
                  <span className="text-[10px] font-bold text-secondary uppercase">Projected Score</span>
                  <span className="text-2xl font-extrabold text-secondary">86<span className="text-[12px] text-secondary/70 font-normal">/100</span></span>
                  <span className="text-[10px] text-secondary font-bold">+14 pts Potential</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-on-surface-variant">Expected Error Reduction</span>
                  <span className="font-bold text-emerald-700">-85% IndexErrors</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-error/30 h-2.5" style={{ width: '15%' }}></div>
                  <div className="bg-emerald-600 h-2.5" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant pt-0.5">
                  <span>Residual Risk: 15%</span>
                  <span className="text-emerald-700 font-bold">Target Success: 85%</span>
                </div>
              </div>
            </div>

            {/* Daily Adaptive Drill */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary-container to-tertiary-container text-white shadow-sm flex flex-col gap-2 relative overflow-hidden border border-tertiary-container">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                  Daily Adaptive Drill
                </span>
                <span className="text-[11px] text-primary-fixed-dim">10-Min Diagnostic</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Debug 3 Intentional Off-By-One Invariant Bugs
              </h3>
              <p className="text-[12px] text-primary-fixed-dim leading-relaxed">
                Spot syntax boundary bugs in mock AST tokens before running test suites. Calibrated to reset your mental model reflexes.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('code-practice')}
                  className="w-full h-10 px-4 rounded-lg bg-secondary-container text-on-secondary-fixed text-[13px] font-bold hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-2 shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  <span>Launch Quick Drill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
