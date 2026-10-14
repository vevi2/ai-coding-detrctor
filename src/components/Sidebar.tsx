import React from 'react';
import { NavigationPath } from '../types';

interface SidebarProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const navItems: Array<{ path: NavigationPath; label: string; icon: string }> = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: 'code-practice', label: 'Code Practice', icon: 'terminal' },
    { path: 'code-analysis', label: 'Code Analysis', icon: 'code_blocks' },
    { path: 'my-skills', label: 'My Skills', icon: 'neurology' },
    { path: 'ai-feedback', label: 'AI Feedback', icon: 'auto_awesome' },
    { path: 'recommendations', label: 'Recommendations', icon: 'explore' },
    { path: 'progress-tracking', label: 'Progress Tracking', icon: 'trending_up' },
    { path: 'submission-history', label: 'Submission History', icon: 'history' },
    { path: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-container z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary-container font-bold text-lg">
            <span className="material-symbols-outlined text-[20px] text-primary">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white leading-tight tracking-tight text-[16px]">
              SkillSense AI
            </span>
            <span className="text-[11px] text-on-primary-container tracking-wider uppercase font-semibold">
              Code Mastery AI
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-colors text-[14px] font-medium ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-fixed font-semibold shadow-xs'
                    : 'text-on-primary-container hover:bg-tertiary-container hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-tertiary-container text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/20"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-white truncate">Alex Rivera</span>
              <span className="text-[11px] text-primary-fixed-dim truncate">CS Sophomore</span>
            </div>
          </div>
          <button
            aria-label="User menu"
            onClick={() => onNavigate('settings')}
            className="p-1 text-on-primary-container hover:text-white transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
