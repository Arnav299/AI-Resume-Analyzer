import React from 'react';
import OrgSidebar from '../components/OrgSidebar';
import { Info, Package, Tag, Building2, FileText, Layers } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { Link } from 'react-router-dom';

const AboutProductPage = () => {
  return (
    <div className="flex min-h-screen font-sans" >
      <div className="hidden md:block"><OrgSidebar /></div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-border-default/80 px-8 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-content-muted mb-1">
              <span>Portal</span><span>›</span>
              <span className="text-blue-600 font-medium">About the Product</span>
            </div>
            <h1 className="text-2xl font-black text-content tracking-tight">About the Product</h1>
            <p className="text-sm text-content-muted mt-0.5">Product information, version, and license details</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Product Overview */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border-subtle">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Info size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-black text-content">Product Overview</h2>
              </div>
              <p className="text-content text-sm font-semibold mb-3">AI Resume Analyzer &amp; Career Recommendation Portal</p>
              <p className="text-content-muted text-sm leading-relaxed mb-3">
                The AI Resume Analyzer &amp; Career Recommendation Portal is an intelligent recruitment platform that
                streamlines resume screening and candidate evaluation using Artificial Intelligence. It automatically
                analyzes resumes, compares them with job descriptions, identifies matching and missing skills, calculates
                ATS compatibility scores, and generates career recommendations to support informed hiring decisions.
              </p>
              <p className="text-content-muted text-sm leading-relaxed">
                The platform helps recruiters reduce manual effort, improve recruitment efficiency, and identify the most
                suitable candidates through AI-driven insights.
              </p>
            </div>

            {/* Version & Developer */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border-subtle">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Package size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-black text-content">Version & Developer</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Left Card — Version */}
                <div className="bg-page rounded-xl p-4 border border-border-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={14} className="text-content-muted" />
                    <span className="text-xs font-bold text-content-muted uppercase tracking-wider">Version</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-content-muted">Current Version</span>
                      <span className="text-xs font-semibold text-content-secondary">1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-content-muted">Release Status</span>
                      <span className="text-xs font-semibold text-content-secondary">Production</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-content-muted">Last Updated</span>
                      <span className="text-xs font-semibold text-content-secondary">August 2026</span>
                    </div>
                  </div>
                </div>
                {/* Right Card — Developer / Organization */}
                <div className="bg-page rounded-xl p-4 border border-border-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={14} className="text-content-muted" />
                    <span className="text-xs font-bold text-content-muted uppercase tracking-wider">Developer / Organization</span>
                  </div>
                  <p className="text-content-muted text-sm leading-relaxed">
                    Developed as an AI-powered recruitment solution to modernize the hiring process through intelligent
                    resume analysis, candidate ranking, and career recommendation capabilities.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Modules */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border-subtle">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                  <Layers size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-black text-content">Core Modules</h2>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Student Dashboard',
                  'Recruiter Dashboard',
                  'Executive Dashboard',
                  'Resume Upload',
                  'Resume Analysis',
                  'ATS Score Generation',
                  'Career Recommendation Engine',
                  'JD Studio',
                  'Bulk Dashboard',
                  'Upload Wizard',
                  'Pipeline Board',
                  'Screening',
                  'Candidate Buckets',
                  'Candidate 360 Dossier',
                ].map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm text-content-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />{m}
                  </li>
                ))}
              </ul>
            </div>

            {/* License */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border-subtle">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                  <FileText size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-black text-content">License</h2>
              </div>
              <div className="bg-page rounded-xl p-5 border border-border-subtle">
                <p className="text-content text-sm font-semibold mb-3">License Type: Proprietary Software</p>
                <p className="text-content-muted text-sm leading-relaxed mb-3">
                  © 2026 AI Resume Analyzer &amp; Career Recommendation Portal. All Rights Reserved.
                </p>
                <p className="text-content-muted text-sm leading-relaxed">
                  This software is intended for authorized use only. Unauthorized copying, modification, redistribution,
                  reverse engineering, or commercial use without prior written permission is prohibited.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AboutProductPage;
