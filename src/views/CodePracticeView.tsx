import React, { useState, useEffect, useRef } from 'react';
import { NavigationPath, Problem, TestCaseResult } from '../types';
import { api } from '../services/api';

interface CodePracticeViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
  initialProblemSlug?: string;
}

export const CodePracticeView: React.FC<CodePracticeViewProps> = ({
  onNavigate,
  initialProblemSlug,
}) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'ai'>('tests');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [testStatus, setTestStatus] = useState<string>('All Tests Passed!');
  const [isPassed, setIsPassed] = useState<boolean>(true);
  const [runtimeMs, setRuntimeMs] = useState<number>(38);
  const [memoryMb, setMemoryMb] = useState<number>(14.2);
  const [codeStyleGrade, setCodeStyleGrade] = useState<string>('B+');
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [astNote, setAstNote] = useState<string>(
    'You used index-based iteration for i in range(len(numbers)):. In idiomatic Python, direct iterator traversal for num in numbers: avoids index lookups and bounds risks.'
  );
  const [cursorPos, setCursorPos] = useState({ line: 8, col: 21 });
  const [timerSeconds, setTimerSeconds] = useState(522);
  const [markComplete, setMarkComplete] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const defaultBoilerplate = `def sum_even_numbers(numbers: list[int]) -> int:
    # Initialize accumulator
    total_sum = 0
    
    # Iterate through each element in the input list
    for i in range(len(numbers)):
        if numbers[i] % 2 == 0:
            total_sum += numbers[i]
            
    return total_sum
`;

  useEffect(() => {
    loadProblem();
  }, [initialProblemSlug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadProblem = async () => {
    try {
      const res = await api.fetchProblems();
      const selected =
        res.problems.find((p) => p.slug === initialProblemSlug) ||
        res.problems.find((p) => p.id === 'prob-even-sum') ||
        res.problems[0];

      if (selected) {
        setProblem(selected);
        setCode(selected.starter_code || defaultBoilerplate);
      }
    } catch (e) {
      setCode(defaultBoilerplate);
    }
  };

  // Initial unit test mock runs
  useEffect(() => {
    setTestResults([
      { case_num: 1, input: '[1, 2, 3, 4, 5, 6]', expected: 12, output: 12, passed: true, runtime_ms: 12 },
      { case_num: 2, input: '[1, 3, 5]', expected: 0, output: 0, passed: true, runtime_ms: 8 },
      { case_num: 3, input: '[]', expected: 0, output: 0, passed: true, runtime_ms: 9 },
      { case_num: 4, input: '[-2, 4, -6, 7]', expected: -4, output: -4, passed: true, runtime_ms: 11 },
    ]);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setActiveTab('tests');
      const res = await api.submitCode({
        code,
        problem_id: problem?.id || 'prob-even-sum',
        language: 'python3',
      });

      if (res.execution) {
        setTestResults(res.execution.test_cases || []);
        setIsPassed(res.execution.all_passed);
        setTestStatus(res.execution.all_passed ? 'All Tests Passed!' : res.execution.status || 'Tests Failed');
        setRuntimeMs(res.execution.runtime_ms || 35);
        setMemoryMb(res.execution.memory_mb || 14.2);
        setConsoleOutput(res.execution.stderr || `Execution finished in ${res.execution.runtime_ms} ms. All assertions validated.`);
      }

      if (res.analysis) {
        setCodeStyleGrade(res.analysis.code_style_grade || 'B+');
        if (res.analysis.issues && res.analysis.issues.length > 0) {
          setAstNote(res.analysis.issues[0].explanation);
        } else {
          setAstNote('AST verified clean Pythonic grammar and O(N) linear time complexity.');
        }
      }
    } catch (err: any) {
      setConsoleOutput(`Execution error: ${err.message}`);
      setTestStatus('Execution Error');
      setIsPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.submitCode({
        code,
        problem_id: problem?.id || 'prob-even-sum',
        language: 'python3',
      });

      setNotification('Solution submitted & analyzed via Python AST engine!');
      setTimeout(() => setNotification(null), 3000);

      if (res.submission_id) {
        onNavigate('code-analysis', { submissionId: res.submission_id });
      }
    } catch (err: any) {
      setNotification(`Submission failed: ${err.message}`);
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    const textUpToCursor = e.target.value.substring(0, e.target.selectionStart);
    const lines = textUpToCursor.split('\n');
    setCursorPos({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification('Copied input sample to clipboard!');
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2.5 rounded-lg bg-primary-container text-white text-sm font-semibold shadow-lg border border-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary-fixed">check_circle</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Sub-header Context Bar */}
      <div className="h-12 bg-surface-container-lowest px-6 flex items-center justify-between shrink-0 shadow-xs z-10 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            <span>Practice Session #402</span>
          </div>
          <span className="text-outline-variant font-mono text-[12px]">/</span>
          <span className="text-[13px] text-on-surface font-semibold">Algorithmic Foundations</span>
          <span className="text-outline-variant font-mono text-[12px]">/</span>
          <span className="text-[13px] text-on-surface-variant">{problem?.title || 'Find the Sum of Even Numbers'}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface text-[12px] font-medium">
            <span className="material-symbols-outlined text-secondary text-[16px]">radar</span>
            <span>Related to your gap: <strong className="text-secondary font-bold">Loop Boundary Traversal</strong></span>
          </div>
          <div className="h-4 w-px bg-outline-variant/40"></div>
          <div className="flex items-center gap-1.5 font-mono text-[12px] text-on-surface-variant font-semibold">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>{formatTimer(timerSeconds)}</span>
          </div>
          <button
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Workspace Settings"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>

      {/* Main Three-Panel Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: Problem Details (34% width) */}
        <section className="w-[34%] bg-surface-container-lowest flex flex-col h-full overflow-hidden shadow-xs z-10 border-r border-surface-container">
          <div className="px-6 py-2.5 bg-surface-container-low flex items-center justify-between shrink-0 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">description</span>
              <span className="text-[13px] text-on-surface font-bold tracking-tight">Problem Details</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {problem?.difficulty || 'Easy'}
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors">
                <input
                  checked={markComplete}
                  onChange={(e) => setMarkComplete(e.target.checked)}
                  className="w-4 h-4 rounded text-secondary focus:ring-secondary/30 accent-secondary"
                  type="checkbox"
                />
                <span className="text-[12px] font-medium">Mark Complete</span>
              </label>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 text-[13px] text-on-surface">
            {/* Title & Taxonomy */}
            <div>
              <h1 className="text-xl font-bold text-on-surface mb-2">{problem?.title || 'Find the Sum of Even Numbers'}</h1>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-semibold">
                  {problem?.concept || 'Loops & Iteration'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium">
                  Modulo Arithmetic
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium">
                  Range Slicing
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">psychology</span> AI Diagnostic Active
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 leading-relaxed">
              <h2 className="text-[11px] font-bold text-outline uppercase tracking-wider">Description</h2>
              <p className="text-[14px] text-on-surface leading-relaxed">
                Write a function <code className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-secondary font-semibold">sum_even_numbers(numbers: list[int]) -&gt; int</code> that accepts a list of integers and calculates the cumulative sum of all even numbers present.
              </p>
              <p className="text-[14px] text-on-surface leading-relaxed">
                If the list contains no even numbers or is entirely empty, your function must return <code className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-secondary font-bold">0</code>.
              </p>
            </div>

            {/* Specifications Card */}
            <div className="p-4 rounded-xl bg-surface-container-low space-y-2 border border-surface-container/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">input</span>
                <h3 className="text-[13px] font-bold text-on-surface">Specifications</h3>
              </div>
              <ul className="space-y-1.5 text-[12px] text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                  <span><strong className="text-on-surface">Input:</strong> A list of integers <code className="font-mono text-on-surface">numbers</code> where <span className="font-mono">0 ≤ len(numbers) ≤ 10⁴</span>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                  <span><strong className="text-on-surface">Output:</strong> A single integer value representing the cumulative sum.</span>
                </li>
              </ul>
            </div>

            {/* Sample Examples */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-bold text-outline uppercase tracking-wider">Sample Examples</h2>
                <span className="text-[11px] text-on-surface-variant font-medium">Click to copy input</span>
              </div>

              {/* Example 1 */}
              <div
                onClick={() => copyToClipboard('[1, 2, 3, 4, 5, 6]')}
                className="group p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container/80"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-primary">Example 1</span>
                  <span className="material-symbols-outlined text-[15px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                    content_copy
                  </span>
                </div>
                <div className="font-mono text-[12px] space-y-0.5 text-on-surface">
                  <div><span className="text-on-surface-variant font-medium">Input:</span> numbers = [1, 2, 3, 4, 5, 6]</div>
                  <div><span className="text-on-surface-variant font-medium">Output:</span> <span className="text-secondary font-bold">12</span></div>
                  <div className="text-[11px] text-on-surface-variant pt-0.5 italic">Explanation: The even values are 2, 4, and 6. Cumulative sum: 2 + 4 + 6 = 12.</div>
                </div>
              </div>

              {/* Example 2 */}
              <div
                onClick={() => copyToClipboard('[1, 3, 5]')}
                className="group p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container/80"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-primary">Example 2</span>
                  <span className="material-symbols-outlined text-[15px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                    content_copy
                  </span>
                </div>
                <div className="font-mono text-[12px] space-y-0.5 text-on-surface">
                  <div><span className="text-on-surface-variant font-medium">Input:</span> numbers = [1, 3, 5]</div>
                  <div><span className="text-on-surface-variant font-medium">Output:</span> <span className="text-secondary font-bold">0</span></div>
                  <div className="text-[11px] text-on-surface-variant pt-0.5 italic">Explanation: No even numbers present, returns fallback 0.</div>
                </div>
              </div>

              {/* Example 3 */}
              <div
                onClick={() => copyToClipboard('[-2, 4, -6, 7]')}
                className="group p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container/80"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-primary">Example 3</span>
                  <span className="material-symbols-outlined text-[15px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                    content_copy
                  </span>
                </div>
                <div className="font-mono text-[12px] space-y-0.5 text-on-surface">
                  <div><span className="text-on-surface-variant font-medium">Input:</span> numbers = [-2, 4, -6, 7]</div>
                  <div><span className="text-on-surface-variant font-medium">Output:</span> <span className="text-secondary font-bold">-4</span></div>
                  <div className="text-[11px] text-on-surface-variant pt-0.5 italic">Explanation: Negative evens are included: (-2) + 4 + (-6) = -4.</div>
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-xs space-y-1.5 border border-surface-container">
              <h3 className="text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-outline">verified</span> Constraints
              </h3>
              <ul className="font-mono text-[11px] text-on-surface-variant space-y-1 pl-4 list-disc marker:text-secondary">
                <li><code className="text-on-surface">0 ≤ len(numbers) ≤ 10,000</code></li>
                <li><code className="text-on-surface">-10⁵ ≤ numbers[i] ≤ 10⁵</code></li>
                <li>Time complexity requirement: <code className="text-secondary font-bold">O(N)</code></li>
                <li>Auxiliary space requirement: <code className="text-secondary font-bold">O(1)</code></li>
              </ul>
            </div>
          </div>
        </section>

        {/* PANEL 2: Python Code Editor (41% width) */}
        <section className="w-[41%] bg-[#1E1E2E] flex flex-col h-full relative z-20 shadow-md">
          {/* Editor Toolbar */}
          <div className="h-12 bg-[#181825] px-4 flex items-center justify-between shrink-0 border-b border-[#252538]">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2 text-[#89B4FA] text-[16px]">data_object</span>
                <select className="h-8 pl-7 pr-7 rounded bg-[#252538] text-[#CDD6F4] font-mono text-[12px] focus:outline-none focus:ring-1 focus:ring-[#89B4FA] appearance-none cursor-pointer">
                  <option value="python310">Python 3.10</option>
                  <option value="python311">Python 3.11</option>
                  <option value="pypy3">PyPy 3.9</option>
                </select>
                <span className="material-symbols-outlined absolute right-1.5 text-[#6C7086] text-[16px] pointer-events-none">expand_more</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#252538] text-[#A6ADC8] font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#A6E3A1]"></span>
                <span>Autosaved</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCode(defaultBoilerplate)}
                className="flex items-center gap-1 h-8 px-2.5 rounded bg-[#252538] text-[#BAC2DE] hover:bg-[#313244] hover:text-[#CDD6F4] transition-colors text-[12px] font-medium"
                title="Reset solution to boilerplate"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span>Reset</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-1.5 h-8 px-3 rounded bg-[#313244] text-[#CDD6F4] hover:bg-[#45475A] transition-colors text-[12px] font-semibold"
                title="Run Unit Tests (Cmd+Enter)"
                type="button"
              >
                <span className={`material-symbols-outlined text-[16px] text-[#89B4FA] ${isRunning ? 'animate-spin' : ''}`}>
                  {isRunning ? 'sync' : 'play_arrow'}
                </span>
                <span>{isRunning ? 'Testing...' : 'Run'}</span>
                <span className="px-1 py-0.2 rounded bg-[#181825] text-[#9399B2] font-mono text-[10px]">⌘⏎</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 h-8 px-4 rounded bg-[#4E9B91] hover:bg-[#42867D] text-white text-[12px] font-bold transition-all shadow-xs active:scale-95"
                title="Submit Solution for Full Diagnostics"
                type="button"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSubmitting ? 'animate-spin' : ''}`}>
                  {isSubmitting ? 'sync' : 'cloud_upload'}
                </span>
                <span>{isSubmitting ? 'Analyzing...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Editor Canvas */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Line Numbers */}
            <div className="w-12 bg-[#181825] py-4 select-none text-right pr-3 font-mono text-[12px] text-[#585B70] leading-6 shrink-0 border-r border-[#252538]">
              {Array.from({ length: Math.max(24, code.split('\n').length) }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            {/* Live Textarea Code Editor */}
            <div className="flex-1 relative overflow-auto font-mono text-[13px] leading-6">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="w-full h-full p-4 bg-[#1E1E2E] text-[#CDD6F4] font-mono text-[13px] leading-6 outline-none resize-none overflow-auto selection:bg-[#45475A]/60"
              />
            </div>
          </div>

          {/* Editor Bottom Bar */}
          <div className="h-8 bg-[#181825] px-4 flex items-center justify-between text-[#6C7086] font-mono text-[11px] shrink-0 border-t border-[#252538]">
            <div className="flex items-center gap-4">
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span>Spaces: 4</span>
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-2 text-[#A6ADC8]">
              <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-[#252538] text-[10px]">Tab</kbd> indent</span>
              <span className="text-[#45475A]">•</span>
              <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-[#252538] text-[10px]">⌘</kbd> + <kbd className="px-1 rounded bg-[#252538] text-[10px]">Enter</kbd> to run</span>
            </div>
          </div>
        </section>

        {/* PANEL 3: Execution Results & AI Diagnostic Panel (25% width) */}
        <section className="w-[25%] bg-surface-container-lowest flex flex-col h-full overflow-hidden shadow-xs z-10 border-l border-surface-container">
          {/* Tab Header */}
          <div className="h-12 bg-surface-container-low px-2 flex items-center justify-between shrink-0 border-b border-surface-container">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'tests'
                    ? 'bg-surface-container-lowest text-secondary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                <span>Test Cases</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {testResults.filter((r) => r.passed).length}/{testResults.length || 4}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  activeTab === 'console'
                    ? 'bg-surface-container-lowest text-secondary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
                type="button"
              >
                <span>Console</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-surface-container-lowest text-secondary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-secondary text-[14px]">auto_awesome</span>
                <span>AI Quick</span>
              </button>
            </div>
            <button
              onClick={() => onNavigate('code-analysis')}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface"
              title="Expand into In-Depth Analysis"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_full</span>
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'tests' && (
              <>
                {/* Status Banner */}
                <div className={`p-3.5 rounded-xl flex items-start gap-3 ${isPassed ? 'bg-emerald-50 text-emerald-950' : 'bg-red-50 text-red-950'}`}>
                  <div className={`p-1.5 rounded-lg shrink-0 ${isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-error'}`}>
                    <span className="material-symbols-outlined text-[20px]">{isPassed ? 'check_circle' : 'cancel'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-bold ${isPassed ? 'text-emerald-900' : 'text-error'}`}>
                        {testStatus}
                      </span>
                      <span className={`font-mono text-[11px] font-bold ${isPassed ? 'text-emerald-700' : 'text-error'}`}>
                        {isPassed ? '100% Correct' : 'Needs Fix'}
                      </span>
                    </div>
                    <p className={`text-[12px] mt-0.5 ${isPassed ? 'text-emerald-800' : 'text-red-900'}`}>
                      {isPassed
                        ? `Simulated submission passed across ${testResults.length || 4} base and edge test cases.`
                        : 'Encountered assertion or boundary error on test evaluation.'}
                    </p>
                  </div>
                </div>

                {/* Telemetry Metric Bar */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-container-low text-center border border-surface-container">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-on-surface-variant">Runtime</span>
                    <span className="font-mono text-[14px] font-bold text-on-surface">{runtimeMs} ms</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Faster than 76%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-on-surface-variant">Memory</span>
                    <span className="font-mono text-[14px] font-bold text-on-surface">{memoryMb} MB</span>
                    <span className="text-[10px] text-secondary font-semibold">Beats 84%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-on-surface-variant">Code Style</span>
                    <span className="font-mono text-[14px] font-bold text-on-surface">{codeStyleGrade}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">AST Evaluated</span>
                  </div>
                </div>

                {/* Unit Test Runs */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Unit Test Runs</span>
                  {testResults.map((tc) => (
                    <div
                      key={tc.case_num}
                      className="p-2.5 rounded-lg bg-surface-container text-on-surface space-y-1.5 border border-surface-container/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-[16px] ${tc.passed ? 'text-emerald-600' : 'text-error'}`}>
                            {tc.passed ? 'check' : 'close'}
                          </span>
                          <span className="text-[12px] font-bold">Case {tc.case_num}</span>
                          <span className="font-mono text-[11px] text-on-surface-variant truncate max-w-[120px]">{tc.input}</span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-700 font-medium">{tc.runtime_ms}ms</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-surface-container-lowest p-2 rounded">
                        <div><span className="text-outline">Expected:</span> <span className="font-semibold text-on-surface">{String(tc.expected)}</span></div>
                        <div><span className="text-outline">Output:</span> <span className={tc.passed ? 'text-emerald-700 font-semibold' : 'text-error font-semibold'}>{tc.error || String(tc.output)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AST Analyzer Note */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#F7FBF9] to-surface-container-lowest shadow-xs space-y-2.5 border border-secondary/20">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span className="text-[12px] font-bold uppercase tracking-wider">AST Analyzer Note</span>
                  </div>
                  <p className="text-[12px] text-on-surface leading-relaxed">{astNote}</p>

                  <button
                    onClick={() => onNavigate('code-analysis')}
                    className="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-[#224F4C] text-white text-center text-[12px] font-bold transition-all shadow-xs"
                    type="button"
                  >
                    View In-Depth AST Code Analysis →
                  </button>

                  <button
                    onClick={() => onNavigate('recommendations')}
                    className="w-full py-2 px-3 rounded-lg bg-transparent hover:bg-surface-container text-secondary text-center text-[11px] font-semibold transition-colors"
                    type="button"
                  >
                    Practice Next: Find Even Numbers in 2D Matrix
                  </button>
                </div>
              </>
            )}

            {activeTab === 'console' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-bold uppercase">
                  <span>Standard Output / Stderr</span>
                  <button onClick={() => setConsoleOutput('')} className="text-secondary hover:underline">Clear</button>
                </div>
                <pre className="p-3 bg-surface-container text-on-surface font-mono text-[11px] rounded-lg leading-relaxed whitespace-pre-wrap overflow-x-auto min-h-[220px]">
                  {consoleOutput || 'Ready for test execution. Click "Run" or press Cmd+Enter.'}
                </pre>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-secondary-container/40 text-on-secondary-container text-[12px] leading-relaxed">
                  <div className="flex items-center gap-1 font-bold text-secondary mb-1">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    <span>Socratic Live Guidance</span>
                  </div>
                  Notice how Python handles range boundaries. The expression <code>range(len(numbers))</code> stops at <code>len - 1</code>.
                </div>
                <button
                  onClick={() => onNavigate('ai-feedback')}
                  className="w-full py-2 px-3 rounded-lg bg-secondary text-white text-[12px] font-bold hover:bg-on-secondary-container transition-colors"
                >
                  Open Full AI Socratic Guidance →
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
