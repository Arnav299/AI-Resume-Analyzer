import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({ icon, title, gradient, children }) => (
  <div className="card shadow-sm">
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border-subtle">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl shadow-md"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <h2 className="text-lg font-bold text-textDark">{title}</h2>
    </div>
    {children}
  </div>
);

// ── Module Badge ──────────────────────────────────────────────────────────────
const ModuleBadge = ({ icon, label, desc }) => (
  <div className="flex items-start gap-3 p-3 bg-page rounded-xl border border-border-subtle hover:bg-blue-50 hover:border-blue-100 transition-colors">
    <span className="text-xl flex-shrink-0">{icon}</span>
    <div>
      <p className="font-semibold text-textDark text-sm">{label}</p>
      {desc && <p className="text-xs text-content-muted mt-0.5">{desc}</p>}
    </div>
  </div>
);

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
    <span className="text-sm text-content-muted">{label}</span>
    <span className="text-sm font-semibold text-textDark">{value}</span>
  </div>
);

// ── Core Modules List (derived from actual application modules) ───────────────
const coreModules = [
  { icon: '🏠', label: 'Student Dashboard', desc: 'Central hub for career readiness tracking and ATS score history.' },
  { icon: '📄', label: 'Resume Upload', desc: 'Upload PDF/DOCX resumes for AI-powered parsing and analysis.' },
  { icon: '📊', label: 'Resume Analysis', desc: 'AI analysis against target roles with skill match and gap reporting.' },
  { icon: '🏆', label: 'ATS Score', desc: 'Applicant Tracking System compatibility scoring (0–100).' },
  { icon: '⚡', label: 'Skills Analysis', desc: 'Detailed breakdown of extracted skills vs. required competencies.' },
  { icon: '💡', label: 'AI Recommendations', desc: 'Personalized career and role-fit recommendations from AI.' },
  { icon: '🗺️', label: 'Learning Path', desc: 'Curated learning resources to close identified skill gaps.' },
  { icon: '📋', label: 'History', desc: 'Full history of all past analyses and resume uploads.' },
  { icon: '📄', label: 'Detailed Report', desc: 'In-depth analytical report with scores and improvement areas.' },
  { icon: '🎯', label: 'Career Roles', desc: 'Explore and select target career roles for resume analysis.' },
  { icon: '👨‍🏫', label: 'Mentor Review', desc: 'Request expert mentor review and feedback on your profile.' },
  { icon: '💬', label: 'Feedback', desc: 'Submit and receive structured feedback from mentors.' },
  { icon: '👤', label: 'Profile Management', desc: 'Manage your student profile, account settings, and preferences.' },
  { icon: '🏗️', label: 'Resume Builder', desc: 'Build and export a professional resume directly in the portal.' },
  { icon: '📝', label: 'Analysis Results', desc: 'Detailed view of individual analysis results with actionable insights.' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudentAboutProductPage = () => {
  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ── Page Header ── */}
            <div>
              <h1 className="text-3xl font-bold text-textDark">📦 About the Product</h1>
              <p className="text-content-muted mt-1">Product information, version details, core modules, and license.</p>
            </div>

            {/* ── Product Overview ── */}
            <SectionCard
              icon="ℹ️"
              title="Product Overview"
              gradient="linear-gradient(135deg, #6C63FF, #00D4FF)"
            >
              <p className="text-sm font-semibold text-textDark mb-3">
                AI Resume Analyzer &amp; Career Recommendation Portal
              </p>
              <p className="text-sm text-content-secondary leading-relaxed mb-3">
                The <strong>AI Resume Analyzer &amp; Career Recommendation Portal</strong> is an intelligent recruitment
                platform that streamlines resume screening and candidate evaluation using Artificial Intelligence. It
                automatically analyzes resumes, compares them with job descriptions, identifies matching and missing
                skills, calculates ATS compatibility scores, and generates career recommendations to support informed
                hiring decisions.
              </p>
              <p className="text-sm text-content-secondary leading-relaxed">
                The platform helps students and job seekers optimize their resumes, understand their career readiness,
                and receive personalized guidance to improve their chances of landing their target role.
              </p>
            </SectionCard>

            {/* ── Version & Developer ── */}
            <SectionCard
              icon="📦"
              title="Version & Developer"
              gradient="linear-gradient(135deg, #10B981, #059669)"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Version info */}
                <div className="bg-page rounded-xl p-4 border border-border-subtle">
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-3">Version</p>
                  <InfoRow label="Current Version" value="1.0.0" />
                  <InfoRow label="Release Status" value="Production" />
                  <InfoRow label="Last Updated" value="August 2026" />
                </div>

                {/* Developer info */}
                <div className="bg-page rounded-xl p-4 border border-border-subtle">
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-3">Developer / Organization</p>
                  <p className="text-sm text-content-secondary leading-relaxed">
                    Developed as an AI-powered recruitment solution to modernize the hiring process through intelligent
                    resume analysis, candidate ranking, and career recommendation capabilities.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* ── Core Modules ── */}
            <SectionCard
              icon="⚙️"
              title="Core Modules"
              gradient="linear-gradient(135deg, #F59E0B, #EF4444)"
            >
              <p className="text-sm text-content-muted mb-4">
                The following modules are part of the AI Resume Analyzer &amp; Career Recommendation Portal:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                {coreModules.map((m) => (
                  <li key={m.label} className="flex items-center gap-2.5 text-sm text-content-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {m.label}
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* ── License ── */}
            <SectionCard
              icon="📜"
              title="License"
              gradient="linear-gradient(135deg, #8B5CF6, #EC4899)"
            >
              <div className="bg-page rounded-xl p-5 border border-border-subtle">
                <p className="text-sm font-semibold text-textDark mb-3">License Type: Proprietary Software</p>
                <p className="text-sm text-content-secondary leading-relaxed mb-3">
                  © 2026 AI Resume Analyzer &amp; Career Recommendation Portal. All Rights Reserved.
                </p>
                <p className="text-sm text-content-secondary leading-relaxed">
                  This software is intended for authorized use only. Unauthorized copying, modification, redistribution,
                  reverse engineering, or commercial use without prior written permission is prohibited.
                </p>
              </div>
            </SectionCard>

            {/* ── Footer Banner ── */}
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF22, #00D4FF22)', border: '1px solid #6C63FF33' }}
            >
              <p className="text-base font-bold" style={{ color: '#6C63FF' }}>
                AI Resume Analyzer &amp; Career Recommendation Portal
              </p>
              <p className="text-sm text-content-muted mt-1">Version 1.0.0 · Production · August 2026</p>
              <p className="text-xs text-content-muted mt-1">© 2026 All Rights Reserved · Proprietary Software</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentAboutProductPage;
