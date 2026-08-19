import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({ icon, title, gradient, children }) => (
  <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border-subtle">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl shadow-md"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <h2 className="text-lg font-bold text-content">{title}</h2>
    </div>
    {children}
  </div>
);

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
    <span className="text-sm text-content-muted">{label}</span>
    <span className="text-sm font-semibold text-content">{value}</span>
  </div>
);

// ── Core Modules — Resume Builder specific ────────────────────────────────────
const coreModules = [
  'Resume Upload (PDF / DOC / DOCX)',
  'OCR Image Upload (JPG / PNG)',
  'AI Field Extraction (Gemini)',
  'Raw Text Editor',
  'Resume Fields Form',
  'Template Selector',
  'Live Resume Preview',
  'Zoom Controls',
  'PDF Download',
  'Resume Builder',
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const ResumeBuilderAboutPage = () => (
  <div className="min-h-screen bg-page">
    {/* Top bar */}
    <header className="bg-surface border-b border-border-default sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
        <Link
          to="/builder"
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ← Back to Resume Builder
        </Link>
        <span className="text-content-muted">|</span>
        <span className="text-sm text-content-muted">Resume Builder · About the Product</span>
        </div>
        <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
      </div>
    </header>

    <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

      {/* Page title */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-content">📦 About the Product</h1>
        <p className="text-content-muted mt-1">Product information, version details, core modules, and license.</p>
      </div>

      {/* Product Overview */}
      <SectionCard
        icon="ℹ️"
        title="Product Overview"
        gradient="linear-gradient(135deg, #6C63FF, #00D4FF)"
      >
        <p className="text-sm font-semibold text-content mb-3">
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

      {/* Version & Developer */}
      <SectionCard
        icon="📦"
        title="Version & Developer"
        gradient="linear-gradient(135deg, #10B981, #059669)"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Version card */}
          <div className="bg-page rounded-xl p-4 border border-border-subtle">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-3">Version</p>
            <InfoRow label="Current Version" value="1.0.0" />
            <InfoRow label="Release Status" value="Production" />
            <InfoRow label="Last Updated" value="August 2026" />
          </div>
          {/* Developer card */}
          <div className="bg-page rounded-xl p-4 border border-border-subtle">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-3">Developer / Organization</p>
            <p className="text-sm text-content-secondary leading-relaxed">
              Developed as an AI-powered recruitment solution to modernize the hiring process through intelligent
              resume analysis, candidate ranking, and career recommendation capabilities.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Core Modules */}
      <SectionCard
        icon="⚙️"
        title="Core Modules"
        gradient="linear-gradient(135deg, #F59E0B, #EF4444)"
      >
        <p className="text-sm text-content-muted mb-4">
          The following modules are part of the Resume Builder:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
          {coreModules.map((m) => (
            <li key={m} className="flex items-center gap-2.5 text-sm text-content-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* License */}
      <SectionCard
        icon="📜"
        title="License"
        gradient="linear-gradient(135deg, #8B5CF6, #EC4899)"
      >
        <div className="bg-page rounded-xl p-5 border border-border-subtle">
          <p className="text-sm font-semibold text-content mb-3">License Type: Proprietary Software</p>
          <p className="text-sm text-content-secondary leading-relaxed mb-3">
            © 2026 AI Resume Analyzer &amp; Career Recommendation Portal. All Rights Reserved.
          </p>
          <p className="text-sm text-content-secondary leading-relaxed">
            This software is intended for authorized use only. Unauthorized copying, modification, redistribution,
            reverse engineering, or commercial use without prior written permission is prohibited.
          </p>
        </div>
      </SectionCard>

      {/* Footer */}
      <div className="rounded-2xl p-6 text-center bg-indigo-50 border border-indigo-100">
        <p className="text-base font-bold text-indigo-700">
          AI Resume Analyzer &amp; Career Recommendation Portal
        </p>
        <p className="text-sm text-content-muted mt-1">Version 1.0.0 · Production · August 2026</p>
        <p className="text-xs text-content-muted mt-1">© 2026 All Rights Reserved · Proprietary Software</p>
      </div>

    </main>
  </div>
);

export default ResumeBuilderAboutPage;
