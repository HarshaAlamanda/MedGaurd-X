import { motion, AnimatePresence } from 'framer-motion';

const ECG_PATH =
  'M 0,30 L 22,30 L 36,30 L 47,7 L 59,53 L 70,30 L 92,30 ' +
  'L 118,30 L 132,30 L 144,5 L 157,55 L 168,30 L 190,30 ' +
  'L 216,30 L 229,30 L 240,8 L 252,52 L 263,30 L 290,30 L 310,30';

function VitalsLine() {
  return (
    <svg viewBox="0 0 310 60" className="w-80 h-16" fill="none">
      <defs>
        <linearGradient id="tGrad" x1="0" y1="0" x2="310" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0d9488" stopOpacity="0" />
          <stop offset="20%"  stopColor="#2dd4bf" stopOpacity="0.7" />
          <stop offset="55%"  stopColor="#2dd4bf" />
          <stop offset="80%"  stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <filter id="ecgGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow copy */}
      <motion.path
        d={ECG_PATH}
        stroke="#2dd4bf"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ecgGlow)"
        opacity="0.35"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.72, ease: 'easeInOut', delay: 0.22 }}
      />
      {/* Main line */}
      <motion.path
        d={ECG_PATH}
        stroke="url(#tGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.72, ease: 'easeInOut', delay: 0.22 }}
      />
    </svg>
  );
}

export default function PageTransitionOverlay({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Scan line sweeping top → bottom */}
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent pointer-events-none"
            initial={{ top: 0 }}
            animate={{ top: '100%' }}
            transition={{ duration: 1.0, ease: 'linear' }}
          />

          {/* Subtle corner accents */}
          <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-teal-500/30 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-teal-500/30 rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-teal-500/30 rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-teal-500/30 rounded-br-lg" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3 mb-6"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 18px rgba(20,184,166,0.4)',
                  '0 0 46px rgba(20,184,166,0.75)',
                  '0 0 18px rgba(20,184,166,0.4)',
                ],
              }}
              transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600 flex items-center justify-center"
            >
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </motion.div>

            <span
              className="text-xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #2dd4bf, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              MedGuard-X
            </span>
          </motion.div>

          {/* ECG vitals line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.15 }}
          >
            <VitalsLine />
          </motion.div>

          {/* Bouncing dots */}
          <motion.div
            className="flex gap-2 mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-teal-400"
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
