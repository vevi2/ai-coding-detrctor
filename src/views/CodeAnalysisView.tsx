import React, { useState, useEffect } from 'react';
import { NavigationPath, Submission } from '../types';
import { api } from '../services/api';

interface CodeAnalysisViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
  submissionId?: string;
}

export const CodeAnalysisView: React.FC<CodeAnalysisViewProps> = ({
  onNavigate,
  submissionId = 'sub-102',
}) => {
  const [activeTab, setActiveTab] = useState<'annotated' | 'diff' | 'ast'>('annotated');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissionData(submissionId);
  }, [submissionId]);

  const loadSubmissionData = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.fetchSubmissionDetail(id);
      setSubmission(res.submission);
      setAnalysis(res.analysis);
      setErrors(res.errors || []);
    } catch (e) {
      console.warn('Using baseline analysis data for sub-102');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-8 py-6 flex flex-col gap-6 max-w-[1560px] mx-auto w-full">
        {/* Top Telemetry & Status Banner */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-surface-container/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-2xl">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  {submission?.problem_title || 'Two Sum II - Input Array Is Sorted'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[15px] leading-none">warning</span>
                  Needs Improvement
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-mono text-[11px]">
                  #LeetCode-167
                </span>
              </div>

              <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-on-surface-variant text-[13px]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                  Submitted Yesterday, 8:40 PM
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[16px] text-outline">speed</span>
                  Runtime: 52 ms
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[16px] text-outline">memory</span>
                  Memory: 15.1 MB
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[16px] text-secondary">terminal</span>
                  Python 3.10 (CPython AST)
                </span>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2 self-start flex-wrap">
              <button
                onClick={() => setActiveTab('ast')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold transition-colors shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                <span>View AST Telemetry</span>
              </button>
              <button
                onClick={() => onNavigate('code-practice')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold transition-colors shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                <span>Re-run in Editor</span>
              </button>
              <button
                onClick={() => onNavigate('recommendations')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container text-white hover:bg-primary transition-colors text-[13px] font-bold shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">model_training</span>
                <span>Practice Similar (3)</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
            <div className="bg-surface-container-low rounded-lg p-4 flex items-center justify-between border border-surface-container/40">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Overall Score</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-primary">68</span>
                  <span className="text-[12px] text-outline font-medium">/100</span>
                  <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 text-[11px] font-bold">Grade B-</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[22px]">analytics</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-lg p-4 flex items-center justify-between border border-surface-container/40">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Diagnostics</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-error">3</span>
                  <span className="text-[12px] text-on-surface-variant font-medium">issues detected</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[22px]">rule</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-lg p-4 flex items-center justify-between border border-surface-container/40">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Time Complexity</span>
                <div className="flex items-baseline gap-1.5 mt-0.5 font-mono">
                  <span className="text-xl font-bold text-on-surface">O(N²)</span>
                  <span className="text-[11px] text-error font-bold">Expected O(N)</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[22px]">timer</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-lg p-4 flex items-center justify-between border border-surface-container/40">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Targeted Concept</span>
                <span className="text-[15px] font-bold text-on-surface mt-0.5">Two Pointers</span>
                <span className="text-[11px] text-secondary font-semibold">Zero-Based Bounds</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">hub</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 60/40 Two-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Annotated Code, Diff & AST */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col border border-surface-container">
              {/* Code Tab Switcher */}
              <div className="bg-primary-container px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-white">
                <div className="flex items-center gap-1 text-[12px] font-bold">
                  <button
                    onClick={() => setActiveTab('annotated')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      activeTab === 'annotated'
                        ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                        : 'text-primary-fixed-dim hover:text-white hover:bg-tertiary-container'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">bug_report</span>
                    <span>Annotated Code</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('diff')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      activeTab === 'diff'
                        ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                        : 'text-primary-fixed-dim hover:text-white hover:bg-tertiary-container'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">difference</span>
                    <span>Corrected Diff</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ast')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      activeTab === 'ast'
                        ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                        : 'text-primary-fixed-dim hover:text-white hover:bg-tertiary-container'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">data_object</span>
                    <span>AST Hierarchy</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-primary-fixed-dim">solution.py</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`for i in range(len(numbers) + 1):\n    ...`);
                    }}
                    className="p-1 rounded hover:bg-tertiary-container text-on-primary-container hover:text-white transition-colors"
                    title="Copy code"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Annotated Code View */}
              {activeTab === 'annotated' && (
                <div className="p-0 font-mono text-[13px] bg-[#0e1716] text-[#e0e6e5] overflow-x-auto">
                  <div className="py-3 text-[13px] leading-6 select-text min-w-[620px]">
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">1</span>
                      <span><span className="text-[#88d4c9]">from</span> typing <span className="text-[#88d4c9]">import</span> List</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">2</span>
                      <span></span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">3</span>
                      <span><span className="text-[#88d4c9]">class</span> <span className="text-[#fdd835]">Solution</span>:</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">4</span>
                      <span className="pl-4"><span className="text-[#88d4c9]">def</span> <span className="text-[#80cbc4]">twoSum</span>(self, numbers: List[<span className="text-[#4dd0e1]">int</span>], target: <span className="text-[#4dd0e1]">int</span>) -&gt; List[<span className="text-[#4dd0e1]">int</span>]:</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">5</span>
                      <span className="pl-8 text-[#546e7a]"># Search for two indices summing to target in sorted array</span>
                    </div>

                    {/* Problem Lines 6 - 8 (Off-by-one Error) */}
                    <div className="bg-red-950/40 border-l-4 border-l-red-500">
                      <div className="flex px-3">
                        <span className="w-8 text-right pr-4 text-red-300/60 select-none text-[12px]">6</span>
                        <span className="pl-8"><span className="text-[#88d4c9]">for</span> i <span className="text-[#88d4c9]">in</span> <span className="text-[#ffcb6b]">range</span>(<span className="text-[#ffcb6b]">len</span>(numbers) + <span className="text-[#f78c6c]">1</span>):</span>
                      </div>
                      <div className="flex px-3">
                        <span className="w-8 text-right pr-4 text-red-300/60 select-none text-[12px]">7</span>
                        <span className="pl-12">current = numbers[i]</span>
                      </div>
                      <div className="flex px-3">
                        <span className="w-8 text-right pr-4 text-red-300/60 select-none text-[12px]">8</span>
                        <span className="pl-12">needed = target - current</span>
                      </div>

                      {/* Diagnostic Callout */}
                      <div className="mx-8 my-2 p-3 rounded-lg bg-surface-container-lowest text-on-surface shadow-md border-l-4 border-l-error">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">error</span>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-error uppercase">Critical Off-By-One Boundary</span>
                              <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-mono font-semibold">IndexError</span>
                            </div>
                            <p className="text-[12px] text-on-surface-variant font-sans">
                              <code className="text-error bg-surface-container px-1 py-0.5 rounded font-mono text-[11px]">range(len(numbers) + 1)</code> evaluates up to index <code className="font-mono text-[11px] text-on-surface">len(numbers)</code>. On iteration <code className="font-mono text-[11px] text-on-surface">i = len(numbers)</code>, evaluating <code className="font-mono text-[11px] text-on-surface">numbers[i]</code> throws <span className="font-bold text-error">IndexError: list index out of range</span>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">9</span>
                      <span className="pl-12 text-[#546e7a]"># Linear scan check across remainder</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">10</span>
                      <span className="pl-12"><span className="text-[#88d4c9]">for</span> j <span className="text-[#88d4c9]">in</span> <span className="text-[#ffcb6b]">range</span>(i + <span className="text-[#f78c6c]">1</span>, <span className="text-[#ffcb6b]">len</span>(numbers)):</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">11</span>
                      <span className="pl-16"><span className="text-[#88d4c9]">if</span> numbers[j] == needed:</span>
                    </div>

                    {/* Problem Line 12 (Suboptimal Complexity) */}
                    <div className="bg-cyan-950/40 border-l-4 border-l-secondary-fixed">
                      <div className="flex px-3">
                        <span className="w-8 text-right pr-4 text-cyan-200/60 select-none text-[12px]">12</span>
                        <span className="pl-20"><span className="text-[#88d4c9]">return</span> [i + <span className="text-[#f78c6c]">1</span>, j + <span className="text-[#f78c6c]">1</span>]</span>
                      </div>
                      <div className="mx-8 my-2 p-3 rounded-lg bg-surface-container-lowest text-on-surface shadow-md border-l-4 border-l-secondary">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">info</span>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-bold text-secondary uppercase">Suboptimal Complexity Detection</span>
                            <p className="text-[12px] text-on-surface-variant font-sans">
                              Array is pre-sorted in non-decreasing order. Nested iteration produces <code className="font-mono text-[11px] text-on-surface">O(N²)</code> runtime. A Two-Pointer approach achieves <code className="font-mono text-[11px] text-secondary font-bold">O(N)</code> runtime with <code className="font-mono text-[11px] text-secondary font-bold">O(1)</code> auxiliary space.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">13</span>
                      <span className="pl-8"></span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">14</span>
                      <span className="pl-8"><span className="text-[#88d4c9]">return</span> []</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">15</span>
                      <span></span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">16</span>
                      <span className="text-[#546e7a]"># Automated Test Case Execution:</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">17</span>
                      <span className="text-[#546e7a]"># Test 1: numbers=[2,7,11,15], target=9 -&gt; Passed [1,2]</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">18</span>
                      <span className="text-[#546e7a]"># Test 2: numbers=[2,3,4], target=6 -&gt; Passed [1,3]</span>
                    </div>
                    <div className="flex hover:bg-white/[0.03] px-3">
                      <span className="w-8 text-right pr-4 text-[#4a5e5b] select-none text-[12px]">19</span>
                      <span className="text-[#ff5370]"># Test 4: numbers=[-1, 0], target=5 -&gt; FAILED: IndexError at line 7</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Corrected Diff View */}
              {activeTab === 'diff' && (
                <div className="p-0 font-mono text-[13px] bg-[#0e1716] text-[#e0e6e5] overflow-x-auto">
                  <div className="py-3 text-[13px] leading-6 min-w-[620px]">
                    <div className="px-6 py-1 bg-surface-container-high/10 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                      Two-Pointer Algorithm Replacement (Recommended)
                    </div>
                    <div className="flex px-3 bg-red-950/30 text-red-300">
                      <span className="w-8 text-right pr-4 text-red-500/60 select-none">-</span>
                      <span><span className="text-[#88d4c9]">for</span> i <span className="text-[#88d4c9]">in</span> <span className="text-[#ffcb6b]">range</span>(<span className="text-[#ffcb6b]">len</span>(numbers) + <span className="text-[#f78c6c]">1</span>):</span>
                    </div>
                    <div className="flex px-3 bg-red-950/30 text-red-300">
                      <span className="w-8 text-right pr-4 text-red-500/60 select-none">-</span>
                      <span className="pl-4"><span className="text-[#88d4c9]">for</span> j <span className="text-[#88d4c9]">in</span> <span className="text-[#ffcb6b]">range</span>(i + <span className="text-[#f78c6c]">1</span>, <span className="text-[#ffcb6b]">len</span>(numbers)): ...</span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span>left, right = <span className="text-[#f78c6c]">0</span>, <span className="text-[#ffcb6b]">len</span>(numbers) - <span className="text-[#f78c6c]">1</span></span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span><span className="text-[#88d4c9]">while</span> left &lt; right:</span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span className="pl-4">current_sum = numbers[left] + numbers[right]</span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span className="pl-4"><span className="text-[#88d4c9]">if</span> current_sum == target:</span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span className="pl-8"><span className="text-[#88d4c9]">return</span> [left + <span className="text-[#f78c6c]">1</span>, right + <span className="text-[#f78c6c]">1</span>]</span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span className="pl-4"><span className="text-[#88d4c9]">elif</span> current_sum &lt; target:</span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span className="pl-8">left += <span className="text-[#f78c6c]">1</span></span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span className="pl-4"><span className="text-[#88d4c9]">else</span>:</span>
                    </div>
                    <div className="flex px-3 bg-emerald-950/40 text-emerald-300">
                      <span className="w-8 text-right pr-4 text-emerald-500/60 select-none">+</span>
                      <span className="pl-8">right -= <span className="text-[#f78c6c]">1</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: AST View */}
              {activeTab === 'ast' && (
                <div className="p-4 font-mono text-[12px] bg-[#0e1716] text-[#b0bec5] overflow-x-auto">
                  <div className="p-3 rounded bg-black/40 text-secondary-fixed font-mono text-[11px] leading-relaxed">
                    FunctionDef(name='twoSum')<br />
                    &nbsp;&nbsp;└── body[0]: For(<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;target=Name(id='i', ctx=Store()),<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;iter=Call(<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;func=Name(id='range'),<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;args=[<span className="text-error font-bold">BinOp(left=Call(func=Name(id='len'), args=[Name(id='numbers')]), op=Add(), right=Constant(value=1))</span>]<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
                  </div>
                </div>
              )}
            </div>

            {/* Time Complexity Benchmark Widget */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-2 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-on-surface">Time Complexity Benchmark</span>
                  <span className="text-[13px] text-on-surface-variant font-medium">Current approach vs Optimal Two-Pointer partition</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                  Optimization Potential: 94% faster
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 border border-surface-container/40">
                  <div className="flex justify-between items-center text-[12px] font-bold">
                    <span className="text-on-surface-variant">Submitted Nested Loops</span>
                    <span className="font-mono text-error">O(N²) • 52ms</span>
                  </div>
                  <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
                    <div className="bg-error h-full rounded-full w-[82%]"></div>
                  </div>
                  <span className="text-[11px] text-outline">Performs up to 45,000 index comparisons on N=300</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 border border-surface-container/40">
                  <div className="flex justify-between items-center text-[12px] font-bold">
                    <span className="text-on-surface-variant">Two Pointers (Optimal)</span>
                    <span className="font-mono text-secondary">O(N) • 3ms</span>
                  </div>
                  <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full w-[12%]"></div>
                  </div>
                  <span className="text-[11px] text-outline">At most 300 evaluations with monotonic narrowing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): AI Analysis Summary & Root-Cause */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Master AI Diagnostic Summary */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border-l-4 border-l-secondary border border-surface-container/60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-on-surface">AI Diagnostic Summary</span>
                    <span className="text-[11px] text-secondary font-semibold">SkillSense Telemetry Engine</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
                  High Severity
                </span>
              </div>

              <p className="text-[13px] text-on-surface leading-relaxed">
                Your loop traverses <strong className="text-error font-bold">1 step beyond</strong> the valid boundary of the <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-[12px]">numbers</code> array. Python arrays use 0-based indexing: a list of size <code className="font-mono text-[12px]">N</code> has valid indexes strictly from <code className="font-mono text-[12px]">0</code> to <code className="font-mono text-[12px]">N - 1</code>.
              </p>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-container-low text-[12px]">
                <div>
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase block">Error Class</span>
                  <span className="font-bold text-on-surface">Runtime Exception</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase block">Concept Trap</span>
                  <span className="font-bold text-on-surface">Loop Invariant / Bounds</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase block">Failing Case</span>
                  <span className="font-bold text-error">Case 4 (Size 2 Arrays)</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase block">Recovery Path</span>
                  <span className="font-bold text-secondary">Two-Pointer Invariant</span>
                </div>
              </div>

              {/* AST Invariant Box */}
              <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-surface-container font-mono text-[11px] text-on-surface-variant">
                <span className="text-[11px] font-bold text-on-surface flex items-center gap-1 font-sans">
                  <span className="material-symbols-outlined text-[16px] text-secondary">terminal</span>
                  AST Invariant Node Extraction
                </span>
                <div className="bg-surface-container-lowest p-2 rounded text-primary text-[11px] overflow-x-auto leading-relaxed border border-surface-container">
                  <code>For.iter -&gt; Call(func=Name('range'), args=[BinOp(left=Call(func=Name('len')), op=Add(), right=Constant(1))])</code>
                </div>
              </div>

              {/* Recommended Module */}
              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between gap-3 border border-surface-container/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-secondary text-[24px] shrink-0">menu_book</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-bold text-on-surface truncate">Loop Boundary Invariants & Zero-Indexing</span>
                    <span className="text-[11px] text-on-surface-variant">SkillSense Interactive Module • 8 min read</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('ai-feedback')}
                  className="shrink-0 p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>
            </div>

            {/* Issue 1: Critical Off-By-One */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2 border border-surface-container/60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-error-container text-error flex items-center justify-center font-bold text-[12px]">1</span>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-on-surface">Off-by-One Array Boundary (Confirmed)</span>
                    <span className="text-[11px] font-semibold text-error">Line 6 • Blocking Test Execution</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-error text-[20px]">error_outline</span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                You used <code className="font-mono text-[11px] text-on-surface bg-surface-container-low px-1 rounded">range(len(numbers) + 1)</code>. Because <code className="font-mono text-[11px] text-on-surface bg-surface-container-low px-1 rounded">range(N)</code> already iterates from <code className="font-mono text-[11px] text-on-surface">0</code> to <code className="font-mono text-[11px] text-on-surface">N - 1</code>, adding <code className="font-mono text-[11px] text-on-surface">+ 1</code> forces an extra iteration with <code className="font-mono text-[11px] text-on-surface">i = N</code>.
              </p>

              <details className="group rounded-lg bg-surface-container-low p-2.5 cursor-pointer">
                <summary className="flex items-center justify-between text-[12px] text-primary font-bold select-none">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    Cognitive Root Cause: Why did this happen?
                  </span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div className="pt-2 text-[12px] text-on-surface-variant leading-relaxed">
                  <p>Common mental slip: Confusing the <strong>count of elements</strong> (cardinality) with the <strong>final valid index</strong> (ordinal boundary). In Python, <code className="font-mono text-[11px] text-on-surface">range(k)</code> terminates exclusively at <code className="font-mono text-[11px] text-on-surface">k - 1</code>, which naturally matches 0-indexed boundaries without offsetting.</p>
                </div>
              </details>
            </div>

            {/* Issue 2: Algorithmic Complexity */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2 border border-surface-container/60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-[12px]">2</span>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-on-surface">O(N²) Complexity on Pre-Sorted Data</span>
                    <span className="text-[11px] font-semibold text-amber-700">Line 10-12 • Suboptimal Algorithm</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-amber-600 text-[20px]">speed</span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                By running a nested linear loop, you miss out on the sorted precondition. When an array is sorted, comparing elements from opposing ends allows narrowing the search space in <strong className="text-on-surface">O(1)</strong> decisions per step.
              </p>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-secondary">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>Switch to Two Pointers gives 3ms runtime on 100k elements</span>
              </div>
            </div>

            {/* Issue 3: Unidiomatic Traversal */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2 border border-surface-container/60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-[12px]">3</span>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-on-surface">Unidiomatic Index-Only Traversal</span>
                    <span className="text-[11px] font-semibold text-outline">Line 6 • Code Style & Maintainability</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[20px]">style</span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                Using <code className="font-mono text-[11px] text-on-surface bg-surface-container-low px-1 rounded">range(len(numbers))</code> followed by <code className="font-mono text-[11px] text-on-surface bg-surface-container-low px-1 rounded">numbers[i]</code> is considered anti-idiomatic in Python. When index and value are both needed, prefer <code className="font-mono text-[11px] text-secondary font-bold">enumerate(numbers)</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Targeted Remediation Action Banner */}
        <div className="bg-primary-container rounded-xl p-6 shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">Launch Targeted Remediation: 3 Boundary Problems</span>
              <span className="text-[13px] text-primary-fixed-dim">
                Curated exercises to permanently eliminate off-by-one errors and master Two-Pointer binary invariants.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              onClick={() => onNavigate('code-practice')}
              className="px-5 py-2.5 rounded-lg bg-surface-container-lowest text-primary font-bold text-[13px] hover:bg-secondary-container transition-colors shadow-sm"
              type="button"
            >
              Start Focused Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
