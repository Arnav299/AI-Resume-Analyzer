import React, { useState } from 'react';

// ── Score ring ────────────────────────────────────────────────────────────────

const ScoreRing = ({ score = 0, size = 56, color = '#3b82f6', label }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 44 44" className="-rotate-90 drop-shadow-sm">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
        <circle
          cx="22" cy="22" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text
          x="22" y="22"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9"
          fontWeight="800"
          fill="#334155"
          style={{ transform: 'rotate(90deg)', transformOrigin: '22px 22px' }}
        >
          {score}
        </text>
      </svg>
      {label && (
        <span className="text-xs text-center font-medium text-content-muted leading-tight" style={{ maxWidth: '64px' }}>
          {label}
        </span>
      )}
    </div>
  );
};

// ── Rationale card ────────────────────────────────────────────────────────────

const RationaleCard = ({ type, category, reason, evidence, icon }) => {
  const [expanded, setExpanded] = useState(false);

  const isGreen = type === 'selected';
  
  const cardStyle = isGreen
    ? 'bg-green-50 border border-green-200 hover:border-green-300'
    : 'bg-orange-50 border border-orange-200 hover:border-orange-300';
    
  const badgeStyle = isGreen
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700';
    
  const chipStyle = isGreen 
    ? 'bg-surface text-green-600 border-green-200' 
    : 'bg-surface text-orange-600 border-orange-200';

  return (
    <div
      className={`rounded-xl p-4 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${cardStyle}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0 mt-0.5">{icon || (isGreen ? '✅' : '⚠️')}</span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${badgeStyle}`}>
                {isGreen ? '✓ Selected Because' : '⚡ Gap Identified'}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${chipStyle}`}>
                {category}
              </span>
            </div>
            <p className="text-sm font-medium text-content leading-snug">{reason}</p>
          </div>
        </div>
        <span
          className="text-xs flex-shrink-0 mt-1 transition-transform duration-200 text-content-muted"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          ▾
        </span>
      </div>

      {/* Evidence expandable */}
      {expanded && evidence && (
        <div
          className="mt-4 ml-9 p-3 rounded-lg bg-surface border border-border-default shadow-sm"
          onClick={e => e.stopPropagation()}
        >
          <p className={`text-xs font-bold mb-1.5 flex items-center gap-1.5 ${isGreen ? 'text-green-600' : 'text-orange-600'}`}>
            <span>📎</span> Evidence from Resume
          </p>
          <p className="text-xs leading-relaxed text-content-secondary font-mono bg-page p-2 rounded border border-border-subtle">
            "{evidence}"
          </p>
        </div>
      )}
    </div>
  );
};

// ── Score breakdown bar ───────────────────────────────────────────────────────

const ScoreBreakdownBar = ({ label, score, weight, color, icon }) => {
  const percentage = Math.min(100, score);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-5 flex-shrink-0 flex justify-center text-content-muted">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-content-secondary">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-content-muted">
              Weight: {weight}%
            </span>
            <span className="text-xs font-black" style={{ color }}>{score}/100</span>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-surface-hover border border-border-default/50">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percentage}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Main XAI Rationale Cards Component ───────────────────────────────────────

const XAIRationaleCards = ({
  totalScore = 0,
  scoreBreakdown = [],
  positiveCards = [],
  gapCards = [],
  recommendation = 'Borderline',
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const recMap = {
    Shortlist: { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', label: '✅ Shortlist' },
    Borderline: { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', label: '⚡ Borderline' },
    Reject: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', label: '❌ Not Recommended' },
  };
  const rec = recMap[recommendation] || recMap.Borderline;

  const tabs = [
    { id: 'overview', label: 'Score Overview', count: null },
    { id: 'strengths', label: 'Strengths', count: positiveCards.length },
    { id: 'gaps', label: 'Gaps', count: gapCards.length },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header: Total Score + Recommendation ─── */}
      <div className="rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 bg-page border border-border-default shadow-sm">
        <div className="flex items-center gap-6">
          <ScoreRing score={totalScore} size={84} color={
            totalScore >= 80 ? '#10b981' : totalScore >= 60 ? '#3b82f6' : totalScore >= 40 ? '#f59e0b' : '#ef4444'
          } />
          <div>
            <p className="text-3xl font-black text-content leading-none">{totalScore}<span className="text-lg text-content-muted font-medium">/100</span></p>
            <p className="text-sm mt-1.5 font-semibold text-content-muted">AI Match Score</p>
            <span
              className={`inline-block mt-3 px-3 py-1 rounded-md text-xs font-bold border ${rec.bg} ${rec.color} ${rec.border}`}
            >
              {rec.label}
            </span>
          </div>
        </div>

        {/* Mini score rings */}
        <div className="flex-1 flex flex-wrap gap-5 justify-end pl-6 sm:border-l border-border-default">
          {scoreBreakdown.slice(0, 4).map(item => (
            <ScoreRing
              key={item.category}
              score={item.score}
              size={48}
              color={item.color}
              label={item.category}
            />
          ))}
        </div>
      </div>

      {/* ── Tab navigation ──────────────────────── */}
      <div className="flex gap-2 border-b border-border-default">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-content-muted hover:text-content hover:bg-page rounded-t-lg'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-surface-hover text-content-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────── */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="rounded-xl p-6 bg-surface border border-border-default shadow-sm space-y-6">
            <h3 className="text-base font-bold text-content flex items-center gap-2">
              <span className="text-blue-500">📊</span> Score Breakdown by Category
            </h3>
            {scoreBreakdown.length > 0 ? (
              <div className="space-y-5">
                {scoreBreakdown.map(item => (
                  <ScoreBreakdownBar
                    key={item.category}
                    label={item.category}
                    score={item.score}
                    weight={item.weight}
                    color={item.color}
                    icon={item.icon}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6 text-content-muted font-medium">
                Score breakdown not available
              </p>
            )}
          </div>
        )}

        {activeTab === 'strengths' && (
          <div className="space-y-4">
            {positiveCards.length > 0 ? (
              positiveCards.map((card, i) => (
                <RationaleCard key={i} type="selected" {...card} />
              ))
            ) : (
              <div className="rounded-xl p-8 text-center bg-page border border-border-default border-dashed">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-sm font-semibold text-content-muted">No strength rationale available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-4">
            {gapCards.length > 0 ? (
              gapCards.map((card, i) => (
                <RationaleCard key={i} type="gap" {...card} />
              ))
            ) : (
              <div className="rounded-xl p-8 text-center bg-page border border-border-default border-dashed">
                <p className="text-3xl mb-3">✨</p>
                <p className="text-sm font-semibold text-content-muted">No gaps identified</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default XAIRationaleCards;
