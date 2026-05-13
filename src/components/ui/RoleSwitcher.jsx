import { useState } from 'react';
import { useAppStore, ROLES, ROLE_CONFIG } from '../../store/useAppStore';
import { addToast } from './Toast';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';
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
    addToast(`Switched to ${ROLE_CONFIG[id].label}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-2 rounded transition-colors text-left',
          'hover:bg-surface-muted dark:hover:bg-dark-border',
          collapsed && 'justify-center'
        )}
        title={collapsed ? config.label : undefined}
      >
        <div className="w-6 h-6 rounded bg-brand-green text-white text-[10px] font-medium flex items-center justify-center flex-shrink-0 leading-none">
          {config.avatar}
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex-1 min-w-0 flex items-center justify-between gap-1"
            >
              <span className="text-[13px] font-medium text-ink dark:text-white truncate">
                {config.label}
              </span>
              <ChevronDown
                size={11}
                className={cn('text-ink-faint flex-shrink-0 transition-transform duration-150', open && 'rotate-180')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            {/* Dropdown opens DOWNWARD since the switcher is near the top of the sidebar */}
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded shadow-card-hover z-50 overflow-hidden py-1"
            >
              {ROLE_ORDER.map((id) => {
                const cfg = ROLE_CONFIG[id];
                const isActive = role === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSwitch(id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
                      isActive
                        ? 'bg-surface-muted dark:bg-dark-border'
                        : 'hover:bg-surface-muted dark:hover:bg-dark-border'
                    )}
                  >
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full flex-shrink-0',
                      isActive ? 'bg-brand-green' : 'bg-border dark:bg-dark-border'
                    )} />
                    <span className={cn(
                      'text-[13px] font-medium',
                      isActive ? 'text-ink dark:text-white' : 'text-ink-muted dark:text-gray-400'
                    )}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
