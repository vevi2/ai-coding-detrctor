import React, { useState } from 'react';
import { NavigationPath } from '../types';

interface HeaderProps {
  currentPath: NavigationPath;
  streakDays?: number;
  skillScore?: number;
  onNavigate: (path: NavigationPath) => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  streakDays = 6,
  skillScore = 72,
  onNavigate,
  onSearch,
}) => {
  const [searchVal, setSearchVal] = useState('');

  const getBreadcrumb = () => {
    switch (currentPath) {
      case 'dashboard':
        return 'Dashboard & Telemetry';
      case 'code-practice':
        return 'Code Practice Workspace';
      case 'code-analysis':
        return 'In-Depth AST Code Analysis';
      case 'my-skills':
        return 'Skills & Weakness Detection';
      case 'ai-feedback':
        return 'AI Feedback & Socratic Guidance';
      case 'recommendations':
        return 'Personalized Practice Recommendations';
      case 'progress-tracking':
        return 'Progress Tracking & Analytics';
      case 'submission-history':
        return 'Submission History';
      case 'settings':
        return 'Settings & Profile';
      default:
        return 'Telemetry & Practice';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="h-16 w-full px-8 flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-on-surface-variant">Workspace</span>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-[14px] font-semibold text-on-surface">{getBreadcrumb()}</span>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              value={searchVal}
              onChange={handleSearchChange}
              className="w-full h-10 pl-9 pr-16 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-lg text-[13px] shadow-[0_1px_3px_0_rgba(25,60,58,0.04)] focus:outline-none focus:ring-2 focus:ring-secondary/30 border border-surface-container"
              placeholder="Search concepts, algorithms, assessments..."
              type="text"
            />
            <span className="absolute right-2 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]">
              ⌘K
            </span>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-[12px] font-semibold text-on-surface">
            <span>🔥</span>
            <span>{streakDays} Days Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-[12px] font-bold text-on-secondary-container">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>Skill Score: {skillScore}</span>
          </div>

          <button
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1 pl-1 cursor-pointer hover:opacity-90 transition-opacity"
            type="button"
          >
            <img
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-secondary/30"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
            />
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              arrow_drop_down
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
