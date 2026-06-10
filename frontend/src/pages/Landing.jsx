import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/hero/HeroSection';
import FeatureCard from '../components/hero/FeatureCard';
import ScrollReveal from '../components/animations/ScrollReveal';
import Footer from '../components/layout/Footer';

const FEATURES = [
  {
    title: 'Health Risk Assessment',
    description: 'XGBoost classifier evaluates 21 patient vitals and symptoms to predict Low, Medium, or High health risk with cross-validated accuracy.',
    icon: (
      <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Medical Fraud Detection',
    description: 'Detects anomalous vital patterns and document inconsistencies. Combines ML model scores with OCR document analysis for a final verdict.',
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Document Analysis',
    description: 'OCR-powered analysis of uploaded PDFs and images. Flags suspicious keywords and verifies document authenticity in seconds.',
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload or Enter Data',
    description: 'Upload a medical PDF or image, or manually fill in patient vitals and symptoms.',
    color: 'from-teal-500 to-cyan-500',
    border: 'border-teal-500/30',
    glow: 'rgba(13,148,136,0.15)',
    icon: (
      <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'AI Processes in Real Time',
    description: 'XGBoost and MobileNetV2 CNN models analyse vitals, OCR text, and visual patterns simultaneously.',
    color: 'from-blue-500 to-indigo-500',
    border: 'border-blue-500/30',
    glow: 'rgba(59,130,246,0.15)',
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Instant Results & Verdict',
    description: 'Get a fraud probability gauge, health risk classification, keyword highlights, and a clear verified or fraud verdict.',
    color: 'from-purple-500 to-pink-500',
    border: 'border-purple-500/30',
    glow: 'rgba(168,85,247,0.15)',
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-navy-900">
      <HeroSection />

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What MedGuard-X Can Do</h2>
            <p className="text-white/50 max-w-lg mx-auto">
              Three AI-powered tools working together to protect patients and healthcare systems.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.12} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/3 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-teal-500/25 text-teal-300 text-xs font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                Simple 3-step process
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
              <p className="text-white/50 max-w-md mx-auto">
                From upload to verdict in seconds — no setup, no expertise required.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-[2.75rem] left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-teal-500/30 via-blue-500/30 to-purple-500/30 pointer-events-none" />

            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  className="relative"
                >
                  <div
                    className={`glass rounded-2xl p-6 border h-full relative overflow-hidden group ${step.border}`}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 50% 0%, ${step.glow} 0%, transparent 70%)` }}
                    />

                    {/* Step number + icon */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${step.color} p-px flex-shrink-0`}>
                        <div className="w-full h-full rounded-2xl bg-navy-900/80 flex items-center justify-center">
                          {step.icon}
                        </div>
                      </div>
                      <span className={`text-3xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-40`}>
                        {step.step}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA under steps */}
          <ScrollReveal delay={0.4}>
            <div className="text-center mt-12">
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 transition-all duration-200 text-sm shadow-lg shadow-teal-500/20"
              >
                Try it Free — No Credit Card
              </motion.a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
