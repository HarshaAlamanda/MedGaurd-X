import { motion } from 'framer-motion';

const POINTS = 8;

export default function DnaHelix({ className = '' }) {
  const pairs = Array.from({ length: POINTS }, (_, i) => ({
    y: (i / (POINTS - 1)) * 100,
    x1: 50 + 35 * Math.sin((i / (POINTS - 1)) * Math.PI * 2),
    x2: 50 - 35 * Math.sin((i / (POINTS - 1)) * Math.PI * 2),
  }));

  return (
    <motion.svg
      viewBox="0 0 100 120"
      className={`w-32 h-40 ${className}`}
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
    >
      {/* Strand 1 */}
      {pairs.map((p, i) => i < POINTS - 1 && (
        <line
          key={`s1-${i}`}
          x1={p.x1} y1={p.y + 10}
          x2={pairs[i + 1].x1} y2={pairs[i + 1].y + 10}
          stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" opacity="0.8"
        />
      ))}
      {/* Strand 2 */}
      {pairs.map((p, i) => i < POINTS - 1 && (
        <line
          key={`s2-${i}`}
          x1={p.x2} y1={p.y + 10}
          x2={pairs[i + 1].x2} y2={pairs[i + 1].y + 10}
          stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.8"
        />
      ))}
      {/* Rungs */}
      {pairs.map((p, i) => (
        <motion.line
          key={`r-${i}`}
          x1={p.x1} y1={p.y + 10}
          x2={p.x2} y2={p.y + 10}
          stroke="url(#dnaGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
      {/* Node dots */}
      {pairs.map((p, i) => (
        <motion.circle
          key={`d-${i}`}
          cx={p.x1} cy={p.y + 10} r="3"
          fill="#2dd4bf"
          animate={{ r: [2.5, 4, 2.5], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
      <defs>
        <linearGradient id="dnaGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}
