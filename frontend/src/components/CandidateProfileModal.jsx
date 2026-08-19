import React, { useState } from 'react';

const CandidateProfileModal = ({ candidate, onClose, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'viewer'

  if (!candidate) return null;

  // Mock data if API doesn't provide these
  const aiScore = candidate.readiness_score || candidate.score || 0;
  const status = candidate.status || 'Pending';
  const name = candidate.filename || candidate.name || 'Unknown Candidate';
  
  const mockSkills = candidate.skills || ['React', 'Node.js', 'Python', 'Tailwind', 'TypeScript'];
  const mockExp = candidate.experience || '3 years of full-stack development experience, focusing on scalable web applications.';

  const handleDownload = () => {
    // Mock download action
    alert('Mock Download: Downloading resume for ' + name);
  };

  const handleContact = () => {
    // Mock contact action
    alert('Mock Contact: Sending email to ' + name);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      {/* Modal Container */}
      <div 
        className="w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-fade-in"
        style={{ background: 'linear-gradient(135deg, #130D2E 0%, #0A0E1A 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        
        {/* Header */}
        <header className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold text-content-primary truncate max-w-sm">{name}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs font-semibold">
                <span style={{ color: aiScore >= 70 ? '#10B981' : aiScore >= 40 ? '#F59E0B' : '#EF4444' }}>
                  ⭐ {aiScore}% AI Match
                </span>
                <span className="text-content-primary opacity-40">•</span>
                <span style={{ color: status === 'Shortlisted' ? '#34D399' : status === 'Rejected' ? '#F87171' : '#FBBF24' }}>
                  {status}
                </span>
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-content-primary opacity-50 hover:opacity-100 hover:bg-surface/10 transition-all text-xl">
            ×
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Tabs & Info */}
          <div className="w-1/3 min-w-[320px] flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            
            {/* Action Buttons */}
            <div className="p-5 grid grid-cols-2 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => onUpdateStatus(candidate, 'Shortlisted')} className="py-2.5 rounded-xl text-sm font-bold text-content-primary bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all border border-emerald-500/30">
                ✓ Shortlist
              </button>
              <button onClick={() => onUpdateStatus(candidate, 'Rejected')} className="py-2.5 rounded-xl text-sm font-bold text-content-primary bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all border border-red-500/30">
                ✕ Reject
              </button>
              <button onClick={handleDownload} className="py-2.5 rounded-xl text-sm font-bold text-content-primary bg-surface/5 hover:bg-surface/10 transition-all border border-border-default">
                📥 Download
              </button>
              <button onClick={handleContact} className="py-2.5 rounded-xl text-sm font-bold text-content-primary bg-surface/5 hover:bg-surface/10 transition-all border border-border-default">
                ✉️ Contact
              </button>
            </div>

            {/* Tab Nav */}
            <div className="flex px-5 pt-4 gap-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={() => setActiveTab('summary')}
                className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'summary' ? 'text-content-primary' : 'text-content-primary/40 hover:text-content-primary/70'}`}
              >
                AI Summary
                {activeTab === 'summary' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('viewer')}
                className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'viewer' ? 'text-content-primary' : 'text-content-primary/40 hover:text-content-primary/70'}`}
              >
                Resume Viewer
                {activeTab === 'viewer' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
              </button>
            </div>

            {/* AI Summary Tab Content */}
            {activeTab === 'summary' && (
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-content-primary/50 uppercase tracking-wider mb-3">Extracted Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/15 text-[#A5A0FF] border border-primary/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-content-primary/50 uppercase tracking-wider mb-3">Experience Overview</h3>
                  <p className="text-sm text-content-secondary leading-relaxed bg-surface/5 p-4 rounded-xl border border-border-subtle">
                    {mockExp}
                  </p>
                </div>

                {/* Placeholder for more AI insights */}
                <div>
                  <h3 className="text-sm font-bold text-content-primary/50 uppercase tracking-wider mb-3">AI Recommendation</h3>
                  <div className="text-sm leading-relaxed p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span className="font-bold text-emerald-400 block mb-1">Strong Candidate</span>
                    <span className="text-emerald-100/70">Candidate matches 85% of the core requirements outlined in your job description. Recommended for technical interview.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel / Viewer Area */}
          <div className="flex-1 bg-black/40 flex flex-col relative">
            {activeTab === 'viewer' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                 {/* Mock PDF Viewer */}
                 <div className="w-full max-w-2xl h-full bg-surface rounded-xl shadow-lg flex flex-col items-center justify-center text-content-muted">
                    <span className="text-6xl mb-4">📄</span>
                    <h3 className="text-xl font-bold text-content-secondary mb-2">Resume Preview</h3>
                    <p className="text-sm max-w-sm">
                      This is a placeholder for the PDF viewer. In a real environment, the candidate's uploaded resume would be rendered here via an iframe or PDF.js.
                    </p>
                 </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                 <div className="w-32 h-32 rounded-full border-4 border-[#6C63FF]/20 flex items-center justify-center mb-6">
                   <span className="text-5xl">🤖</span>
                 </div>
                 <h2 className="text-2xl font-bold text-content-primary mb-2">AI Processing Engine</h2>
                 <p className="text-content-primary/50 max-w-md">
                   Our models have analyzed this candidate's profile against your JD parameters. Select the "Resume Viewer" tab to see the original document.
                 </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;
