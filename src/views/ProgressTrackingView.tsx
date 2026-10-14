import React, { useState, useEffect } from 'react';
import { NavigationPath } from '../types';
import { api } from '../services/api';

interface ProgressTrackingViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
}

export const ProgressTrackingView: React.FC<ProgressTrackingViewProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'14d' | '30d' | '90d'>('30d');
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await api.fetchProgress();
      setProgressData(res);
    } catch (e) {
      console.warn('Error loading progress, using fallback');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setToastMessage('Exporting Progress & Learning Velocity Report (PDF)... Ready!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const velocityPoints = [
    { date: 'Oct 01', score: 58, problems: 6, accuracy: 62, milestone: 'Started Array Fundamentals' },
    { date: 'Oct 03', score: 61, problems: 9, accuracy: 65, milestone: null },
    { date: 'Oct 06', score: 64, problems: 14, accuracy: 68, milestone: 'First 5-Day Streak' },
    { date: 'Oct 09', score: 66, problems: 18, accuracy: 70, milestone: 'Completed Socratic Loop Practice' },
    { date: 'Oct 11', score: 69, problems: 21, accuracy: 73, milestone: null },
    { date: 'Oct 13', score: 71, problems: 23, accuracy: 74, milestone: 'Index Bounds Rule Mastered' },
    { date: 'Oct 14', score: 72, problems: 24, accuracy: 76, milestone: 'Current Milestone (Top 22% Cohort)' },
  ];

  const comparativeGains = [
    {
      concept: 'Loop Boundaries & Off-by-One',
      beforeAccuracy: 42,
      afterAccuracy: 88,
      delta: '+46%',
      status: 'High Impact',
      note: 'Switched from index iteration to enumerate() and idiomatic range()',
    },
    {
      concept: 'Array & List Indexing Bounds',
      beforeAccuracy: 50,
      afterAccuracy: 78,
      delta: '+28%',
      status: 'Improved',
      note: 'Zero IndexError crashes in last 8 submissions',
    },
    {
      concept: 'Time Complexity Optimization',
      beforeAccuracy: 33,
      afterAccuracy: 65,
      delta: '+32%',
      status: 'In Progress',
      note: 'Replaced nested O(n²) lookups with hash set O(1) lookups',
    },
    {
      concept: 'Recursive Base Cases',
      beforeAccuracy: 60,
      afterAccuracy: 75,
      delta: '+15%',
      status: 'Steady',
      note: 'Explicit empty-node guard clauses added',
    },
  ];

  const badges = [
    { id: 'streak-7', title: '7-Day Momentum', desc: 'Practiced consecutive days without skipping', icon: 'local_fire_department', earned: true, date: 'Oct 14' },
    { id: 'bounds-zero', title: 'Zero IndexError', desc: '5 consecutive solutions without index crash', icon: 'shield_check', earned: true, date: 'Oct 13' },
    { id: 'socratic-mind', title: 'Socratic Thinker', desc: 'Answered 5 self-reflection prompts correctly', icon: 'psychology', earned: true, date: 'Oct 10' },
    { id: 'algo-optimizer', title: 'O(n) Strategist', desc: 'Optimized quadratic loop to linear hash map', icon: 'speed', earned: true, date: 'Oct 08' },
    { id: 'recursion-master', title: 'Recursion Guardian', desc: 'Guard against maximum recursion depth', icon: 'account_tree', earned: false, date: 'Pending' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2.5 rounded-lg bg-primary-container text-white text-sm font-semibold shadow-lg border border-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary-fixed">download</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="px-8 py-6 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Top Header & Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
              <span>Learning Velocity Engine</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant font-medium">Cognitive Progression</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              Progress Tracking & Learning Curve
            </h1>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Monitor your skill score acceleration, recurring error decline, and cognitive gains before and after targeted recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex p-1 bg-surface-container rounded-lg border border-outline-variant/30 text-xs font-semibold">
              {(['14d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    timeRange === r ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold shadow-xs border border-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">picture_as_pdf</span>
              <span>Export Velocity PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-on-surface-variant">Overall Skill Score</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+14 pts (30d)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface font-mono">72</span>
              <span className="text-xs text-on-surface-variant">/ 100</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-on-surface-variant">AST Error Reduction</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">-68% recurrence</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface font-mono">3.4x</span>
              <span className="text-xs text-on-surface-variant">fewer bug crashes</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-3">From 4.2 errors/attempt down to 1.1</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-on-surface-variant">Active Practice Streak</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🔥 Top 10%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface font-mono">6</span>
              <span className="text-xs text-on-surface-variant">consecutive days</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-3">Personal best: 9 days</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-on-surface-variant">Cohort Benchmark</span>
              <span className="text-xs font-bold text-secondary-container text-on-secondary-fixed px-2 py-0.5 rounded-full">78th Percentile</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface font-mono">+8.4</span>
              <span className="text-xs text-on-surface-variant">pts above cohort avg (63.6)</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-3">CS Sophomore 2026 Batch</p>
          </div>
        </div>

        {/* Visual Growth Trajectory Graph */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Skill Score & Accuracy Trajectory</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Composite evaluation score combining syntax accuracy, boundary robustness, and algorithmic time complexity.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-primary"></span>
                <span className="text-on-surface">Skill Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-secondary"></span>
                <span className="text-on-surface">Accuracy %</span>
              </div>
            </div>
          </div>

          {/* Trajectory Bars with Interactive Milestones */}
          <div className="grid grid-cols-7 gap-3 pt-6 pb-2 items-end min-h-[220px]">
            {velocityPoints.map((pt, idx) => {
              const isSelected = selectedMilestone === idx;
              return (
                <div
                  key={pt.date}
                  onClick={() => setSelectedMilestone(isSelected ? null : idx)}
                  className={`flex flex-col items-center gap-2 cursor-pointer group p-2 rounded-lg transition-all ${
                    isSelected ? 'bg-surface-container' : 'hover:bg-surface-container-low'
                  }`}
                >
                  {pt.milestone && (
                    <span className="material-symbols-outlined text-[16px] text-secondary animate-bounce">
                      flag
                    </span>
                  )}
                  <div className="flex items-end gap-1.5 w-full justify-center h-36">
                    {/* Score Bar */}
                    <div
                      className="w-4 rounded-t bg-primary group-hover:bg-primary-container transition-all"
                      style={{ height: `${(pt.score / 100) * 100}%` }}
                      title={`Score: ${pt.score}`}
                    ></div>
                    {/* Accuracy Bar */}
                    <div
                      className="w-4 rounded-t bg-secondary group-hover:bg-secondary-fixed transition-all"
                      style={{ height: `${(pt.accuracy / 100) * 100}%` }}
                      title={`Accuracy: ${pt.accuracy}%`}
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-on-surface-variant font-mono">{pt.date}</span>
                  <span className="text-[10px] text-on-surface font-bold">{pt.score} pts</span>
                </div>
              );
            })}
          </div>

          {/* Active Milestone Card */}
          {selectedMilestone !== null && velocityPoints[selectedMilestone]?.milestone && (
            <div className="p-3.5 bg-surface-container-low rounded-lg border border-secondary/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">emoji_events</span>
                <div>
                  <span className="font-bold text-on-surface">{velocityPoints[selectedMilestone].date}: </span>
                  <span className="text-on-surface-variant">{velocityPoints[selectedMilestone].milestone}</span>
                </div>
              </div>
              <span className="font-mono font-bold text-primary">{velocityPoints[selectedMilestone].problems} problems solved</span>
            </div>
          )}
        </div>

        {/* Comparative Gains: Before vs After Recommendations */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Comparative Mastery Before vs. After Recommendations</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Quantified concept retention following targeted practice problems recommended by the telemetry engine.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-fixed">
              Validated Telemetry
            </span>
          </div>

          <div className="divide-y divide-surface-container">
            {comparativeGains.map((gain) => (
              <div key={gain.concept} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface">{gain.concept}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
                      {gain.delta}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{gain.note}</p>
                </div>

                <div className="flex items-center gap-6 min-w-[320px]">
                  {/* Before */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-on-surface-variant">
                      <span>Pre-Recommendation</span>
                      <span className="font-mono">{gain.beforeAccuracy}%</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-red-400 h-full rounded-full" style={{ width: `${gain.beforeAccuracy}%` }}></div>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-outline text-[18px]">trending_flat</span>

                  {/* After */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-on-surface">
                      <span>Post-Recommendation</span>
                      <span className="font-mono text-emerald-600">{gain.afterAccuracy}%</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${gain.afterAccuracy}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Badges & Achievements */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-on-surface">Milestones & Competency Badges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                  b.earned
                    ? 'bg-surface-container-low/50 border-secondary/30 shadow-2xs'
                    : 'bg-surface-container-lowest border-surface-container opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    b.earned ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container text-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{b.icon}</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-on-surface">{b.title}</h3>
                    {b.earned && (
                      <span className="text-[10px] font-semibold text-secondary px-1.5 py-0.2 rounded bg-secondary-fixed/30">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{b.desc}</p>
                  <span className="text-[10px] text-outline font-mono block pt-1">{b.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
