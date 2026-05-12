import { useState, useMemo } from 'react';
import { useGateStore } from '../../store/useGateStore';
import { useContentStore } from '../../store/useContentStore';
import { cn } from '../../lib/utils';
import { Bell, Shield, Clock, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useNotifications() {
  const gates = useGateStore((s) => s.gates);
  const assets = useContentStore((s) => s.assets);

  return useMemo(() => {
    const notifs = [];

    // Active gate with pending items
    gates.forEach((gate) => {
      if (gate.status === 'active') {
        const pending = assets.filter((a) => a.status === `${gate.id}-pending`);
        if (pending.length > 0) {
          notifs.push({
            id: `gate-${gate.id}`,
            type: 'gate',
            icon: Shield,
            title: `${gate.name} review pending`,
            body: `${pending.length} asset${pending.length > 1 ? 's' : ''} awaiting approval`,
          });
        }
      }
    });

    // SLA at risk — active gate with < 25% SLA remaining
    gates.forEach((gate) => {
      if (gate.status === 'active' && gate.slaDeadline) {
        const now = Date.now();
        const deadline = new Date(gate.slaDeadline).getTime();
        const slaTotal = gate.slaHours * 60 * 60 * 1000;
        const remaining = deadline - now;
        const pct = (remaining / slaTotal) * 100;
        if (pct < 25 && remaining > 0) {
          notifs.push({
            id: `sla-${gate.id}`,
            type: 'warning',
            icon: Clock,
            title: `${gate.name} SLA at risk`,
            body: `Less than 25% of the ${gate.slaHours}h window remaining`,
          });
        }
      }
    });

    // Assets below quality threshold
    const lowQuality = assets.filter(
      (a) => a.qualityScores?.overall && a.qualityScores.overall < 74
    );
    if (lowQuality.length > 0) {
      notifs.push({
        id: 'low-quality',
        type: 'warning',
        icon: AlertTriangle,
        title: 'Quality check required',
        body: `${lowQuality.length} asset${lowQuality.length > 1 ? 's' : ''} scored below the 74 quality threshold`,
      });
    }

    // Recently approved assets
    const recentlyApproved = assets.filter((a) => a.status === 'approved').slice(0, 3);
    if (recentlyApproved.length > 0) {
      notifs.push({
        id: 'approved',
        type: 'success',
        icon: CheckCircle2,
        title: 'Assets approved',
        body: `${recentlyApproved.length} asset${recentlyApproved.length > 1 ? 's' : ''} moved to approved state`,
      });
    }

    return notifs;
  }, [gates, assets]);
}

const TYPE_STYLE = {
  gate: { dot: 'bg-amber-400', icon: 'text-amber-500' },
  warning: { dot: 'bg-red-400', icon: 'text-red-500' },
  success: { dot: 'bg-brand-green', icon: 'text-brand-green' },
  info: { dot: 'bg-blue-400', icon: 'text-blue-500' },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(new Set());
  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !read.has(n.id)).length;

  const markRead = (id) => setRead((s) => new Set([...s, id]));
  const markAllRead = () => setRead(new Set(notifications.map((n) => n.id)));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative w-8 h-8 flex items-center justify-center rounded-[6px] border transition-colors',
          open
            ? 'bg-surface-muted dark:bg-dark-border border-brand-green/30'
            : 'border-border dark:border-dark-border hover:bg-surface-muted dark:hover:bg-dark-border'
        )}
        aria-label="Notifications"
      >
        <Bell size={16} className="text-ink-faint dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-1.5 w-[380px] bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-[10px] shadow-card-hover z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-semibold text-ink dark:text-white">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-px bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[9px] text-ink-faint dark:text-gray-500 hover:text-brand-green transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-ink-faint dark:text-gray-500 hover:text-ink dark:hover:text-white transition-colors">
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-surface-muted dark:bg-dark-border flex items-center justify-center mb-2">
                      <CheckCircle2 size={14} className="text-brand-green" />
                    </div>
                    <p className="text-[11px] font-medium text-ink dark:text-white">All clear</p>
                    <p className="text-[10px] text-ink-faint dark:text-gray-500 mt-0.5">No pending actions right now</p>
                  </div>
                ) : (
                  notifications.map((n, i) => {
                    const isUnread = !read.has(n.id);
                    const style = TYPE_STYLE[n.type] || TYPE_STYLE.info;
                    const Icon = n.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-3 py-3 text-left transition-colors',
                          i < notifications.length - 1 && 'border-b border-border dark:border-dark-border',
                          isUnread
                            ? 'bg-surface-muted/50 dark:bg-dark-border/30 hover:bg-surface-muted dark:hover:bg-dark-border/60'
                            : 'hover:bg-surface-muted dark:hover:bg-dark-border/40'
                        )}
                      >
                        <div className={cn('w-7 h-7 rounded-[6px] bg-surface-muted dark:bg-dark-border flex items-center justify-center flex-shrink-0 mt-px', style.icon)}>
                          <Icon size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={cn('text-[11px] font-medium leading-tight', isUnread ? 'text-ink dark:text-white' : 'text-ink-muted dark:text-gray-400')}>
                              {n.title}
                            </p>
                            {isUnread && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />}
                          </div>
                          <p className="text-[10px] text-ink-faint dark:text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
