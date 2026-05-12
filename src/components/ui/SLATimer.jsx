import { cn } from '../../lib/utils';
import { useSLATimer, formatSLA, getSLAUrgency } from '../../hooks/useSLATimer';
import { Clock, AlertTriangle } from 'lucide-react';

export function SLATimer({ deadline, slaHours, className, compact = false }) {
  const remaining = useSLATimer(deadline);
  if (!remaining) return null;

  const urgency = getSLAUrgency(remaining, slaHours);
  const label = formatSLA(remaining, slaHours);

  const urgencyConfig = {
    normal: { color: 'text-ink-muted dark:text-gray-400', icon: Clock, bg: '' },
    warning: { color: 'text-amber-600 dark:text-amber-400', icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/20' },
    critical: { color: 'text-red-600 dark:text-red-400', icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-900/20' },
    overdue: { color: 'text-red-600 dark:text-red-400 font-semibold', icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-900/20' },
  };

  const { color, icon: Icon, bg } = urgencyConfig[urgency];

  if (compact) {
    return (
      <span className={cn('font-mono text-xs tabular-nums flex items-center gap-1', color, className)}>
        <Icon size={11} />
        {remaining.overdue ? 'OVERDUE' : `${String(remaining.hours).padStart(2, '0')}:${String(remaining.minutes).padStart(2, '0')}:${String(remaining.seconds).padStart(2, '0')}`}
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-badge', bg, className)}>
      <Icon size={13} className={color} />
      <span className={cn('text-xs font-medium font-mono-nums', color)}>{label}</span>
    </div>
  );
}

export function SLAProgressBar({ deadline, slaHours, className }) {
  const remaining = useSLATimer(deadline);
  if (!remaining) return null;

  const urgency = getSLAUrgency(remaining, slaHours);
  const totalMs = slaHours * 3600000;
  const pct = remaining.overdue ? 0 : Math.round((remaining.total / totalMs) * 100);

  const barColor = {
    normal: 'bg-brand-green',
    warning: 'bg-amber-400',
    critical: 'bg-red-400',
    overdue: 'bg-red-600',
  }[urgency];

  return (
    <div className={cn('w-full h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-1000', barColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
