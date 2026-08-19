import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
      status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    }`}
  >
    {status}
  </span>
);

const ScoreBar = ({ score }) => {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#6C63FF' : '#F59E0B';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-hover rounded-full h-2 w-24">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-sm font-bold text-content-secondary w-8">{score}</span>
    </div>
  );
};

// Loading skeleton for stats
const StatSkeleton = () => (
  <div className="card shadow-sm animate-pulse">
    <div className="h-4 bg-surface-hover rounded w-24 mb-3" />
    <div className="h-8 bg-surface-hover rounded w-16 mb-2" />
    <div className="h-3 bg-surface-hover rounded w-20" />
  </div>
);

// Loading skeleton for table rows
const RowSkeleton = () => (
  <tr>
    {[...Array(6)].map((_, i) => (
      <td key={i} className="py-4 px-3">
        <div className="h-4 bg-surface-hover rounded animate-pulse" style={{ width: i === 0 ? '120px' : '60px' }} />
      </td>
    ))}
  </tr>
);

// Score trend bar chart from API data
const ScoreTrendChart = ({ history }) => {
  if (!history || history.length === 0) return null;
  const scores = history.map((h) => Math.round(h.readiness_score || 0));
  const maxScore = Math.max(...scores, 1);
  const labels = history.map((h, i) => {
    const d = h.analyzed_at ? new Date(h.analyzed_at) : null;
    return d ? d.toLocaleDateString('en', { month: 'short' }) : `#${i + 1}`;
  });

  const delta = scores.length > 1 ? scores[scores.length - 1] - scores[0] : null;

  return (
    <div className="card shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-textDark text-lg">ATS Score Trend</h2>
          <p className="text-xs text-content-muted mt-0.5">Your readiness improvement over time</p>
        </div>
        {delta !== null && (
          <span className={`badge-${delta >= 0 ? 'success' : 'error'} text-xs`}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)} pts
          </span>
        )}
      </div>
      <div className="flex items-end gap-3 h-36 overflow-x-auto scrollbar-hide pb-1">
        {scores.map((score, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-[36px]">
            <span className="text-xs font-bold text-content-secondary">{score}</span>
            <div
              className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden"
              style={{
                height: `${(score / maxScore) * 100}%`,
                background:
                  i === scores.length - 1
                    ? 'linear-gradient(180deg, #6C63FF, #00D4FF)'
                    : 'linear-gradient(180deg, #CBD5E1, #E2E8F0)',
                minHeight: '12px',
              }}
            >
              {i === scores.length - 1 && (
                <div
                  className="absolute inset-0 animate-shimmer opacity-30"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                />
              )}
            </div>
            <span className="text-xs text-content-muted">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const careerTips = [
  { icon: '🎯', tip: 'Tailor your resume for each job — relevance beats length.', color: 'from-violet-500 to-purple-600' },
  { icon: '🔧', tip: 'Add measurable achievements (e.g. "Reduced load time by 40%").', color: 'from-blue-500 to-cyan-500' },
  { icon: '📈', tip: 'Include GitHub/portfolio links to showcase real projects.', color: 'from-emerald-500 to-teal-500' },
  { icon: '🤝', tip: 'Use keywords from the job description to pass ATS filters.', color: 'from-orange-400 to-rose-500' },
];

// ── Main Component ─────────────────────────────────────────────────────────────

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardAPI.getStudent();
        setDashData(res?.data ?? res);
      } catch (err) {
        const msg = err?.response?.data?.detail || err?.message || 'Failed to load dashboard.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived values with fallbacks
  const fullName = dashData?.full_name || user?.full_name || user?.name || 'Student';
  const totalResumes = dashData?.total_resumes ?? 0;
  const latestScore = dashData?.latest_score != null ? Math.round(dashData.latest_score) : null;
  const avgScore = dashData?.average_score != null ? Math.round(dashData.average_score) : null;
  const analysisHistory = dashData?.analysis_history ?? [];
  const latestAnalysis = dashData?.latest_analysis ?? null;
  const latestRole = latestAnalysis?.target_role ?? '—';

  const filteredHistory = analysisHistory.filter(
    (r) =>
      (r.target_role || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.resume_id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* ── Header Row ──────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-textDark">My Dashboard</h1>
                <p className="text-content-muted mt-1">Track your career readiness and resume progress.</p>
              </div>
              <Link to="/upload">
                <Button variant="primary" className="py-2.5 px-6">+ Upload Resume</Button>
              </Link>
            </div>

            {/* ── Error Banner ─────────────────────────────────── */}
            {error && !loading && (
              <div
                className="rounded-xl px-5 py-3 text-sm flex items-center gap-3"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#B45309' }}
              >
                <span>⚠️</span>
                <span>{error} — Showing cached view. Please complete your profile to see live data.</span>
              </div>
            )}

            {/* ── Profile + Score Trend ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Profile Card */}
              <div className="card shadow-sm flex flex-col items-center text-center py-8 gap-4 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}
                />
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="w-20 h-20 rounded-2xl bg-surface-hover mx-auto" />
                    <div className="h-5 bg-surface-hover rounded w-32 mx-auto" />
                    <div className="h-4 bg-surface-hover rounded w-40 mx-auto" />
                  </div>
                ) : (
                  <>
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg relative"
                      style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}
                    >
                      {fullName?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-textDark">{fullName}</p>
                      <p className="text-sm text-content-muted mt-0.5">{user?.email || '—'}</p>
                      {latestRole !== '—' && (
                        <span className="badge-primary text-xs mt-2 inline-block">{latestRole}</span>
                      )}
                    </div>
                    <div className="w-full border-t border-border-subtle pt-4 grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-2xl font-extrabold gradient-text">{totalResumes}</p>
                        <p className="text-xs text-content-muted">Resumes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold" style={{ color: '#10B981' }}>
                          {latestScore ?? '—'}
                        </p>
                        <p className="text-xs text-content-muted">Latest Score</p>
                      </div>
                    </div>
                    <Link
                      to="/org-dashboard"
                      className="w-full mt-2 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-90"
                      style={{
                        background: 'linear-gradient(135deg, #6C63FF22, #00D4FF22)',
                        color: '#6C63FF',
                        border: '1px solid #6C63FF33',
                      }}
                    >
                      🏢 Switch to Org Dashboard
                    </Link>
                  </>
                )}
              </div>

              {/* Score Trend Chart */}
              {loading ? (
                <div className="card shadow-sm lg:col-span-2 animate-pulse">
                  <div className="h-5 bg-surface-hover rounded w-48 mb-4" />
                  <div className="flex items-end gap-3 h-36">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-surface-hover rounded-t-lg"
                        style={{ height: `${40 + i * 10}%` }}
                      />
                    ))}
                  </div>
                </div>
              ) : analysisHistory.length > 0 ? (
                <ScoreTrendChart history={analysisHistory} />
              ) : (
                <div className="card shadow-sm lg:col-span-2 flex items-center justify-center">
                  <div className="text-center py-6">
                    <p className="text-3xl mb-3">📊</p>
                    <p className="font-semibold text-content-secondary">No analysis history yet</p>
                    <p className="text-xs text-content-muted mt-1">Upload and analyze a resume to see your score trend</p>
                    <Link to="/upload" className="inline-block mt-4">
                      <Button variant="primary" className="py-2 px-4 text-sm">Upload Resume →</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Stat Cards ─────────────────────────────────────── */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <DashboardCard
                  title="Total Resumes"
                  value={String(totalResumes)}
                  icon="📄"
                  bgColor="bg-blue-50"
                  textColor="text-primary"
                  change={totalResumes > 0 ? `${totalResumes} uploaded` : 'None yet'}
                  changeType="up"
                />
                <DashboardCard
                  title="Latest ATS Score"
                  value={latestScore != null ? `${latestScore}/100` : '—'}
                  icon="🏆"
                  bgColor="bg-emerald-50"
                  textColor="text-success"
                  change={avgScore != null ? `Avg: ${avgScore}` : '—'}
                  changeType="up"
                />
                <DashboardCard
                  title="Target Role"
                  value={latestRole !== '—' ? latestRole.split(' ')[0] : '—'}
                  icon="🎯"
                  bgColor="bg-purple-50"
                  textColor="text-purple-600"
                />
                <DashboardCard
                  title="Analyses Done"
                  value={String(analysisHistory.length)}
                  icon="📊"
                  bgColor="bg-amber-50"
                  textColor="text-warning"
                />
              </div>
            )}

            {/* ── Quick Actions ───────────────────────────────────── */}
            <div>
              <h2 className="font-bold text-textDark text-lg mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Upload Resume', icon: '📤', to: '/upload', color: 'from-blue-500 to-primary', desc: 'Add new resume' },
                  { 
                    label: 'View Analysis', 
                    icon: '📊', 
                    to: analysisHistory.length > 0 ? '/analysis' : '/upload', 
                    state: analysisHistory.length > 0 ? { 
                      results: [{ ...analysisHistory[0], role_name: analysisHistory[0].target_role }], 
                      resumeId: analysisHistory[0].resume_id 
                    } : {},
                    color: 'from-purple-500 to-purple-700', 
                    desc: 'See AI results' 
                  },
                  { label: 'Career Roles', icon: '🎯', to: '/roles', color: 'from-emerald-500 to-teal-600', desc: 'Explore paths' },
                  { label: 'Get Feedback', icon: '💬', to: '/feedback', color: 'from-orange-400 to-rose-500', desc: 'Mentor review' },
                ].map((item) => {

                  const linkState = item.state || {};
                  return (
                  <Link key={item.to} to={item.to} state={linkState}>
                    <div
                      className={`bg-gradient-to-br ${item.color} rounded-2xl p-5 text-white cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs opacity-75 mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                )})}
              </div>
            </div>

            {/* ── Recent Analysis Table ────────────────────────────── */}
            <div className="card shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-textDark">Recent Analyses</h2>
                  <p className="text-xs text-content-muted mt-0.5">
                    {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Search by role…"
                  className="input-field max-w-xs text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      {['Resume ID', 'Role', 'Date', 'Score', 'Status', 'Action'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-3 text-content-muted font-semibold text-xs uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(4)].map((_, i) => <RowSkeleton key={i} />)
                    ) : filteredHistory.length > 0 ? (
                      filteredHistory.slice(0, 10).map((r, idx) => (
                        <tr key={r.id || idx} className="border-b border-border-subtle hover:bg-blue-50/40 transition-colors">
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-sm">📄</span>
                              </div>
                              <span className="font-medium text-textDark truncate max-w-[100px] text-xs">
                                {r.resume_id?.slice(0, 8) || `—`}…
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-content-muted text-xs">{r.target_role || '—'}</td>
                          <td className="py-4 px-3 text-content-muted text-xs">
                            {r.analyzed_at ? new Date(r.analyzed_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-4 px-3">
                            <ScoreBar score={Math.round(r.readiness_score || 0)} />
                          </td>
                          <td className="py-4 px-3">
                            <StatusBadge status="Completed" />
                          </td>
                          <td className="py-4 px-3">
                            <Link
                              to="/analysis"
                              state={{
                                results: [{
                                  ...r,
                                  role_name: r.target_role
                                }],
                                resumeId: r.resume_id
                              }}
                              className="text-primary hover:underline text-xs font-semibold"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-content-muted">
                          {analysisHistory.length === 0
                            ? 'No analyses yet — upload a resume to get started.'
                            : 'No results match your search.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Career Tips ──────────────────────────────────────── */}
            <div>
              <h2 className="font-bold text-textDark text-lg mb-4">💡 Career Readiness Tips</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {careerTips.map(({ icon, tip, color }, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-5 text-white bg-gradient-to-br ${color} hover:-translate-y-1 transition-all duration-300 hover:shadow-lg`}
                  >
                    <div className="text-2xl mb-3">{icon}</div>
                    <p className="text-xs leading-relaxed font-medium opacity-95">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
