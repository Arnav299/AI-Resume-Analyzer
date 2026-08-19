import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useResume } from '../context/ResumeContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Read the last analysis results saved by RoleSelection. */
const loadResults = () => {
  try {
    const raw = localStorage.getItem('rocas_last_analysis');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Filter out error / custom-stub entries
    return Array.isArray(parsed) ? parsed.filter(r => !r.isError && !r.isCustom && r.readiness_score != null) : null;
  } catch {
    return null;
  }
};

const ROLE_ICONS = {
  'full stack':     '💻',
  'frontend':       '🎨',
  'backend':        '⚙️',
  'data scientist': '🧪',
  'data analyst':   '📊',
  'ai/ml':          '🤖',
  'ai engineer':    '🧠',
  'devops':         '🔄',
  'cloud':          '☁️',
  'mobile':         '📱',
  'software':       '🖥️',
  'data engineer':  '🔧',
  'business intelligence': '📈',
};

const getRoleIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🎯';
};

const ROLE_GRADIENTS = [
  'from-blue-500 to-primary',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-500',
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-fuchsia-600',
];

const getDemand = (score) => {
  if (score >= 75) return 'Very High';
  if (score >= 55) return 'High';
  return 'Medium';
};

const TABS = ['Career Suggestions', 'Learning Path', 'Improve Profile'];

// ── Sub-components ─────────────────────────────────────────────────────────────
const MatchRing = ({ match }) => {
  const color = match >= 75 ? '#10B981' : match >= 55 ? '#6C63FF' : '#F59E0B';
  return (
    <div className="relative w-14 h-14">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="22" fill="none" stroke="#E5E7EB" strokeWidth="5" />
        <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${2 * Math.PI * 22}`}
          strokeDashoffset={`${2 * Math.PI * 22 * (1 - match / 100)}`}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-extrabold" style={{ color }}>{match}%</span>
      </div>
    </div>
  );
};

const DemandBadge = ({ demand }) => {
  const styles = { 'Very High': 'bg-emerald-100 text-emerald-700', High: 'bg-blue-100 text-blue-700', Medium: 'bg-amber-100 text-amber-700' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[demand] || 'bg-surface-hover text-content-secondary'}`}>{demand} Demand</span>;
};

// ── Empty state ────────────────────────────────────────────────────────────────
const NoAnalysis = () => (
  <div className="card shadow-sm text-center py-16">
    <p className="text-5xl mb-4">📂</p>
    <h3 className="font-bold text-textDark text-lg mb-2">No Analysis Found</h3>
    <p className="text-sm text-content-muted mb-6">Upload a resume and analyse it first to see personalised recommendations.</p>
    <Link to="/upload">
      <button className="btn-primary px-6 py-2.5 text-sm">Upload Resume →</button>
    </Link>
  </div>
);

