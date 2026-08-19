import ThemeToggle from '../components/ThemeToggle';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import OrgSidebar from '../components/OrgSidebar';
import NotificationBell from '../components/NotificationBell';
import StepIndicator from '../components/StepIndicator';
import UploadWizard from '../components/UploadWizard';
import { jdAPI } from '../services/api';
import { Plus, CheckCircle, Briefcase, ChevronRight, UploadCloud, Sparkles } from 'lucide-react';

const UploadWizardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedJdId, setSelectedJdId] = useState(location.state?.selectedJdId || null);
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJDs = async () => {
      try {
        const res = await jdAPI.getAll();
        setJds(res.data.filter(jd => jd.status !== 'Archived'));
      } catch (err) {
        console.error('Failed to load JDs', err);
      } finally {
        setLoading(false);
      }
    };
    loadJDs();
  }, []);

  const steps = [
    { label: 'Select Job Description' },
    { label: 'Upload Resumes' },
    { label: 'AI Parsing & Analysis' },
  ];

  const selectedJd = jds.find(j => j.id === selectedJdId);

  return (
    <div className="flex min-h-screen font-sans" >
      <div className="hidden md:block">
        <OrgSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Premium Header */}
        <header className="bg-surface border-b border-border-default/80 px-8 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-content-muted mb-1">
              <span>Portal</span><span>›</span>
              <span className="text-blue-600 font-medium">Upload Wizard</span>
            </div>
            <h1 className="text-2xl font-black text-content tracking-tight">Upload Wizard</h1>
            <p className="text-sm text-content-muted mt-0.5">Batch upload and AI-analyze candidate resumes</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
            <NotificationBell notifications={[]} />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Step Indicator Card */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
              <StepIndicator steps={steps} currentStep={currentStep} />
            </div>

            {/* Main Content Card */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm min-h-[500px]">

              {/* STEP 0: Select JD */}
              {currentStep === 0 && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Briefcase size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-content">Select a Job Description</h2>
                      <p className="text-xs text-content-muted">Choose the role you're hiring for</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                      <p className="text-sm text-content-muted">Loading job descriptions…</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Create New */}
                      <button
                        onClick={() => navigate('/jd-studio')}
                        className="group border-2 border-dashed border-border-default hover:border-blue-400 hover:bg-blue-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-300 min-h-[160px]"
                      >
                        <div className="w-12 h-12 rounded-xl bg-surface-hover group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <Plus size={22} className="text-content-muted group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-content-secondary group-hover:text-blue-700 transition-colors">Create New JD</p>
                          <p className="text-xs text-content-muted mt-0.5">Design a job description first</p>
                        </div>
                      </button>

                      {/* Existing JDs */}
                      {jds.map(jd => (
                        <div
                          key={jd.id}
                          onClick={() => { setSelectedJdId(jd.id); setCurrentStep(1); }}
                          className={`group border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 min-h-[160px] flex flex-col justify-between hover:-translate-y-0.5 ${
                            selectedJdId === jd.id
                              ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10'
                              : 'border-border-subtle hover:border-blue-300 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedJdId === jd.id ? 'bg-blue-600' : 'bg-surface-hover group-hover:bg-blue-100'
                            }`}>
                              <Briefcase size={16} className={selectedJdId === jd.id ? 'text-white' : 'text-content-muted group-hover:text-blue-600'} />
                            </div>
                            <div>
                              <h3 className={`font-bold text-base line-clamp-1 ${selectedJdId === jd.id ? 'text-blue-700' : 'text-content'}`}>{jd.title}</h3>
                              <p className="text-xs text-content-muted mt-0.5">{jd.domain || 'Uncategorized'} · {jd.department || 'General'}</p>
                            </div>
                            {selectedJdId === jd.id && (
                              <CheckCircle size={18} className="text-blue-600 ml-auto flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <span className="text-xs font-bold bg-surface text-content-secondary px-3 py-1 rounded-full border border-border-subtle shadow-sm">
                              🎯 {jd.ai_matching_threshold}% threshold
                            </span>
                            <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{jd.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(1)}
                      disabled={!selectedJdId}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/25 hover:-translate-y-0.5"
                    >
                      Next Step <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1 & 2: Upload & Analysis */}
              {(currentStep === 1 || currentStep === 2) && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                        currentStep === 2
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20'
                      }`}>
                        {currentStep === 2 ? <Sparkles size={18} className="text-white" /> : <UploadCloud size={18} className="text-white" />}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-content">
                          {currentStep === 1 ? 'Upload Resumes' : 'AI Analysis in Progress'}
                        </h2>
                        <p className="text-xs text-content-muted mt-0.5">
                          Targeting: <span className="font-bold text-blue-600">{selectedJd?.title}</span>
                        </p>
                      </div>
                    </div>
                    {currentStep === 1 && (
                      <button
                        onClick={() => setCurrentStep(0)}
                        className="text-sm font-semibold text-content-muted hover:text-content-secondary flex items-center gap-1 transition-colors"
                      >
                        ← Back to JD Selection
                      </button>
                    )}
                  </div>

                  <UploadWizard
                    selectedJdId={selectedJdId}
                    onUploadStart={() => setCurrentStep(2)}
                    onComplete={() => navigate('/executive')}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UploadWizardPage;
