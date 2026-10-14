import React, { useState, useEffect } from 'react';
import { NavigationPath, FeedbackData } from '../types';
import { api } from '../services/api';

interface AIFeedbackViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
}

export const AIFeedbackView: React.FC<AIFeedbackViewProps> = ({ onNavigate }) => {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState('Loops & Iteration');
  const [quizSelected, setQuizSelected] = useState<number>(2);
  const [understood, setUnderstood] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [selectedConcept]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.fetchFeedback();
      setFeedback(res.feedback);
    } catch (e) {
      console.warn('Using baseline feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    setToastMessage('Exporting Feedback Summary (PDF)... Download ready.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2.5 rounded-lg bg-primary-container text-white text-sm font-semibold shadow-lg border border-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="px-8 py-6 flex flex-col gap-6 max-w-[1560px] mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold tracking-wider uppercase">
                Tutor Intelligence Engine
              </span>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-1.5 text-[11px] text-secondary font-bold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Active Learning Session
              </span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">
              AI Feedback & Conceptual Guidance
            </h1>
            <p className="text-[14px] text-on-surface-variant max-w-3xl">
              Personalized pedagogical explanations diagnosing recurring mental models, code misconceptions, and step-by-step remediation tailored to your recent telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setToastMessage('Session log recorded: 4 diagnostic telemetry events logged.');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="h-10 px-4 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-[13px] font-semibold transition-colors flex items-center gap-2 shadow-xs border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
              <span>Session Log</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="h-10 px-4 rounded-lg bg-primary-container text-white hover:bg-secondary text-[13px] font-bold transition-colors flex items-center gap-2 shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Export Feedback Summary (PDF)</span>
            </button>
          </div>
        </div>

        {/* Filter & Segment Bar */}
        <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex flex-wrap items-center justify-between gap-4 border border-surface-container/60">
          <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-bold">
            <span className="text-[11px] text-on-surface-variant uppercase px-2">Concept:</span>
            {['All', 'Loops & Iteration', 'Data Structures', 'Algorithmic Thinking'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedConcept(c)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedConcept === c
                    ? 'bg-primary-container text-white shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
                type="button"
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[12px] font-bold">
            <span className="text-[11px] text-on-surface-variant uppercase px-2">Severity:</span>
            <button className="px-2.5 py-1 rounded-md text-on-surface-variant hover:bg-surface-container-low" type="button">All</button>
            <button className="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-fixed font-bold shadow-xs" type="button">High Priority</button>
            <button className="px-2.5 py-1 rounded-md text-on-surface-variant hover:bg-surface-container-low" type="button">Emerging Patterns</button>
          </div>
        </div>

        {/* AI Persona Top Diagnostic Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-primary to-primary-container text-white p-6 shadow-md border border-tertiary-container">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-secondary/15 blur-2xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[26px]">psychology</span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-secondary-fixed flex items-center justify-center text-[10px] text-on-secondary-fixed font-bold">✓</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-white">SkillSense Socratic Tutor</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary-fixed text-[11px] font-semibold tracking-wide">
                    Active Diagnostic Feedback
                  </span>
                </div>
                <p className="text-[14px] text-on-primary-container max-w-4xl leading-relaxed">
                  Hello Alex! Over your last 7 submissions, I observed a repeating cognitive trap with loop boundaries and collection length. Rather than just giving you the code solution, let's deconstruct why this occurs and lock in the invariant permanently.
                </p>
              </div>
            </div>

            {/* Telemetry Profile Pill */}
            <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 p-3 rounded-lg bg-surface-container-lowest/10 backdrop-blur-sm border border-white/10">
              <span className="text-[11px] text-secondary-fixed font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
                Telemetry Profile
              </span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-[13px] text-white font-bold">4 of 7 runs</div>
                  <div className="text-[11px] text-on-primary-container">Recurrence: 57%</div>
                </div>
                <span className="px-2 py-1 rounded bg-error-container text-on-error-container text-[11px] font-bold uppercase">
                  IndexError
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): 5-Step Pedagogical Architecture */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-6 border border-surface-container/60">
              {/* Module Title */}
              <div className="flex flex-col gap-1 pb-3 border-b border-surface-container">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold">
                    Loops & Iteration
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
                    High Priority Exception
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium">
                    Cognitive Misconception
                  </span>
                  <span className="text-[11px] text-outline ml-auto font-mono">Diagnostic ID: #AI-TRAP-204</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface pt-1">
                  Deconstructing Off-by-One Loop Invariants & 0-Indexed Boundaries
                </h2>
                <p className="text-[13px] text-on-surface-variant">
                  Targeted cognitive remediation for submissions on <span className="font-mono font-semibold text-primary">Two Sum II</span>, <span className="font-mono font-semibold text-primary">Sum of Even Numbers</span>, and <span className="font-mono font-semibold text-primary">Array Reversal</span>.
                </p>
              </div>

              {/* 5-Step Architecture */}
              <div className="flex flex-col gap-6">
                {/* Step 1: Plain English Diagnosis */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[14px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[15px] font-bold text-on-surface">What Went Wrong (Plain English Diagnosis)</span>
                    <div className="p-4 rounded-lg bg-surface-container-low text-on-surface flex flex-col gap-2 border border-surface-container/60">
                      <p className="text-[13px] leading-relaxed">
                        In your recent attempts (such as <span className="font-mono font-bold">Two Sum II</span> and <span className="font-mono font-bold">Sum of Even Numbers</span>), you wrote <span className="font-mono bg-surface-container-high px-1.5 py-0.5 rounded text-error font-semibold">range(len(numbers) + 1)</span> or indexed <span className="font-mono bg-surface-container-high px-1.5 py-0.5 rounded text-error font-semibold">arr[len(arr)]</span>.
                      </p>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">
                        Python arrays and lists strictly use <strong>0-based indexing</strong>: an array of size <span className="font-mono font-bold">N</span> has valid positions from <span className="font-mono font-bold">0</span> to <span className="font-mono font-bold">N - 1</span>. When iterating up to <span className="font-mono">len(numbers) + 1</span>, the loop executes <span className="font-mono">N + 1</span> iterations, attempting to read memory address <span className="font-mono text-error font-semibold">numbers[N]</span> which triggers a fatal <span className="font-mono font-bold text-error">IndexError: list index out of range</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2: Why It Happens */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[14px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[15px] font-bold text-on-surface">Why It Happens (The Underlying Misconception)</span>
                    <p className="text-[13px] text-on-surface-variant">
                      This stems from conflating <em>cardinal counting</em> (human natural numbers: 1, 2, 3...) with <em>zero-based pointer offsets</em> (distance from start of memory block).
                    </p>

                    {/* Array Tape Diagram */}
                    <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs flex flex-col gap-3 border border-surface-container">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-on-surface uppercase tracking-wider">Memory Cell Offset vs Natural Counting</span>
                        <span className="font-mono text-on-surface-variant">Collection: items = ["a", "b", "c", "d", "e"] (len = 5)</span>
                      </div>

                      <div className="grid grid-cols-6 gap-2 text-center pt-1">
                        {[
                          { human: '1st', val: "'a'", idx: 0, offset: '+0', last: false, err: false },
                          { human: '2nd', val: "'b'", idx: 1, offset: '+1', last: false, err: false },
                          { human: '3rd', val: "'c'", idx: 2, offset: '+2', last: false, err: false },
                          { human: '4th', val: "'d'", idx: 3, offset: '+3', last: false, err: false },
                          { human: '5th', val: "'e'", idx: 4, offset: 'N - 1', last: true, err: false },
                          { human: 'Non-existent', val: 'Ø Nil', idx: 5, offset: 'IndexError!', last: false, err: true },
                        ].map((cell) => (
                          <div key={cell.idx} className="flex flex-col items-center">
                            <span className={`text-[10px] mb-1 font-semibold ${cell.err ? 'text-error font-bold' : 'text-on-surface-variant'}`}>{cell.human}</span>
                            <div className={`w-full py-2.5 rounded-lg font-mono text-[12px] font-bold shadow-xs ${
                              cell.err
                                ? 'bg-error-container/40 text-error border border-error/30'
                                : (cell.last ? 'bg-secondary-container text-on-secondary-fixed ring-2 ring-secondary' : 'bg-secondary-container/60 text-on-secondary-fixed')
                            }`}>
                              {cell.val}
                            </div>
                            <span className={`font-mono text-[11px] font-bold mt-1 ${cell.err ? 'text-error' : (cell.last ? 'text-secondary' : 'text-primary')}`}>
                              idx: {cell.idx}
                            </span>
                            <span className={`text-[10px] ${cell.err ? 'text-error font-bold' : 'text-outline'}`}>
                              {cell.offset}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* AST Note */}
                      <div className="p-3 rounded-lg bg-surface-container flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">terminal</span>
                        <p className="text-[12px] text-on-surface leading-relaxed">
                          <strong>Python AST Invariant:</strong> The statement <span className="font-mono font-bold">range(0, N)</span> creates a half-open interval <span className="font-mono font-bold">[0, N)</span>. It automatically visits exactly <span className="font-mono font-bold">N</span> items: <span className="font-mono font-bold">0, 1, ..., N-1</span>. Adding <span className="font-mono font-bold text-error">+ 1</span> forces evaluation at <span className="font-mono font-bold text-error">N</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Rules of Thumb */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[14px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[15px] font-bold text-on-surface">How to Improve (Mental Rules of Thumb)</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 rounded-lg bg-surface-container-low flex flex-col gap-1.5 shadow-xs border border-surface-container/60">
                        <div className="flex items-center gap-1.5 text-secondary">
                          <span className="material-symbols-outlined text-[18px]">rule</span>
                          <span className="text-[12px] font-bold">Rule 1: Direct Iteration</span>
                        </div>
                        <p className="text-[12px] text-on-surface-variant">
                          If you only need element values without modifying indices, use direct traversal:
                        </p>
                        <code className="font-mono text-[11px] bg-surface-container p-1.5 rounded text-on-surface font-semibold">
                          for item in items:
                        </code>
                      </div>

                      <div className="p-4 rounded-lg bg-surface-container-low flex flex-col gap-1.5 shadow-xs border border-surface-container/60">
                        <div className="flex items-center gap-1.5 text-secondary">
                          <span className="material-symbols-outlined text-[18px]">counter_1</span>
                          <span className="text-[12px] font-bold">Rule 2: Enumerate</span>
                        </div>
                        <p className="text-[12px] text-on-surface-variant">
                          When both index and value are required, let Python manage safe bounds:
                        </p>
                        <code className="font-mono text-[11px] bg-surface-container p-1.5 rounded text-on-surface font-semibold">
                          for i, item in enumerate(items):
                        </code>
                      </div>

                      <div className="p-4 rounded-lg bg-surface-container-low flex flex-col gap-1.5 shadow-xs border border-surface-container/60">
                        <div className="flex items-center gap-1.5 text-secondary">
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                          <span className="text-[12px] font-bold">Rule 3: Trust len()</span>
                        </div>
                        <p className="text-[12px] text-on-surface-variant">
                          <span className="font-mono">range(len(items))</span> stops exactly at index <span className="font-mono">len - 1</span>. Never add + 1.
                        </p>
                        <code className="font-mono text-[11px] bg-surface-container p-1.5 rounded text-on-surface font-semibold">
                          for i in range(len(items)):
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Side-by-Side Code Example */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[14px] shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[15px] font-bold text-on-surface">Side-by-Side Code Example: Flawed Pattern vs Pythonic Invariant</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Flawed */}
                      <div className="rounded-xl bg-primary-container text-white p-4 shadow-sm flex flex-col gap-2 border border-tertiary-container">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-[11px] text-error-container flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                            Flawed: Boundary Overstep
                          </span>
                          <span className="font-mono text-[11px] text-on-primary-container">Python 3</span>
                        </div>
                        <pre className="font-mono text-[12px] leading-relaxed text-surface-container-highest overflow-x-auto p-3 rounded-lg bg-tertiary-container">
                          <code>
{`# Alex's Submission Pattern
def compute_sum(nums):
    total = 0
    # Danger: range(len(nums) + 1)
    for i in range(len(nums) + 1):
        total += nums[i]  # IndexError!
    return total

# nums[5] on 5 elements crashes`}
                          </code>
                        </pre>
                        <div className="text-[11px] text-error-container mt-1 flex items-start gap-1">
                          <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">warning</span>
                          <span>Executes 6 cycles for 5 items, failing on the terminal iteration.</span>
                        </div>
                      </div>

                      {/* Right: Pythonic Invariant */}
                      <div className="rounded-xl bg-surface-container-low text-on-surface p-4 shadow-sm flex flex-col gap-2 border border-surface-container/60">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-[11px] text-secondary flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Pythonic & Bounds-Safe
                          </span>
                          <span className="font-mono text-[11px] text-on-surface-variant font-medium">Recommended</span>
                        </div>
                        <pre className="font-mono text-[12px] leading-relaxed text-on-surface overflow-x-auto p-3 rounded-lg bg-surface-container-lowest shadow-inner border border-surface-container">
                          <code>
{`# Clean Canonical Approach
def compute_sum(nums):
    total = 0
    # Python manages collection bounds
    for val in nums:
        total += val
    return total

# Alternatively: return sum(nums)`}
                          </code>
                        </pre>
                        <div className="text-[11px] text-secondary mt-1 flex items-start gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">verified</span>
                          <span>Completely immune to off-by-one errors; optimal bytecode traversal.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 5: Interactive Socratic Knowledge Check */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[14px] shrink-0 mt-0.5">
                    5
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[15px] font-bold text-on-surface">Check Your Understanding (Interactive Socratic Knowledge Check)</span>
                    <div className="p-5 rounded-xl bg-surface-container-low flex flex-col gap-4 shadow-sm border border-surface-container/60">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">Concept Verification</span>
                          <h3 className="text-[14px] font-bold text-on-surface">
                            Given <code className="font-mono bg-surface-container-lowest px-1.5 py-0.5 rounded text-primary">data = ['a', 'b', 'c']</code>, which statement traverses all elements without raising an IndexError?
                          </h3>
                        </div>
                        <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-fixed text-[11px] font-bold shrink-0">
                          1 Question
                        </span>
                      </div>

                      {/* Options */}
                      <div className="flex flex-col gap-2">
                        {[
                          { idx: 0, text: 'for i in range(1, len(data) + 1): print(data[i])', hint: 'Attempts data[3]! IndexError' },
                          { idx: 1, text: 'for i in range(len(data)): print(data[i])', hint: 'Valid 0-indexed, but unidiomatic index lookup' },
                          { idx: 2, text: 'for item in data: print(item)', hint: 'Optimal & Idiomatic!' },
                        ].map((opt) => (
                          <label
                            key={opt.idx}
                            onClick={() => setQuizSelected(opt.idx)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors shadow-xs border ${
                              quizSelected === opt.idx
                                ? (opt.idx === 2 ? 'bg-secondary-container/30 border-secondary' : 'bg-red-50 border-error')
                                : 'bg-surface-container-lowest hover:bg-surface-container border-surface-container'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="socratic_check"
                                checked={quizSelected === opt.idx}
                                onChange={() => setQuizSelected(opt.idx)}
                                className="w-4 h-4 text-secondary accent-secondary"
                              />
                              <span className="font-mono text-[12px] text-on-surface font-semibold">{opt.text}</span>
                            </div>
                            <span className={`text-[11px] font-bold ${opt.idx === 2 ? 'text-secondary' : 'text-error'}`}>
                              {opt.hint}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Instant Confirmation */}
                      {quizSelected === 2 && (
                        <div className="p-3 rounded-lg bg-secondary-container/40 text-on-secondary-fixed flex items-start gap-2.5 border border-secondary/30">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">sentiment_very_satisfied</span>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-bold">Spot on!</span>
                            <p className="text-[12px] text-on-surface-variant">
                              Direct iteration eliminates index book-keeping entirely, removing any possibility of boundary violation.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-container">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-on-surface-variant font-medium">Targeted drills ready:</span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container-low font-mono text-[11px] text-on-surface">Reverse Vowels</span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container-low font-mono text-[11px] text-on-surface">Rotate Array</span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container-low font-mono text-[11px] text-on-surface">Remove Duplicates</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setUnderstood(true);
                      setToastMessage('Concept marked as understood! Progress recorded.');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="h-10 px-4 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-[13px] font-bold transition-colors flex items-center gap-2 border border-surface-container"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                    <span>{understood ? 'Understood ✓' : 'Mark as Understood'}</span>
                  </button>
                  <button
                    onClick={() => onNavigate('code-practice')}
                    className="h-10 px-5 rounded-lg bg-secondary text-white hover:bg-secondary/90 text-[13px] font-bold transition-colors flex items-center gap-2 shadow-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    <span>Practice 3 Targeted Problems</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sidebar Context & Concept Queue */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Concept Queue */}
            <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-on-surface">Concept Queue</span>
                  <span className="text-[11px] text-on-surface-variant">Diagnosed patterns in Alex's submissions</span>
                </div>
                <span className="material-symbols-outlined text-outline text-[20px]">queue_music</span>
              </div>

              <div className="flex flex-col gap-2">
                {/* Active */}
                <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 shadow-xs border border-secondary/30">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold">
                      Currently Viewing
                    </span>
                    <span className="text-[11px] text-error font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      High Severity
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold text-on-surface pt-0.5">
                    Loop Boundary Traversal & 0-Indexing
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>Loops & Iteration</span>
                    <span className="font-mono font-bold text-secondary">4 instances</span>
                  </div>
                </div>

                {/* Queue Item 2 */}
                <div className="p-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex flex-col gap-1 border border-surface-container/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant">Lists & Dictionaries</span>
                    <span className="text-[11px] text-secondary font-bold">Medium Severity</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-on-surface">
                    Collection Cardinality vs Key Lookups
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>3 instances detected</span>
                    <button onClick={() => setSelectedConcept('Data Structures')} className="text-secondary hover:underline font-bold flex items-center gap-0.5">
                      <span>View Feedback</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Queue Item 3 */}
                <div className="p-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex flex-col gap-1 border border-surface-container/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant">Algorithmic Thinking</span>
                    <span className="text-[11px] text-error font-bold">High Severity</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-on-surface">
                    Premature Recursion Termination
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>2 instances detected</span>
                    <button onClick={() => setSelectedConcept('Algorithmic Thinking')} className="text-secondary hover:underline font-bold flex items-center gap-0.5">
                      <span>View Feedback</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Concept Retention Meter */}
            <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-on-surface">Concept Retention Meter</span>
                <span className="material-symbols-outlined text-secondary text-[20px]">donut_large</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-container-low border border-surface-container/40">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                    <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="64, 100" strokeLinecap="round" strokeWidth="3.5" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-[13px] font-bold text-on-surface">64%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-on-surface">Boundary Invariants</span>
                    <span className="text-[11px] text-secondary font-bold">+14%</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-snug">
                    3 consecutive clean submissions needed to graduate this concept to <strong>Proficient</strong>.
                  </p>
                </div>
              </div>

              {/* Progression Milestones */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[11px]">✓</div>
                  <span className="text-[10px] text-on-surface-variant">Diagnostics</span>
                </div>
                <div className="flex-1 h-0.5 bg-secondary-container mx-1"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-[11px]">2</div>
                  <span className="text-[10px] text-secondary font-bold">Review</span>
                </div>
                <div className="flex-1 h-0.5 bg-surface-container mx-1"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-bold text-[11px]">3</div>
                  <span className="text-[10px] text-on-surface-variant">Practice (0/3)</span>
                </div>
              </div>
            </div>

            {/* Socratic Note Card */}
            <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-2 border border-surface-container/60">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                <span className="text-[14px] font-bold text-on-surface">Socratic Note</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5 border border-surface-container/40">
                <p className="text-[12px] text-on-surface leading-relaxed">
                  <strong>Did you know?</strong> In mathematics and computer science, Python's <code className="font-mono font-bold">range(start, stop)</code> represents a <em>half-open interval</em>:
                </p>
                <div className="font-mono text-[11px] bg-surface-container p-2 rounded text-center text-primary font-bold">
                  [start, stop) = {'{ x | start ≤ x < stop }'}
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  It always includes <code className="font-mono">start</code>, but strictly excludes <code className="font-mono">stop</code>!
                </p>
              </div>
              <button
                onClick={() => {
                  setToastMessage('Interactive Primer on Intervals opened.');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-secondary border border-surface-container/40"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  <span className="text-[12px] font-bold">Interactive Primer on Intervals</span>
                </div>
                <span className="text-[11px] text-on-surface-variant">4 min read</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
