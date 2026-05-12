import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MetricCard({ label, value, subValue, trend, trendLabel, explanation, accent, className, mono = true, children }) {
  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';

  return (
    <div className={cn('card p-4 flex flex-col gap-1.5', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wider leading-none">{label}</p>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium flex-shrink-0',
            trendDir === 'up' ? 'text-brand-green' : trendDir === 'down' ? 'text-red-500' : 'text-ink-muted'
          )}>
            {trendDir === 'up' ? <TrendingUp size={10} /> : trendDir === 'down' ? <TrendingDown size={10} /> : <Minus size={10} />}
            <span>{trendLabel || `${Math.abs(trend)}%`}</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={cn(
          'text-lg font-semibold tracking-tight text-ink dark:text-white leading-none',
          mono && 'font-mono-nums',
          accent && 'text-brand-green'
        )}>
          {value}
        </span>
        {subValue && (
          <span className="text-[11px] text-ink-muted dark:text-gray-400">{subValue}</span>
        )}
      </div>

      {explanation && (
        <p className="text-[10px] text-ink-faint dark:text-gray-500 leading-relaxed">{explanation}</p>
      )}

      {children}
    </div>
  );
}
