import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_ID = 'HARSHA@ADMIN';
const ADMIN_PASS = 'MedGuard@2024';

export default function Admin() {
  const [empId, setEmpId]       = useState('');
  const [empPass, setEmpPass]   = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [authErr, setAuthErr]   = useState('');
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (empId === ADMIN_ID && empPass === ADMIN_PASS) {
      setUnlocked(true);
      setAuthErr('');
    } else {
      setAuthErr('Invalid Employee ID or password.');
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 w-full max-w-sm space-y-6">
          <h1 className="text-2xl font-bold text-white text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Employee ID</label>
              <input
                type="text"
                value={empId}
                onChange={e => setEmpId(e.target.value)}
                placeholder="HARSHA@ADMIN"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Password</label>
              <input
                type="password"
                value={empPass}
                onChange={e => setEmpPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-teal-500"
              />
            </div>
            {authErr && <p className="text-red-400 text-sm">{authErr}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 transition"
            >
              Sign In
            </button>
          </form>
          <button onClick={() => navigate('/dashboard')} className="w-full text-white/30 hover:text-white text-sm transition">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const downloadCSV = async () => {
    setDownloading(true);
    try {
      const base = window.location.hostname === 'localhost' ? '' : 'https://medgaurd-x.onrender.com';
      const res = await fetch(`${base}/admin/export-users?key=medguard-admin-2024`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medguard_users.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Make sure the backend is awake.');
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-white/40 text-sm">Download all registered users as a CSV file — open in Excel or Google Sheets.</p>

        <button
          onClick={downloadCSV}
          disabled={downloading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 disabled:opacity-50 transition"
        >
          {downloading ? 'Downloading...' : 'Download Users CSV'}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 rounded-xl font-semibold text-white/50 hover:text-white transition text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
