import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AUTH_NAV    = [{ label: 'Home', to: '/' }, { label: 'Dashboard', to: '/dashboard' }];
const PUBLIC_NAV  = [{ label: 'Home', to: '/' }, { label: 'Sign In', to: '/login' }, { label: 'Sign Up', to: '/signup' }];

export default function Navbar() {
  const { logout, isAuthenticated, userEmail } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen]         = useState(false);
  const [hovered, setHovered]   = useState(null);

  const handleLogout = () => { setOpen(false); logout(); navigate('/login'); };
  const initials     = userEmail ? userEmail.slice(0, 2).toUpperCase() : '?';
  const navLinks     = isAuthenticated ? AUTH_NAV : PUBLIC_NAV;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07]"
      style={{ background: 'rgba(8,15,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="font-bold text-lg gradient-text">MedGuard-X</span>
        </motion.div>

        {/* Centre nav links */}
        <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ label, to }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onMouseEnter={() => setHovered(to)}
                onMouseLeave={() => setHovered(null)}
                className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 select-none"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.45)' }}
              >
                {/* Hover / active pill */}
                <AnimatePresence>
                  {(hovered === to || isActive) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg,rgba(13,148,136,0.22),rgba(37,99,235,0.18))'
                          : 'rgba(255,255,255,0.05)',
                        border: isActive ? '1px solid rgba(13,148,136,0.28)' : '1px solid rgba(255,255,255,0.07)',
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Active underline dot */}
                {isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right — user controls */}
        {isAuthenticated ? (
          <div className="relative flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-teal-500/30 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
              <span className="text-white/70 text-sm font-medium max-w-[140px] truncate hidden sm:block">{userEmail}</span>
              <motion.svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>

            <AnimatePresence>
              {open && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="absolute right-0 mt-2 w-56 border border-white/15 rounded-2xl overflow-hidden shadow-2xl z-20"
                    style={{ background: 'rgba(8,15,30,0.92)', backdropFilter: 'blur(24px)' }}
                  >
                    <div className="px-4 py-3.5 border-b border-white/10">
                      <p className="text-white/35 text-xs font-medium uppercase tracking-wide">Signed in as</p>
                      <p className="text-white/85 text-sm font-semibold truncate mt-1">{userEmail}</p>
                    </div>
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={() => { setOpen(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white transition-colors duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </motion.button>
                    <div className="border-t border-white/[0.07]" />
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-400 transition-colors duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      Sign Out
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            href="/signup"
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 transition-all duration-200 shadow-md shadow-teal-500/20"
          >
            Get Started
          </motion.a>
        )}
      </div>
    </nav>
  );
}
