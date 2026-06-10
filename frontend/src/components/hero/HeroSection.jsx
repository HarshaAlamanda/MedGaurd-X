import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animate } from 'framer-motion';
import HeartbeatLine from '../animations/HeartbeatLine';
import DnaHelix from '../animations/DnaHelix';
import MedicalParticles from '../animations/MedicalParticles';

function CountUp({ to, suffix = '', duration = 2 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const ctrl = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: v => setVal(Math.round(v)),
    });
    return ctrl.stop;
  }, [to, duration]);
  return <>{val}{suffix}</>;
}

const STATS = [
  { value: 98, suffix: '%+', label: 'Accuracy', duration: 2.2 },
  { value: 2, suffix: '', label: 'AI Models', duration: 1 },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
      <MedicalParticles />

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-teal-500/30 text-teal-300 text-xs font-medium mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            AI-Powered Medical Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
          >
            <span className="text-white">Medical Risk</span>
            <br />
            <span className="gradient-text">Detection</span>
            <br />
            <span className="text-white">Reimagined</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg leading-relaxed mb-8 max-w-md"
          >
            Harness XGBoost AI to detect health risks and identify medical fraud with 98%+ accuracy in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/signup"
                className="inline-block px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 transition-all duration-200 text-sm shadow-lg shadow-teal-500/20"
              >
                Get Started Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="inline-block px-6 py-3 rounded-xl font-semibold text-white/80 glass hover:bg-white/10 transition-all duration-200 text-sm border border-white/10"
              >
                Sign In →
              </Link>
            </motion.div>
          </motion.div>

          {/* Animated stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-8 mt-10"
          >
            {STATS.map(({ value, suffix, label, duration }) => (
              <div key={label}>
                <p className="text-2xl font-bold gradient-text">
                  <CountUp to={value} suffix={suffix} duration={duration} />
                </p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            ))}
            <div>
              <p className="text-2xl font-bold gradient-text">Real-time</p>
              <p className="text-white/40 text-xs mt-0.5">Analysis</p>
            </div>
          </motion.div>
        </div>

        {/* Right: Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Pulsing heart */}
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-teal-400/30 flex items-center justify-center glow-teal">
              <svg className="w-14 h-14 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-teal-400/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <DnaHelix />

          <div className="w-full max-w-xs opacity-70">
            <HeartbeatLine />
          </div>

          {/* Shield badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03, borderColor: 'rgba(13,148,136,0.4)' }}
            className="glass rounded-2xl px-6 py-4 flex items-center gap-4 border border-teal-500/20 cursor-default"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Fraud Detection Active</p>
              <p className="text-teal-400 text-xs">XGBoost · 99.7% AUC</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
