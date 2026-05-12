import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAgentStore } from '../../store/useAgentStore';
import { NotificationBell } from '../ui/NotificationBell';
import { Activity, Box, Clock3, Menu, Moon, Server, Sun } from 'lucide-react';

function useCurrentTime() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function TopBar({ title, subtitle, onMenuClick }) {
  const { theme, toggleTheme } = useAppStore();
  const runningCount = useAgentStore((s) => s.getRunningCount());
  const currentTime = useCurrentTime();

  return (
    <header className="z-50 flex h-14 flex-shrink-0 items-center justify-between border-b border-border/80 bg-white/95 px-5 backdrop-blur dark:border-dark-border dark:bg-dark-card/95">
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-border text-ink-faint transition-colors hover:bg-surface-muted dark:border-dark-border dark:text-gray-400 dark:hover:bg-dark-border md:hidden"
          aria-label="Open menu"
        >
          <Menu size={15} strokeWidth={1.6} />
        </button>

        <div className="flex items-center gap-4 border-r border-border pr-4 dark:border-dark-border">
          <div className="flex items-center leading-none" aria-label="LevelShift Pulse">
            <span className="text-[12px] font-semibold tracking-[0.12em] text-ink dark:text-white">LEVEL</span>
            <span className="text-[12px] font-semibold tracking-[0.12em] text-sky-500">SHIFT</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-brand-green shadow-[0_0_0_5px_rgba(22,163,74,0.10)]" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate font-mono text-[12px] font-medium text-[#34405d] dark:text-white">{title}</h1>
        </div>

        {subtitle && (
          <span className="hidden max-w-[360px] truncate text-[12px] text-ink-faint dark:text-gray-500 lg:block">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
       

        {/* <div className="hidden h-9 items-center gap-2 rounded-[6px] border border-border bg-white px-3 font-mono text-[13px] text-[#44506a] dark:border-dark-border dark:bg-dark-card dark:text-gray-300 md:flex">
          <Server size={14} strokeWidth={1.5} className="text-ink-faint" />
          prod-us-east-1
        </div> */}

        <div className="flex h-9 items-center gap-2 rounded-[6px] border border-green-200 bg-brand-green-light px-3 dark:border-green-800 dark:bg-green-900/20">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
          <span className="font-mono text-[12px] font-medium text-brand-green-dark dark:text-green-400">
            LIVE
          </span>
        </div>

        <div className="hidden h-9 items-center gap-2 px-1 font-mono text-[13px] text-[#34405d] dark:text-gray-300 sm:flex">
          <Clock3 size={14} strokeWidth={1.5} className="text-ink-faint" />
          {currentTime}
        </div>

        

        <NotificationBell />

        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-border text-ink-faint transition-colors hover:bg-surface-muted dark:border-dark-border dark:text-gray-400 dark:hover:bg-dark-border"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={14} strokeWidth={1.5} /> : <Sun size={14} strokeWidth={1.5} />}
        </button>
      </div>
    </header>
  );
}
