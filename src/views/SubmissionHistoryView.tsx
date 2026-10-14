import React, { useState, useEffect } from 'react';
import { NavigationPath, Submission } from '../types';
import { api } from '../services/api';

interface SubmissionHistoryViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
  onSelectSubmission?: (submissionId: string) => void;
  searchFilter?: string;
}

export const SubmissionHistoryView: React.FC<SubmissionHistoryViewProps> = ({
  onNavigate,
  onSelectSubmission,
  searchFilter = '',
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [conceptFilter, setConceptFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(searchFilter);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (searchFilter) {
      setSearchQuery(searchFilter);
    }
  }, [searchFilter]);

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter, conceptFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.fetchSubmissions({
        status: statusFilter,
        concept: conceptFilter,
        q: searchQuery,
      });
      setSubmissions(res.submissions || []);
    } catch (e) {
      console.warn('Failed loading submissions from API, using fallback data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSubmissions();
  };

  const handleInspectAnalysis = (sub: Submission) => {
    if (onSelectSubmission) {
      onSelectSubmission(sub.id);
    }
    onNavigate('code-analysis', { submissionId: sub.id });
  };

  const handlePracticeAgain = (sub: Submission) => {
    onNavigate('code-practice', { problemSlug: sub.problem_slug || 'sum-even-numbers' });
  };

  // Metrics
  const totalSubmissions = submissions.length;
  const acceptedCount = submissions.filter((s) => s.status === 'Accepted').length;
  const needsImprovementCount = submissions.filter((s) => s.status === 'Needs Improvement').length;
  const errorCount = submissions.filter((s) => ['IndexError', 'RuntimeError', 'SyntaxError'].includes(s.status)).length;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;

  const filteredList = submissions.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (s.problem_title || '').toLowerCase().includes(q);
      const matchConcept = (s.detected_concept || '').toLowerCase().includes(q);
      const matchSummary = (s.result_summary || '').toLowerCase().includes(q);
      if (!matchTitle && !matchConcept && !matchSummary) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
              <span>Submission Telemetry Archive</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant font-medium">AST Audit Trail</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              Submission History & Run Telemetry
            </h1>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Complete historical record of student code runs, compiler outputs, AST error logs, and execution benchmarks.
            </p>
          </div>

          <button
            onClick={() => onNavigate('code-practice')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary-container transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>New Code Session</span>
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container shadow-xs">
            <span className="text-xs text-on-surface-variant font-semibold">Total Submissions</span>
            <div className="text-2xl font-bold font-mono text-on-surface mt-1">{totalSubmissions}</div>
            <span className="text-[11px] text-outline">Across 8 problems</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container shadow-xs">
            <span className="text-xs text-on-surface-variant font-semibold">Accepted Solutions</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{acceptedCount}</div>
            <span className="text-[11px] text-emerald-700 font-semibold">{acceptanceRate}% Acceptance</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container shadow-xs">
            <span className="text-xs text-on-surface-variant font-semibold">Needs Improvement</span>
            <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{needsImprovementCount}</div>
            <span className="text-[11px] text-amber-700">Suboptimal complexity</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container shadow-xs">
            <span className="text-xs text-on-surface-variant font-semibold">Runtime / Bounds Errors</span>
            <div className="text-2xl font-bold font-mono text-red-600 mt-1">{errorCount}</div>
            <span className="text-[11px] text-red-700">AST boundary flags</span>
          </div>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem, concept, or error class..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface placeholder:text-outline border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-on-surface-variant font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container-low border border-surface-container rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="All">All Statuses</option>
                <option value="Accepted">Accepted</option>
                <option value="Needs Improvement">Needs Improvement</option>
                <option value="IndexError">IndexError</option>
                <option value="RuntimeError">RuntimeError</option>
                <option value="SyntaxError">SyntaxError</option>
              </select>
            </div>

            {/* Concept Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-on-surface-variant font-medium">Concept:</span>
              <select
                value={conceptFilter}
                onChange={(e) => setConceptFilter(e.target.value)}
                className="bg-surface-container-low border border-surface-container rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="All">All Concepts</option>
                <option value="Loops & Iteration">Loops & Iteration</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Algorithmic Thinking">Algorithmic Thinking</option>
                <option value="Recursion">Recursion</option>
                <option value="Syntax & Fundamentals">Syntax & Fundamentals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[32px] text-secondary animate-spin">sync</span>
            <span className="text-xs text-on-surface-variant font-medium">Fetching telemetry database records...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-xl border border-surface-container text-center space-y-3">
            <span className="material-symbols-outlined text-outline text-[48px]">history_toggle_off</span>
            <h3 className="text-sm font-bold text-on-surface">No Submissions Found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              No submission records match your active filters. Try resetting the filters or submit new code in the practice workspace.
            </p>
            <button
              onClick={() => {
                setStatusFilter('All');
                setConceptFilter('All');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((sub) => {
              const isExpanded = expandedId === sub.id;
              const isAccepted = sub.status === 'Accepted';
              const isNeedsImp = sub.status === 'Needs Improvement';
              const isError = ['IndexError', 'RuntimeError', 'SyntaxError'].includes(sub.status);

              return (
                <div
                  key={sub.id}
                  className="bg-surface-container-lowest rounded-xl border border-surface-container hover:border-secondary/30 transition-all shadow-xs overflow-hidden"
                >
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Problem & Metadata */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-on-surface hover:text-primary transition-colors cursor-pointer" onClick={() => handleInspectAnalysis(sub)}>
                          {sub.problem_title || 'Coding Problem'}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isNeedsImp
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {isAccepted ? 'check_circle' : isNeedsImp ? 'warning' : 'error'}
                          </span>
                          <span>{sub.status}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]">
                          {sub.id}
                        </span>

                        <span className="text-xs text-on-surface-variant font-medium">
                          {sub.detected_concept}
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-1">
                        {sub.result_summary || 'Analysis completed with AST verification.'}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-outline font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {sub.execution_time_ms} ms
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">memory</span>
                          {sub.memory_mb} MB
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {sub.created_at || 'Recent'}
                        </span>
                        <span className="font-semibold text-primary">Score: {sub.score}/100</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
                      >
                        {isExpanded ? 'Hide Code' : 'View Code'}
                      </button>

                      <button
                        onClick={() => handleInspectAnalysis(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-container text-on-secondary-fixed text-xs font-bold hover:brightness-105 transition-colors shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">troubleshoot</span>
                        <span>AST Report</span>
                      </button>

                      <button
                        onClick={() => handlePracticeAgain(sub)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        title="Re-open in Practice Workspace"
                      >
                        <span className="material-symbols-outlined text-[18px]">replay</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Code View */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-surface-container bg-surface-container-low/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                          Python 3.10 Source Code Submission
                        </span>
                        <span className="text-[11px] text-outline font-mono">
                          Lines: {sub.code.split('\n').length}
                        </span>
                      </div>
                      <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                        {sub.code}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
