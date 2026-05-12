import { cn, timeAgo, qualityColor } from '../../lib/utils';
import { useAgentStore } from '../../store/useAgentStore';
import { CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LAYER_DOT = {
  1: 'bg-blue-500',
  2: 'bg-brand-green',
  3: 'bg-violet-600',
  4: 'bg-cyan-600',
};

export function ActivityFeed({ maxItems = 10, className }) {
  const feed = useAgentStore((s) => s.activityFeed);
  const items = feed.slice(0, maxItems);

  return (
    <div className={cn('space-y-0', className)}>
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'flex items-start gap-3 py-3',
              i < items.length - 1 && 'border-b border-border dark:border-dark-border'
            )}
          >
            {/* Layer dot */}
            <div className="flex-shrink-0 mt-1 flex flex-col items-center gap-1">
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', LAYER_DOT[item.layer] || 'bg-agent-idle')} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-ink dark:text-white">{item.agentName}</span>
                  <span className="text-xs text-ink-muted dark:text-gray-400"> {item.action}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.quality !== null && item.quality !== undefined && (
                    <span className={cn('text-xs font-mono-nums font-medium', qualityColor(item.quality))}>
                      {item.quality}
                    </span>
                  )}
                  {item.status === 'success' ? (
                    <CheckCircle size={12} className="text-brand-green flex-shrink-0" />
                  ) : (
                    <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                  )}
                </div>
              </div>
              <p className="text-xs text-ink-muted dark:text-gray-400 truncate mt-0.5">{item.asset}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-ink-faint dark:text-gray-500 font-mono bg-surface-muted dark:bg-dark-border px-1.5 py-0.5 rounded">
                  {item.buAbbr}
                </span>
                <span className="text-[10px] text-ink-faint dark:text-gray-500">{timeAgo(item.timestamp)}</span>
                {item.note && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 truncate">{item.note}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
