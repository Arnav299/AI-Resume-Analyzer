import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, Settings, Users, Lightbulb, Target } from 'lucide-react';

const StarRating = ({ value = 0, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className="text-2xl transition-all duration-150 disabled:cursor-default focus:outline-none focus-visible:ring-2 rounded"
            style={{
              color: filled ? '#f59e0b' : '#e2e8f0', // amber-500 or slate-200
              transform: filled ? 'scale(1.1)' : 'scale(1)',
            }}
            aria-label={`${star} star`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

const CATEGORIES = [
  { key: 'communication', label: 'Communication', icon: MessageSquare, description: 'Clarity, articulation, and listening skills', color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'technical', label: 'Technical Skills', icon: Settings, description: 'Domain knowledge, problem solving, code quality', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { key: 'cultureFit', label: 'Culture Fit', icon: Users, description: 'Alignment with company values and team dynamics', color: 'text-green-500', bg: 'bg-green-50' },
  { key: 'problemSolving', label: 'Problem Solving', icon: Lightbulb, description: 'Analytical thinking and creative solutions', color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'leadership', label: 'Leadership', icon: Target, description: 'Initiative, ownership, and team influence', color: 'text-orange-500', bg: 'bg-orange-50' },
];

const RECOMMENDATIONS = [
  { value: 'Hire',   label: '✅ Strong Hire',  classes: 'border-green-200 bg-green-50 text-green-700', active: 'ring-2 ring-green-500 bg-green-100 shadow-sm' },
  { value: 'Hold',   label: '⚡ Hold / 2nd Round', classes: 'border-orange-200 bg-orange-50 text-orange-700', active: 'ring-2 ring-orange-500 bg-orange-100 shadow-sm' },
  { value: 'Reject', label: '❌ Not a Fit',    classes: 'border-red-200 bg-red-50 text-red-700', active: 'ring-2 ring-red-500 bg-red-100 shadow-sm' },
];

const InterviewScorecard = ({
  candidateId,
  candidateName = 'Candidate',
  onSave,
  initialData = {},
  readOnly = false,
}) => {
  const defaultRatings = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: initialData?.ratings?.[cat.key] ?? 0 }), {});
  const defaultNotes = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: initialData?.notes?.[cat.key] ?? '' }), {});

  const [ratings, setRatings] = useState(defaultRatings);
  const [notes, setNotes] = useState(defaultNotes);
  const [recommendation, setRec] = useState(initialData?.recommendation ?? '');
  const [overallNotes, setOverallNotes] = useState(initialData?.overallNotes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalRated = CATEGORIES.filter(c => ratings[c.key] > 0).length;
  const avgRating  = totalRated > 0 ? CATEGORIES.reduce((sum, c) => sum + ratings[c.key], 0) / CATEGORIES.length : 0;
  const overallScore = Math.round((avgRating / 5) * 100);

  const scoreColor = overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-blue-600' : overallScore >= 40 ? 'text-orange-500' : 'text-red-500';
  const scoreLabel = overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Average' : 'Below par';

  const setRating = useCallback((key, value) => { setRatings(prev => ({ ...prev, [key]: value })); setSaved(false); }, []);
  const setNote = useCallback((key, value) => { setNotes(prev => ({ ...prev, [key]: value })); setSaved(false); }, []);

  const handleSave = async () => {
    if (!recommendation) return toast.error('Please select a hiring recommendation before saving');
    if (totalRated < CATEGORIES.length) return toast.error(`Please rate all ${CATEGORIES.length} categories`);

    setIsSaving(true);
    try {
      if (onSave) await onSave({ candidateId, ratings, notes, recommendation, overallNotes, overallScore, savedAt: new Date().toISOString() });
      setSaved(true);
      toast.success('Scorecard saved successfully!');
    } catch {
      toast.error('Failed to save scorecard');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRatings(CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: 0 }), {}));
    setNotes(CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: '' }), {}));
    setRec(''); setOverallNotes(''); setSaved(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="rounded-xl p-6 flex items-center justify-between bg-surface border border-border-default shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-content flex items-center gap-2">📋 Interview Scorecard</h3>
          <p className="text-sm text-content-muted mt-1">Evaluating: <span className="font-semibold text-content">{candidateName}</span></p>
        </div>
        <div className="text-center px-6 py-2 bg-page rounded-lg border border-border-subtle">
          <p className={`text-3xl font-black ${totalRated > 0 ? scoreColor : 'text-content-muted'}`}>
            {totalRated > 0 ? overallScore : '—'}
            <span className="text-base font-bold text-content-muted">/100</span>
          </p>
          {totalRated > 0 && <p className={`text-xs mt-1 font-bold ${scoreColor}`}>{scoreLabel}</p>}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isRated = ratings[cat.key] > 0;
          return (
            <div key={cat.key} className={`rounded-xl p-5 border transition-all duration-200 ${isRated ? 'bg-surface border-blue-100 shadow-sm' : 'bg-page border-border-default'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.bg} ${cat.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-content">{cat.label}</p>
                    <p className="text-xs text-content-muted mt-0.5">{cat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating value={ratings[cat.key]} onChange={(v) => setRating(cat.key, v)} readOnly={readOnly} />
                  {isRated && <span className={`text-sm font-bold w-6 text-center ${cat.color}`}>{ratings[cat.key]}/5</span>}
                </div>
              </div>

              {!readOnly ? (
                <textarea
                  value={notes[cat.key]}
                  onChange={(e) => setNote(cat.key, e.target.value)}
                  placeholder={`Notes on ${cat.label.toLowerCase()}...`}
                  rows={2}
                  className="w-full text-sm rounded-lg px-4 py-2 border border-border-default bg-surface focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              ) : notes[cat.key] ? (
                <p className="text-sm mt-2 text-content-secondary italic bg-page p-3 rounded-lg border border-border-subtle">"{notes[cat.key]}"</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Overall Notes */}
      {!readOnly && (
        <div className="rounded-xl p-6 bg-surface border border-border-default shadow-sm">
          <label className="block text-sm font-bold text-content mb-3">📝 Overall Interview Notes</label>
          <textarea
            value={overallNotes}
            onChange={(e) => { setOverallNotes(e.target.value); setSaved(false); }}
            placeholder="Summary of the interview — key impressions, standout moments, concerns..."
            rows={4}
            className="w-full text-sm rounded-lg px-4 py-3 border border-border-default focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
        </div>
      )}

      {/* Recommendation */}
      <div className="rounded-xl p-6 bg-surface border border-border-default shadow-sm">
        <p className="text-sm font-bold text-content mb-4">🎯 Hiring Recommendation</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RECOMMENDATIONS.map(rec => (
            <button
              key={rec.value}
              type="button"
              disabled={readOnly}
              onClick={() => { if (!readOnly) { setRec(rec.value); setSaved(false); } }}
              className={`p-4 rounded-xl border text-sm font-bold transition-all duration-200 disabled:opacity-70 disabled:cursor-default ${
                recommendation === rec.value ? rec.active : `bg-surface text-content-secondary border-border-default hover:bg-page`
              }`}
            >
              {rec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border-default">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-content-secondary bg-surface border border-border-default hover:bg-page transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-sm flex items-center gap-2 ${
              saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-70'
            }`}
          >
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : saved ? (
              '✓ Saved'
            ) : (
              'Save Scorecard'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewScorecard;
