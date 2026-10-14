import React, { useState } from 'react';
import { NavigationPath } from '../types';

interface SettingsViewProps {
  onNavigate: (path: NavigationPath, extra?: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const [studentName, setStudentName] = useState('Alex Rivera');
  const [studentEmail, setStudentEmail] = useState('alex.rivera@cs.university.edu');
  const [cohort, setCohort] = useState('CS Sophomore 2026 Batch');
  const [socraticMode, setSocraticMode] = useState(true);
  const [astStrictness, setAstStrictness] = useState<'Standard' | 'Strict' | 'Pedagogical'>('Pedagogical');
  const [sandboxTimeout, setSandboxTimeout] = useState('2000');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Profile and Telemetry Engine settings saved successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col w-full">
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2.5 rounded-lg bg-primary-container text-white text-sm font-semibold shadow-lg border border-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="px-8 py-6 space-y-8 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
            <span>Platform Configuration</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface-variant font-medium">Telemetry & Profile</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Settings & Telemetry Preferences
          </h1>
          <p className="text-[13px] text-on-surface-variant mt-1">
            Customize student profile details, Socratic guidance parameters, AST parser strictness, and sandbox execution constraints.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-xs space-y-5">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces"
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-secondary/40"
              />
              <div>
                <h2 className="text-base font-bold text-on-surface">{studentName}</h2>
                <p className="text-xs text-on-surface-variant">{cohort}</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-semibold mt-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Verified CS Student
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Academic Email
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Cohort / Academic Track
                </label>
                <input
                  type="text"
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>
          </div>

          {/* AST Engine & Tutor Configuration */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-xs space-y-5">
            <h3 className="text-base font-bold text-on-surface">Analysis & Tutor Intelligence</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/50 border border-surface-container">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-on-surface">Socratic Feedback Mode</span>
                  <p className="text-[11px] text-on-surface-variant">
                    Presents reflective guiding questions rather than immediately revealing full code solutions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={socraticMode}
                  onChange={(e) => setSocraticMode(e.target.checked)}
                  className="w-4 h-4 accent-secondary rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    AST Parser Mode
                  </label>
                  <select
                    value={astStrictness}
                    onChange={(e) => setAstStrictness(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  >
                    <option value="Pedagogical">Pedagogical (Flags anti-patterns and bounds vulnerabilities)</option>
                    <option value="Standard">Standard (Python 3.10 ast syntax & runtime checks)</option>
                    <option value="Strict">Strict (Enforces PEP8 and asymptotic optimality)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    Subprocess Sandbox Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={sandboxTimeout}
                    onChange={(e) => setSandboxTimeout(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Architecture & Status */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-xs space-y-4">
            <h3 className="text-base font-bold text-on-surface">System Architecture & Diagnostic Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <span className="text-outline font-medium block">Relational Database</span>
                <span className="text-on-surface font-bold font-mono">SQLite (Normalized)</span>
                <span className="text-[11px] text-emerald-600 block mt-1">● Active & Seeded</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <span className="text-outline font-medium block">Parser Engine</span>
                <span className="text-on-surface font-bold font-mono">Python 3.10 AST</span>
                <span className="text-[11px] text-emerald-600 block mt-1">● CPython Sandboxed</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <span className="text-outline font-medium block">Generative Model</span>
                <span className="text-on-surface font-bold font-mono">Gemini 2.5 Flash</span>
                <span className="text-[11px] text-secondary font-bold block mt-1">● Server-Side Hooked</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
