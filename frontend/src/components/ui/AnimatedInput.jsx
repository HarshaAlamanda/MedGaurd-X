import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedInput({ label, type = 'text', value, onChange, required = false, className = '' }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== '' && value !== undefined && value !== null;
  const lifted = focused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <motion.label
        animate={{
          y: lifted ? -22 : 0,
          scale: lifted ? 0.78 : 1,
          color: focused ? '#2dd4bf' : 'rgba(255,255,255,0.5)',
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-3 top-3.5 text-sm pointer-events-none origin-left font-medium"
      >
        {label}
      </motion.label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className={`
          w-full pt-5 pb-2 px-3 rounded-xl text-sm text-white
          bg-white/5 border transition-all duration-200 outline-none
          ${focused ? 'border-teal-400 shadow-[0_0_0_2px_rgba(45,212,191,0.15)]' : 'border-white/10'}
        `}
      />
    </div>
  );
}
