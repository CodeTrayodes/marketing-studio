import { cn, STATUS_CONFIG } from '../../lib/utils';

export function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'text-ink-muted', bg: 'bg-surface-muted', border: 'border-border' };

  return (
    <span className={cn(
      'badge border text-[10px] font-medium',
      config.color,
      config.bg,
      config.border,
      className
    )}>
      {config.label}
    </span>
  );
}

export function AgentStatusBadge({ status, className }) {
  const configs = {
    running: { label: 'Running', color: 'text-brand-green', bg: 'bg-brand-green-light dark:bg-green-900/20', dot: 'bg-brand-green animate-pulse' },
    idle: { label: 'Idle', color: 'text-ink-muted', bg: 'bg-surface-muted dark:bg-dark-border', dot: 'bg-agent-idle' },
    queued: { label: 'Queued', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', dot: 'bg-blue-400' },
    completed: { label: 'Complete', color: 'text-brand-green', bg: 'bg-brand-green-light dark:bg-green-900/20', dot: 'bg-brand-green' },
    error: { label: 'Error', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', dot: 'bg-agent-error animate-pulse' },
  };
  const config = configs[status] || configs.idle;

  return (
    <span className={cn('badge gap-1.5', config.color, config.bg, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function LayerBadge({ layer, className }) {
  const configs = {
    1: { label: 'Layer 1', bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-700 dark:text-blue-400' },
    2: { label: 'Layer 2', bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-700 dark:text-green-400' },
    3: { label: 'Layer 3', bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-700 dark:text-violet-400' },
    4: { label: 'Layer 4', bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-700 dark:text-cyan-400' },
  };
  const config = configs[layer] || { label: `L${layer}`, bg: 'bg-surface-muted', color: 'text-ink-muted' };

  return (
    <span className={cn('badge', config.bg, config.color, className)}>
      {config.label}
    </span>
  );
}
