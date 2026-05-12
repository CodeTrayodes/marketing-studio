import { cn } from '../../lib/utils';

export function ProgressRing({ value, max = 100, size = 48, strokeWidth = 4, color = '#16A34A', trackColor, className }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className={cn('rotate-[-90deg]', className)}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor || 'currentColor'}
        strokeWidth={strokeWidth}
        className="text-border dark:text-dark-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
      />
    </svg>
  );
}
