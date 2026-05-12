import { useState, useEffect } from 'react';

export function useSLATimer(deadline) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!deadline) return;

    const compute = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ hours: 0, minutes: 0, seconds: 0, overdue: true, total: 0 });
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemaining({ hours, minutes, seconds, overdue: false, total: diff });
    };

    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return remaining;
}

export function formatSLA(remaining, slaHours) {
  if (!remaining) return '—';
  if (remaining.overdue) return 'OVERDUE';
  const { hours, minutes, seconds } = remaining;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  if (minutes > 0) return `${minutes}m ${seconds}s remaining`;
  return `${seconds}s remaining`;
}

export function getSLAUrgency(remaining, slaHours) {
  if (!remaining) return 'normal';
  if (remaining.overdue) return 'overdue';
  const totalSlaMs = slaHours * 3600000;
  const pctRemaining = remaining.total / totalSlaMs;
  if (pctRemaining < 0.15) return 'critical';
  if (pctRemaining < 0.35) return 'warning';
  return 'normal';
}
