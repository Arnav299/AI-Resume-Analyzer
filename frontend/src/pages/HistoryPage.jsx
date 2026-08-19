import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { dashboardAPI, resumeAPI } from '../services/api';
import { useResume } from '../context/ResumeContext';



const ScoreChip = ({ score }) => {
  if (score === null || score === undefined) {
    return <span className="text-content-muted text-sm font-semibold">—</span>;
  }
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#6C63FF' : '#F59E0B';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-surface-hover overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-sm font-bold" style={{ color }}>{score}%</span>
    </div>
  );
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const { setCurrentResume } = useResume();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [confirm, setConfirm] = useState(null);
  
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, resumesRes] = await Promise.all([
          dashboardAPI.getStudent(),
          resumeAPI.getAll()
        ]);
        
        const dashData = dashRes?.data ?? dashRes;
        const resumes  = resumesRes?.data ?? resumesRes ?? [];
        const analysisHistory = dashData?.analysis_history ?? [];

        // Build resume name lookup: resumeId → filename
        const resumeNameMap = {};
        resumes.forEach(r => {
          resumeNameMap[r.id] = r.original_filename || r.filename || `Resume_${r.id.substring(0, 8)}.pdf`;
        });
        const resumeSizeMap = {};
        resumes.forEach(r => {
          resumeSizeMap[r.id] = r.file_size_bytes
            ? `${Math.round(r.file_size_bytes / 1024)} KB`
            : '—';
        });

        // One row per analysis entry (not per resume)
        const rows = analysisHistory.map(a => ({
          analysisId:   a.id,
          resumeId:     a.resume_id,
          resumeName:   resumeNameMap[a.resume_id] || `Resume_${String(a.resume_id).substring(0, 8)}.pdf`,
          resumeSize:   resumeSizeMap[a.resume_id] || '—',
          role:         a.target_role || '—',
          score:        a.readiness_score != null ? Math.round(a.readiness_score) : null,
          date:         a.analyzed_at || new Date().toISOString(),
          rawAnalysis:  a,
        }));

        setHistoryData(rows);
      } catch (err) {
        console.error("Failed to load history", err);
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = historyData
    .filter(r =>
      r.resumeName.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let va, vb;
      if (sortBy === 'date') { va = new Date(a.date); vb = new Date(b.date); }
      else if (sortBy === 'score') { va = a.score ?? -1; vb = b.score ?? -1; }
      else if (sortBy === 'name') { va = a.resumeName; vb = b.resumeName; }
      else { va = a[sortBy]; vb = b[sortBy]; }
      return order === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const toggleSort = (col) => {
    if (sortBy === col) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setOrder('desc'); }
  };

  const sortIcon = (col) => sortBy === col ? (order === 'asc' ? ' ↑' : ' ↓') : '';
  
  const validScores = historyData.filter(r => r.score !== null).map(r => r.score);
  const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  const bestScore = validScores.length > 0 ? Math.max(...validScores) : 0;

  // Group consecutive rows by resumeId for visual grouping
  const seenResumeIds = new Set();

  const handleView = (row) => {
    setCurrentResume(row.resumeId, row.resumeName);
    navigate('/analysis', {
      state: {
        results: [{ ...row.rawAnalysis, role_name: row.rawAnalysis.target_role }],
        resumeId: row.resumeId,
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-textDark">📋 Analysis History</h1>
                <p className="text-content-muted mt-1">All your past resume analyses in one place</p>
              </div>
              <Link to="/upload">
                <button className="btn-primary px-5 py-2.5 text-sm">+ Upload New Resume</button>
              </Link>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Analyses', value: historyData.length, icon: '📄', color: 'text-primary', bg: 'bg-blue-50' },
                { label: 'Avg Score', value: `${avgScore}%`, icon: '📊', color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Best Score', value: `${bestScore}%`, icon: '🏆', color: 'text-success', bg: 'bg-emerald-50' },
                { label: 'This Month', value: '3', icon: '📅', color: 'text-warning', bg: 'bg-amber-50' },
              ].map(({ label, value, icon, color, bg }) => (
                <div key={label} className="stat-card animate-fade-in">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bg}`}>{icon}</div>
                  <div>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-content-muted">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table card */}
            <div className="card shadow-sm">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-bold text-textDark text-lg">Resume History</h2>
                  <p className="text-xs text-content-muted mt-0.5">{loading ? 'Loading...' : `${filtered.length} records found`}</p>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or role…"
                  className="input-field max-w-xs text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      {[
                        { label: 'Resume', col: 'name' },
                        { label: 'Role', col: 'role' },
                        { label: 'Score', col: 'score' },
                        { label: 'Date', col: 'date' },
                        { label: 'Size', col: 'size' },
                        { label: 'Action', col: null },
                      ].map(({ label, col }) => (
                        <th key={label}
                          className={`text-left py-3 px-3 text-content-muted font-semibold text-xs uppercase tracking-wider ${col ? 'cursor-pointer hover:text-primary transition-colors select-none' : ''}`}
                          onClick={() => col && toggleSort(col)}>
                          {label}{col ? sortIcon(col) : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => {
                      const isFirstForResume = !seenResumeIds.has(r.resumeId);
                      if (isFirstForResume) seenResumeIds.add(r.resumeId);

                      return (
                        <tr key={r.analysisId} className="border-b border-border-subtle hover:bg-blue-50/40 transition-colors group">
                          <td className="py-4 px-3">
                            {isFirstForResume ? (
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm">📄</span>
                                </div>
                                <div>
                                  <p className="font-medium text-textDark truncate max-w-[140px]">{r.resumeName}</p>
                                  <p className="text-xs text-content-muted">Analyzed</p>
                                </div>
                              </div>
                            ) : (
                              <div className="pl-12">
                                <span className="text-xs text-content-muted">↳ {r.resumeName}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-3 text-content-muted">{r.role}</td>
                          <td className="py-4 px-3"><ScoreChip score={r.score} /></td>
                          <td className="py-4 px-3 text-content-muted">{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="py-4 px-3 text-content-muted">{r.resumeSize}</td>
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="text-primary hover:underline text-xs font-semibold"
                                onClick={() => handleView(r)}
                              >View →</button>
                              <button
                                className="text-xs font-semibold text-content-muted hover:text-error transition-colors"
                                onClick={() => setConfirm(r.analysisId)}>
                                🗑
                              </button>
                            </div>
                            {confirm !== r.analysisId && (
                              <button
                                className="text-primary hover:underline text-xs font-semibold group-hover:hidden"
                                onClick={() => handleView(r)}
                              >View</button>
                            )}
                            {confirm === r.analysisId && (
                              <div className="flex items-center gap-1">
                                <button className="text-xs text-error font-semibold hover:underline"
                                  onClick={() => setConfirm(null)}>Delete?</button>
                                <button className="text-xs text-content-muted hover:underline"
                                  onClick={() => setConfirm(null)}>Cancel</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {loading && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-content-muted">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                            <p>Loading history...</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && error && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-error">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">⚠️</span>
                            <p>{error}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && !error && historyData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-content-muted">
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-4xl opacity-50">📂</span>
                            <p className="text-base font-medium">No resume history available yet.</p>
                            <p className="text-sm">Upload a resume to see your history here.</p>
                            <Link to="/upload">
                              <button className="mt-2 btn-primary px-4 py-2 text-sm">Upload Resume</button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && !error && historyData.length > 0 && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-content-muted">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">🔍</span>
                            <p>No results found for "{search}"</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
