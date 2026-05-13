import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { NotificationBell } from '../ui/NotificationBell';
import { Clock3, Menu, Moon, Sun } from 'lucide-react';

function useCurrentTime() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function TopBar({ title, subtitle, onMenuClick }) {
  const { theme, toggleTheme } = useAppStore();
  const currentTime = useCurrentTime();

  return (
    <header className="z-50 flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-white px-5 dark:border-dark-border dark:bg-dark-card">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-5">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded border border-border text-ink-faint transition-colors hover:bg-surface-muted dark:border-dark-border dark:text-gray-400 dark:hover:bg-dark-border md:hidden"
          aria-label="Open menu"
        >
          <Menu size={15} strokeWidth={1.5} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 border-r border-border pr-5 dark:border-dark-border">
          <img
            src="/logo.svg"
            alt="LevelShift"
            className="h-8 w-auto"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <span
            className="hidden items-center text-[13px] font-medium tracking-tight text-ink dark:text-white"
            style={{ display: 'none' }}
          >
            LevelShift<span className="ml-0.5 text-brand-green">·</span>Pulse
          </span>
        </div>

        {/* Page title */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-[13px] font-medium text-ink dark:text-white truncate">{title}</h1>
          {subtitle && (
            <span className="hidden text-[12px] text-ink-faint dark:text-gray-500 lg:block truncate max-w-[300px]">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Live badge */}
        <div className="flex items-center gap-1.5 rounded border border-brand-green/20 bg-brand-green-light px-2.5 py-1 dark:border-green-800/60 dark:bg-green-900/15">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
          <span className="font-mono text-[11px] font-medium text-brand-green-dark dark:text-green-400 tracking-wide">
            LIVE
          </span>
        </div>

        {/* Clock */}
        <div className="hidden items-center gap-1.5 px-2 sm:flex">
          <Clock3 size={13} className="text-ink-faint" strokeWidth={1.5} />
          <span className="font-mono-nums text-[12px] text-ink-faint dark:text-gray-400">{currentTime}</span>
        </div>

        <div className="h-4 w-px bg-border dark:bg-dark-border" />

        <NotificationBell />

        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded border border-border text-ink-faint transition-colors hover:bg-surface-muted dark:border-dark-border dark:text-gray-400 dark:hover:bg-dark-border"
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon size={13} strokeWidth={1.5} /> : <Sun size={13} strokeWidth={1.5} />}
        </button>
      </div>
    </header>
  );
}
