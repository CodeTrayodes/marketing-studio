import { cn } from '../../lib/utils';
import { useAppStore, ROLES, ROLE_CONFIG } from '../../store/useAppStore';
import { useAgentStore } from '../../store/useAgentStore';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_OPTIONS = [
  { id: ROLES.MARKETING_HEAD, icon: '●' },
  { id: ROLES.CAMPAIGN_LEAD, icon: '◆' },
  { id: ROLES.CONTENT_EDITOR, icon: '▲' },
  { id: ROLES.AI_COE, icon: '◉' },
];

export function TopBar({ title, subtitle }) {
  const { role, theme, setRole, toggleTheme } = useAppStore();
  const runningCount = useAgentStore((s) => s.getRunningCount());
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleConfig = ROLE_CONFIG[role];

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border dark:border-dark-border bg-white dark:bg-dark-card flex-shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-sm font-semibold text-ink dark:text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted dark:text-gray-400">{subtitle}</p>}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-badge bg-brand-green-light dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
          <span className="text-xs font-medium text-brand-green-dark dark:text-green-400">
            {runningCount} running
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-btn border border-border dark:border-dark-border text-ink-muted dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Role switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-btn border text-sm font-medium transition-colors',
              'border-border dark:border-dark-border bg-white dark:bg-dark-card',
              'hover:bg-surface-muted dark:hover:bg-dark-border text-ink dark:text-white'
            )}
          >
            <span className="w-5 h-5 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {roleConfig.avatar}
            </span>
            <span className="hidden sm:block">{roleConfig.label}</span>
            <ChevronDown size={12} className={cn('text-ink-muted transition-transform', roleMenuOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {roleMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-card shadow-card-hover z-50 overflow-hidden"
                >
                  <div className="p-1">
                    <p className="px-3 py-2 text-[10px] text-ink-faint dark:text-gray-500 uppercase tracking-wider font-semibold">
                      Switch Role
                    </p>
                    {ROLE_OPTIONS.map(({ id }) => {
                      const config = ROLE_CONFIG[id];
                      const isActive = role === id;
                      return (
                        <button
                          key={id}
                          onClick={() => { setRole(id); setRoleMenuOpen(false); }}
                          className={cn(
                            'w-full flex items-start gap-3 px-3 py-2.5 rounded-[8px] text-left transition-colors',
                            isActive
                              ? 'bg-brand-green-light dark:bg-green-900/20'
                              : 'hover:bg-surface-muted dark:hover:bg-dark-border'
                          )}
                        >
                          <span className={cn(
                            'w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5',
                            isActive ? 'bg-brand-green text-white' : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400'
                          )}>
                            {config.avatar}
                          </span>
                          <div className="min-w-0">
                            <p className={cn('text-sm font-medium leading-tight', isActive ? 'text-brand-green' : 'text-ink dark:text-white')}>
                              {config.label}
                            </p>
                            <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5 leading-tight">{config.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
