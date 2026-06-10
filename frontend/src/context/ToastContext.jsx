import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

const STYLES = {
  success: {
    wrap: 'border-emerald-500/35 bg-emerald-950/70',
    icon: 'bg-emerald-500/20 text-emerald-400',
    text: 'text-emerald-50',
    bar: 'bg-emerald-500',
  },
  error: {
    wrap: 'border-red-500/35 bg-red-950/70',
    icon: 'bg-red-500/20 text-red-400',
    text: 'text-red-50',
    bar: 'bg-red-500',
  },
  info: {
    wrap: 'border-teal-500/35 bg-slate-900/80',
    icon: 'bg-teal-500/20 text-teal-400',
    text: 'text-white/90',
    bar: 'bg-teal-500',
  },
  warning: {
    wrap: 'border-amber-500/35 bg-amber-950/70',
    icon: 'bg-amber-500/20 text-amber-400',
    text: 'text-amber-50',
    bar: 'bg-amber-500',
  },
};

const DURATION = 4000;

function ToastItem({ toast, onDismiss }) {
  const s = STYLES[toast.type] || STYLES.info;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => onDismiss(toast.id)}
      className={`pointer-events-auto relative flex items-center gap-3 pl-3 pr-4 py-3 rounded-2xl border backdrop-blur-xl cursor-pointer min-w-[280px] max-w-[360px] shadow-2xl overflow-hidden ${s.wrap}`}
    >
      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${s.bar}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: DURATION / 1000, ease: 'linear' }}
      />
      <span className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}>
        {ICONS[toast.type]}
      </span>
      <p className={`text-sm font-medium leading-snug flex-1 ${s.text}`}>{toast.message}</p>
      <span className="text-white/20 text-base leading-none ml-1">×</span>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => dismiss(id), DURATION + 300);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
