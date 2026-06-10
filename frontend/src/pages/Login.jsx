import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import MedicalParticles from '../components/animations/MedicalParticles';
import HeartbeatLine from '../components/animations/HeartbeatLine';

function LoginBackground() {
  const blobs = [
    { pos: 'top-[-8%] left-[-4%]',    size: 'w-96 h-96', color: 'bg-teal-500/15',  dur: 8,  delay: 0 },
    { pos: 'top-[8%] right-[-6%]',    size: 'w-80 h-80', color: 'bg-blue-600/10',  dur: 10, delay: 2 },
    { pos: 'bottom-[8%] left-[8%]',   size: 'w-72 h-72', color: 'bg-indigo-500/10',dur: 9,  delay: 1 },
    { pos: 'bottom-[-4%] right-[4%]', size: 'w-64 h-64', color: 'bg-cyan-400/8',   dur: 7,  delay: 3 },
  ];

  return (
    <>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Animated gradient blobs */}
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute ${b.pos} ${b.size} ${b.color} rounded-full blur-3xl pointer-events-none`}
          animate={{ scale: [1, 1.18, 1], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Rotating rings (centered) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="w-[640px] h-[640px] rounded-full border border-teal-500/[0.06]"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="w-[460px] h-[460px] rounded-full border border-blue-500/[0.05]"
          animate={{ rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </>
  );
}

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

export default function Login() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const res = await axios.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      login(res.data.access_token, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]     = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      await axios.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSent(true);
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Failed to send reset link. Try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const toggleForgot = () => {
    setShowForgot(v => !v);
    setForgotSent(false);
    setForgotEmail(email);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <LoginBackground />
      <MedicalParticles />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 28px rgba(20,184,166,0.3)',
                '0 0 52px rgba(20,184,166,0.55)',
                '0 0 28px rgba(20,184,166,0.3)',
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600 mb-4 shadow-xl"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl font-bold gradient-text tracking-tight"
          >
            MedGuard-X
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-white/40 mt-1 text-sm tracking-wide"
          >
            AI Medical Risk & Fraud Detection
          </motion.p>
        </div>

        {/* Card with gradient border glow */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/25 via-blue-500/20 to-teal-500/25 rounded-2xl blur-sm pointer-events-none" />

          <GlassCard className="relative glass-strong p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-white/40 text-sm mt-1">Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <AnimatedInput
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Password + show/hide toggle */}
              <div className="relative">
                <AnimatedInput
                  label="Password"
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

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => setRememberMe(v => !v)}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      rememberMe
                        ? 'bg-teal-500 border-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]'
                        : 'bg-white/5 border-white/20 group-hover:border-teal-500/50'
                    }`}
                  >
                    <AnimatePresence>
                      {rememberMe && (
                        <motion.svg
                          key="check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors select-none">
                    Remember me
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleForgot}
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Forgot password expandable panel */}
              <AnimatePresence>
                {showForgot && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-3">
                      <AnimatePresence mode="wait">
                        {forgotSent ? (
                          <motion.div
                            key="sent"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-9 h-9 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-teal-400 text-sm font-semibold">Reset link sent!</p>
                              <p className="text-white/40 text-xs mt-0.5">Check your inbox for instructions.</p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <p className="text-white/50 text-xs mb-2.5">
                              Enter your email and we'll send reset instructions.
                            </p>
                            <form onSubmit={handleForgotSubmit} className="flex gap-2">
                              <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-teal-400/60 transition-colors"
                              />
                              <button
                                type="submit"
                                disabled={forgotLoading}
                                className="bg-teal-500/20 hover:bg-teal-500/35 border border-teal-500/30 text-teal-300 text-xs px-3 py-2 rounded-lg transition-colors whitespace-nowrap font-medium disabled:opacity-50"
                              >
                                {forgotLoading ? '...' : 'Send link'}
                              </button>
                            </form>
                            {forgotError && (
                              <p className="text-red-400 text-xs mt-2">{forgotError}</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
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

              {/* Submit */}
              <GradientButton type="submit" disabled={loading} className="mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </GradientButton>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/20 text-xs tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <p className="text-center text-white/40 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                Create one free
              </Link>
            </p>
          </GlassCard>
        </div>

        {/* ECG line */}
        <div className="mt-8 opacity-20">
          <HeartbeatLine />
        </div>

      </motion.div>
    </div>
  );
}
