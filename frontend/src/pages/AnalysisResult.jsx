import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useResume } from '../context/ResumeContext';
import { dashboardAPI } from '../services/api';

// ── Sub-score tile explanations ────────────────────────────────────────────────
const TILE_INFO = {
  'Skill Match':  'Measures how many of the required skills for your target role were detected in your resume. A higher score means your resume closely matches the role\'s skill requirements. Contributes up to 58.3 points (the largest share of the readiness score).',
  'Experience':   'Points awarded based on years of relevant work experience detected in your resume. More years of experience in relevant roles = higher score. Contributes up to 16.7 points.',
  'Education':    'Based on your highest detected qualification. A PhD scores highest, followed by a Master\'s degree, then a Bachelor\'s degree. Contributes up to 12.5 points.',
  'Projects':     'Awarded for evidence of personal or professional projects and certifications found in your resume. Having real-world projects and credentials demonstrates practical ability. Contributes up to 8.3 points.',
  'Presence':     'Points for a professional online presence — specifically a GitHub link, LinkedIn URL, and contact email detected in your resume. Increases recruiter confidence in your digital footprint. Contributes up to 4.2 points.',
};

// ── Sub-score grid with ? info toggle ─────────────────────────────────────────
const SubScoreGrid = ({ skill_score, experience_score, education_score, project_score, professional_presence_score }) => {
  const [expandedInfo, setExpandedInfo] = useState(null);

  const openPopup = (label, colour) => setExpandedInfo({ label, colour });
  const closePopup = () => setExpandedInfo(null);

  const Tile = ({ label, value, rawMax, colour }) => {
    const displayMax   = (rawMax * 100 / 120).toFixed(1);
    const displayValue = (value * 100 / 120).toFixed(1);

    return (
      <div className="relative bg-surface rounded-2xl border border-border-subtle shadow-sm p-5 text-center overflow-hidden group">
        {/* ? toggle */}
        <button
          onClick={() => openPopup(label, colour)}
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors bg-[#6C63FF22] text-[#6C63FF] hover:bg-[#6C63FF44]"
          title="What does this score mean?"
        >
          ?
        </button>

        {/* Normal score view */}
        <p className="text-3xl font-extrabold" style={{ color: colour }}>{displayValue}</p>
        <p className="text-xs text-content-muted mt-1">{label}</p>
        <p className="text-xs text-content-muted">/ {displayMax}</p>
      </div>
    );
  };

  return (
    <>
      <div className="md:col-span-2 flex flex-col gap-4">
        {/* Row 1: top 3 */}
        <div className="grid grid-cols-3 gap-4">
          <Tile label="Skill Match"  value={skill_score}                   rawMax={70} colour="#6C63FF" />
          <Tile label="Experience"   value={experience_score}               rawMax={20} colour="#3B82F6" />
          <Tile label="Education"    value={education_score}                rawMax={15} colour="#8B5CF6" />
        </div>
        {/* Row 2: bottom 2 */}
        <div className="grid grid-cols-2 gap-4">
          <Tile label="Projects"  value={project_score}               rawMax={10} colour="#10B981" />
          <Tile label="Presence"  value={professional_presence_score}  rawMax={5}  colour="#F59E0B" />
        </div>
      </div>

      {/* Pop-up Modal */}
      {expandedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={closePopup}>
          <div className="bg-surface rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-bold text-lg" style={{ color: expandedInfo.colour }}>
                {expandedInfo.label}
              </h3>
              <button onClick={closePopup} className="text-content-muted hover:text-error transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-surface-hover">
                ✕
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-content-secondary leading-relaxed">
                {TILE_INFO[expandedInfo.label]}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Score ring SVG ─────────────────────────────────────────────────────────
const ScoreRing = ({ score = 0, size = 140 }) => {
  const capped   = Math.min(Math.max(score, 0), 100);
  const radius   = 52;
  const circ     = 2 * Math.PI * radius;
  const offset   = circ - (capped / 100) * circ;
  const colour   = capped >= 75 ? '#10B981' : capped >= 50 ? '#F59E0B' : '#EF4444';
  const label    = capped >= 75 ? 'Excellent' : capped >= 50 ? 'Good' : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={colour} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center -mt-[calc(var(--size,140px)/2+12px)]" style={{ marginTop: `-${size / 2 + 10}px` }}>
        <p className="text-3xl font-extrabold" style={{ color: colour }}>{capped.toFixed(0)}<span className="text-sm font-semibold text-content-muted"> / 100</span></p>
        <p className="text-xs font-semibold text-content-muted uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

// ── Skill pill ─────────────────────────────────────────────────────────────
const Pill = ({ label, colour }) => (
  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${colour}`}>
    {label}
  </span>
);

// ── Formatted Text ──────────────────────────────────────────────────────────
const FormattedText = ({ text, emptyMsg }) => {
  if (!text) return <p className="text-sm text-content-muted italic">{emptyMsg}</p>;
  
  // 1. Fix broken line wraps (merge lines starting with lowercase letter)
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const mergedLines = [];
  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].replace(/^[•\-\*]\s*/, '');
    if (mergedLines.length > 0 && /^[a-z]/.test(line)) {
      mergedLines[mergedLines.length - 1] += ' ' + line;
    } else {
      mergedLines.push(line);
    }
  }

  // 2. Classify and render lines
  let inList = false;
  
  return (
    <div className="space-y-1.5">
      {mergedLines.map((line, i) => {
        const firstWord = line.split(' ')[0];
        const isActionVerb = /^(Built|Implemented|Collaborated|Diagnosed|Suggested|Developed|Designed|Analyzed|Architected|Worked|Led|Managed|Created|Resolved|Spearheaded|Improved|Increased|Decreased|Maintained|Supported|Tested|Integrated)\b/i.test(firstWord) || /ed$/.test(firstWord);
        
        const isListHeader = /^(relevant coursework|coursework|courses|relevant courses|core modules|key modules|skills)/i.test(line);
        if (isListHeader) {
          inList = true;
        } else if (/\b(19|20)\d{2}\b/.test(line) || /\b(Present|Current)\b/i.test(line)) {
          inList = false; // Reset list if a new date (new block) appears
        }
        
        const isBullet = isActionVerb || line.length > 55 || (inList && !isListHeader);

        if (!isBullet) {
          // Check if this is the start of a new role/degree (follows a bullet, a date, or is the first line)
          const prevLine = i > 0 ? mergedLines[i - 1] : '';
          const prevWasActionVerb = i > 0 && (/^(Built|Implemented|Collaborated|Diagnosed|Suggested|Developed|Designed|Analyzed|Architected|Worked|Led|Managed|Created|Resolved|Spearheaded|Improved|Increased|Decreased|Maintained|Supported|Tested|Integrated)/i.test(prevLine.split(' ')[0]) || /ed$/.test(prevLine.split(' ')[0]));
          const prevWasBullet = i > 0 && (prevLine.length > 55 || prevWasActionVerb || (i > 1 && inList)); // If previous was a bullet in our list
          
          const prevWasDate = i > 0 && (/\b(19|20)\d{2}\b/.test(prevLine) || /\b(Present|Current)\b/i.test(prevLine));
          const isLocation = (line.includes(',') && line.length < 30) || line.toLowerCase() === 'remote';
          
          const isNewSection = i === 0 || isListHeader || prevWasBullet || (prevWasDate && !isLocation);
          
          return (
            <div key={i} className={`text-sm ${isNewSection ? 'mt-4 font-bold text-textDark' : 'font-medium text-content-secondary'} ${i === 0 ? '!mt-0' : ''}`}>
              {line}
            </div>
          );
        }
        
        return (
          <div key={i} className="text-sm text-content-secondary flex gap-2 leading-relaxed ml-2">
            <span className="text-content-muted">•</span>
            <span>{line}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Single role result panel ───────────────────────────────────────────────
const RolePanel = ({ result }) => {
  if (result.isCustom && !result.readiness_score) {
    return (
      <div className="p-8 bg-orange-50 border border-orange-200 rounded-2xl text-center">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-xl font-bold text-orange-700 mb-2">{result.role_name}</h3>
        <p className="text-orange-600 max-w-md mx-auto">{result.note}</p>
      </div>
    );
  }

  if (result.isError) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
        <div className="text-5xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-red-700 mb-2">{result.role_name}</h3>
        <p className="text-red-600">{result.error}</p>
      </div>
    );
  }

  const {
    readiness_score = 0,
    skill_score = 0,
    project_score = 0,
    professional_presence_score = 0,
    experience_score = 0,
    education_score = 0,
    matched_skills = [],
    missing_skills = [],
    extracted_skills = [],
    soft_skills = [],
    recommendation_summary = '',
    strengths = [],
    weaknesses = [],
    learning_plan = [],
    quick_wins = [],
    education = '',
    experience = '',
  } = result;

  return (
    <div className="space-y-8">
      {/* Score overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Big ring */}
        <div className="md:col-span-1 bg-surface rounded-2xl border border-border-subtle shadow-sm p-6 flex flex-col items-center justify-center gap-2">
          <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-2">Readiness Score</p>
          <ScoreRing score={readiness_score} size={140} />
        </div>

        {/* Sub-scores — all 5 contributing factors, normalized so maxes sum to 100 */}
        {/* Backend raw maxes: 70+20+15+10+5 = 120 → scale factor = 100/120 */}
        <SubScoreGrid
          skill_score={skill_score}
          experience_score={experience_score}
          education_score={education_score}
          project_score={project_score}
          professional_presence_score={professional_presence_score}
        />

      </div>

      {/* Summary card */}
      {recommendation_summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-bold text-blue-800 mb-2">💡 AI Summary</h3>
          <p className="text-blue-700 text-sm leading-relaxed">{recommendation_summary}</p>
        </div>
      )}

      {/* Skills grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched skills */}
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
          <h3 className="font-bold text-content mb-4 flex items-center gap-2">
            <span className="text-green-500">✅</span> Matched Skills ({matched_skills.length})
          </h3>
          {matched_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matched_skills.map(s => (
                <Pill key={s} label={s} colour="bg-green-50 text-green-700 border-green-200" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-muted italic">No matched skills found.</p>
          )}
        </div>

        {/* Missing skills */}
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
          <h3 className="font-bold text-content mb-4 flex items-center gap-2">
            <span className="text-red-400">❌</span> Missing Skills ({missing_skills.length})
          </h3>
          {missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missing_skills.map(s => (
                <Pill key={s} label={s} colour="bg-red-50 text-red-600 border-red-200" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-muted italic">No missing skills — great match!</p>
          )}
        </div>

        {/* Extracted skills */}
        {extracted_skills.length > 0 && (
          <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
            <h3 className="font-bold text-content mb-4 flex items-center gap-2">
              <span>🔍</span> Extracted From Resume ({extracted_skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {extracted_skills.map(s => (
                <Pill key={s} label={s} colour="bg-purple-50 text-purple-700 border-purple-200" />
              ))}
            </div>
          </div>
        )}

        {/* Soft skills */}
        {soft_skills.length > 0 && (
          <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
            <h3 className="font-bold text-content mb-4 flex items-center gap-2">
              <span>🤝</span> Soft Skills ({soft_skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {soft_skills.map(s => (
                <Pill key={s} label={s} colour="bg-blue-50 text-blue-700 border-blue-200" />
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
          <h3 className="font-bold text-content mb-4 flex items-center gap-2">
            <span>🎓</span> Education
          </h3>
          <FormattedText text={education} emptyMsg="No education details extracted." />
        </div>

        {/* Experience */}
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
          <h3 className="font-bold text-content mb-4 flex items-center gap-2">
            <span>💼</span> Experience
          </h3>
          <FormattedText text={experience} emptyMsg="No experience details extracted." />
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
            <h3 className="font-bold text-green-800 mb-3">💪 Strengths</h3>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="text-sm text-green-700 flex gap-2"><span>•</span>{s}</li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl p-6">
            <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-3">🔧 Areas to Improve</h3>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex gap-2"><span className="text-amber-500 dark:text-amber-400">•</span>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Quick wins */}
      {quick_wins.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h3 className="font-bold text-indigo-800 mb-3">⚡ Quick Wins — Learn These First</h3>
          <div className="flex flex-wrap gap-3">
            {quick_wins.map((s, i) => (
              <span key={s} className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                {i + 1}. {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learning plan */}
      {learning_plan.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
          <h3 className="font-bold text-content mb-4">📚 Personalised Learning Plan</h3>
          <div className="space-y-3">
            {learning_plan.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-page rounded-xl">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  item.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {item.priority?.toUpperCase()}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-content-secondary text-sm capitalize">{item.skill}</p>
                  <p className="text-xs text-content-muted">{item.platform}</p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Learn →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────
const AnalysisResult = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { resumeId: globalResumeId } = useResume();
  
  // Try state first, then fallback to global context and localStorage
  let navResults = location.state?.results;
  const resumeId = location.state?.resumeId || globalResumeId;

  if (!navResults) {
    try {
      const stored = localStorage.getItem('rocas_last_analysis');
      if (stored) navResults = JSON.parse(stored);
    } catch { /* ignore */ }
  }

  const results = navResults || [];
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    dashboardAPI.getStudent()
      .then(res => setProfileData(res.data?.student_profile || null))
      .catch(console.error);
  }, []);

  // Note: Only require a valid resumeId and results. 
  // We consider "No Analysis Results" true if NO results or NO global resume is selected.
  if (!resumeId || !results || results.length === 0) {
    return (
      <div className="flex min-h-screen bg-page">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6 md:p-10">
            <div className="card shadow-sm text-center py-16 px-12 border border-border-default bg-surface max-w-lg w-full">
              <p className="text-5xl mb-4">📂</p>
              <h3 className="font-bold text-textDark text-lg mb-2">No Analysis Found</h3>
              <p className="text-sm text-content-muted mb-6">
                Upload and analyse a resume first to get a personalised learning path.
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Upload Resume →
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const activeResult = results[activeTab];

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-textDark">Resume Analysis</h1>
                <p className="text-content-muted mt-1">
                  {results.length} role{results.length > 1 ? 's' : ''} analysed
                </p>
              </div>
              <button
                onClick={() => navigate('/roles', { state: { resumeId } })}
                className="text-sm text-primary font-semibold hover:underline"
              >
                ← Analyse different roles
              </button>
            </div>

            {/* Role tabs */}
            {results.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap border transition-all ${
                      i === activeTab
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                        : 'bg-surface text-content-secondary border-border-default hover:border-primary/40'
                    }`}
                  >
                    {r.isCustom ? '✨ ' : r.isError ? '❌ ' : '✅ '}
                    {r.role_name}
                    {!r.isCustom && !r.isError && (
                      <span className="ml-2 text-xs opacity-75">
                        {(r.readiness_score || 0).toFixed(0)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Active panel */}
            <div className="mt-8 animate-fade-in">
              {activeResult && <RolePanel result={activeResult} />}
            </div>

            {/* CTA */}
            <div className="mt-10 flex gap-4 justify-center">
              <button
                onClick={() => navigate('/upload')}
                className="py-3 px-8 rounded-xl font-semibold border border-border-default text-content-secondary hover:border-primary hover:text-primary transition-all"
              >
                Upload Different Resume
              </button>
              <button
                onClick={() => navigate('/roles', { state: { resumeId } })}
                className="py-3 px-8 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Try Other Roles
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalysisResult;
