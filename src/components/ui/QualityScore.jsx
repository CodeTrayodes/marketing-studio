import { cn, qualityColor, qualityBg } from '../../lib/utils';

export function QualityScore({ score, size = 'md', showLabel = true, className }) {
  const sizes = {
    sm: 'text-sm font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-2xl font-bold',
  };

  return (
    <span className={cn(
      'font-mono-nums inline-flex items-baseline gap-1',
      sizes[size],
      qualityColor(score),
      className
    )}>
      {score}
      {showLabel && <span className="text-xs font-normal text-ink-faint dark:text-gray-500">/100</span>}
    </span>
  );
}

export function QualityBreakdown({ scores, className }) {
  if (!scores) return null;
  const dims = [
    { key: 'seo', label: 'SEO', explanation: 'Keyword density, structure, meta, internal links' },
    { key: 'brand', label: 'Brand', explanation: 'Voice consistency, tone, LevelShift guidelines' },
    { key: 'geo', label: 'GEO', explanation: 'Geographic and industry relevance' },
    { key: 'aiDetection', label: 'AI Detect', explanation: 'Probability of AI-detection flags (lower = better)', invert: true },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {dims.map((d) => (
        <div key={d.key} className={cn('p-2.5 rounded-[8px] border', qualityBg(d.invert ? 100 - scores[d.key] : scores[d.key]), 'border-transparent')}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-ink-muted dark:text-gray-400">{d.label}</span>
            <span className={cn('text-xs font-semibold font-mono-nums', d.invert ? qualityColor(100 - scores[d.key]) : qualityColor(scores[d.key]))}>
              {d.invert ? `${scores[d.key]}%` : scores[d.key]}
            </span>
          </div>
          <div className="w-full h-0.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', d.invert ? 'bg-brand-green' : qualityColor(scores[d.key]).replace('text-', 'bg-').replace('-600', '-500').replace('-500', '-500'))}
              style={{ width: `${d.invert ? 100 - scores[d.key] : scores[d.key]}%` }}
            />
          </div>
          <p className="text-[10px] text-ink-faint dark:text-gray-500 mt-1 leading-tight">{d.explanation}</p>
        </div>
      ))}
    </div>
  );
}

export function QualityBar({ score, className }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = score >= 90 ? 'bg-brand-green' : score >= 80 ? 'bg-blue-500' : score >= 70 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn('text-xs font-mono-nums font-medium w-6 text-right', qualityColor(score))}>{score}</span>
    </div>
  );
}
