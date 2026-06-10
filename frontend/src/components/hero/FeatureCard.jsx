import { motion } from 'framer-motion';
import ScrollReveal from '../animations/ScrollReveal';

export default function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <ScrollReveal delay={delay}>
      <motion.div
        whileHover={{ y: -6, scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="h-full"
      >
        <div className="glass rounded-2xl p-6 h-full border border-white/10 hover:border-teal-500/30 transition-colors duration-300 group relative overflow-hidden">
          {/* Glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(13,148,136,0.08) 0%, transparent 70%)' }} />

          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-teal-500/30 flex items-center justify-center mb-4"
            whileHover={{ scale: 1.12, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {icon}
          </motion.div>
          <h3 className="text-white font-semibold text-base mb-2 group-hover:text-teal-100 transition-colors duration-200">{title}</h3>
          <p className="text-white/50 text-sm leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}
