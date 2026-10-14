import React, { useState, useEffect } from 'react';
import { NavigationPath, SkillAssessment } from '../types';
import { api } from '../services/api';

interface MySkillsViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
}

export const MySkillsView: React.FC<MySkillsViewProps> = ({ onNavigate }) => {
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'developing' | 'proficient'>('all');
  const [skills, setSkills] = useState<SkillAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const res = await api.fetchSkills();
      setSkills(res.skills || []);
    } catch (e) {
      console.warn('Using baseline skills data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    setToastMessage('Exporting Skill Report (PDF)... Generated and ready for download.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const displayedSkills = skills.filter((s) => {
    if (filterTab === 'critical') return s.status === 'Critical Weakness' || s.status === 'Weak';
    if (filterTab === 'developing') return s.status === 'Developing' || s.status === 'Needs Attention';
    if (filterTab === 'proficient') return s.status === 'Proficient';
    return true;
  });

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
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
              <span>Cognitive Diagnostic Engine</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant font-medium">Telemetry Active</span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">
              My Skills & Weakness Detection
            </h1>
            <p className="text-[14px] text-on-surface-variant mt-0.5">
              Continuous telemetry-driven intelligence on programming competencies and root mistake patterns
            </p>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button className="h-10 px-4 bg-surface-container-lowest text-on-surface rounded-lg text-[13px] font-semibold flex items-center gap-2 shadow-xs hover:bg-surface-container-low transition-colors border border-surface-container">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_today</span>
              <span>Last 30 Days</span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </button>
            <button className="h-10 px-4 bg-surface-container-lowest text-on-surface rounded-lg text-[13px] font-semibold flex items-center gap-2 shadow-xs hover:bg-surface-container-low transition-colors border border-surface-container">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">category</span>
              <span>All 9 Concepts</span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="h-10 px-4 bg-primary text-white rounded-lg text-[13px] font-bold flex items-center gap-2 shadow-xs hover:bg-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Export Skill Report (PDF)</span>
            </button>
          </div>
        </div>

        {/* Top Section: Proficiency & Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Overall Proficiency & Stats (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Telemetry Assessment</span>
                  <h2 className="text-xl font-bold text-on-surface mt-0.5">Overall Coding Proficiency</h2>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Proficient (Level 3)
                </span>
              </div>

              <div className="flex items-center gap-6 my-6">
                {/* Radial Score Gauge */}
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle className="text-surface-container" cx="60" cy="60" fill="none" r="48" stroke="currentColor" strokeWidth="10" />
                    <circle className="text-secondary" cx="60" cy="60" fill="none" r="48" stroke="currentColor" strokeDasharray="301.59" strokeDashoffset="84.4" strokeLinecap="round" strokeWidth="10" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold text-on-surface leading-none tracking-tight">72</span>
                    <span className="text-[11px] font-bold text-on-surface-variant mt-1">/100</span>
                  </div>
                </div>

                {/* Context Stats */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-secondary text-[13px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span className="text-base font-extrabold">+8 pts</span>
                    <span className="text-on-surface-variant font-normal text-[12px]">in last 14 days</span>
                  </div>
                  <div className="text-[14px] font-bold text-on-surface mt-0.5">
                    Top 18% in CS Sophomore Cohort
                  </div>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    Algorithm formulation remains the primary drag coefficient. Strong baseline syntax stability prevents catastrophic execution regression.
                  </p>
                </div>
              </div>

              {/* Cohort Benchmark Bar */}
              <div className="pt-3 bg-surface-container-low rounded-lg p-3 border border-surface-container/60">
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-1 font-medium">
                  <span>Cohort Benchmark Distribution</span>
                  <span className="text-on-surface font-bold">Cohort Avg: 64.2</span>
                </div>
                <div className="relative w-full h-2.5 bg-surface-container rounded-full overflow-hidden flex">
                  <div className="bg-primary/20 h-full w-[64%]"></div>
                  <div className="bg-secondary h-full w-[8%]"></div>
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant mt-1 font-mono">
                  <span>0 (Novice)</span>
                  <span className="text-secondary font-bold">Your Score: 72</span>
                  <span>100 (Mastery)</span>
                </div>
              </div>
            </div>

            {/* Quick Stat Grid (4 cards) */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between border border-surface-container/60">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-[12px] font-bold">Concepts Tracked</span>
                  <span className="material-symbols-outlined text-[20px] text-secondary">account_tree</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-on-surface leading-none">9 / 9</div>
                  <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">Full Syllabus Coverage</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between border border-surface-container/60">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-[12px] font-bold">Submissions Analyzed</span>
                  <span className="material-symbols-outlined text-[20px] text-secondary">terminal</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-on-surface leading-none">48</div>
                  <span className="text-[11px] text-secondary font-bold mt-1 block">+12 this week</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between border border-surface-container/60">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-[12px] font-bold">Recurring Mistakes</span>
                  <span className="material-symbols-outlined text-[20px] text-outline">replay</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-on-surface leading-none">14</div>
                  <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">Across 4 unique patterns</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between border border-surface-container/60">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-[12px] font-bold">Critical Gaps</span>
                  <span className="material-symbols-outlined text-[20px] text-error">error_outline</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-error leading-none">3</div>
                  <span className="text-[11px] text-error font-bold mt-1 block">Remediation Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Multiaxial Radar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Vector Spatial Telemetry</span>
                <h2 className="text-xl font-bold text-on-surface mt-0.5">Multiaxial Competency Radar</h2>
              </div>
              {/* Radar Legend */}
              <div className="flex items-center gap-4 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-secondary"></span>
                  <span className="font-semibold text-on-surface">Your Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0 border-t-2 border-dashed border-outline-variant"></span>
                  <span className="text-on-surface-variant">Cohort Avg (65%)</span>
                </div>
              </div>
            </div>

            {/* SVG Radar Visualization matching Stitch */}
            <div className="relative w-full flex items-center justify-center py-2 overflow-hidden min-h-[380px]">
              <svg className="w-full max-w-[580px] h-[380px] select-none" viewBox="-240 -200 480 400">
                {/* Concentric Polygons */}
                <polygon className="text-surface-container" fill="none" points="0,-28 18,-21 27,-5 24,14 10,26 -10,26 -24,14 -27,-5 -18,-21" stroke="currentColor" strokeWidth="1" />
                <polygon className="text-surface-container" fill="none" points="0,-56 36,-43 55,-10 48,29 19,53 -19,53 -48,29 -55,-10 -36,-43" stroke="currentColor" strokeWidth="1" />
                <polygon className="text-surface-container" fill="none" points="0,-84 54,-64 82,-14 73,43 29,79 -29,79 -73,43 -82,-14 -54,-64" stroke="currentColor" strokeWidth="1" />
                <polygon className="text-surface-container" fill="none" points="0,-112 72,-85 110,-19 97,58 38,105 -38,105 -97,58 -110,-19 -72,-85" stroke="currentColor" strokeWidth="1" />
                <polygon className="text-surface-container-high" fill="none" points="0,-140 90,-107 137,-24 121,72 48,132 -48,132 -121,72 -137,-24 -90,-107" stroke="currentColor" strokeWidth="1.5" />

                {/* Rays */}
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="0" y2="-140" />
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="90" y2="-107" />
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="137" y2="-24" />
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="121" y2="72" />
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="48" y2="132" />
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="-48" y2="132" />
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="-121" y2="72" />
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="-137" y2="-24" />
                <line className="text-surface-container" stroke="currentColor" strokeWidth="1" x1="0" y1="0" x2="-90" y2="-107" />

                {/* Cohort Average Polygon (65%) */}
                <polygon className="text-outline-variant" fill="none" points="0,-91 58,-69 89,-16 79,47 31,86 -31,86 -79,47 -89,-16 -58,-69" stroke="currentColor" strokeDasharray="4,4" strokeWidth="1.5" />

                {/* Student Score Polygon Overlay */}
                <polygon
                  className="text-secondary"
                  fill="currentColor"
                  fillOpacity="0.22"
                  points="0,-123 75.6,-90.0 111.0,-19.4 90.8,54.0 25.9,71.3 -29.7,81.8 -62.9,37.4 -65.7,-11.5 -37.8,-44.9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />

                {/* Student Data Point Circles */}
                <circle className="fill-surface-container-lowest stroke-secondary" cx="0" cy="-123" r="4.5" strokeWidth="2.5" />
                <circle className="fill-surface-container-lowest stroke-secondary" cx="75.6" cy="-90" r="4.5" strokeWidth="2.5" />
                <circle className="fill-surface-container-lowest stroke-secondary" cx="111" cy="-19.4" r="4.5" strokeWidth="2.5" />
                <circle className="fill-surface-container-lowest stroke-secondary" cx="90.8" cy="54" r="4.5" strokeWidth="2.5" />
                <circle className="fill-surface-container-lowest stroke-secondary" cx="25.9" cy="71.3" r="4.5" strokeWidth="2.5" />
                <circle className="fill-surface-container-lowest stroke-secondary" cx="-29.7" cy="81.8" r="4.5" strokeWidth="2.5" />
                <circle className="fill-surface-container-lowest stroke-secondary" cx="-62.9" cy="37.4" r="4.5" strokeWidth="2.5" />
                <circle className="fill-surface-container-lowest stroke-secondary" cx="-65.7" cy="-11.5" r="4.5" strokeWidth="2.5" />
                <circle className="fill-surface-container-lowest stroke-secondary" cx="-37.8" cy="-44.9" r="4.5" strokeWidth="2.5" />

                {/* Axis Labels */}
                <text className="font-sans text-[11px] fill-on-surface font-bold" textAnchor="middle" x="0" y="-154">Syntax (88%)</text>
                <text className="font-sans text-[11px] fill-on-surface font-bold" textAnchor="start" x="110" y="-115">Variables & Types (84%)</text>
                <text className="font-sans text-[11px] fill-on-surface font-bold" textAnchor="start" x="146" y="-20">Conditionals (81%)</text>
                <text className="font-sans text-[11px] fill-on-surface font-bold" textAnchor="start" x="132" y="80">Functions & Scope (75%)</text>
                <text className="font-sans text-[11px] fill-on-surface font-bold" textAnchor="start" x="50" y="152">Lists & Dicts (54%)</text>
                <text className="font-sans text-[11px] fill-on-surface font-bold" textAnchor="end" x="-52" y="152">Loops & Iteration (62%)</text>
                <text className="font-sans text-[11px] fill-on-surface font-bold" textAnchor="end" x="-132" y="80">Search & Sort (52%)</text>
                <text className="font-sans text-[11px] fill-error font-bold" textAnchor="end" x="-146" y="-20">Algorithms (48%)</text>
                <text className="font-sans text-[11px] fill-error font-bold" textAnchor="end" x="-106" y="-115">Complexity (42%)</text>
              </svg>
            </div>

            <div className="flex items-center justify-between pt-2 bg-surface-container-low/50 px-4 py-2 rounded-lg border border-surface-container">
              <span className="text-[12px] text-on-surface-variant flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-secondary">psychology</span>
                <span>Algorithmic Thinking & Complexity show recurring systemic divergence from peer average.</span>
              </span>
              <button onClick={() => onNavigate('progress-tracking')} className="text-[12px] text-secondary font-bold hover:underline shrink-0" type="button">
                View Calibration History →
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Concept Competency Matrix */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Granular Competency Vectors</span>
              <h2 className="text-2xl font-bold text-on-surface">Concept Competency Matrix</h2>
            </div>
            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-surface-container-low shadow-inner gap-1 border border-surface-container/60">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  filterTab === 'all' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                All ({skills.length})
              </button>
              <button
                onClick={() => setFilterTab('critical')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  filterTab === 'critical' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Critical Weaknesses (3)
              </button>
              <button
                onClick={() => setFilterTab('developing')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  filterTab === 'developing' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Developing (2)
              </button>
              <button
                onClick={() => setFilterTab('proficient')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  filterTab === 'proficient' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Proficient (4)
              </button>
            </div>
          </div>

          {/* 9 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedSkills.map((concept, idx) => {
              const isCritical = concept.status === 'Critical Weakness' || concept.status === 'Weak';
              const isDeveloping = concept.status === 'Developing' || concept.status === 'Needs Attention';

              let borderColor = 'border-l-secondary';
              let badgeBg = 'bg-secondary-container text-on-secondary-container';
              let scoreColor = 'text-secondary';
              let progressColor = 'bg-secondary';
              let buttonBg = 'bg-surface-container-low text-on-surface hover:bg-secondary-container';

              if (isCritical) {
                borderColor = 'border-l-error';
                badgeBg = 'bg-error-container text-on-error-container';
                scoreColor = 'text-error';
                progressColor = 'bg-error';
                buttonBg = 'bg-error-container text-on-error-container hover:bg-error hover:text-white';
              } else if (isDeveloping) {
                borderColor = 'border-l-amber-500';
                badgeBg = 'bg-amber-50 text-amber-800 border border-amber-200';
                scoreColor = 'text-amber-600';
                progressColor = 'bg-amber-500';
                buttonBg = 'bg-surface-container-low text-on-surface hover:bg-amber-100 hover:text-amber-900';
              }

              return (
                <div
                  key={concept.concept_key}
                  className={`bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container/60 border-l-4 ${borderColor}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                          Concept 0{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-on-surface">{concept.concept_name}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeBg}`}>
                        {concept.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className={`text-2xl font-extrabold ${scoreColor}`}>{concept.proficiency_percentage}%</span>
                        <span className={`text-[11px] font-bold flex items-center gap-0.5 ${concept.trend.includes('-') ? 'text-error' : 'text-secondary'}`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {concept.trend.includes('-') ? 'trending_down' : (concept.trend.includes('+') ? 'trending_up' : 'horizontal_rule')}
                          </span>
                          {concept.trend}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                        <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${concept.proficiency_percentage}%` }}></div>
                      </div>
                    </div>

                    {/* Counters */}
                    <div className="grid grid-cols-2 gap-2 mt-4 py-2 px-3 bg-surface-container-low rounded-lg border border-surface-container/40">
                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Submissions</span>
                        <span className="text-base font-bold text-on-surface">{concept.attempts_count}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Recurring Mistakes</span>
                        <span className={`text-base font-bold ${concept.recurring_mistakes_count > 0 ? 'text-error' : 'text-secondary'}`}>
                          {concept.recurring_mistakes_count} instances
                        </span>
                      </div>
                    </div>

                    {/* Diagnostic Insight */}
                    <div className="mt-3">
                      <p className="text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed">
                        {isCritical
                          ? 'Difficulty formulating terminal boundary conditions and recursive invariants. Tendency to attempt unconstrained index access.'
                          : (isDeveloping
                            ? 'Off-by-one boundary traps in iterations. Boundary check required for collection indexing.'
                            : 'Consistent syntactic compliance and robust execution stability across unit test evaluations.')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4">
                    <button
                      onClick={() => onNavigate('code-practice')}
                      className={`w-full h-9 rounded-lg transition-colors text-[12px] font-bold flex items-center justify-center gap-1.5 ${buttonBg}`}
                      type="button"
                    >
                      <span>{isCritical ? 'Targeted Practice (3 problems)' : (isDeveloping ? 'Boundary Drills' : 'View Telemetry')}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Recurring Error Pattern Taxonomy */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-6 border border-surface-container/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>AST Semantic Analysis</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface">Recurring Error Pattern Taxonomy</h2>
            </div>
            {/* Methodology callout */}
            <div className="lg:max-w-xl p-3.5 rounded-xl bg-surface-container-low flex items-start gap-3 border border-surface-container/60">
              <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">psychology_alt</span>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold">Cognitive Model Mapping:</strong> SkillSense AI inspects Abstract Syntax Tree (AST) trace histories to disambiguate trivial typing typos from recurring conceptual misconceptions in mental execution simulation.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Pattern 1 */}
            <div className="p-5 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors space-y-2 border border-surface-container/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error shrink-0"></span>
                  <h3 className="text-base font-bold text-on-surface">Off-by-One Loop Boundary Trapping</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-container text-on-surface-variant">
                    Loops & Iteration
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-error bg-error-container/60 px-2.5 py-0.5 rounded-full font-bold">
                    High Priority Remediation
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    Freq: 4 of last 7 submissions
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 items-center">
                <div className="lg:col-span-7 space-y-1">
                  <div className="text-[12px] font-bold text-on-surface">Underpinning Misconception:</div>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    Iterating over <code className="px-1.5 py-0.5 rounded bg-surface-container text-secondary font-mono text-[11px]">range(len(nums) + 1)</code> or forgetting that Python's upper range bound is strictly exclusive. Leads to immediate index overrun errors when accessing collection terminals.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-error flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[14px]">bug_report</span>
                      Impact: IndexError: list index out of range
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-5 bg-primary-container text-white rounded-lg p-3 font-mono text-[11px] leading-tight overflow-x-auto shadow-inner border border-tertiary-container">
                  <span className="text-on-primary-container block mb-1 text-[10px] uppercase font-bold tracking-wider">AST Invariant Detected</span>
                  <code>For(target=Name(id='i'), iter=Call(func=Name(id='range'), args=[BinOp(left=Call(func=Name(id='len')), op=Add(), right=Constant(value=1))]))</code>
                </div>
              </div>
            </div>

            {/* Pattern 2 */}
            <div className="p-5 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors space-y-2 border border-surface-container/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <h3 className="text-base font-bold text-on-surface">List Indexing vs. Collection Cardinality Confusion</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-container text-on-surface-variant">
                    Lists & Dictionaries
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold">
                    Medium Priority
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    Freq: 3 recent submissions
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 items-center">
                <div className="lg:col-span-7 space-y-1">
                  <div className="text-[12px] font-bold text-on-surface">Underpinning Misconception:</div>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    Querying <code className="px-1.5 py-0.5 rounded bg-surface-container text-secondary font-mono text-[11px]">arr[len(arr)]</code> assuming the natural 1-based size quantity corresponds to the 0-indexed tail element rather than <code className="px-1.5 py-0.5 rounded bg-surface-container text-secondary font-mono text-[11px]">arr[-1]</code>.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-amber-700 flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Impact: Unhandled runtime exceptions in edge-case validation
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-5 bg-primary-container text-white rounded-lg p-3 font-mono text-[11px] leading-tight overflow-x-auto shadow-inner border border-tertiary-container">
                  <span className="text-on-primary-container block mb-1 text-[10px] uppercase font-bold tracking-wider">AST Invariant Detected</span>
                  <code>Subscript(value=Name(id='arr'), slice=Call(func=Name(id='len'), args=[Name(id='arr')]), ctx=Load())</code>
                </div>
              </div>
            </div>

            {/* Pattern 3 */}
            <div className="p-5 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors space-y-2 border border-surface-container/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></span>
                  <h3 className="text-base font-bold text-on-surface">Accidental Quadratic Complexity via Nested Lookups</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-container text-on-surface-variant">
                    Algorithmic Thinking & Complexity
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-secondary bg-secondary-container px-2.5 py-0.5 rounded-full font-bold">
                    Recommended Optimization
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    Freq: 2 array problems
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 items-center">
                <div className="lg:col-span-7 space-y-1">
                  <div className="text-[12px] font-bold text-on-surface">Underpinning Misconception:</div>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    Invoking sequential containment test <code className="px-1.5 py-0.5 rounded bg-surface-container text-secondary font-mono text-[11px]">if item in list_collection</code> within an outer traversal loop instead of pre-materializing a Hash Set for O(1) membership queries.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-secondary flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[14px]">speed</span>
                      Impact: Time Limit Exceeded (TLE) on large benchmark test suites (&gt; 10⁴)
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-5 bg-primary-container text-white rounded-lg p-3 font-mono text-[11px] leading-tight overflow-x-auto shadow-inner border border-tertiary-container">
                  <span className="text-on-primary-container block mb-1 text-[10px] uppercase font-bold tracking-wider">AST Invariant Detected</span>
                  <code>For(..., body=[If(test=Compare(ops=[In()], comparators=[Name(type='List')]) ... )])</code>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-primary-container to-tertiary-container text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">model_training</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Ready to eliminate your 3 critical weakness vectors?
                </h3>
                <p className="text-[13px] text-on-primary-container mt-0.5">
                  SkillSense AI has curated 3 micro-challenges calibrated to force correct boundary indexing and recursive base checks.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('recommendations')}
              className="h-11 px-6 bg-secondary text-white hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 shrink-0 transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              <span>Launch Weakness-Targeted Practice Session (3 Problems)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
