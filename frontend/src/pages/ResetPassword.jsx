import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import HeartbeatLine from '../components/animations/HeartbeatLine';

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export default function ResetPassword() {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get('token') || '';
  const navigate                = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background blobs */}
      {[
        { pos: 'top-[-8%] left-[-4%]',   size: 'w-96 h-96', color: 'bg-teal-500/12',  dur: 8,  delay: 0 },
        { pos: 'bottom-[6%] right-[4%]', size: 'w-80 h-80', color: 'bg-blue-600/10',  dur: 10, delay: 1.5 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className={`absolute ${b.pos} ${b.size} ${b.color} rounded-full blur-3xl pointer-events-none`}
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: ['0 0 28px rgba(20,184,166,0.3)', '0 0 52px rgba(20,184,166,0.55)', '0 0 28px rgba(20,184,166,0.3)'],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600 mb-4 shadow-xl"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text tracking-tight">MedGuard-X</h1>
          <p className="text-white/40 mt-1 text-sm">Set a new password for your account</p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/25 via-blue-500/20 to-teal-500/25 rounded-2xl blur-sm pointer-events-none" />

          <GlassCard className="relative glass-strong p-8">
            <AnimatePresence mode="wait">
              {!token ? (
                /* ── No token in URL ── */
                <motion.div key="no-token" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold mb-1">Invalid reset link</p>
                  <p className="text-white/40 text-sm mb-5">The link is missing a token. Please request a new one.</p>
                  <Link to="/login" className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
                    Back to Sign In
                  </Link>
                </motion.div>

              ) : success ? (
                /* ── Success ── */
                <motion.div key="success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-5"
                  >
                    <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-1">Password updated!</h3>
                  <p className="text-white/40 text-sm mb-1">Your password has been changed successfully.</p>
                  <p className="text-white/30 text-xs">Redirecting to sign in...</p>
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mt-6 mx-auto"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.8, ease: 'linear', delay: 0.1 }}
                  />
                </motion.div>

              ) : (
                /* ── Form ── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-7">
                    <h2 className="text-2xl font-bold text-white">New password</h2>
                    <p className="text-white/40 text-sm mt-1">Choose a strong password for your account</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <AnimatedInput
                        label="New password"
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-[14px] text-white/30 hover:text-teal-400 transition-colors"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showPwd} />
                      </button>
                    </div>

                    <div className="relative">
                      <AnimatedInput
                        label="Confirm new password"
                        type={showCfm ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCfm(v => !v)}
                        className="absolute right-3 top-[14px] text-white/30 hover:text-teal-400 transition-colors"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showCfm} />
                      </button>
                      <AnimatePresence>
                        {confirm && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute right-9 top-[15px] text-xs font-bold ${confirm === password ? 'text-teal-400' : 'text-red-400'}`}
                          >
                            {confirm === password ? '✓' : '✗'}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          key="err"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <GradientButton type="submit" disabled={loading} className="mt-1">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                            className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Updating password...
                        </span>
                      ) : 'Set New Password'}
                    </GradientButton>
                  </form>

                  <p className="text-center text-white/30 text-xs mt-6">
                    Remembered it?{' '}
                    <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                      Back to Sign In
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        <div className="mt-8 opacity-20">
          <HeartbeatLine />
        </div>
      </motion.div>
    </div>
  );
}
