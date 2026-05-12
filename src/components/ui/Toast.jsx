import { create } from 'zustand';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const useToastStore = create((set) => ({
  toasts: [],
  add: (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },
}));

export function addToast(msg, type = 'success') {
  useToastStore.getState().add(msg, type);
}

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const ICON_COLOR = {
  success: 'text-brand-green',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return createPortal(
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[300] flex flex-col-reverse gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || CheckCircle2;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-ink dark:bg-white rounded-[8px] shadow-lg text-white dark:text-ink text-[11px] font-medium whitespace-nowrap"
            >
              <Icon size={13} className={ICON_COLOR[t.type] || ICON_COLOR.success} />
              {t.msg}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
