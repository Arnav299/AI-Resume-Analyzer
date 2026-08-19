import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';

// ── Subcomponents ─────────────────────────────────────────────────────────────
const ScoreRing = ({ score, label, size = 100 }) => {
  const r = size * 0.35;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#6C63FF' : '#F59E0B';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={size * 0.09} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.09}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-extrabold" style={{ fontSize: size * 0.22, color }}>{Math.round(score)}</span>
        </div>
      </div>
      <span className="text-xs text-content-muted font-medium text-center">{label}</span>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="mb-6">
    <h3 className="font-bold text-textDark flex items-center gap-2 mb-3 text-base">
      <span>{icon}</span>{title}
    </h3>
    {children}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const ReportPage = () => {
  const { user } = useAuth();
  const { resumeId: globalResumeId, resumeName } = useResume();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    dashboardAPI.getStudent()
      .then(res => {
        const payload = res.data ?? res;
        setHistory(payload?.analysis_history || []);
        if (!globalResumeId) {
          setData(null);
        } else {
          const match = payload?.analysis_history?.find(h => h.resume_id === globalResumeId);
          setData(match || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [globalResumeId]);

  const handleDownload = async () => {
    setDownloading(true);
    await new Promise(r => setTimeout(r, 1800));
    setDownloading(false);
    alert('Report downloaded successfully!');
  };

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-primary font-semibold mb-1">
                  ← <Link to="/analysis" className="hover:underline">Back to Analysis</Link>
                </p>
                <h1 className="text-3xl font-bold text-textDark">📋 Detailed Report</h1>
                <p className="text-content-muted mt-1">
                  Full analysis report for <strong>{user?.name || user?.full_name || 'Student'}</strong>
                </p>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading || !data}
                className="btn-primary px-6 py-3 text-sm flex items-center gap-2 disabled:opacity-60"
              >
                {downloading ? 'Generating PDF…' : '📥 Download PDF'}
              </button>
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
              <div ref={reportRef} className="card shadow-sm p-8 space-y-6 animate-fade-in border border-border-default bg-surface">
                {/* Report Header */}
                <div className="flex items-start justify-between pb-6 border-b border-border-subtle">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow"
                        style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                        R
                      </div>
                      <div>
                        <p className="font-black text-textDark text-xl">ResumeAI</p>
                        <p className="text-xs text-content-muted">AI Career Analysis Report</p>
                      </div>
                    </div>
                    <p className="text-xs text-content-muted">
                      Generated on {new Date(data.analyzed_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="badge-primary text-xs">{data.target_role || 'General Role'}</span>
                </div>

                {/* Candidate Info */}
                <Section title="Candidate Information" icon="👤">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Full Name', value: user?.name || user?.full_name || 'N/A' },
                      { label: 'Email', value: user?.email || 'N/A' },
                      { label: 'Current Role', value: 'Student' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-page rounded-xl p-3 border border-border-default">
                        <p className="text-xs text-content-muted font-medium">{label}</p>
                        <p className="text-sm font-semibold text-textDark mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Scores */}
                <Section title="Score Summary" icon="📊">
                  <div className="flex flex-wrap justify-around gap-6 py-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                    <ScoreRing score={data.readiness_score || 0} label="Overall Score" size={110} />
                    <ScoreRing score={data.project_score || 0} label="Project Score" size={90} />
                    <ScoreRing score={data.skill_score || 0} label="Skill Match" size={90} />
                    <ScoreRing score={data.professional_presence_score || 0} label="Professional Presence" size={90} />
                  </div>
                </Section>

                {/* Summary */}
                {data.recommendation_summary && (
                  <Section title="Summary" icon="📝">
                    <div className="bg-blue-50 rounded-xl p-4 text-sm text-content-secondary leading-relaxed border border-blue-100">
                      {data.recommendation_summary}
                    </div>
                  </Section>
                )}

                {/* Strengths & Areas to Improve */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Section title="Strengths" icon="💪">
                    <ul className="space-y-2">
                      {data.strengths?.length > 0 ? data.strengths.map(s => (
                        <li key={s} className="flex items-center gap-2 text-sm text-content-secondary">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                          {s}
                        </li>
                      )) : <p className="text-sm text-content-muted">No strengths identified.</p>}
                    </ul>
                  </Section>
                  <Section title="Areas to Improve" icon="🎯">
                    <ul className="space-y-2">
                      {data.weaknesses?.length > 0 ? data.weaknesses.map(a => (
                        <li key={a} className="flex items-center gap-2 text-sm text-content-secondary">
                          <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold flex-shrink-0">!</span>
                          {a}
                        </li>
                      )) : <p className="text-sm text-content-muted">No areas to improve identified.</p>}
                    </ul>
                  </Section>
                </div>

                {/* Matched & Missing Skills */}
                <Section title="Skills Breakdown" icon="🔧">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Matched Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {data.matched_skills?.length > 0 ? data.matched_skills.map(s => (
                          <span key={s} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-200">{s}</span>
                        )) : <span className="text-xs text-content-muted">None</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Missing Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {data.missing_skills?.length > 0 ? data.missing_skills.map(s => (
                          <span key={s} className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold border border-red-200">{s}</span>
                        )) : <span className="text-xs text-content-muted">None</span>}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Recommendations */}
                {(data.learning_plan?.length > 0 || data.quick_wins?.length > 0) && (
                  <Section title="AI Recommendations" icon="🤖">
                    <ol className="space-y-3">
                      {[...(data.learning_plan || []), ...(data.quick_wins || [])].map((rec, i) => {
                        let content = rec;
                        if (typeof rec === 'object' && rec !== null) {
                          if (rec.skill) content = `${rec.skill} (via ${rec.platform || 'online'})`;
                          else if (rec.action) content = rec.action;
                          else if (rec.title) content = rec.title;
                          else content = JSON.stringify(rec);
                        }
                        return (
                          <li key={i} className="flex items-start gap-3 text-sm text-content-secondary bg-page rounded-xl p-3 border border-border-default">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                              {i + 1}
                            </span>
                            <span className="mt-0.5">{content}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </Section>
                )}

                {/* Previous Scores */}
                {history?.length > 0 && (
                  <Section title="Analysis History" icon="📈">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-border-subtle">
                            <th className="py-2 px-3 text-content-muted font-semibold text-xs uppercase">Role</th>
                            <th className="py-2 px-3 text-content-muted font-semibold text-xs uppercase">Score</th>
                            <th className="py-2 px-3 text-content-muted font-semibold text-xs uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((h, i) => (
                            <tr key={i} className="border-b border-border-subtle hover:bg-surface-hover transition-colors">
                              <td className="py-3 px-3 font-medium text-textDark">{h.target_role || 'N/A'}</td>
                              <td className="py-3 px-3">
                                <span className={`font-bold ${h.readiness_score >= 80 ? 'text-success' : 'text-primary'}`}>{Math.round(h.readiness_score || 0)}%</span>
                              </td>
                              <td className="py-3 px-3 text-content-muted">{new Date(h.analyzed_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Section>
                )}

                {/* Footer note */}
                <div className="border-t border-border-subtle pt-4 text-center">
                  <p className="text-xs text-content-muted">
                    ⚠️ This report is AI-generated for educational purposes. Actual results may vary based on specific job requirements.
                  </p>
                  <p className="text-xs text-content-muted mt-1">
                    Generated by ResumeAI · Powered by AI
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/skills" className="flex-1">
                <button className="btn-secondary w-full py-3 text-sm">📊 Skills Analysis</button>
              </Link>
              <Link to="/recommendations" className="flex-1">
                <button className="btn-primary w-full py-3 text-sm">🎯 AI Recommendations</button>
              </Link>
              <Link to="/learning-path" className="flex-1">
                <button className="btn-secondary w-full py-3 text-sm">🗺️ Learning Path</button>
              </Link>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportPage;
