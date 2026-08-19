import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  { icon: '📄', title: 'Smart Upload', desc: 'Drag-and-drop your PDF resume with instant validation and preview.', gradient: 'from-violet-500 to-purple-600' },
  { icon: '🤖', title: 'AI Parsing', desc: 'Gemini AI extracts your skills, experience, and education in seconds.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: '⚡', title: 'Skills Analysis', desc: 'Detailed breakdown of matched and missing skills vs. industry demands.', gradient: 'from-amber-500 to-orange-500' },
  { icon: '🎯', title: 'Career Match', desc: 'Personalized career role suggestions scored against your profile.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: '🗺️', title: 'Learning Path', desc: 'Customized roadmap to bridge your skill gaps effectively.', gradient: 'from-rose-500 to-pink-500' },
  { icon: '📊', title: 'Readiness Score', desc: 'Career readiness score out of 100 with actionable improvement tips.', gradient: 'from-indigo-500 to-violet-500' },
  { icon: '👨‍🏫', title: 'Mentor Feedback', desc: 'Structured feedback from mentors to accelerate your career growth.', gradient: 'from-cyan-500 to-blue-500' },
  { icon: '📈', title: 'Progress Tracking', desc: 'Track improvement over time with beautiful analytics dashboards.', gradient: 'from-purple-500 to-indigo-500' },
];

const stats = [
  { value: '10K+', label: 'Resumes Analyzed' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '50+', label: 'Career Paths' },
  { value: '200+', label: 'Skills Tracked' },
];

const studentBenefits = [
  'Get an AI career readiness score instantly',
  'Discover critical skill gaps in your profile',
  'Receive personalized learning roadmaps',
  'Access curated job-specific resources',
  'Track your improvement over time',
];

const mentorBenefits = [
  'Track student progress in real-time',
  'Provide structured, data-driven feedback',
  'Manage multiple students efficiently',
  'Access detailed AI analysis reports',
];

const orgBenefits = [
  'Upload and rank 200+ resumes at once',
  'AI-powered candidate scoring & shortlisting',
  'Skill-match analysis against job description',
  'Exportable ranked leaderboard as CSV',
  'Instant score distribution insights',
];

// ── Animated Counter ───────────────────────────────────────────────────────
const AnimatedStat = ({ value, label }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="glass rounded-2xl p-6 text-center border border-white/40 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
      <p className={`text-3xl md:text-4xl font-black gradient-text transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {value}
      </p>
      <p className="text-sm mt-2 font-medium text-content-secondary">{label}</p>
    </div>
  );
};

const LandingPage = () => (
  <div className="min-h-screen flex flex-col" >
    <Navbar />

    {/* ── HERO ────────────────────────────────────────────────────── */}
    <section className="relative overflow-hidden py-20 md:py-32 hero-gradient">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute -top-32 -right-32 w-96 h-96 glow-orb opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)' }} />
        <div className="blob blob-delay-2 absolute -bottom-32 -left-32 w-80 h-80 glow-orb opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)' }} />
        <div className="blob blob-delay-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 glow-orb opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-8 bg-primary/10 text-primary border border-primary/20 dark:bg-surface dark:border-border-subtle">
            🤖 AI-Powered Career Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] text-content"
            style={{ letterSpacing: '-0.03em' }}>
            Land Your Dream Job<br />
            <span className="gradient-text">with AI Precision</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-content-secondary dark:text-content-secondary">
            Upload your resume, get a career readiness score, discover skill gaps,
            and receive personalized recommendations — powered by Google Gemini.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 flex-wrap">
            <Link to="/dashboard">
              <button className="text-base py-4 px-8 rounded-2xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(108,99,255,0.08))', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '1rem' }}>
                🎓 For Students →
              </button>
            </Link>
            <Link to="/builder">
              <button className="text-base py-4 px-8 rounded-2xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,255,0.08))', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '1rem' }}>
                ✨ Build Your Resume
              </button>
            </Link>

            <Link to="/org-login">
              <button className="text-base py-4 px-8 rounded-2xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(0,212,255,0.08))', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '1rem' }}>
                🏢 For Organizations →
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {['✓ Instant ATS Score', '✓ Results in seconds', '✓ 100% private', '✓ Smart Skill Matching'].map(t => (
              <span key={t} className="text-sm font-medium px-4 py-2 rounded-full bg-surface/70 dark:bg-surface text-content-secondary dark:text-content-secondary border border-primary/15 dark:border-border-default">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <AnimatedStat key={label} value={value} label={label} />
          ))}
        </div>
      </div>
    </section>

    {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
    <section className="py-20 bg-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to transform your career prospects</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '📂', title: 'Upload Resume', desc: 'Drag and drop your PDF resume. No account needed to try.' },
            { step: '02', icon: '🧠', title: 'AI Analyzes', desc: 'Gemini reads your resume and compares it against role requirements.' },
            { step: '03', icon: '🎯', title: 'Get Results', desc: 'Receive a score, skill gap report, and personalized recommendations.' },
          ].map(({ step, icon, title, desc }, i) => (
            <div key={step} className="relative text-center animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 -translate-x-8 z-0"
                  style={{ background: 'linear-gradient(90deg, rgba(108,99,255,0.4), transparent)' }} />
              )}
              <div className="relative z-10">
                <div className="text-xs font-black mb-4 tracking-widest"
                  style={{ color: 'rgba(108,99,255,0.4)' }}>STEP {step}</div>
                <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center text-4xl shadow-lg bg-primary/10 dark:bg-surface-hover border border-primary/15 dark:border-border-subtle">
                  {icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-content">{title}</h3>
                <p className="text-sm leading-relaxed text-content-secondary">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/analyze">
            <button className="btn-neon py-4 px-10 text-base font-bold rounded-2xl text-white">
              Try It Now — Free 🚀
            </button>
          </Link>
        </div>
      </div>
    </section>

    {/* ── FEATURES ────────────────────────────────────────────────── */}
    <section className="py-20" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">Everything you need to supercharge your career journey</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon, title, desc, gradient }, i) => (
            <div key={title}
              className="group bg-surface cursor-default rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 animate-fade-in border border-border-default shadow-sm"
              style={{
                animationDelay: `${i * 0.07}s`,
              }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl bg-primary/10 dark:bg-surface-hover">
                {icon}
              </div>
              <h3 className="font-bold mb-2 text-content">{title}</h3>
              <p className="text-sm leading-relaxed text-content-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── BENEFITS ────────────────────────────────────────────────── */}
    <section className="py-20 bg-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">Who Benefits?</h2>
          <p className="section-subtitle">Designed for students, mentors, and organizations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Students */}
          <div className="rounded-2xl p-8 relative overflow-hidden bg-blue-50/50 dark:bg-surface border border-primary/15 dark:border-border-subtle">
            <div className="absolute top-0 right-0 w-48 h-48 glow-orb opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.4) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(108,99,255,0.15)' }}>🎓</div>
                <h3 className="text-xl font-bold text-content">For Students</h3>
              </div>
              <ul className="space-y-3 mb-8">
                {studentBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-content-primary">
                    <span className="font-bold mt-0.5" style={{ color: '#6C63FF' }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link to="/dashboard">
                <button className="btn-neon w-full py-3 text-sm font-bold text-white rounded-xl">
                  🎓 Open Student Dashboard →
                </button>
              </Link>
            </div>
          </div>

          {/* Mentors */}
          <div className="rounded-2xl p-8 relative overflow-hidden bg-cyan-50/50 dark:bg-surface border border-cyan-400/15 dark:border-border-subtle">
            <div className="absolute top-0 right-0 w-48 h-48 glow-orb opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(0,212,255,0.15)' }}>👨‍🏫</div>
                <h3 className="text-xl font-bold text-content">For Mentors</h3>
              </div>
              <ul className="space-y-3 mb-8">
                {mentorBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-content-primary">
                    <span className="font-bold mt-0.5" style={{ color: '#00A8CC' }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link to="/coming-soon">
                <button className="w-full py-3 text-sm font-bold rounded-xl transition-all"
                  style={{ background: 'rgba(0,212,255,0.12)', color: '#00A8CC', border: '1px solid rgba(0,212,255,0.25)' }}>
                  Start as Mentor →
                </button>
              </Link>
            </div>
          </div>

          {/* Organizations */}
          <div className="rounded-2xl p-8 relative overflow-hidden bg-emerald-50/50 dark:bg-surface border border-emerald-400/20 dark:border-border-subtle">
            <div className="absolute top-0 right-0 w-48 h-48 glow-orb opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(16,185,129,0.15)' }}>🏢</div>
                <h3 className="text-xl font-bold text-content">For Organizations</h3>
              </div>
              <ul className="space-y-3 mb-8">
                {orgBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-content-primary">
                    <span className="font-bold mt-0.5" style={{ color: '#059669' }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link to="/org-login">
                <button className="w-full py-3 text-sm font-bold rounded-xl text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                  🏢 Open Org Dashboard →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── CTA BANNER ──────────────────────────────────────────────── */}
    <section className="py-24 relative overflow-hidden bg-surface dark:bg-page">
      <div className="absolute inset-0 pointer-events-none">
        <div className="blob absolute -top-20 -right-20 w-72 h-72 glow-orb"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.3) 0%, transparent 70%)' }} />
        <div className="blob blob-delay-4 absolute -bottom-20 -left-20 w-72 h-72 glow-orb"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.25) 0%, transparent 70%)' }} />
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          Ready to Supercharge<br />
          <span className="neon-text">Your Career?</span>
        </h2>
        <p className="text-lg mb-10 max-w-xl mx-auto text-white/50">
          Join thousands of students who've accelerated their careers with AI-powered resume analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Link to="/dashboard">
            <button className="py-4 px-10 rounded-2xl text-base font-bold transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }}>
              🎓 Student Dashboard
            </button>
          </Link>
          <Link to="/builder">
            <button className="py-4 px-10 rounded-2xl text-base font-bold transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(108,99,255,0.15)', color: '#A5A0FF', border: '1px solid rgba(108,99,255,0.3)' }}>
              ✨ Build Resume
            </button>
          </Link>

          <Link to="/org-login">
            <button className="py-4 px-10 rounded-2xl text-base font-bold transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>
              🏢 Org Dashboard
            </button>
          </Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default LandingPage;
