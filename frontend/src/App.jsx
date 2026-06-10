import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PageTransitionOverlay from './components/animations/PageTransitionOverlay';

const Landing       = lazy(() => import('./pages/Landing'));
const Login         = lazy(() => import('./pages/Login'));
const Signup        = lazy(() => import('./pages/Signup'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile       = lazy(() => import('./pages/Profile'));

function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const location  = useLocation();
  const prevPath  = useRef(null);
  const timerRef  = useRef(null);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    // Never show overlay on first load
    if (prevPath.current === null) {
      prevPath.current = location.pathname;
      return;
    }
    if (prevPath.current === location.pathname) return;

    prevPath.current = location.pathname;

    // Clear any existing timer before starting a new one
    clearTimeout(timerRef.current);
    setShowTransition(true);
    timerRef.current = setTimeout(() => setShowTransition(false), 700);

    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"               element={<Landing />} />
          <Route path="/login"          element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup"         element={<PublicOnly><Signup /></PublicOnly>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/profile"      element={<Profile />} />
          </Route>
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <PageTransitionOverlay isVisible={showTransition} />
    </>
  );
}
