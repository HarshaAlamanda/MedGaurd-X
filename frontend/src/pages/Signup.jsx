import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import MedicalParticles from '../components/animations/MedicalParticles';
import HeartbeatLine from '../components/animations/HeartbeatLine';

function SignupBackground() {
  const blobs = [
    { pos: 'top-[-6%] right-[-4%]',   size: 'w-96 h-96', color: 'bg-blue-600/12',   dur: 9,  delay: 0 },
    { pos: 'top-[12%] left-[-6%]',    size: 'w-80 h-80', color: 'bg-teal-500/14',   dur: 8,  delay: 1.5 },
    { pos: 'bottom-[6%] right-[8%]',  size: 'w-72 h-72', color: 'bg-indigo-500/10', dur: 10, delay: 0.8 },
    { pos: 'bottom-[-4%] left-[5%]',  size: 'w-64 h-64', color: 'bg-cyan-400/8',    dur: 7,  delay: 2.5 },
  ];

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute ${b.pos} ${b.size} ${b.color} rounded-full blur-3xl pointer-events-none`}
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="w-[680px] h-[680px] rounded-full border border-blue-500/[0.05]"
          animate={{ rotate: -360 }}
          transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="w-[480px] h-[480px] rounded-full border border-teal-500/[0.05]"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
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

function StrengthBar({ password }) {
  const getStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-teal-400', 'bg-green-400'];
  const textColors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-teal-400', 'text-green-400'];

  if (!password) return null;

  return (
    <div className="space-y-1.5 px-0.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? colors[strength] : 'bg-white/10'}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          />
        ))}
      </div>
      <p className={`text-xs ${textColors[strength]}`}>{labels[strength]}</p>
    </div>
  );
}

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

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
      await api.post('/auth/register', { email, password, first_name: firstName, last_name: lastName });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      // FastAPI can return detail as a string (HTTPException) or array (422 validation)
      if (!detail) {
        setError('Registration failed. Check your connection and try again.');
      } else if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(' · ') || 'Invalid input.');
      } else if (err.response?.status === 409) {
        setError('already_registered');   // special key — shows sign-in prompt
      } else {
        setError(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <SignupBackground />
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
                '0 0 28px rgba(59,130,246,0.3)',
                '0 0 52px rgba(59,130,246,0.5)',
                '0 0 28px rgba(59,130,246,0.3)',
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600 mb-4 shadow-xl"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/25 via-teal-500/20 to-blue-500/25 rounded-2xl blur-sm pointer-events-none" />

          <GlassCard className="relative glass-strong p-8">
            <AnimatePresence mode="wait">
              {success ? (
                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="py-6 text-center"
                >
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
                  <h3 className="text-xl font-bold text-white mb-1">Account created!</h3>
                  <p className="text-white/40 text-sm">Redirecting you to sign in...</p>
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mt-6 mx-auto"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.4, ease: 'linear', delay: 0.1 }}
                  />
                </motion.div>
              ) : (
                /* ── Form state ── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-7">
                    <h2 className="text-2xl font-bold text-white">Create account</h2>
                    <p className="text-white/40 text-sm mt-1">Join MedGuard-X — it's free</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <AnimatedInput
                        label="First name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                      />
                      <AnimatedInput
                        label="Last name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                    <AnimatedInput
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    {/* Password + toggle */}
                    <div className="space-y-2">
                      <div className="relative">
                        <AnimatedInput
                          label="Password (min. 6 characters)"
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
                      <StrengthBar password={password} />
                    </div>

                    {/* Confirm password + toggle */}
                    <div className="relative">
                      <AnimatedInput
                        label="Confirm password"
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
                      {/* Match indicator */}
                      <AnimatePresence>
                        {confirm && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute right-9 top-[15px] text-xs font-medium transition-colors ${
                              confirm === password ? 'text-teal-400' : 'text-red-400'
                            }`}
                          >
                            {confirm === password ? '✓' : '✗'}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        error === 'already_registered' ? (
                          <motion.div
                            key="error-409"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-3 space-y-1.5"
                          >
                            <p className="text-amber-300 text-sm font-medium">Email already registered</p>
                            <p className="text-white/45 text-xs">
                              This email already has an account.{' '}
                              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2">
                                Sign in instead
                              </Link>
                              {' '}or use{' '}
                              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2">
                                Forgot password?
                              </Link>
                            </p>
                          </motion.div>
                        ) : (
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
                        )
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
                          Creating account...
                        </span>
                      ) : 'Create Account'}
                    </GradientButton>
                  </form>

                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-white/20 text-xs tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-white/8" />
                  </div>

                  <p className="text-center text-white/40 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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
