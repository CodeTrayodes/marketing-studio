import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAppStore, ROLE_CONFIG, ROLES } from '../../store/useAppStore';
import { useAgentStore } from '../../store/useAgentStore';
import {
  LayoutDashboard, GitBranch, FileText, Shield, BarChart3, Settings,
  Zap, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Command Centre', icon: LayoutDashboard, exact: true },
  { path: '/pipeline', label: 'Agent Pipeline', icon: GitBranch },
  { path: '/content', label: 'Content Tracker', icon: FileText },
  { path: '/gates', label: 'Gate Manager', icon: Shield },
  { path: '/performance', label: 'Performance', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { role, sidebarCollapsed, toggleSidebar } = useAppStore();
  const runningCount = useAgentStore((s) => s.getRunningCount());
  const roleConfig = ROLE_CONFIG[role];

  return (
    <aside className={cn(
      'flex flex-col bg-white dark:bg-dark-card border-r border-border dark:border-dark-border',
      'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0 z-20',
      sidebarCollapsed ? 'w-16' : 'w-56'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-border dark:border-dark-border h-14 flex-shrink-0',
        sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
      )}>
        <div className="flex-shrink-0 w-7 h-7 bg-brand-green rounded-[6px] flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden flex-shrink-0"
            >
              <span className="text-sm font-semibold text-ink dark:text-white tracking-tight whitespace-nowrap">
                Pulse
              </span>
              <span className="text-xs text-ink-muted dark:text-gray-400 ml-1 whitespace-nowrap">by LevelShift</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isVisible = roleConfig.visibleNav.includes(item.path);
          if (!isVisible) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => cn(
                'flex items-center gap-3 mx-2 px-2 py-2 rounded-[8px] text-sm transition-all duration-150',
                'hover:bg-surface-muted dark:hover:bg-dark-border',
                isActive
                  ? 'bg-surface-muted dark:bg-dark-border text-ink dark:text-white font-medium'
                  : 'text-ink-muted dark:text-gray-400',
                sidebarCollapsed && 'justify-center px-0 mx-2'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Active agents badge on pipeline */}
              {item.path === '/pipeline' && runningCount > 0 && !sidebarCollapsed && (
                <span className="ml-auto flex-shrink-0 w-4 h-4 bg-brand-green text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {runningCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System health + collapse */}
      <div className="border-t border-border dark:border-dark-border p-2 space-y-2">
        {!sidebarCollapsed && (
          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-ink-faint dark:text-gray-500 uppercase tracking-wider">System</span>
              <span className="text-[10px] font-mono-nums text-brand-green font-semibold">
                {useAgentStore.getState().systemHealth.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-0.5 bg-border dark:bg-dark-border rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full" style={{ width: '98%' }} />
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-[8px] text-ink-muted dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}
