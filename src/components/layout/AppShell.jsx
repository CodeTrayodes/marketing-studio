import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '../ui/Toast';
import { useSimulation } from '../../hooks/useSimulation';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { mobileSidebarOpen, setMobileSidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-subtle dark:bg-dark-bg">
      <TopBar
        title={meta.title}
        subtitle={meta.subtitle}
        onMenuClick={() => setMobileSidebarOpen(true)}
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-14 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
