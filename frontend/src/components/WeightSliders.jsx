import React, { useState, useCallback } from 'react';

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { key: 'skills',         label: 'Skills Match',     icon: '⚡', description: 'Technical & soft skills alignment', color: '#6C63FF' },
  { key: 'experience',     label: 'Experience',        icon: '💼', description: 'Years and depth of experience', color: '#00D4FF' },
  { key: 'education',      label: 'Education',         icon: '🎓', description: 'Academic qualifications', color: '#10B981' },
  { key: 'certifications', label: 'Certifications',    icon: '📜', description: 'Industry certifications', color: '#F59E0B' },
  { key: 'projects',       label: 'Projects',          icon: '🚀', description: 'Portfolio & project quality', color: '#A78BFA' },
  { key: 'requirements',   label: 'Requirements',      icon: '📋', description: 'Specific job requirements', color: '#F472B6' },
];

const TARGET_TOTAL = 100;

// ── Helper ─────────────────────────────────────────────────────────────────────

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// ── WeightSliders Component ────────────────────────────────────────────────────

/**
 * WeightSliders — interactive 6-category weight distribution (must total 100).
 *
 * @param {Object} props
 * @param {Object} [props.initialWeights] — override initial per-key values
 * @param {(weights: Object) => void} [props.onChange] — called on every change
 * @param {boolean} [props.readOnly] — disable sliders
 */
const WeightSliders = ({ initialWeights, onChange, readOnly = false }) => {
  const defaultWeights = DEFAULT_CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = initialWeights?.[cat.key] ?? Math.round(TARGET_TOTAL / DEFAULT_CATEGORIES.length);
    return acc;
  }, {});

  const [weights, setWeights] = useState(defaultWeights);
  const [activeKey, setActiveKey] = useState(null);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const remaining = TARGET_TOTAL - total;
  const isValid = total === TARGET_TOTAL;

  const handleChange = useCallback(
    (key, newValue) => {
      if (readOnly) return;

      setWeights((prev) => {
        const clamped = clamp(newValue, 0, 100);
        const updated = { ...prev, [key]: clamped };

        // Auto-notify parent
        onChange?.(updated);
        return updated;
      });
    },
    [onChange, readOnly]
  );

  const distributeEvenly = () => {
    const even = Math.floor(TARGET_TOTAL / DEFAULT_CATEGORIES.length);
    const remainder = TARGET_TOTAL - even * DEFAULT_CATEGORIES.length;
    const evened = DEFAULT_CATEGORIES.reduce((acc, cat, i) => {
      acc[cat.key] = even + (i === 0 ? remainder : 0);
      return acc;
    }, {});
    setWeights(evened);
    onChange?.(evened);
  };

  const resetAll = () => {
    const reset = DEFAULT_CATEGORIES.reduce((acc, cat) => {
      acc[cat.key] = 0;
      return acc;
    }, {});
    setWeights(reset);
    onChange?.(reset);
  };

  const totalColor = total > TARGET_TOTAL ? '#EF4444' : total === TARGET_TOTAL ? '#10B981' : '#F59E0B';

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <div>
          <p className="text-sm font-semibold text-white">Weight Distribution</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Adjust each category — total must equal 100%
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Total indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: `${totalColor}18`,
              border: `1px solid ${totalColor}44`,
            }}
          >
            <span className="text-sm font-extrabold" style={{ color: totalColor }}>
              {total}
            </span>
            <span className="text-xs" style={{ color: `${totalColor}99` }}>
              / {TARGET_TOTAL}
            </span>
            {isValid && <span className="text-xs">✓</span>}
          </div>

          {!readOnly && (
            <>
              <button
                onClick={distributeEvenly}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-surface/10"
                style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Distribute
              </button>
              <button
                onClick={resetAll}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-surface/10"
                style={{ color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {DEFAULT_CATEGORIES.map((cat) => {
          const val = weights[cat.key];
          const pct = (val / TARGET_TOTAL) * 100;
          const isActive = activeKey === cat.key;

          return (
            <div
              key={cat.key}
              className="rounded-2xl p-4 transition-all duration-200"
              style={{
                background: isActive
                  ? `${cat.color}0E`
                  : 'rgba(255,255,255,0.04)',
                border: isActive
                  ? `1px solid ${cat.color}44`
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${cat.color}22`, border: `1px solid ${cat.color}33` }}
                >
                  {cat.icon}
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{cat.label}</p>
                    <div className="flex items-center gap-2">
                      {/* Numeric input */}
                      {!readOnly ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={val}
                          onChange={(e) => handleChange(cat.key, Number(e.target.value))}
                          onFocus={() => setActiveKey(cat.key)}
                          onBlur={() => setActiveKey(null)}
                          className="w-14 text-center text-sm font-extrabold rounded-lg py-1 outline-none transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: `1px solid ${cat.color}44`,
                            color: cat.color,
                          }}
                        />
                      ) : (
                        <span className="text-sm font-extrabold" style={{ color: cat.color }}>
                          {val}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        %
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Track + slider */}
              <div className="relative h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                {/* Filled portion */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${cat.color}cc, ${cat.color})`,
                    boxShadow: isActive ? `0 0 8px ${cat.color}88` : 'none',
                  }}
                />
                {/* Native range input */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={val}
                  disabled={readOnly}
                  onChange={(e) => handleChange(cat.key, Number(e.target.value))}
                  onFocus={() => setActiveKey(cat.key)}
                  onBlur={() => setActiveKey(null)}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                  style={{ cursor: readOnly ? 'default' : 'pointer' }}
                />
                {/* Thumb indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg transition-all duration-200"
                  style={{
                    left: `calc(${pct}% - 8px)`,
                    background: cat.color,
                    boxShadow: isActive ? `0 0 12px ${cat.color}` : `0 2px 6px ${cat.color}66`,
                    transform: isActive ? 'translateY(-50%) scale(1.3)' : 'translateY(-50%) scale(1)',
                    border: '2px solid rgba(10,14,26,0.8)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-xs font-semibold text-white mb-3">Distribution Summary</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {DEFAULT_CATEGORIES.map((cat) => {
            const pct = (weights[cat.key] / TARGET_TOTAL) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={cat.key}
                className="h-full rounded-sm transition-all duration-300"
                style={{ width: `${pct}%`, background: cat.color, minWidth: '2px' }}
                title={`${cat.label}: ${weights[cat.key]}%`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {DEFAULT_CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {cat.label.split(' ')[0]}:{' '}
              </span>
              <span className="text-xs font-bold text-white">{weights[cat.key]}%</span>
            </div>
          ))}
        </div>

        {/* Validation message */}
        {!isValid && (
          <div
            className="mt-3 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-semibold"
            style={{
              background: total > TARGET_TOTAL ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
              color: total > TARGET_TOTAL ? '#F87171' : '#FCD34D',
            }}
          >
            <span>{total > TARGET_TOTAL ? '⚠️' : 'ℹ️'}</span>
            <span>
              {total > TARGET_TOTAL
                ? `Over by ${total - TARGET_TOTAL}% — reduce weights to reach exactly 100%`
                : `${remaining}% remaining — increase weights to reach 100%`}
            </span>
          </div>
        )}

        {isValid && (
          <div
            className="mt-3 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-semibold"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399' }}
          >
            <span>✅</span>
            <span>Perfect! Weights sum to 100%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightSliders;
