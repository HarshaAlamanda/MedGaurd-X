import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/layout/Navbar';
import GlassCard from '../components/ui/GlassCard';
import PatientForm from '../components/dashboard/PatientForm';
import DocumentUpload from '../components/dashboard/DocumentUpload';
import ResultsPanel from '../components/dashboard/ResultsPanel';
import FraudGauge from '../components/dashboard/FraudGauge';
import Footer from '../components/layout/Footer';
import { useToast } from '../context/ToastContext';
import { exportAnalysisPdf } from '../utils/exportPdf';
import { useAuth } from '../context/AuthContext';

const TABS = [
  {
    id: 'document',
    label: 'Document Upload',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Upload a medical report (PDF, PNG, JPEG) for OCR fraud detection',
  },
  {
    id: 'manual',
    label: 'Manual Entry',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    description: 'Enter patient vitals and symptoms manually to run AI risk analysis',
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'View all analyses performed in this session',
  },
];

/* ── Animated counter ──────────────────────────────────────────── */
function AnimatedCount({ value, decimals = 0 }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()
  );

  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 0.7, ease: 'easeOut' });
    return ctrl.stop;
  }, [value]);

  return <motion.span>{display}</motion.span>;
}

/* ── Stats strip ───────────────────────────────────────────────── */
function StatsStrip({ history }) {
  const total    = history.length;
  const fraud    = history.filter(h => h.isFraud).length;
  const verified = total - fraud;
  const avg      = total > 0
    ? history.reduce((s, h) => s + (h.fraudScore ?? 0), 0) / total * 100
    : 0;

  const stats = [
    {
      label: 'Total Analyses',
      value: total,
      decimals: 0,
      suffix: '',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      valueColor: 'text-white',
    },
    {
      label: 'Fraud Detected',
      value: fraud,
      decimals: 0,
      suffix: '',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      valueColor: fraud > 0 ? 'text-red-400' : 'text-white/50',
    },
    {
      label: 'Verified Clear',
      value: verified,
      decimals: 0,
      suffix: '',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      valueColor: verified > 0 ? 'text-emerald-400' : 'text-white/50',
    },
    {
      label: 'Avg Fraud Score',
      value: avg,
      decimals: 1,
      suffix: '%',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: avg > 50 ? 'bg-red-500/15' : 'bg-teal-500/15',
      iconColor: avg > 50 ? 'text-red-400' : 'text-teal-400',
      valueColor: avg > 50 ? 'text-red-400' : avg > 0 ? 'text-teal-400' : 'text-white/50',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
    >
      {stats.map(({ label, value, decimals, suffix, icon, iconBg, iconColor, valueColor }) => (
        <motion.div
          key={label}
          whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
        >
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 ${iconColor}`}>
            {icon}
          </div>
          <div>
            <p className={`text-xl font-bold leading-none ${valueColor}`}>
              <AnimatedCount value={value} decimals={decimals} />{suffix}
            </p>
            <p className="text-white/35 text-[11px] mt-1 leading-none">{label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

const pageVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.25 } }),
};

const TAB_ORDER = ['document', 'manual', 'history'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('document');
  const [tabDir, setTabDir] = useState(1);

  const [healthRisk, setHealthRisk] = useState(null);
  const [fraudResult, setFraudResult] = useState(null);
  const [docResult, setDocResult] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const { addToast } = useToast();
  const { userEmail } = useAuth();

  // Load persistent history from backend on mount
  useEffect(() => {
    api.get('/analyses')
      .then(res => {
        setHistory(res.data.map(a => ({
          id: a.id,
          timestamp: new Date(a.created_at + 'Z'),
          type: a.analysis_type,
          fraudScore: a.fraud_score,
          isFraud: a.is_fraud,
          healthRisk: a.health_risk,
          patientId: a.patient_data?.patient_id,
          wordCount: a.doc_result?.word_count,
          keywords: a.doc_result?.medical_keywords_found ?? [],
          cnnScore: a.doc_result?.cnn_medical_score,
          persistent: true,
        })));
      })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, []);

  const switchTab = (id) => {
    const dir = TAB_ORDER.indexOf(id) > TAB_ORDER.indexOf(activeTab) ? 1 : -1;
    setTabDir(dir);
    setActiveTab(id);
  };

  const handleDocResult = async (data) => {
    setDocResult(data);
    if (data) {
      addToast(
        data.suspected_fraud ? 'Fraud detected in document!' : 'Document verified — no fraud detected',
        data.suspected_fraud ? 'error' : 'success'
      );
      try {
        const res = await api.post('/analyses', {
          analysis_type: 'document',
          fraud_score: data.document_fraud_score,
          is_fraud: data.suspected_fraud,
          doc_result: data,
        });
        setHistory(prev => [{
          id: res.data.id,
          timestamp: new Date(),
          type: 'document',
          fraudScore: data.document_fraud_score,
          isFraud: data.suspected_fraud,
          wordCount: data.word_count,
          keywords: data.medical_keywords_found ?? [],
          cnnScore: data.cnn_medical_score,
          persistent: true,
        }, ...prev]);
      } catch {
        setHistory(prev => [{
          id: Date.now(),
          timestamp: new Date(),
          type: 'document',
          fraudScore: data.document_fraud_score,
          isFraud: data.suspected_fraud,
          wordCount: data.word_count,
          keywords: data.medical_keywords_found ?? [],
          cnnScore: data.cnn_medical_score,
        }, ...prev]);
      }
    }
  };

  const handleAnalysis = async (payload) => {
    setPatientData(payload);
    setLoading(true);
    setError('');
    try {
      const [healthRes, fraudRes] = await Promise.all([
        api.post('/predict/health', payload),
        api.post('/predict/fraud', payload),
      ]);
      const hr = healthRes.data.health_risk;
      const fr = fraudRes.data;
      setHealthRisk(hr);
      setFraudResult(fr);
      addToast(
        fr.is_fraud ? `Fraud detected — ${hr} health risk` : `Analysis complete — ${hr} health risk`,
        fr.is_fraud ? 'error' : 'success'
      );
      try {
        const res = await api.post('/analyses', {
          analysis_type: 'manual',
          patient_data: payload,
          health_risk: hr,
          fraud_score: fr.fraud_score,
          is_fraud: fr.is_fraud,
        });
        setHistory(prev => [{
          id: res.data.id,
          timestamp: new Date(),
          type: 'manual',
          fraudScore: fr.fraud_score,
          isFraud: fr.is_fraud,
          healthRisk: hr,
          patientId: payload.patient_id,
          persistent: true,
        }, ...prev]);
      } catch {
        setHistory(prev => [{
          id: Date.now(),
          timestamp: new Date(),
          type: 'manual',
          fraudScore: fr.fraud_score,
          isFraud: fr.is_fraud,
          healthRisk: hr,
          patientId: payload.patient_id,
        }, ...prev]);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Analysis failed. Make sure the API server is running.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      {/* Page header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-blue-600/5" />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              AI Analysis Ready
            </div>
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1.5">Analysis Dashboard</h1>
                <p className="text-white/40 text-sm">
                  Upload a medical document or enter patient data to run instant AI-powered risk and fraud detection.
                </p>
              </div>
              {history.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => switchTab('history')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white/80 text-xs transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {history.length} scan{history.length !== 1 ? 's' : ''} this session
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats strip */}
        <StatsStrip history={history} />

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-3 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit"
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              whileHover={{ scale: activeTab !== tab.id ? 1.02 : 1 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.4), rgba(37,99,235,0.4))' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
                {tab.id === 'history' && history.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-teal-500/30 text-teal-300 text-[10px] font-bold flex items-center justify-center">
                    {history.length > 9 ? '9+' : history.length}
                  </span>
                )}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeTab + '-desc'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/30 text-xs mb-8"
          >
            {TABS.find((t) => t.id === activeTab)?.description}
          </motion.p>
        </AnimatePresence>

        {/* Tab pages */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={tabDir}>
            {activeTab === 'document' && (
              <motion.div key="document" custom={tabDir} variants={pageVariants} initial="enter" animate="center" exit="exit">
                <DocumentPage onResult={handleDocResult} docResult={docResult} />
              </motion.div>
            )}
            {activeTab === 'manual' && (
              <motion.div key="manual" custom={tabDir} variants={pageVariants} initial="enter" animate="center" exit="exit">
                <ManualPage
                  onSubmit={handleAnalysis}
                  loading={loading}
                  error={error}
                  healthRisk={healthRisk}
                  fraudResult={fraudResult}
                  docResult={docResult}
                  patientData={patientData}
                  userEmail={userEmail}
                />
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div key="history" custom={tabDir} variants={pageVariants} initial="enter" animate="center" exit="exit">
                <HistoryPage history={history} historyLoaded={historyLoaded} onGoToTab={switchTab} onDelete={async (id) => {
                  try { await api.delete(`/analyses/${id}`); } catch {}
                  setHistory(prev => prev.filter(h => h.id !== id));
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── Manual Entry Page ─────────────────────────────────────────── */
function ManualPage({ onSubmit, loading, error, healthRisk, fraudResult, docResult, patientData, userEmail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <GlassCard className="p-7">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Patient Details</h3>
              <p className="text-white/40 text-xs mt-0.5">Fill in all vitals for accurate risk prediction</p>
            </div>
          </div>
          <PatientForm onSubmit={onSubmit} loading={loading} />
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
        </GlassCard>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-5">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm">Normal Ranges</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Blood Pressure', value: '90-120 / 60-80 mmHg' },
              { label: 'Heart Rate', value: '60-100 bpm' },
              { label: 'Temperature', value: '36.1-37.2 °C' },
              { label: 'SpO₂', value: '≥ 95%' },
              { label: 'Glucose', value: '70-99 mg/dL (fasting)' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-white/40 text-xs">{label}</span>
                <span className="text-white/70 text-xs font-mono bg-white/5 px-2 py-0.5 rounded">{value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm">Analysis Results</h3>
            {(healthRisk || fraudResult) && (
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => exportAnalysisPdf({ healthRisk, fraudResult, docResult, patientData, userEmail })}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 border border-teal-500/25 hover:border-teal-500/50 text-teal-300 text-xs font-medium transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PDF
              </motion.button>
            )}
          </div>
          <ResultsPanel healthRisk={healthRisk} fraudResult={fraudResult} docResult={docResult} patientData={patientData} />
        </GlassCard>
      </div>
    </div>
  );
}

/* ── Document Upload Page ──────────────────────────────────────── */
function DocumentPage({ onResult, docResult }) {
  const isFraud = docResult?.suspected_fraud;
  const fraudScore = docResult?.document_fraud_score ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <GlassCard className="p-8">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Medical Document Analysis</h3>
              <p className="text-white/40 text-sm mt-0.5">Upload a PDF, PNG, or JPEG medical report for OCR fraud detection</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { label: 'Lab Reports', icon: '🧪', desc: 'Blood, urine, CBC panels' },
              { label: 'Prescriptions', icon: '💊', desc: 'Doctor-signed Rx sheets' },
              { label: 'Discharge Summaries', icon: '🏥', desc: 'Hospital release notes' },
            ].map(({ label, icon, desc }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.03, borderColor: 'rgba(13,148,136,0.3)' }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 border border-white/10 cursor-default"
              >
                <span className="text-xl mb-1.5">{icon}</span>
                <p className="text-white/80 text-xs font-semibold">{label}</p>
                <p className="text-white/30 text-xs mt-0.5">{desc}</p>
              </motion.div>
            ))}
          </div>

          <DocumentUpload onResult={onResult} />

          <div className="mt-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-white/3 border border-white/8">
            <svg className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white/30 text-xs leading-relaxed">
              Documents are analyzed locally using OCR. No data is stored or shared.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-2">
        <GlassCard className="p-6 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm">Document Fraud Score</h3>
          </div>

          <AnimatePresence mode="wait">
            {fraudScore === null ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-white/20"
              >
                <svg className="w-14 h-14 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-center">Upload and analyze a document to see the fraud score</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <FraudGauge score={fraudScore} />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`px-5 py-4 rounded-xl border text-center ${
                    isFraud
                      ? 'bg-red-500/15 border-red-500/40 text-red-300'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <p className="text-lg font-bold tracking-wide">
                    {isFraud ? 'FRAUD SUSPECTED' : 'DOCUMENT VERIFIED'}
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    Confidence: {(Math.max(fraudScore, 1 - fraudScore) * 100).toFixed(1)}%
                  </p>
                </motion.div>

                {docResult?.medical_keywords_found?.length > 0 && (
                  <div>
                    <p className="text-white/40 text-xs font-medium mb-2">Medical terms detected</p>
                    <div className="flex flex-wrap gap-1.5">
                      {docResult.medical_keywords_found.map((kw) => (
                        <motion.span
                          key={kw}
                          whileHover={{ scale: 1.05 }}
                          className="text-xs px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-300 capitalize cursor-default"
                        >
                          {kw}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {docResult?.suspicious_terms?.length > 0 && (
                  <div>
                    <p className="text-red-400/60 text-xs font-medium mb-2">Suspicious terms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {docResult.suspicious_terms.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {docResult?.cnn_medical_score !== null && docResult?.cnn_medical_score !== undefined && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/40 text-xs">CNN visual score</span>
                    <span className={`text-xs font-semibold font-mono ${
                      docResult.cnn_medical_score >= 0.5 ? 'text-teal-400' : 'text-amber-400'
                    }`}>
                      {(docResult.cnn_medical_score * 100).toFixed(0)}%
                      <span className="text-white/30 font-normal ml-1">medical</span>
                    </span>
                  </div>
                )}

                {docResult?.word_count !== undefined && (
                  <p className="text-white/25 text-xs">{docResult.word_count} words extracted via OCR</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}

/* ── History Page ──────────────────────────────────────────────── */
const RISK_COLORS = {
  Low: 'text-emerald-400',
  Medium: 'text-amber-400',
  High: 'text-red-400',
};

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function HistoryPage({ history, historyLoaded, onGoToTab, onDelete }) {
  const [deleting, setDeleting] = useState(null);

  if (!historyLoaded) {
    return (
      <GlassCard className="p-16">
        <div className="flex flex-col items-center text-white/30">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-white/20 border-t-teal-400 rounded-full mb-4" />
          <p className="text-sm">Loading history...</p>
        </div>
      </GlassCard>
    );
  }

  if (history.length === 0) {
    return (
      <GlassCard className="p-16">
        <div className="flex flex-col items-center text-white/20">
          <svg className="w-16 h-16 mb-5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base font-medium mb-1.5">No analyses yet</p>
          <p className="text-sm text-center max-w-xs">
            Run a document scan or patient analysis first — results are saved automatically.
          </p>
          <div className="flex gap-3 mt-6">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => onGoToTab('document')}
              className="px-4 py-2 rounded-xl text-sm font-medium text-teal-300 bg-teal-500/10 border border-teal-500/25 hover:border-teal-500/50 transition-all duration-200">
              Upload Document
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => onGoToTab('manual')}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 glass border border-white/10 hover:border-white/25 transition-all duration-200">
              Manual Entry
            </motion.button>
          </div>
        </div>
      </GlassCard>
    );
  }

  const totalScans = history.length;
  const fraudCount = history.filter(h => h.isFraud).length;
  const docCount   = history.filter(h => h.type === 'document').length;
  const avgScore   = (history.reduce((s, h) => s + (h.fraudScore ?? 0), 0) / totalScans * 100).toFixed(0);

  const handleDelete = async (id) => {
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans',    value: totalScans, color: 'text-white' },
          { label: 'Fraud Detected', value: fraudCount, color: 'text-red-400' },
          { label: 'Documents',      value: docCount,   color: 'text-blue-400' },
          { label: 'Avg Fraud Score',value: `${avgScore}%`, color: avgScore > 50 ? 'text-red-400' : 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <GlassCard key={label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-white/40 text-xs mt-0.5">{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* History list */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-sm">Scan Log</h3>
          <span className="flex items-center gap-1.5 text-teal-400/70 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Saved to your account
          </span>
        </div>
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] group hover:bg-white/[0.06] transition-colors duration-150"
              >
                {/* Type icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === 'document' ? 'bg-blue-500/20' : 'bg-teal-500/20'
                }`}>
                  {item.type === 'document' ? (
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/80 text-sm font-medium">
                      {item.type === 'document' ? 'Document Scan' : `Patient #${item.patientId ?? '—'}`}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.isFraud
                        ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    }`}>
                      {item.isFraud ? 'Fraud' : 'Verified'}
                    </span>
                    {item.healthRisk && (
                      <span className={`text-xs font-medium ${RISK_COLORS[item.healthRisk] || 'text-white/50'}`}>
                        {item.healthRisk} risk
                      </span>
                    )}
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">
                    {formatDate(item.timestamp)}
                    {item.wordCount !== undefined && ` · ${item.wordCount} words`}
                    {item.keywords?.length > 0 && ` · ${item.keywords.length} keywords`}
                  </p>
                </div>

                {/* Fraud score */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-bold ${item.isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
                    {((item.fraudScore ?? 0) * 100).toFixed(0)}%
                  </p>
                  <p className="text-white/25 text-xs">fraud score</p>
                </div>

                {/* Delete button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400/70 hover:text-red-400 flex-shrink-0"
                >
                  {deleting === item.id ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                      className="block w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}
