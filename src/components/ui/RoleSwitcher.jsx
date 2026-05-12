import { useState } from 'react';
import { useAppStore, ROLES, ROLE_CONFIG } from '../../store/useAppStore';
import { addToast } from './Toast';
import { cn } from '../../lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_ORDER = [
  ROLES.MARKETING_HEAD,
  ROLES.CAMPAIGN_LEAD,
  ROLES.CONTENT_EDITOR,
  ROLES.AI_COE,
];

export function RoleSwitcher({ collapsed }) {
  const { role, setRole } = useAppStore();
  const [open, setOpen] = useState(false);
  const config = ROLE_CONFIG[role];

  const handleSwitch = (id) => {
    setOpen(false);
    if (id === role) return;
    setRole(id);
    const cfg = ROLE_CONFIG[id];
    addToast(`Viewing as ${cfg.label} — ${cfg.visibleNav.length} sections visible`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-2.5 transition-colors text-left',
          'hover:bg-surface-muted dark:hover:bg-dark-border',
          collapsed && 'justify-center'
        )}
        title={collapsed ? config.label : undefined}
      >
        <div className="w-6 h-6 rounded-full bg-brand-green text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0">
          {config.avatar}
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-w-0 flex items-center gap-1"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-ink dark:text-white truncate leading-tight">{config.label}</p>
                <p className="text-[9px] text-ink-faint dark:text-gray-500 truncate leading-tight">{config.name}</p>
              </div>
              {open
                ? <ChevronUp size={10} className="text-ink-faint flex-shrink-0" />
                : <ChevronDown size={10} className="text-ink-faint flex-shrink-0" />
              }
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-full left-0 mb-1 w-60 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-[10px] shadow-card-hover z-50 overflow-hidden"
            >
              <div className="p-1">
                <p className="px-2 py-1.5 text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider font-semibold">
                  Switch Role
                </p>
                {ROLE_ORDER.map((id) => {
                  const cfg = ROLE_CONFIG[id];
                  const isActive = role === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSwitch(id)}
                      className={cn(
                        'w-full flex items-start gap-2 px-2 py-2 rounded-[6px] text-left transition-colors',
                        isActive
                          ? 'bg-brand-green-light dark:bg-green-900/20'
                          : 'hover:bg-surface-muted dark:hover:bg-dark-border'
                      )}
                    >
                      <span className={cn(
                        'w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-px',
                        isActive
                          ? 'bg-brand-green text-white'
                          : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400'
                      )}>
                        {cfg.avatar}
                      </span>
                      <div className="min-w-0">
                        <p className={cn(
                          'text-[11px] font-medium leading-tight',
                          isActive ? 'text-brand-green' : 'text-ink dark:text-white'
                        )}>
                          {cfg.label}
                        </p>
                        <p className="text-[9px] text-ink-faint dark:text-gray-500 leading-tight mt-0.5">
                          {cfg.description}
                        </p>
                        <p className="text-[9px] text-ink-faint dark:text-gray-600 mt-0.5">
                          {cfg.visibleNav.length} sections visible
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
