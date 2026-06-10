import { motion } from 'framer-motion';

export default function GradientButton({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative w-full py-3 px-6 rounded-xl font-semibold text-white text-sm
        bg-gradient-to-r from-teal-500 to-blue-600
        hover:from-teal-400 hover:to-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 overflow-hidden
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        whileHover={{ opacity: 0.05 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}
