import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { dashboardAPI } from '../services/api';
import { useResume } from '../context/ResumeContext';

const SkillsAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { resumeId: globalResumeId, resumeName } = useResume();
  const location = useLocation();

  useEffect(() => {
    if (!globalResumeId) {
      setData(null);
      setLoading(false);
      return;
    }

    if (location.state?.results?.length > 0 && location.state?.resumeId === globalResumeId) {
      setData(location.state.results[0]);
      setLoading(false);
      return;
    }

    dashboardAPI.getStudent()
      .then(res => {
        const payload = res.data ?? res;
        const match = payload?.analysis_history?.find(h => h.resume_id === globalResumeId);
        setData(match || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [globalResumeId, location.state]);

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-primary font-semibold mb-1">← <Link to="/analysis" className="hover:underline">Back to Analysis</Link></p>
                <h1 className="text-3xl font-bold text-textDark">
                  Resume Skills Analysis{resumeName ? ` – ${resumeName}` : ''}
                </h1>
                <p className="text-content-muted mt-1">Detailed breakdown of your skills vs. industry requirements</p>
              </div>
              <div className="flex gap-3">
                <Link to="/recommendations">
                  <button className="btn-primary px-5 py-2.5 text-sm">🎯 View Recommendations</button>
                </Link>
                <Link to="/report">
                  <button className="btn-secondary px-5 py-2.5 text-sm">📥 Download Report</button>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-content-muted">Loading...</div>
            ) : !data ? (
              <div className="card shadow-sm text-center py-16 border border-border-default bg-surface">
                <p className="text-5xl mb-4">📂</p>
                <h3 className="font-bold text-textDark text-lg mb-2">No Analysis Found</h3>
                <p className="text-sm text-content-muted mb-6">
                  Upload and analyse a resume first to get a personalised learning path.
                </p>
                <Link to="/upload">
                  <button className="btn-primary px-6 py-2.5 text-sm">Upload Resume →</button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card shadow-sm border border-border-default bg-surface">
                  <h3 className="font-bold text-textDark mb-4">Matched Skills</h3>
                  {data.matched_skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.matched_skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-content-muted">No matched skills found.</p>
                  )}
                </div>

                <div className="card shadow-sm border border-border-default bg-surface">
                  <h3 className="font-bold text-textDark mb-4">Missing Skills</h3>
                  {data.missing_skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.missing_skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-200">
                          ✗ {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-content-muted">No missing skills identified.</p>
                  )}
                </div>

                <div className="card shadow-sm border border-border-default bg-surface md:col-span-2">
                  <h3 className="font-bold text-textDark mb-4">Extracted Skills</h3>
                  {data.extracted_skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.extracted_skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-surface-hover text-content-secondary rounded-full text-sm border border-border-default">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-content-muted">No extracted skills available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SkillsAnalysis;
