import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSimulation } from '../../hooks/useSimulation';

const PAGE_META = {
  '/': { title: 'Command Centre', subtitle: 'Q2 2025 — Live operational overview' },
  '/pipeline': { title: 'Agent Pipeline', subtitle: '13 agents across 4 layers' },
  '/content': { title: 'Content Tracker', subtitle: '310 assets · Q2 2025' },
  '/gates': { title: 'Gate Manager', subtitle: '4 approval gates · SLA monitoring' },
  '/performance': { title: 'Performance & ROI', subtitle: 'Quarter-to-date analytics' },
  '/settings': { title: 'Settings', subtitle: 'Platform preferences and configuration' },
};

export function AppShell() {
  useSimulation(3500);
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: 'LevelShift Pulse', subtitle: '' };

  return (
    <div className="flex h-screen bg-surface-subtle dark:bg-dark-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
