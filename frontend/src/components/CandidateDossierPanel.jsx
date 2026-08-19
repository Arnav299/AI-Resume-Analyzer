import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  X, User, FileText, MapPin, GraduationCap, Briefcase, Award,
  CheckCircle, XCircle, Clock, ExternalLink, Star, TrendingUp
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const getScoreColor = (s) => {
  if (s >= 80) return '#10B981';
  if (s >= 60) return '#6C63FF';
  if (s >= 40) return '#F59E0B';
  return '#EF4444';
};

const SkillChip = ({ skill, type }) => {
  const styles = {
    matched:  { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.3)' },
    required: { bg: 'rgba(239,68,68,0.10)',  color: '#F87171', border: 'rgba(239,68,68,0.25)' },
    desired:  { bg: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: 'rgba(245,158,11,0.3)' },
  };
  const s = styles[type] || styles.matched;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {type === 'matched' ? '✓ ' : type === 'required' ? '✗ ' : '~ '}{skill}
    </span>
  );
};

const InfoBlock = ({ icon: Icon, label, value, accent = '#6C63FF' }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${accent}20` }}>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
        <p className="text-sm font-medium text-white truncate">{value}</p>
      </div>
    </div>
  );
};

// ── Main Panel Component ───────────────────────────────────────────────────────
/**
 * CandidateDossierPanel
 *
 * A right-side slide-over panel that shows candidate summary, skills match,
 * and a PDF/resume preview inline without navigating away from OrgDashboard.
 *
 * Props:
 *   candidate   – result object from bulk analysis (r from results[])
 *   onClose     – () => void
 *   requiredSkills  – string[]
 *   desiredSkills   – string[]
 *   isHRManager – bool (show extra columns)
 */
const CandidateDossierPanel = ({
  candidate,
  onClose,
  requiredSkills = [],
  desiredSkills = [],
  isHRManager = false,
}) => {
  const panelRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Trap focus inside panel
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  if (!candidate) return null;

  const score = candidate.overall ?? 0;
  const scoreColor = getScoreColor(score);

  const matchedSkills  = (candidate.matched  || []);
  const missingSkills  = (candidate.missing  || []);
  const desiredMatched = desiredSkills.filter(s => matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase()));
  const desiredMissing = desiredSkills.filter(s => !matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase()));

  const statusIcon = candidate.status === 'Shortlisted' ? '✅' : candidate.status === 'Rejected' ? '❌' : '⚡';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close panel"
      />

      {/* Slide-over Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="fixed right-0 top-0 z-[201] h-full w-full max-w-xl flex flex-col outline-none"
        style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #130D2E 60%, #0A1A2E 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
          animation: 'slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg text-white shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
              {(candidate.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-black text-white text-base leading-tight">{candidate.name || 'Candidate'}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Rank #{candidate.rank} · {statusIcon} {candidate.status}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/candidate/${candidate.id || candidate.rank}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
              style={{ background: 'rgba(108,99,255,0.2)', color: '#A5A0FF', border: '1px solid rgba(108,99,255,0.3)' }}>
              <ExternalLink size={12} /> Full Profile
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all hover:bg-surface/10"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* Score Hero */}
          <div className="px-6 py-5"
            style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Match Score', value: `${score}%`, color: scoreColor, icon: TrendingUp },
                { label: 'Skill Match', value: `${candidate.skillMatch ?? '—'}%`, color: '#00D4FF', icon: Star },
                { label: 'ATS Score', value: candidate.ats ?? '—', color: '#34D399', icon: Award },
                { label: 'Percentile', value: `${candidate.percentile ?? '—'}%`, color: '#A5A0FF', icon: CheckCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Icon size={14} style={{ color, margin: '0 auto 6px' }} />
                  <p className="text-base font-black" style={{ color }}>{value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Score bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Overall Match</span>
                <span className="text-xs font-bold" style={{ color: scoreColor }}>{score}/100</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)`, boxShadow: `0 0 10px ${scoreColor}60` }} />
              </div>
            </div>
          </div>

          {/* Info Blocks */}
          <div className="px-6 py-5 space-y-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Candidate Info
            </h3>
            <InfoBlock icon={Briefcase} label="Experience" value={candidate.experience} accent="#6C63FF" />
            <InfoBlock icon={MapPin}    label="Location"   value={candidate.location}   accent="#00D4FF" />
            <InfoBlock icon={GraduationCap} label="Education" value={candidate.education} accent="#34D399" />
            {isHRManager && (
              <>
                <InfoBlock icon={User} label="Email" value={candidate.email} accent="#F59E0B" />
                <InfoBlock icon={FileText} label="Salary Expectation" value={candidate.salary_band || 'Not specified'} accent="#A5A0FF" />
              </>
            )}
          </div>

          {/* ATS Score Breakdown */}
          {candidate.score_breakdown && (
            <div className="px-6 py-5 space-y-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Score Breakdown
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Required Skills', key: 'required_skills_score', weight: '35%', color: '#10B981' },
                  { label: 'Preferred Skills', key: 'preferred_skills_score', weight: '20%', color: '#34D399' },
                  { label: 'Experience', key: 'experience_score', weight: '15%', color: '#6C63FF' },
                  { label: 'Responsibility Match', key: 'responsibility_score', weight: '10%', color: '#F59E0B' },
                  { label: 'Education', key: 'education_score_pct', weight: '5%', color: '#A5A0FF' },
                  { label: 'Certifications', key: 'certification_score', weight: '5%', color: '#F87171' },
                  { label: 'Location', key: 'location_score', weight: '5%', color: '#00D4FF' },
                  { label: 'Semantic Match', key: 'semantic_score', weight: '5%', color: '#818CF8' },
                ].map(({ label, key, weight, color }) => {
                  const val = candidate.score_breakdown[key] ?? 0;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {label} <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>({weight})</span>
                        </span>
                        <span className="text-xs font-black" style={{ color }}>{val}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${val}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Debug Panel */}
          {candidate.debug_info && (
            <details className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest mb-2 select-none"
                style={{ color: 'rgba(255,255,255,0.3)', listStyle: 'none' }}>
                🔍 Debug Info (click to expand)
              </summary>
              <div className="mt-3 space-y-4">

                {/* JD Skills */}
                {candidate.debug_info.jd_skills?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      JD Skills ({candidate.debug_info.jd_skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.debug_info.jd_skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: 'rgba(108,99,255,0.15)', color: '#A5A0FF', border: '1px solid rgba(108,99,255,0.25)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted from Resume */}
                {candidate.debug_info.extracted_skills?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Extracted from Resume ({candidate.debug_info.extracted_skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.debug_info.extracted_skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Skills */}
                {candidate.debug_info.matched_skills?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Matched Skills ({candidate.debug_info.matched_skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.debug_info.matched_skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {candidate.debug_info.missing_skills?.length > 0 ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Missing Skills ({candidate.debug_info.missing_skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.debug_info.missing_skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                          ✗ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] font-semibold" style={{ color: '#10B981' }}>✅ No missing skills detected</p>
                )}

                {/* Raw Scores */}
                {candidate.debug_info.scores_raw && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Score Calculation
                    </p>
                    <div className="rounded-xl p-3 text-[11px] font-mono space-y-1"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
                      <div>Required Skills:  {candidate.debug_info.scores_raw.required_skills_score ?? '—'}% × 35% = {((candidate.debug_info.scores_raw.required_skills_score ?? 0) * 0.35).toFixed(2)}</div>
                      <div>Preferred Skills: {candidate.debug_info.scores_raw.preferred_skills_score ?? '—'}% × 20% = {((candidate.debug_info.scores_raw.preferred_skills_score ?? 0) * 0.20).toFixed(2)}</div>
                      <div>Experience:       {candidate.debug_info.scores_raw.experience_score ?? '—'}% × 15% = {((candidate.debug_info.scores_raw.experience_score ?? 0) * 0.15).toFixed(2)}</div>
                      <div>Responsibilities: {candidate.debug_info.scores_raw.responsibility_match_score ?? '—'}% × 10% = {((candidate.debug_info.scores_raw.responsibility_match_score ?? 0) * 0.10).toFixed(2)}</div>
                      <div>Education:        {candidate.debug_info.scores_raw.education_score ?? '—'}% × 5%  = {((candidate.debug_info.scores_raw.education_score ?? 0) * 0.05).toFixed(2)}</div>
                      <div>Certifications:   {candidate.debug_info.scores_raw.certification_score ?? '—'}% × 5%  = {((candidate.debug_info.scores_raw.certification_score ?? 0) * 0.05).toFixed(2)}</div>
                      <div>Location:         {candidate.debug_info.scores_raw.location_score ?? '—'}% × 5%  = {((candidate.debug_info.scores_raw.location_score ?? 0) * 0.05).toFixed(2)}</div>
                      <div>Semantic:         {candidate.debug_info.scores_raw.semantic_score ?? '—'}% × 5%  = {((candidate.debug_info.scores_raw.semantic_score ?? 0) * 0.05).toFixed(2)}</div>
                      <div className="border-t mt-1 pt-1" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#10B981', fontWeight: 'bold' }}>
                        Final ATS Score: {candidate.debug_info.scores_raw.final_ats_score ?? '—'}%
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </details>
          )}

          {/* Required Skills Match */}
          <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.length === 0 && matchedSkills.length === 0 && (
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No skills data</p>
              )}
              {matchedSkills.filter(s => requiredSkills.length === 0 || requiredSkills.map(r => r.toLowerCase()).includes(s.toLowerCase())).map(s => (
                <SkillChip key={s} skill={s} type="matched" />
              ))}
              {missingSkills.filter(s => requiredSkills.length === 0 || requiredSkills.map(r => r.toLowerCase()).includes(s.toLowerCase())).map(s => (
                <SkillChip key={s} skill={s} type="required" />
              ))}
              {matchedSkills.filter(s => requiredSkills.length > 0 && !requiredSkills.map(r => r.toLowerCase()).includes(s.toLowerCase()) && desiredSkills.length === 0).map(s => (
                <SkillChip key={s} skill={s} type="matched" />
              ))}
            </div>
          </div>

          {/* Desired Skills Match */}
          {(desiredSkills.length > 0) && (
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Desired Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {desiredMatched.map(s => <SkillChip key={s} skill={s} type="matched" />)}
                {desiredMissing.map(s => <SkillChip key={s} skill={s} type="desired" />)}
              </div>
            </div>
          )}

          {/* Selection Status */}
          <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Selection Decision
            </h3>
            <div className="flex items-center gap-3">
              {candidate.bucket === 'successful'
                ? <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <CheckCircle size={16} /> Successful
                  </div>
                : candidate.bucket === 'not_successful'
                ? <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <XCircle size={16} /> Not Successful
                  </div>
                : <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm" style={{ background: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <Clock size={16} /> Pending Review
                  </div>
              }
            </div>
          </div>

          {/* HR Manager Notes */}
          {isHRManager && (
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                🔒 HR Manager Notes
              </h3>
              <textarea
                className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:ring-2"
                rows={4}
                placeholder="Add internal notes for this candidate…"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          )}

          {/* Resume PDF Embed */}
          {candidate.resumeUrl && (
            <div className="px-6 py-5">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Resume Document
              </h3>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', height: '420px' }}>
                <iframe
                  src={candidate.resumeUrl}
                  title="Resume PDF"
                  className="w-full h-full bg-surface"
                />
              </div>
            </div>
          )}

          {/* Fallback if no resumeUrl */}
          {!candidate.resumeUrl && (
            <div className="px-6 py-5">
              <div className="rounded-xl flex flex-col items-center justify-center py-10 gap-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)' }}>
                <FileText size={32} style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Resume PDF not available</p>
                <Link
                  to={`/candidate/${candidate.id || candidate.rank}`}
                  className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background: 'rgba(108,99,255,0.2)', color: '#A5A0FF', border: '1px solid rgba(108,99,255,0.3)' }}>
                  Open Full Dossier →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 flex gap-3 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}>
          <Link
            to={`/candidate/${candidate.id || candidate.rank}`}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #5A52E0)', color: 'white' }}>
            Open Full Dossier
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-surface/10"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default CandidateDossierPanel;
