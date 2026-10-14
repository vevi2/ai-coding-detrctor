import { useState, useEffect } from 'react';
import { NavigationPath, DashboardData } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { CodePracticeView } from './views/CodePracticeView';
import { CodeAnalysisView } from './views/CodeAnalysisView';
import { MySkillsView } from './views/MySkillsView';
import { AIFeedbackView } from './views/AIFeedbackView';
import { RecommendationsView } from './views/RecommendationsView';
import { ProgressTrackingView } from './views/ProgressTrackingView';
import { SubmissionHistoryView } from './views/SubmissionHistoryView';
import { SettingsView } from './views/SettingsView';
import { api } from './services/api';

export default function App() {
  const [currentPath, setCurrentPath] = useState<NavigationPath>('dashboard');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('sub-102');
  const [selectedProblemSlug, setSelectedProblemSlug] = useState<string>('find-sum-even');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [streakDays, setStreakDays] = useState<number>(6);
  const [skillScore, setSkillScore] = useState<number>(72);

  useEffect(() => {
    // Initial fetch of telemetry summary to keep Header metrics synchronized
    api.fetchDashboard()
      .then((data: DashboardData) => {
        if (data?.metrics) {
          setStreakDays(data.metrics.streak_days ?? 6);
          setSkillScore(data.metrics.overall_skill_score ?? 72);
        }
      })
      .catch((err) => {
        console.warn('Dashboard sync preview mode:', err);
      });
  }, []);

  const handleNavigate = (path: NavigationPath, extra?: any) => {
    if (extra?.submissionId) {
      setSelectedSubmissionId(extra.submissionId);
    }
    if (extra?.problemSlug) {
      setSelectedProblemSlug(extra.problemSlug);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    if (query.trim().length > 2 && currentPath !== 'submission-history') {
      setCurrentPath('submission-history');
    }
  };

  const renderCurrentView = () => {
    switch (currentPath) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={handleNavigate}
            onSelectSubmission={(id) => setSelectedSubmissionId(id)}
          />
        );
      case 'code-practice':
        return (
          <CodePracticeView
            onNavigate={handleNavigate}
            initialProblemSlug={selectedProblemSlug}
          />
        );
      case 'code-analysis':
        return (
          <CodeAnalysisView
            onNavigate={handleNavigate}
            submissionId={selectedSubmissionId}
          />
        );
      case 'my-skills':
        return <MySkillsView onNavigate={handleNavigate} />;
      case 'ai-feedback':
        return <AIFeedbackView onNavigate={handleNavigate} />;
      case 'recommendations':
        return <RecommendationsView onNavigate={handleNavigate} />;
      case 'progress-tracking':
        return <ProgressTrackingView onNavigate={handleNavigate} />;
      case 'submission-history':
        return (
          <SubmissionHistoryView
            onNavigate={handleNavigate}
            onSelectSubmission={(id) => setSelectedSubmissionId(id)}
            searchFilter={globalSearch}
          />
        );
      case 'settings':
        return <SettingsView onNavigate={handleNavigate} />;
      default:
        return (
          <DashboardView
            onNavigate={handleNavigate}
            onSelectSubmission={(id) => setSelectedSubmissionId(id)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex font-sans selection:bg-secondary/20">
      {/* Persistent Left Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Top Header & Main Content Workspace */}
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Header
          currentPath={currentPath}
          streakDays={streakDays}
          skillScore={skillScore}
          onNavigate={handleNavigate}
          onSearch={handleGlobalSearch}
        />

        {/* View Container */}
        <main className="flex-1 pt-16 bg-surface">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