const AIRecommendations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { resumeId: globalResumeId } = useResume();
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(() => {
    const saved = localStorage.getItem('rocas_selected_role_idx');
    return saved !== null ? Number(saved) : 0;
  });
  
  const rawResults = useMemo(() => loadResults(), []);
  const results = globalResumeId ? rawResults : null;

  // Keep localStorage in sync with selected role so LearningPath page matches
  useEffect(() => {
    localStorage.setItem('rocas_selected_role_idx', String(selectedRoleIdx));
  }, [selectedRoleIdx]);

  // ── Derive career suggestions from results ──────────────────────────────────
  const careerSuggestions = useMemo(() => {
    if (!results) return [];
    return results
      .sort((a, b) => b.readiness_score - a.readiness_score)
      .map((r, i) => ({
        id: i,
        title: r.role_name,
        match: Math.round(r.readiness_score),
        desc: r.recommendation_summary || `Based on your resume, you are a ${getDemand(r.readiness_score).toLowerCase()} demand match for this role.`,
        // Use up to 4 matched skills as tags, fall back to extracted skills
        tags: (r.matched_skills?.length ? r.matched_skills : r.extracted_skills || []).slice(0, 4),
        icon: getRoleIcon(r.role_name),
        color: ROLE_GRADIENTS[i % ROLE_GRADIENTS.length],
        demand: getDemand(r.readiness_score),
        // Keep full result for other tabs
        _result: r,
      }));
  }, [results]);

  // ── Derive learning plan from the selected role ────────────────────────────
  const safeIdx = Math.min(selectedRoleIdx, careerSuggestions.length - 1);
  const bestResult = careerSuggestions[safeIdx]?._result;
  const learningPlanItems = useMemo(() => {
    const plan = bestResult?.learning_plan;
    if (!plan || plan.length === 0) return [];
    return plan.map((item, i) => ({
      step: i + 1,
      skill: item.skill || item,
      platform: item.platform || 'Online Course',
      url: item.url || null,
      priority: item.priority || 'medium',
    }));
  }, [bestResult]);

  // ── Derive improvement tips from weaknesses + quick_wins ──────────────────
  const improveTips = useMemo(() => {
    if (!bestResult) return [];
    const tips = [];

    // From weaknesses
    (bestResult.weaknesses || []).forEach((w, i) => {
      tips.push({
        icon: '🔧',
        title: `Improve: ${w.length > 60 ? w.slice(0, 60) + '…' : w}`,
        desc: w,
        priority: i < 2 ? 'High' : 'Medium',
      });
    });

    // From missing skills
    const missing = bestResult.missing_skills || [];
    if (missing.length > 0) {
      tips.push({
        icon: '📚',
        title: `Learn missing skills: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '…' : ''}`,
        desc: `Your resume is missing the following skills required for ${bestResult.role_name}: ${missing.join(', ')}.`,
        priority: 'High',
      });
    }

    // From quick_wins
    (bestResult.quick_wins || []).slice(0, 3).forEach((qw) => {
      tips.push({
        icon: '⚡',
        title: `Quick Win: ${qw}`,
        desc: `Adding ${qw} to your skillset could quickly boost your match score.`,
        priority: 'Medium',
      });
    });

    // Generic always-good tips if we have room
    if (tips.length < 4) {
      tips.push(
        { icon: '🔗', title: 'Add GitHub Portfolio Link', desc: 'Include a GitHub link with active projects to show hands-on coding skills.', priority: 'High' },
        { icon: '🏆', title: 'Add Certifications', desc: 'Add relevant certificates to strengthen your resume.', priority: 'Medium' },
      );
    }

    return tips.slice(0, 6);
  }, [bestResult]);

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
                <h1 className="text-3xl font-bold text-textDark">🎯 AI Recommendations</h1>
                <p className="text-content-muted mt-1">Personalized career guidance based on your latest resume analysis</p>
              </div>
              <Link to="/report">
                <button className="btn-primary px-5 py-2.5 text-sm">📥 Download Report</button>
              </Link>
            </div>

            {/* Tabs */}
            <div className="card shadow-sm p-1 flex gap-1">
              {TABS.map((tab, i) => (
                <button key={i} onClick={() => setActiveTab(i)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={activeTab === i
                    ? { background: 'linear-gradient(135deg, #6C63FF, #5A52E0)', color: 'white', boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }
                    : { color: '#6B7280' }
                  }>
                  {['💼', '🗺️', '✨'][i]} {tab}
                </button>
              ))}
            </div>

            {/* Tab 0 — Career Suggestions */}
            {activeTab === 0 && (
              <div className="animate-fade-in space-y-4">
                {!results ? (
                  <NoAnalysis />
                ) : careerSuggestions.length === 0 ? (
                  <NoAnalysis />
                ) : (
                  <>
                    <p className="text-sm text-content-muted">Based on your resume analysis, here are your best-fit career paths — ranked by readiness score:</p>
                    {careerSuggestions.map(role => (
                      <div key={role.id} className="card shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                        <div className="flex items-start gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-md bg-gradient-to-br ${role.color} flex-shrink-0`}>
                            {role.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-bold text-textDark">{role.title}</h3>
                              <DemandBadge demand={role.demand} />
                            </div>
                            <p className="text-sm text-content-muted mb-3 line-clamp-2">{role.desc}</p>
                            <div className="flex flex-wrap gap-2">
                              {role.tags.map(t => (
                                <span key={t} className="badge-primary text-xs">{t}</span>
                              ))}
                              {role.tags.length === 0 && (
                                <span className="text-xs text-content-muted italic">No skills matched</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <MatchRing match={role.match} />
                            <span className="text-xs text-content-muted">Match</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border-subtle">
                          <button
                            className="btn-secondary py-2 px-4 text-xs w-full"
                            onClick={() => { setSelectedRoleIdx(role.id); setActiveTab(1); }}
                          >
                            View Learning Path →
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Tab 1 — Learning Path */}
            {activeTab === 1 && (
              <div className="animate-fade-in space-y-4">
                {!results || learningPlanItems.length === 0 ? (
                  <NoAnalysis />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-content-muted">
                        Your personalised skill-building roadmap for{' '}
                        <strong>{bestResult?.role_name}</strong>
                      </p>
                      {careerSuggestions.length > 1 && (
                        <select
                          className="text-xs border border-border-default rounded-lg px-2 py-1 bg-surface text-content-secondary"
                          value={safeIdx}
                          onChange={e => setSelectedRoleIdx(Number(e.target.value))}
                        >
                          {careerSuggestions.map((r, i) => (
                            <option key={i} value={i}>{r.title}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary to-transparent" />
                      <div className="space-y-4">
                        {learningPlanItems.map((item, i) => (
                          <div key={i} className="card shadow-sm flex items-start gap-5 ml-4 hover:-translate-y-0.5 transition-all duration-200">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 -ml-8 z-10"
                              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                              {item.step}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-bold text-textDark capitalize">{item.skill}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  item.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>{item.priority?.toUpperCase()}</span>
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-content-muted">
                                <span>🎓 {item.platform}</span>
                              </div>
                            </div>
                            {item.url ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer"
                                className="btn-primary px-4 py-1.5 text-xs flex-shrink-0 no-underline">
                                Learn →
                              </a>
                            ) : (
                              <button className="btn-primary px-4 py-1.5 text-xs flex-shrink-0">Start →</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link to="/learning-path">
                      <button className="btn-neon w-full py-3 text-sm font-bold text-white rounded-xl mt-2">
                        🗺️ View Full Learning Path
                      </button>
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Tab 2 — Improve Profile */}
            {activeTab === 2 && (
              <div className="animate-fade-in space-y-4">
                {!results || improveTips.length === 0 ? (
                  <NoAnalysis />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-content-muted">
                        Based on your resume analysis for <strong>{bestResult?.role_name}</strong>, here are the most impactful improvements:
                      </p>
                      {careerSuggestions.length > 1 && (
                        <select
                          className="text-xs border border-border-default rounded-lg px-2 py-1 bg-surface text-content-secondary ml-4 flex-shrink-0"
                          value={safeIdx}
                          onChange={e => setSelectedRoleIdx(Number(e.target.value))}
                        >
                          {careerSuggestions.map((r, i) => (
                            <option key={i} value={i}>{r.title}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    {improveTips.map((tip, i) => {
                      const priorityStyle = {
                        High: { bg: 'bg-red-100', text: 'text-red-700' },
                        Medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
                        Low: { bg: 'bg-surface-hover', text: 'text-content-secondary' },
                      }[tip.priority] || { bg: 'bg-surface-hover', text: 'text-content-secondary' };
                      return (
                        <div key={i} className="card shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-blue-50 flex-shrink-0">{tip.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-textDark text-sm">{tip.title}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityStyle.bg} ${priorityStyle.text}`}>
                                {tip.priority}
                              </span>
                            </div>
                            <p className="text-sm text-content-muted leading-relaxed">{tip.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AIRecommendations;
