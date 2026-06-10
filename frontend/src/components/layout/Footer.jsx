import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeartbeatLine from '../animations/HeartbeatLine';

const CAPABILITIES = [
  { label: 'Health Risk AI',      icon: '♥', color: 'text-red-400' },
  { label: 'Fraud Detection',     icon: '🛡', color: 'text-teal-400' },
  { label: 'Document OCR',        icon: '📄', color: 'text-blue-400' },
  { label: 'CNN Visual Analysis', icon: '🔬', color: 'text-purple-400' },
];

const TECH_STACK = ['FastAPI', 'XGBoost', 'PyTorch', 'React', 'Tesseract OCR'];

export default function Footer() {
  return (
    <footer className="relative mt-8 border-t border-white/[0.06] bg-[#080f1e]">
      <div className="opacity-[0.12]">
        <HeartbeatLine />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

          {/* ── Brand column ── */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.08 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600 flex items-center justify-center shadow-[0_0_18px_rgba(20,184,166,0.3)] flex-shrink-0"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>
              <span className="text-xl font-bold"
                style={{ background: 'linear-gradient(135deg,#2dd4bf,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                MedGuard-X
              </span>
            </Link>

            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              AI-powered platform for real-time medical risk assessment and healthcare fraud detection. Built for research and analysis purposes.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {TECH_STACK.map((tech) => (
                <span key={tech} className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white/30 font-mono">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* ── Capabilities ── */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-5">Capabilities</h4>
            <ul className="space-y-3">
              {CAPABILITIES.map(({ label, icon, color }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{icon}</span>
                  <span className={`text-sm ${color} opacity-70`}>{label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-400/80 text-xs font-medium">All systems operational</span>
            </div>
          </div>
        </div>

        {/* ── Bottom strip ── */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} MedGuard-X · For research &amp; educational use only · Not intended for clinical diagnosis
          </p>
          <p className="text-white/15 text-xs">AI Medical Risk &amp; Fraud Detection Platform</p>
        </div>
      </div>
    </footer>
  );
}
