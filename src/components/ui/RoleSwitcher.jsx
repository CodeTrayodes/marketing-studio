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

export function RoleSwitcher({ collapsed, variant = 'default' }) {
  const { role, setRole } = useAppStore();
  const [open, setOpen] = useState(false);
  const config = ROLE_CONFIG[role];
  const isSidebarTop = variant === 'sidebarTop';

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
          'w-full flex items-center gap-2 transition-colors text-left',
          isSidebarTop
            ? 'rounded-[6px] border border-green-200/80 bg-green-50/70 px-3 py-2.5 hover:bg-green-50 dark:border-violet-500/20 dark:bg-violet-500/10 dark:hover:bg-violet-500/15'
            : 'px-2 py-2.5 hover:bg-surface-muted dark:hover:bg-dark-border',
          collapsed && 'justify-center'
        )}
        title={collapsed ? config.label : undefined}
      >
        <div className={cn(
          'rounded-full bg-brand-green text-white font-bold flex items-center justify-center flex-shrink-0',
          isSidebarTop ? 'w-5 h-5 text-[7px]' : 'w-6 h-6 text-[8px]'
        )}>
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
                <p className={cn(
                  'font-medium uppercase truncate leading-tight',
                  isSidebarTop ? 'text-[10px] tracking-[0.16em] text-green-500' : 'text-[10px] text-ink dark:text-white'
                )}>
                  {config.label}
                </p>
                <p className={cn(
                  'truncate leading-tight',
                  isSidebarTop ? 'mt-1 text-[13px] normal-case text-ink-muted dark:text-gray-300' : 'text-[9px] text-ink-faint dark:text-gray-500'
                )}>
                  {config.name}
                </p>
              </div>
              {open
                ? <ChevronUp size={isSidebarTop ? 12 : 10} className="text-ink-faint flex-shrink-0" />
                : <ChevronDown size={isSidebarTop ? 12 : 10} className="text-ink-faint flex-shrink-0" />
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
              className={cn(
                'absolute left-0 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-[10px] shadow-card-hover z-50 overflow-hidden',
                isSidebarTop ? 'top-full mt-1.5 w-full' : 'bottom-full mb-1 w-60'
              )}
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
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          'truncate text-[11px] font-medium leading-tight',
                          isActive ? 'text-brand-green' : 'text-ink dark:text-white'
                        )}>
                          {cfg.label}
                        </p>
                        <p className="mt-0.5 truncate text-[9px] leading-tight text-ink-faint dark:text-gray-500">
                          {cfg.description}
                        </p>
                        <p className="mt-0.5 truncate text-[9px] text-ink-faint dark:text-gray-600">
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
