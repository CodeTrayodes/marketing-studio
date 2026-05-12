import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MetricCard({ label, value, subValue, trend, trendLabel, explanation, accent, className, mono = true, children }) {
  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';

  return (
    <div className={cn('card p-5 flex flex-col gap-2', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wider leading-none">{label}</p>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-medium flex-shrink-0',
            trendDir === 'up' ? 'text-brand-green' : trendDir === 'down' ? 'text-red-500' : 'text-ink-muted'
          )}>
            {trendDir === 'up' ? <TrendingUp size={12} /> : trendDir === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
            <span>{trendLabel || `${Math.abs(trend)}%`}</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn(
          'text-2xl font-semibold tracking-tight text-ink dark:text-white leading-none',
          mono && 'font-mono-nums',
          accent && 'text-brand-green'
        )}>
          {value}
        </span>
        {subValue && (
          <span className="text-sm text-ink-muted dark:text-gray-400">{subValue}</span>
        )}
      </div>

      {explanation && (
        <p className="text-xs text-ink-faint dark:text-gray-500 leading-relaxed">{explanation}</p>
      )}

      {children}
    </div>
  );
}
