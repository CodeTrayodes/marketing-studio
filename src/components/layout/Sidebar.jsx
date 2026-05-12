import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAppStore, ROLE_CONFIG } from '../../store/useAppStore';
import { useAgentStore } from '../../store/useAgentStore';
import { RoleSwitcher } from '../ui/RoleSwitcher';
import {
  LayoutDashboard, GitBranch, FileText, Shield, BarChart3, Settings,
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

export function Sidebar({ mobileOpen, onClose }) {
  const { role, sidebarCollapsed } = useAppStore();
  const runningCount = useAgentStore((s) => s.getRunningCount());
  const roleConfig = ROLE_CONFIG[role];

  return (
    <aside className={cn(
      'flex flex-col bg-white dark:bg-dark-card border-r border-border dark:border-dark-border',
      'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0 z-40',
      // Mobile: fixed overlay; Desktop: in-flow
      'fixed inset-y-0 left-0 md:relative md:inset-auto',
      // Width
      sidebarCollapsed ? 'w-12' : 'w-48',
      // Mobile slide in/out
      mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0',
    )}>

      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-border dark:border-dark-border h-10 flex-shrink-0',
        sidebarCollapsed ? 'justify-center' : 'px-3 gap-2'
      )}>
        <div className="w-5 h-5 rounded-[4px] bg-brand-green flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold leading-none">P</span>
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
              <span className="text-[11px] font-semibold text-ink dark:text-white whitespace-nowrap">Pulse</span>
              <span className="text-[10px] text-ink-faint dark:text-gray-500 ml-1 whitespace-nowrap">by LevelShift</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin space-y-px">
        {NAV_ITEMS.map((item) => {
          const isVisible = roleConfig.visibleNav.includes(item.path);
          if (!isVisible) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-2 mx-1.5 px-2 py-1.5 rounded-[6px] text-[11px] transition-all duration-150',
                'hover:bg-surface-muted dark:hover:bg-dark-border',
                isActive
                  ? 'bg-surface-muted dark:bg-dark-border text-ink dark:text-white font-medium'
                  : 'text-ink-muted dark:text-gray-400',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={13} className="flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap overflow-hidden flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.path === '/pipeline' && runningCount > 0 && !sidebarCollapsed && (
                <span className="flex-shrink-0 min-w-[14px] h-3.5 bg-brand-green text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1">
                  {runningCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: role switcher */}
      <div className="border-t border-border dark:border-dark-border">
        <RoleSwitcher collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}
