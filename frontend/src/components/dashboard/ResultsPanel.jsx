import { useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import FraudGauge from './FraudGauge';

/* ── Risk styles ──────────────────────────────────────────────── */
const RISK_STYLES = {
  Low:    { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400', bar: '#10b981' },
  Medium: { bg: 'bg-amber-500/15',   border: 'border-amber-500/30',   text: 'text-amber-300',   dot: 'bg-amber-400',   bar: '#f59e0b' },
  High:   { bg: 'bg-red-500/15',     border: 'border-red-500/30',     text: 'text-red-300',     dot: 'bg-red-400',     bar: '#ef4444' },
};

/* ── Vitals config ────────────────────────────────────────────── */
const VITALS = [
  { key: 'blood_pressure_systolic',  label: 'Systolic BP',  unit: 'mmHg', min: 90,   max: 120,  lo: 60,   hi: 180 },
  { key: 'blood_pressure_diastolic', label: 'Diastolic BP', unit: 'mmHg', min: 60,   max: 80,   lo: 40,   hi: 120 },
  { key: 'heart_rate',               label: 'Heart Rate',   unit: 'bpm',  min: 60,   max: 100,  lo: 30,   hi: 160 },
  { key: 'temperature',              label: 'Temperature',  unit: '°C',   min: 36.1, max: 37.2, lo: 34.5, hi: 40.5 },
  { key: 'oxygen_saturation',        label: 'SpO₂',         unit: '%',    min: 95,   max: 100,  lo: 80,   hi: 100 },
  { key: 'glucose_level',            label: 'Glucose',      unit: 'mg/dL',min: 70,   max: 99,   lo: 50,   hi: 300 },
];

/* ── Animated fill bar ────────────────────────────────────────── */
function AnimatedBar({ pct, color, delay = 0 }) {
  const mv = useMotionValue(0);
  useEffect(() => {
    const ctrl = animate(mv, pct, { duration: 0.7, ease: 'easeOut', delay });
    return ctrl.stop;
  }, [pct]);
  return (
    <motion.div
      className="absolute top-0 left-0 h-full rounded-full"
      style={{ width: mv.get() + '%', backgroundColor: color, boxShadow: `0 0 6px ${color}50` }}
      animate={{ width: `${pct}%` }}
      initial={{ width: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
    />
  );
}

/* ── Single vital row ─────────────────────────────────────────── */
function VitalBar({ label, value, unit, min, max, lo, hi, delay }) {
  if (!value && value !== 0) return null;

  const clampedVal = Math.min(Math.max(value, lo), hi);
  const range = hi - lo;
  const valuePct  = ((clampedVal - lo) / range) * 100;
  const normalL   = ((min - lo) / range) * 100;
  const normalW   = ((max - min) / range) * 100;

  const inRange      = value >= min && value <= max;
  const slightlyOff  = !inRange && value >= min * 0.88 && value <= max * 1.18;
  const color        = inRange ? '#10b981' : slightlyOff ? '#f59e0b' : '#ef4444';
  const statusLabel  = inRange ? 'Normal' : slightlyOff ? 'Borderline' : 'Abnormal';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/45">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: color + '20', color }}>
            {statusLabel}
          </span>
          <span className="text-xs font-mono font-semibold" style={{ color }}>
            {value}
            <span className="text-white/25 font-normal ml-0.5 text-[10px]">{unit}</span>
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2 bg-white/[0.07] rounded-full overflow-hidden">
        {/* Normal zone highlight */}
        <div
          className="absolute top-0 h-full rounded-full bg-white/10"
          style={{ left: `${normalL}%`, width: `${normalW}%` }}
        />
        {/* Animated fill */}
        <AnimatedBar pct={valuePct} color={color} delay={delay + 0.1} />
        {/* Value dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#080f1e] z-10"
          style={{ left: `calc(${Math.min(valuePct, 96)}% - 5px)`, backgroundColor: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.5, type: 'spring', stiffness: 400 }}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-[9px] text-white/15">{lo}</span>
        <span className="text-[9px] text-white/20">Normal {min}–{max} {unit}</span>
        <span className="text-[9px] text-white/15">{hi}</span>
      </div>
    </motion.div>
  );
}

/* ── Fraud score breakdown bar ────────────────────────────────── */
function FraudBreakdownBar({ score }) {
  const pct     = Math.round(score * 100);
  const color   = score < 0.3 ? '#10b981' : score < 0.55 ? '#f59e0b' : '#ef4444';
  const label   = score < 0.3 ? 'Low threat' : score < 0.55 ? 'Moderate' : 'High threat';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/45">Fraud probability</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="relative h-3 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}50` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-white/20">0%</span>
        <span className="text-[10px] font-medium" style={{ color }}>{label}</span>
        <span className="text-[9px] text-white/20">100%</span>
      </div>
    </div>
  );
}

/* ── Main panel ───────────────────────────────────────────────── */
export default function ResultsPanel({ healthRisk, fraudResult, docResult, patientData }) {
  const hasAny = healthRisk || fraudResult || docResult;

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/25">
        <svg className="w-14 h-14 mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm text-center">Results will appear here after analysis</p>
      </div>
    );
  }

  const fraudScore = fraudResult?.fraud_score ?? 0;
  const isFraud    = fraudResult?.is_fraud || docResult?.suspected_fraud;
  const finalScore = docResult?.suspected_fraud ? Math.max(fraudScore, 0.8) : fraudScore;
  const rs         = healthRisk ? (RISK_STYLES[healthRisk] || RISK_STYLES.Low) : null;

  return (
    <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-1 scrollbar-hide">
      <AnimatePresence>

        {/* ── Health Risk ── */}
        {healthRisk && rs && (
          <motion.div
            key="health"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Health Risk</p>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${rs.bg} ${rs.border}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse ${rs.dot}`} />
              <span className={`font-bold text-base ${rs.text}`}>{healthRisk} Risk</span>
              <span className="ml-auto text-xs opacity-50">AI classified</span>
            </div>
          </motion.div>
        )}

        {/* ── Vitals Chart ── */}
        {patientData && (
          <motion.div
            key="vitals"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Vitals vs Normal Ranges</p>
            <div className="space-y-3.5 px-1">
              {VITALS.map((v, i) => (
                <VitalBar
                  key={v.key}
                  label={v.label}
                  value={patientData[v.key]}
                  unit={v.unit}
                  min={v.min}
                  max={v.max}
                  lo={v.lo}
                  hi={v.hi}
                  delay={i * 0.06}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Fraud Detection ── */}
        {fraudResult && (
          <motion.div
            key="fraud"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Fraud Detection</p>

            <FraudGauge score={finalScore} />
            <FraudBreakdownBar score={finalScore} />

            {docResult && (
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                docResult.suspected_fraud ? 'bg-red-500/10 text-red-300' : 'bg-white/5 text-white/50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${docResult.suspected_fraud ? 'bg-red-400' : 'bg-white/30'}`} />
                Document: {docResult.suspected_fraud ? 'Suspicious' : 'Verified'}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`px-5 py-4 rounded-xl border text-center ${
                isFraud
                  ? 'bg-red-500/15 border-red-500/40 text-red-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <p className="text-lg font-bold tracking-wide">
                {isFraud ? 'FRAUD DETECTED' : 'RECORD VERIFIED'}
              </p>
              <p className="text-xs opacity-60 mt-1">
                Confidence: {(Math.max(finalScore, 1 - finalScore) * 100).toFixed(1)}%
              </p>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
