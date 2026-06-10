import { motion } from 'framer-motion';

const PARTICLES = [
  { x: '10%', y: '20%', delay: 0, size: 14 },
  { x: '85%', y: '15%', delay: 0.8, size: 10 },
  { x: '20%', y: '70%', delay: 1.5, size: 16 },
  { x: '75%', y: '65%', delay: 0.4, size: 12 },
  { x: '50%', y: '10%', delay: 1.1, size: 8 },
  { x: '90%', y: '45%', delay: 2.0, size: 14 },
  { x: '5%', y: '50%', delay: 0.6, size: 10 },
  { x: '60%', y: '85%', delay: 1.8, size: 12 },
];

function PlusIcon({ size }) {
  const s = size;
  const t = s * 0.28;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <rect x={(s - t) / 2} y={0} width={t} height={s} rx={t / 2} fill="currentColor" />
      <rect x={0} y={(s - t) / 2} width={s} height={t} rx={t / 2} fill="currentColor" />
    </svg>
  );
}

export default function MedicalParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-teal-400/20"
          style={{ left: p.x, top: p.y }}
          animate={{ y: [0, -28, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 5 + i * 0.5, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PlusIcon size={p.size} />
        </motion.div>
      ))}
    </div>
  );
}
