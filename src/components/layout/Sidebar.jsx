import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAppStore, ROLE_CONFIG } from '../../store/useAppStore';
import { useAgentStore } from '../../store/useAgentStore';
import { RoleSwitcher } from '../ui/RoleSwitcher';
import {
  BarChart3,
  FileText,
  GitBranch,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Command Centre', icon: LayoutDashboard, exact: true, group: 'Monitor' },
  { path: '/pipeline', label: 'Agent Pipeline', icon: GitBranch, group: 'Monitor', badge: 'live' },
  { path: '/content', label: 'Content Tracker', icon: FileText, group: 'Analyse' },
  { path: '/gates', label: 'Gate Manager', icon: ShieldCheck, group: 'Analyse' },
  { path: '/performance', label: 'Performance', icon: BarChart3, group: 'Analyse' },
  { path: '/settings', label: 'Settings', icon: Settings, group: 'Operate' },
];

const GROUPS = ['Monitor', 'Analyse', 'Operate'];

export function Sidebar({ mobileOpen, onClose }) {
  const { role, sidebarCollapsed } = useAppStore();
  const runningCount = useAgentStore((s) => s.getRunningCount());
  const roleConfig = ROLE_CONFIG[role];

  return (
    <aside className={cn(
      'flex flex-col bg-white dark:bg-dark-card border-r border-border/80 dark:border-dark-border',
      'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0 z-40',
      'fixed top-14 bottom-0 left-0 md:relative md:top-auto md:bottom-auto',
      sidebarCollapsed ? 'w-14' : 'w-[220px]',
      mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0',
    )}>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        <div className="mx-3 mb-5">
          <RoleSwitcher collapsed={sidebarCollapsed} variant="sidebarTop" />
        </div>

        {GROUPS.map((group) => {
          const groupItems = NAV_ITEMS.filter(
            (item) => item.group === group && roleConfig.visibleNav.includes(item.path)
          );
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="mb-5 last:mb-0">
              {!sidebarCollapsed && (
                <p className="mb-2 px-5 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-gray-500">
                  {group}
                </p>
              )}

              <div className="space-y-0.5">
                {groupItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={onClose}
                    className={({ isActive }) => cn(
                      'group relative flex min-h-9 items-center gap-3 px-5 text-[13px] transition-colors duration-150',
                      'hover:text-ink dark:hover:text-white',
                      isActive
                        ? 'text-ink dark:text-white font-medium'
                        : 'text-[#4f5874] dark:text-gray-400',
                      sidebarCollapsed && 'justify-center px-0'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={cn(
                          'absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 bg-sky-500 transition-opacity',
                          isActive ? 'opacity-100' : 'opacity-0'
                        )} />
                        <item.icon
                          size={15}
                          strokeWidth={1.35}
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive ? 'text-sky-600 dark:text-sky-400' : 'text-[#8a94aa] group-hover:text-ink dark:group-hover:text-white'
                          )}
                        />
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="min-w-0 flex-1 truncate"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {item.path === '/pipeline' && runningCount > 0 && !sidebarCollapsed && (
                          <span className="ml-auto min-w-6 rounded-full bg-slate-100 px-1.5 py-0.5 text-center text-[10px] font-medium text-[#657089] dark:bg-dark-border dark:text-gray-300">
                            {runningCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
