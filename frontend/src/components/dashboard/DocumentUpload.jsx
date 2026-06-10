import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

// Some browsers report .jpg files as 'image/jpg' instead of 'image/jpeg'
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

function FileTypeIcon({ type }) {
  if (type === 'application/pdf') {
    return (
      <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-3">
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
      <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    </div>
  );
}

export default function DocumentUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setErrorType('filetype');
      setError('');
      setFile(null);
      return;
    }
    setFile(f);
    setResult(null);
    setError('');
    setErrorType('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setResult(null);
    setError('');
    setErrorType('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setErrorType('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/analyze/document', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!res.data.is_medical_report) {
        setErrorType('notmedical');
        setResult(null);
        onResult(null);
      } else {
        setResult(res.data);
        onResult(res.data);
      }
    } catch {
      setErrorType('server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Format chips */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 text-xs">Accepted formats:</span>
        {['PDF', 'PNG', 'JPEG'].map((fmt) => (
          <span key={fmt} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">{fmt}</span>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          file
            ? 'border-teal-400/50 bg-teal-400/5 cursor-default'
            : dragging
            ? 'border-teal-400 bg-teal-400/10 scale-[1.01] cursor-copy'
            : 'border-white/15 hover:border-teal-400/40 hover:bg-white/5 cursor-pointer'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <FileTypeIcon type={file.type} />
              <p className="text-white font-semibold text-sm truncate max-w-[200px] mx-auto">{file.name}</p>
              <p className="text-white/40 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={clearFile}
                className="mt-3 text-xs text-white/40 hover:text-red-400 transition-colors underline underline-offset-2"
              >
                Remove file
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-white/70 text-sm font-medium">Drop your medical document here</p>
              <p className="text-white/30 text-xs mt-1.5">or click to browse</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wrong file type banner */}
      <AnimatePresence>
        {errorType === 'filetype' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
          >
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-amber-300 text-sm font-semibold">Unsupported file type</p>
              <p className="text-amber-300/70 text-xs mt-0.5">Please upload a <strong>PDF</strong>, <strong>PNG</strong>, or <strong>JPEG</strong> file.</p>
            </div>
          </motion.div>
        )}

        {errorType === 'notmedical' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30"
          >
            <svg className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <div>
              <p className="text-orange-300 text-sm font-semibold">Not a medical report</p>
              <p className="text-orange-300/70 text-xs mt-0.5">Please insert a valid medical report (lab results, prescriptions, discharge summaries, scans).</p>
            </div>
          </motion.div>
        )}

        {errorType === 'server' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30"
          >
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 text-sm">Analysis failed. Please try again.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyze button */}
      {file && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={analyze}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing Document…
            </span>
          ) : 'Analyze Document'}
        </motion.button>
      )}

      {/* Scan complete confirmation */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              result.suspected_fraud
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${result.suspected_fraud ? 'text-red-400' : 'text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {result.suspected_fraud
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
            <p className={`text-sm font-medium ${result.suspected_fraud ? 'text-red-300' : 'text-emerald-300'}`}>
              Scan complete — see fraud score on the right
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
