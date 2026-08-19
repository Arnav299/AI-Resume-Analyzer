import ThemeToggle from '../components/ThemeToggle';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import OrgSidebar from '../components/OrgSidebar';
import NotificationBell from '../components/NotificationBell';
import SplitPDFViewer from '../components/SplitPDFViewer';
import XAIRationaleCards from '../components/XAIRationaleCards';
import { candidateAPI, xaiAPI } from '../services/api';
import { ChevronLeft, User, FileText, Check, X, Mail, Phone, MapPin, ExternalLink, GitBranch, Award, Briefcase, GraduationCap } from 'lucide-react';



const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border-subtle last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-content-muted mb-0.5">{label}</p>
        <p className="text-sm font-medium text-content truncate">{value}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    'Shortlisted': 'bg-green-100 text-green-700 border-green-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
    'Pending': 'bg-orange-100 text-orange-700 border-orange-200',
    'Interviewing': 'bg-purple-100 text-purple-700 border-purple-200'
  };
  
  const style = styles[status] || styles['Pending'];
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
      {status}
    </span>
  );
};

const CandidateDossier = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [xaiData, setXaiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dossier'); // 'dossier' | 'splitpdf'
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 10000)
      );

      try {
        const [candRes, xaiRes] = await Promise.race([
          Promise.allSettled([
            candidateAPI.getDossier(id),
            xaiAPI.getRationale(id),
          ]),
          timeout,
        ]);

        if (cancelled) return;

        const candData = candRes?.status === 'fulfilled' ? (candRes.value?.data ?? candRes.value) : null;
        const xaiResult = xaiRes?.status === 'fulfilled' ? (xaiRes.value?.data ?? xaiRes.value) : null;

        if (!candData) {
          setError('Could not fetch candidate details.');
          return;
        }

        setCandidate(candData);
        setXaiData(xaiResult || null);
        setStatus(candData.status || 'Pending');
      } catch (err) {
        if (cancelled) return;
        setError('Failed to fetch candidate details.');
        toast.error('Failed to fetch candidate details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    const prev = status;
    setStatus(newStatus);
    try {
      await candidateAPI.updateStatus(id, newStatus);
      toast.success(`Candidate marked as ${newStatus}`);
    } catch {
      setStatus(prev);
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen" >
        <div className="hidden md:block"><OrgSidebar /></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen" >
        <div className="hidden md:block"><OrgSidebar /></div>
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="text-red-500 font-bold text-xl">Error</div>
          <p className="text-content-secondary">{error}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Go Back</button>
        </div>
      </div>
    );
  }

  const highlights = candidate?.skills || [];

  return (
    <div className="flex min-h-screen text-content font-sans" >
      <div className="hidden md:block"><OrgSidebar /></div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-border-default/80 px-8 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-border-default text-content-muted hover:bg-page hover:text-content transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-content-muted mb-1">
                <span>Portal</span><span>›</span>
                <span className="text-blue-600 font-medium">Candidate Profile</span>
              </div>
              <h1 className="text-xl font-bold text-content tracking-tight flex items-center gap-2">
                Candidate 360° Dossier
              </h1>
              <p className="text-sm text-content-muted mt-0.5">
                {candidate?.name} • {candidate?.jdTitle || 'Resume Dossier'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
            {/* View Toggles */}
            <div className="flex p-1 bg-surface-hover rounded-lg">
              <button
                onClick={() => setActiveView('dossier')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeView === 'dossier' ? 'bg-surface text-blue-600 shadow-sm' : 'text-content-secondary hover:text-content'
                }`}
              >
                <User size={16} /> Profile
              </button>
              <button
                onClick={() => setActiveView('splitpdf')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeView === 'splitpdf' ? 'bg-surface text-blue-600 shadow-sm' : 'text-content-secondary hover:text-content'
                }`}
              >
                <FileText size={16} /> Resume PDF
              </button>
            </div>

            <NotificationBell notifications={[]} />

            {/* Actions */}
            <div className="flex items-center gap-3 border-l border-border-default pl-6">
              <button
                onClick={() => handleStatusChange('Shortlisted')}
                disabled={status === 'Shortlisted'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check size={16} /> Shortlist
              </button>
              <button
                onClick={() => handleStatusChange('Rejected')}
                disabled={status === 'Rejected'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-surface border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
          {activeView === 'dossier' ? (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Details */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-surface rounded-xl border border-border-default shadow-sm p-6 text-center relative overflow-hidden">
                  <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center text-3xl font-black mb-4">
                    {candidate?.avatar || (candidate?.name?.charAt(0) || '?')}
                  </div>
                  <h2 className="text-xl font-bold text-content mb-1">{candidate?.name}</h2>
                  <p className="text-sm text-content-muted mb-4">{candidate?.currentTitle}</p>
                  <StatusBadge status={status} />

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border-subtle pt-6">
                    <div>
                      <p className="text-xs font-semibold text-content-muted mb-1">ATS Score</p>
                      <p className="text-xl font-bold text-blue-600">{xaiData?.totalScore ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-content-muted mb-1">Experience</p>
                      <p className="text-xl font-bold text-content-secondary">{candidate?.experience || '—'}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border-subtle pt-6">
                    <div>
                      <p className="text-xs font-semibold text-content-muted mb-1">AI Rank</p>
                      <p className="text-xl font-bold text-purple-600">#{candidate?.aiRank || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-content-muted mb-1">Percentile</p>
                      <p className="text-xl font-bold text-green-600">{candidate?.percentile ? `${candidate.percentile}%` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-content-muted mb-1">Match Score</p>
                      <p className="text-xl font-bold text-blue-600">{candidate?.matchScore ? `${candidate.matchScore}%` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-content-muted mb-1">Selection Status</p>
                      <p className="text-sm font-bold text-content mt-1">{candidate?.selectionStatus || '⏳ Waiting'}</p>
                    </div>
                  </div>

                  {candidate?.score_breakdown && (
                    <div className="mt-4 border-t border-border-subtle pt-6 text-left">
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-content-muted">
                        Score Breakdown
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow icon={Check} label="Required Skills" value={`${candidate.score_breakdown.required_skills_score}%`} />
                        <InfoRow icon={Award} label="Preferred Skills" value={`${candidate.score_breakdown.preferred_skills_score}%`} />
                        <InfoRow icon={Check} label="Semantic Match" value={`${candidate.score_breakdown.semantic_score}%`} />
                        <InfoRow icon={Briefcase} label="Experience" value={`${candidate.score_breakdown.experience_score}%`} />
                        <InfoRow icon={Check} label="Responsibility" value={`${candidate.score_breakdown.responsibility_score}%`} />
                        <InfoRow icon={GraduationCap} label="Education" value={`${candidate.score_breakdown.education_score_pct}%`} />
                        <InfoRow icon={FileText} label="Certifications" value={`${candidate.score_breakdown.certification_score}%`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="bg-surface rounded-xl border border-border-default shadow-sm p-6">
                  <h3 className="text-base font-bold text-content mb-4">Contact Information</h3>
                  <div className="space-y-1">
                    <InfoRow icon={Mail} label="Email" value={candidate?.email} />
                    <InfoRow icon={Phone} label="Phone" value={candidate?.phone} />
                    <InfoRow icon={MapPin} label="Location" value={candidate?.location} />
                    <InfoRow icon={ExternalLink} label="LinkedIn" value={candidate?.linkedin} />
                    <InfoRow icon={GitBranch} label="GitHub" value={candidate?.github} />
                  </div>
                </div>

                {/* Extracted Skills */}
                <div className="bg-surface rounded-xl border border-border-default shadow-sm p-6">
                  <h3 className="text-base font-bold text-content mb-4">Extracted Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate?.skills?.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: AI Analysis */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-surface rounded-xl border border-border-default shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-content flex items-center gap-2">
                      <Award className="text-blue-600" /> AI Rationale & Breakdown
                    </h3>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                      Deep Analysis Engine
                    </span>
                  </div>

                  {/* We reuse the component but in a light theme wrapper if needed, 
                      or assume XAIRationaleCards renders ok. We will pass our data down. */}
                  <div className="light-theme-wrapper">
                    <XAIRationaleCards
                      totalScore={xaiData?.totalScore ?? 0}
                      scoreBreakdown={xaiData?.scoreBreakdown ?? []}
                      positiveCards={xaiData?.positiveCards ?? []}
                      gapCards={xaiData?.gapCards ?? []}
                      recommendation={xaiData?.recommendation ?? 'Borderline'}
                    />
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Split PDF View */
            <div className="max-w-full h-full flex flex-col bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden p-4">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-subtle">
                <div>
                  <h3 className="text-lg font-bold text-content">Original Resume Document</h3>
                  <p className="text-sm text-content-muted">PDF preview alongside extracted text</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-content-muted">Match Score</p>
                    <p className="text-xl font-bold text-blue-600">{xaiData?.totalScore ?? '—'}/100</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <SplitPDFViewer
                  pdfUrl={candidate?.resumeUrl}
                  extractedText={candidate?.extractedText}
                  highlights={highlights}
                  candidateName={candidate?.name}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CandidateDossier;
