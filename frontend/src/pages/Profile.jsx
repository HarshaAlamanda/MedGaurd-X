import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import GlassCard from '../components/ui/GlassCard';
import Footer from '../components/layout/Footer';

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

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white/80 text-sm font-medium">{value}</span>
    </div>
  );
}

export default function Profile() {
  const { logout, userEmail } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]         = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // change-password state
  const [curPwd,   setCurPwd]   = useState('');
  const [newPwd,   setNewPwd]   = useState('');
  const [cfmPwd,   setCfmPwd]   = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showCfm,  setShowCfm]  = useState(false);
  const [pwdMsg,   setPwdMsg]   = useState(null);  // { type: 'success'|'error', text }
  const [pwdLoad,  setPwdLoad]  = useState(false);

  // delete-account state
  const [showDelete,  setShowDelete]  = useState(false);
  const [delPwd,      setDelPwd]      = useState('');
  const [showDelPwd,  setShowDelPwd]  = useState(false);
  const [delMsg,      setDelMsg]      = useState('');
  const [delLoad,     setDelLoad]     = useState(false);

  useEffect(() => {
    api.get('/auth/profile')
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== cfmPwd) { setPwdMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    if (newPwd.length < 6)  { setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' }); return; }
    setPwdLoad(true);
    try {
      await api.post('/auth/change-password', { current_password: curPwd, new_password: newPwd });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurPwd(''); setNewPwd(''); setCfmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to change password.' });
    } finally {
      setPwdLoad(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDelMsg('');
    setDelLoad(true);
    try {
      await api.delete('/auth/account', { data: { password: delPwd } });
      logout();
      navigate('/');
    } catch (err) {
      setDelMsg(err.response?.data?.detail || 'Incorrect password.');
      setDelLoad(false);
    }
  };

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : '?';
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16 space-y-6">

        {/* ── Header card ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <GlassCard className="p-7">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-500/20 flex-shrink-0">
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{userEmail}</h1>
                <p className="text-white/40 text-sm mt-0.5">Member since {memberSince}</p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-teal-400/80 text-xs font-medium">Active</span>
              </div>
            </div>

            {/* Stats row */}
            {!profileLoading && profile && (
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/[0.07]">
                {[
                  { label: 'Total Analyses', value: profile.total_analyses, color: 'text-white' },
                  { label: 'Fraud Detected', value: profile.fraud_detected, color: 'text-red-400' },
                  { label: 'Verified Clear', value: profile.verified_clear, color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-white/35 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* ── Account info ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
          <GlassCard className="p-6">
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h2>
            <Field label="Email address"  value={userEmail || '—'} />
            <Field label="Member since"   value={memberSince} />
            <Field label="Account status" value="Active" />
          </GlassCard>
        </motion.div>

        {/* ── Change password ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}>
          <GlassCard className="p-6">
            <h2 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-3">
              {[
                { label: 'Current password', val: curPwd, set: setCurPwd, show: showCur, toggle: () => setShowCur(v => !v) },
                { label: 'New password',     val: newPwd, set: setNewPwd, show: showNew, toggle: () => setShowNew(v => !v) },
                { label: 'Confirm new password', val: cfmPwd, set: setCfmPwd, show: showCfm, toggle: () => setShowCfm(v => !v) },
              ].map(({ label, val, set, show, toggle }) => (
                <div key={label} className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={label}
                    required
                    className="w-full bg-white/[0.05] border border-white/10 focus:border-teal-400/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors duration-200 pr-10"
                  />
                  <button type="button" onClick={toggle} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-teal-400 transition-colors">
                    <EyeIcon open={show} />
                  </button>
                  {/* Match indicator on confirm field */}
                  {label === 'Confirm new password' && cfmPwd && (
                    <span className={`absolute right-9 top-1/2 -translate-y-1/2 text-xs font-bold ${cfmPwd === newPwd ? 'text-teal-400' : 'text-red-400'}`}>
                      {cfmPwd === newPwd ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              ))}

              <AnimatePresence>
                {pwdMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`text-xs px-3 py-2 rounded-lg ${pwdMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                  >
                    {pwdMsg.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={pwdLoad}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 disabled:opacity-50 transition-all duration-200 mt-1"
              >
                {pwdLoad ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Updating...
                  </span>
                ) : 'Update Password'}
              </motion.button>
            </form>
          </GlassCard>
        </motion.div>

        {/* ── Danger zone ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <GlassCard className="p-6 border border-red-500/15">
            <h2 className="text-red-400 font-semibold text-sm mb-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Danger Zone
            </h2>
            <p className="text-white/35 text-xs mb-4">Permanently delete your account and all analysis history. This cannot be undone.</p>

            <AnimatePresence mode="wait">
              {!showDelete ? (
                <motion.button
                  key="trigger"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDelete(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/25 bg-red-500/8 hover:bg-red-500/15 hover:border-red-500/40 transition-all duration-200"
                >
                  Delete My Account
                </motion.button>
              ) : (
                <motion.form
                  key="confirm"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onSubmit={handleDeleteAccount}
                  className="space-y-3"
                >
                  <p className="text-white/50 text-xs">Enter your password to confirm deletion:</p>
                  <div className="relative">
                    <input
                      type={showDelPwd ? 'text' : 'password'}
                      value={delPwd}
                      onChange={e => setDelPwd(e.target.value)}
                      placeholder="Your password"
                      required
                      className="w-full bg-red-500/5 border border-red-500/20 focus:border-red-400/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors duration-200 pr-10"
                    />
                    <button type="button" onClick={() => setShowDelPwd(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-red-400 transition-colors">
                      <EyeIcon open={showDelPwd} />
                    </button>
                  </div>
                  {delMsg && <p className="text-red-400 text-xs">{delMsg}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setShowDelete(false); setDelPwd(''); setDelMsg(''); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 transition-all duration-200">
                      Cancel
                    </button>
                    <motion.button
                      type="submit" disabled={delLoad}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 disabled:opacity-50 transition-all duration-200"
                    >
                      {delLoad ? 'Deleting...' : 'Yes, Delete Everything'}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
}
