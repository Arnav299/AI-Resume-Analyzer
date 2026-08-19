import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useResume } from '../context/ResumeContext';

// ── Read analysis data from localStorage ──────────────────────────────────────
const loadAnalysis = () => {
  try {
    const raw = localStorage.getItem('rocas_last_analysis');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(r => !r.isError && !r.isCustom && r.readiness_score != null)
      : null;
  } catch {
    return null;
  }
};

const getSavedRoleIdx = () => {
  const saved = localStorage.getItem('rocas_selected_role_idx');
  return saved !== null ? Number(saved) : 0;
};

// ── Color palette cycling for steps ──────────────────────────────────────────
const STEP_COLORS = [
  { color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  { color: '#00D4FF', bg: 'rgba(0,212,255,0.1)' },
  { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
];

const PLATFORM_ICONS = {
  coursera: '🎓',
  udemy: '🎓',
  kaggle: '🐍',
  youtube: '▶️',
  github: '⚡',
  'microsoft learn': '📘',
  'google': '🔵',
  'freecodecamp': '🔥',
  'pluralsight': '📺',
  'linkedin learning': '🔗',
};

const getPlatformIcon = (platform = '') => {
  const lower = platform.toLowerCase();
  for (const [key, icon] of Object.entries(PLATFORM_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '📚';
};

// ── Build roadmap steps from a result's learning_plan ─────────────────────────
const buildSteps = (result) => {
  const plan = result?.learning_plan;
  if (!plan || plan.length === 0) return [];
  return plan.map((item, i) => ({
    step: i + 1,
    title: item.skill || item,
    subtitle: `${item.priority === 'high' ? 'Priority' : 'Recommended'}`,
    platform: item.platform || 'Online Course',
    platformIcon: getPlatformIcon(item.platform || ''),
    url: item.url || null,
    desc: `Learn ${item.skill} to strengthen your profile for this role.`,
    resources: item.url ? [item.platform || 'Course Link'] : [],
    tags: [item.skill],
    color: STEP_COLORS[i % STEP_COLORS.length].color,
    bg: STEP_COLORS[i % STEP_COLORS.length].bg,
    done: false,
    priority: item.priority,
  }));
};

// ── No analysis state ─────────────────────────────────────────────────────────
const NoAnalysis = () => (
  <div className="card shadow-sm text-center py-16">
    <p className="text-5xl mb-4">📂</p>
    <h3 className="font-bold text-textDark text-lg mb-2">No Analysis Found</h3>
    <p className="text-sm text-content-muted mb-6">
      Upload and analyse a resume first to get a personalised learning path.
    </p>
    <Link to="/upload">
      <button className="btn-primary px-6 py-2.5 text-sm">Upload Resume →</button>
    </Link>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const LearningPath = () => {
  const [expanded, setExpanded] = useState(null);
  const { resumeId: globalResumeId } = useResume();

  const allResults = useMemo(() => loadAnalysis(), []);

  // Pick the role the user selected in AI Recommendations (or first by default)
  const roleIdx = useMemo(() => {
    if (!allResults) return 0;
    const saved = getSavedRoleIdx();
    return Math.min(saved, allResults.length - 1);
  }, [allResults]);

  // Only show results if a global resume is actually selected
  const activeResult = globalResumeId ? (allResults?.[roleIdx] ?? null) : null;
  const roadmapSteps = useMemo(() => buildSteps(activeResult), [activeResult]);

  const completed  = roadmapSteps.filter(s => s.done).length;
  const progressPct = roadmapSteps.length > 0
    ? Math.round((completed / roadmapSteps.length) * 100)
    : 0;

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-textDark">🗺️ Your Learning Path</h1>
                <p className="text-content-muted mt-1">
                  Customized roadmap to become a{' '}
                  <strong className="text-primary">
                    {activeResult?.role_name ?? 'your target role'}
                  </strong>
                </p>
              </div>
              <Link to="/recommendations">
                <button className="btn-secondary px-5 py-2.5 text-sm">🎯 AI Recommendations</button>
              </Link>
            </div>

            {/* No data state */}
            {!activeResult || roadmapSteps.length === 0 ? (
              <NoAnalysis />
            ) : (
              <>
                {/* Progress overview */}
                <div className="card shadow-sm">
                  <div className="grid grid-cols-3 gap-6 text-center mb-6">
                    {[
                      { label: 'Steps Completed', value: `${completed}/${roadmapSteps.length}`, color: 'text-success' },
                      { label: 'Total Steps',      value: `${roadmapSteps.length} Steps`,        color: 'text-primary' },
                      { label: 'Progress',         value: `${progressPct}%`,                     color: 'text-purple-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                        <p className="text-xs text-content-muted mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-3 bg-surface-hover rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #6C63FF, #00D4FF)' }} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-content-muted">Start</span>
                    <span className="text-xs font-semibold text-primary">{progressPct}% Complete</span>
                    <span className="text-xs text-content-muted">Goal</span>
                  </div>
                </div>

                {/* Roadmap Steps */}
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-7 top-8 bottom-8 w-0.5"
                    style={{ background: 'linear-gradient(180deg, #6C63FF 0%, #E5E7EB 100%)' }} />

                  <div className="space-y-5">
                    {roadmapSteps.map((item, i) => (
                      <div key={i} className="relative">
                        {/* Step circle */}
                        <div className="absolute left-0 top-0 z-10 w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold text-white shadow-lg"
                          style={{
                            background: item.done
                              ? '#10B981'
                              : `linear-gradient(135deg, ${item.color}, #00D4FF)`,
                          }}>
                          {item.done ? '✓' : item.platformIcon}
                        </div>

                        {/* Card */}
                        <div className="ml-20 card shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                          style={item.priority === 'high' ? { border: `2px solid ${item.color}`, boxShadow: `0 4px 24px ${item.color}22` } : {}}>

                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 cursor-pointer"
                            onClick={() => setExpanded(expanded === i ? null : i)}>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className={`font-bold text-lg ${item.done ? 'text-content-muted' : 'text-textDark'} capitalize`}>
                                  {item.title}
                                </h3>
                                {item.done && <span className="badge-success text-xs">✓ Completed</span>}
                                {item.priority === 'high' && !item.done && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
                                    style={{ background: item.color }}>
                                    ⭐ High Priority
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-content-muted mb-2">{item.subtitle} · {item.platform}</p>
                              <div className="flex flex-wrap gap-2">
                                {item.tags.map(t => (
                                  <span key={t} className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                                    style={{ background: item.bg, color: item.color }}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button className="text-content-muted text-xl transition-transform duration-200 flex-shrink-0"
                              style={{ transform: expanded === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              ▾
                            </button>
                          </div>

                          {/* Expanded content */}
                          {expanded === i && (
                            <div className="mt-4 pt-4 border-t border-border-subtle animate-fade-in">
                              <p className="text-sm text-content-secondary mb-4 leading-relaxed">{item.desc}</p>
                              {item.url && (
                                <>
                                  <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Resource</h4>
                                  <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm text-content-secondary">
                                      <span className="text-primary">→</span>
                                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                                        className="text-primary hover:underline">
                                        {item.platform}
                                      </a>
                                    </li>
                                  </ul>
                                </>
                              )}
                              {!item.done && (
                                item.url ? (
                                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                                    className="btn-primary w-full py-2.5 text-sm mt-4 block text-center no-underline">
                                    🚀 Start Learning
                                  </a>
                                ) : (
                                  <button className="btn-primary w-full py-2.5 text-sm mt-4">
                                    🚀 Start This Step
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="card shadow-sm text-center py-8 border border-primary/20"
                  style={{ background: 'var(--theme-hero-gradient)' }}>
                  <p className="text-2xl mb-2">🎉</p>
                  <h3 className="font-bold text-content mb-1">Complete Your Roadmap</h3>
                  <p className="text-sm text-content-muted mb-5">
                    Finish all {roadmapSteps.length} steps to become job-ready as a {activeResult?.role_name}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/recommendations">
                      <button className="btn-primary px-6 py-2.5 text-sm">🎯 View Career Suggestions</button>
                    </Link>
                    <Link to="/skills">
                      <button className="btn-secondary px-6 py-2.5 text-sm">📊 Skills Analysis</button>
                    </Link>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningPath;
