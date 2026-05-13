import { useState } from 'react';
import { cn, timeAgo, qualityColor } from '../../lib/utils';
import { useAgentStore } from '../../store/useAgentStore';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LAYER_DOT = {
  1: 'bg-blue-500',
  2: 'bg-brand-green',
  3: 'bg-violet-600',
  4: 'bg-cyan-600',
};

const COLLAPSED_COUNT = 5;

export function ActivityFeed({ maxItems = 20, className }) {
  const feed = useAgentStore((s) => s.activityFeed);
  const [expanded, setExpanded] = useState(false);

  const all = feed.slice(0, maxItems);
  const items = expanded ? all : all.slice(0, COLLAPSED_COUNT);
  const hasMore = all.length > COLLAPSED_COUNT;

  if (all.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-10 text-center', className)}>
        <span className="w-2 h-2 rounded-full bg-agent-idle animate-pulse mb-2.5" />
        <p className="text-[12px] text-ink-faint dark:text-gray-500">Waiting for agent activity...</p>
      </div>
    );
  }

  return (
    <div className={cn('', className)}>
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'flex items-start gap-2.5 py-2.5',
              i < items.length - 1 && 'border-b border-border dark:border-dark-border'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', LAYER_DOT[item.layer] || 'bg-agent-idle')} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[12px] font-medium text-ink dark:text-white">{item.agentName}</span>
                  <span className="text-[12px] text-ink-muted dark:text-gray-400"> {item.action}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-px">
                  {item.quality != null && (
                    <span className={cn('text-[11px] font-mono-nums font-medium', qualityColor(item.quality))}>
                      {item.quality}
                    </span>
                  )}
                  {item.status === 'success'
                    ? <CheckCircle size={12} className="text-brand-green flex-shrink-0" strokeWidth={1.5} />
                    : <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" strokeWidth={1.5} />
                  }
                </div>
              </div>
              <p className="text-[11px] text-ink-muted dark:text-gray-400 truncate mt-0.5">{item.asset}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-ink-faint dark:text-gray-500 font-mono bg-surface-muted dark:bg-dark-border px-1.5 py-px rounded">
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

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 pt-2.5 mt-0.5 border-t border-border dark:border-dark-border text-[11px] text-ink-faint dark:text-gray-500 hover:text-ink dark:hover:text-white transition-colors"
        >
          {expanded ? (
            <><ChevronUp size={12} strokeWidth={1.5} /> Show less</>
          ) : (
            <><ChevronDown size={12} strokeWidth={1.5} /> Show {all.length - COLLAPSED_COUNT} more</>
          )}
        </button>
      )}
    </div>
  );
}
