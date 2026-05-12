import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { useAgentStore } from '../../store/useAgentStore';
import { NotificationBell } from '../ui/NotificationBell';
import { Moon, Sun, Menu } from 'lucide-react';

export function TopBar({ title, subtitle, onMenuClick }) {
  const { theme, toggleTheme } = useAppStore();
  const runningCount = useAgentStore((s) => s.getRunningCount());

  return (
    <header className="h-10 flex items-center justify-between px-4 border-b border-border dark:border-dark-border bg-white dark:bg-dark-card flex-shrink-0 z-30">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="md:hidden w-7 h-7 flex items-center justify-center rounded-[6px] border border-border dark:border-dark-border text-ink-faint dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
          aria-label="Open menu"
        >
          <Menu size={13} />
        </button>
        <h1 className="text-[12px] font-semibold text-ink dark:text-white">{title}</h1>
        {subtitle && (
          <span className="text-[11px] text-ink-faint dark:text-gray-500 hidden sm:block">· {subtitle}</span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {/* Live indicator */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-green-light dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <span className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />
          <span className="text-[10px] font-medium text-brand-green-dark dark:text-green-400">
            {runningCount} running
          </span>
        </div>

        {/* Notification bell */}
        <NotificationBell />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-border dark:border-dark-border text-ink-faint dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={12} /> : <Sun size={12} />}
        </button>
      </div>
    </header>
  );
}
