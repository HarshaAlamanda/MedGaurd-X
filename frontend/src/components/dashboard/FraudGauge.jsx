import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const ARC_START = -140;
const ARC_END = 140;
const ARC_RANGE = ARC_END - ARC_START;

export default function FraudGauge({ score = 0 }) {
  const count = useMotionValue(0);
  const displayed = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const ctrl = animate(count, score * 100, { duration: 1.4, ease: 'easeOut' });
    return ctrl.stop;
  }, [score]);

  const pct = Math.min(Math.max(score, 0), 1);
  const angle = ARC_START + pct * ARC_RANGE;

  const color = pct < 0.3 ? '#10b981' : pct < 0.7 ? '#f59e0b' : '#ef4444';
  const bgColor = pct < 0.3 ? '#10b98120' : pct < 0.7 ? '#f59e0b20' : '#ef444420';
  const label = pct < 0.3 ? 'Low Risk' : pct < 0.7 ? 'Medium Risk' : 'High Risk';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 140" className="w-48 h-32">
        {/* Background track */}
        <path
          d={describeArc(100, 100, 70, ARC_START, ARC_END)}
          fill="none"
          stroke="#ffffff15"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Zone colors */}
        <path d={describeArc(100, 100, 70, ARC_START, ARC_START + ARC_RANGE * 0.3)} fill="none" stroke="#10b98130" strokeWidth="14" strokeLinecap="round" />
        <path d={describeArc(100, 100, 70, ARC_START + ARC_RANGE * 0.3, ARC_START + ARC_RANGE * 0.7)} fill="none" stroke="#f59e0b30" strokeWidth="14" strokeLinecap="round" />
        <path d={describeArc(100, 100, 70, ARC_START + ARC_RANGE * 0.7, ARC_END)} fill="none" stroke="#ef444430" strokeWidth="14" strokeLinecap="round" />

        {/* Active fill */}
        {pct > 0 && (
          <motion.path
            d={describeArc(100, 100, 70, ARC_START, angle)}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        )}

        {/* Needle */}
        <motion.line
          x1="100" y1="100"
          x2={100 + 55 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={100 + 55 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
        <circle cx="100" cy="100" r="5" fill={color} />

        {/* Center score */}
        <text x="100" y="92" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Inter,sans-serif">
          <motion.tspan>{displayed}</motion.tspan>
          <tspan fontSize="12" fill="rgba(255,255,255,0.5)">%</tspan>
        </text>
      </svg>

      <motion.span
        key={label}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-semibold mt-1"
        style={{ color }}
      >
        {label}
      </motion.span>
    </div>
  );
}
