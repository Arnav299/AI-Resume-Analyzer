import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { careerAPI, resumeAPI, jobsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useResume } from '../context/ResumeContext';

// ── Role emoji mapping by name keywords ────────────────────────────────────
const ROLE_ICONS = {
  'full stack':    '💻',
  'frontend':      '🎨',
  'backend':       '⚙️',
  'data scientist':'🧪',
  'data analyst':  '📊',
  'ai/ml':         '🤖',
  'ai engineer':   '🧠',
  'devops':        '🔄',
  'cloud':         '☁️',
  'mobile':        '📱',
  'software':      '🖥️',
  'data engineer': '🔧',
};

const getRoleIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🎯';
};

// ── Progress overlay shown while running analysis ──────────────────────────
const AnalysisProgress = ({ roles, current }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-surface rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
      <h2 className="text-xl font-bold text-content mb-6 text-center">🔍 Analysing Resume…</h2>
      <div className="space-y-3">
        {roles.map((role, i) => {
          const done    = i < current;
          const running = i === current;
          return (
            <div key={role.id || role} className="flex items-center gap-3">
              <span className="text-lg w-7">
                {done ? '✅' : running ? '⏳' : '⬜'}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${running ? 'text-blue-600' : done ? 'text-green-600' : 'text-content-muted'}`}>
                  {role.role_name || role}
                </p>
                {running && (
                  <div className="mt-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const SKILLS_KEY = 'rocas_role_skills';

const loadSkillOverrides = () => {
  try {
    const raw = localStorage.getItem(SKILLS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveSkillOverrides = (overrides) => {
  localStorage.setItem(SKILLS_KEY, JSON.stringify(overrides));
};

const RoleSelection = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { resumeId: globalResumeId, setCurrentResume } = useResume();
  const resumeId  = location.state?.resumeId || globalResumeId;

  const [dbRoles,          setDbRoles]          = useState([]);
  const [customRoles,      setCustomRoles]      = useState([]);
  const [selectedIds,      setSelectedIds]      = useState(new Set());
  const [customInput,      setCustomInput]      = useState('');
  const [loadingRoles,     setLoadingRoles]     = useState(true);
  const [analyzing,        setAnalyzing]        = useState(false);
  const [analysisCurrent,  setAnalysisCurrent]  = useState(0);

  // Per-role skill overrides stored in localStorage
  const [skillOverrides,   setSkillOverrides]   = useState(loadSkillOverrides);

  // UI state for skill management panels
  // editingRoleId: role whose Edit panel is open
  // addingRoleId: role whose Add Skills panel is open
  const [editingRoleId,    setEditingRoleId]    = useState(null);
  const [addingRoleId,     setAddingRoleId]     = useState(null);
  // draft edits: { [skill]: editedValue }
  const [editDraft,        setEditDraft]        = useState({});
  // new skill input per role
  const [newSkillInput,    setNewSkillInput]    = useState('');

  // Fetch real roles from backend on mount
  useEffect(() => {
    careerAPI.getRoles()
      .then(res => setDbRoles(res.data || []))
      .catch(() => toast.error('Could not load career roles.'))
      .finally(() => setLoadingRoles(false));
  }, []);

  const allRoles = [
    ...dbRoles,
    ...customRoles.map(r => ({ id: `custom::${r}`, role_name: r, _isCustom: true })),
  ];

  // ── Skill helpers ────────────────────────────────────────────────────────
  const getSkills = (role) => {
    const overrides = skillOverrides[role.id];
    if (overrides && overrides.length > 0) return overrides;
    // fall back to backend required_skills if present
    return role.required_skills || [];
  };

  const persistSkills = (roleId, skills) => {
    const next = { ...skillOverrides, [roleId]: skills };
    setSkillOverrides(next);
    saveSkillOverrides(next);
  };

  // Open edit panel for a role
  const openEdit = (role, e) => {
    e.stopPropagation();
    const skills = getSkills(role);
    const draft = {};
    skills.forEach(s => { draft[s] = s; });
    setEditDraft(draft);
    setEditingRoleId(role.id);
    setAddingRoleId(null);
  };

  // Save edited skills
  const saveEdit = (role, e) => {
    e.stopPropagation();
    const updated = Object.values(editDraft).map(s => s.trim()).filter(Boolean);
    persistSkills(role.id, updated);
    setEditingRoleId(null);
    setEditDraft({});
  };

  // Cancel edit
  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingRoleId(null);
    setEditDraft({});
  };

  // Remove a skill in edit mode
  const removeSkillInEdit = (original, e) => {
    e.stopPropagation();
    const next = { ...editDraft };
    delete next[original];
    setEditDraft(next);
  };

  // Open add-skills panel
  const openAdd = (role, e) => {
    e.stopPropagation();
    setAddingRoleId(role.id);
    setEditingRoleId(null);
    setNewSkillInput('');
  };

  // Add one or more skills (comma or Enter)
  const addSkill = (role, e) => {
    e.stopPropagation();
    const parts = newSkillInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const existing = getSkills(role);
    const merged = [...existing, ...parts.filter(p => !existing.includes(p))];
    persistSkills(role.id, merged);
    setNewSkillInput('');
    setAddingRoleId(null);
  };

  const toggleRole = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const name = customInput.trim();
    if (!name) return;
    const alreadyExists =
      dbRoles.some(r => r.role_name.toLowerCase() === name.toLowerCase()) ||
      customRoles.some(r => r.toLowerCase() === name.toLowerCase());
    if (!alreadyExists) {
      setCustomRoles(prev => [...prev, name]);
    }
    // Auto-select the new custom role
    setSelectedIds(prev => new Set([...prev, `custom::${name}`]));
    setCustomInput('');
  };

  const handleAnalyze = async () => {
    if (selectedIds.size === 0) return;
    if (!resumeId) {
      toast.error('No resume found. Please upload your resume first.');
      navigate('/upload');
      return;
    }

    const selectedRoles = allRoles.filter(r => selectedIds.has(r.id));
    console.log('[RoleSelection] Starting analysis for roles:', selectedRoles.map(r => r.role_name));
    setAnalyzing(true);
    setAnalysisCurrent(0);

    const apiKey = localStorage.getItem('gemini_api_key') || '';
    const results = [];

    for (let i = 0; i < selectedRoles.length; i++) {
      const role = selectedRoles[i];
      setAnalysisCurrent(i);

      const requestPayload = {
        target_role_id: role.id,
        gemini_api_key: apiKey.trim() || null,
      };
      console.log(`[RoleSelection] Request payload for role "${role.role_name}":`, requestPayload);

      try {
        const res = await resumeAPI.analyze(resumeId, requestPayload);
        const jobId = res.data.job_id;
        
        let jobStatus = res.data.status;
        let finalResult = null;
        
        while (jobStatus === 'Pending' || jobStatus === 'Processing') {
          await new Promise(r => setTimeout(r, 2000));
          const statusRes = await jobsAPI.getStatus(jobId);
          jobStatus = statusRes.data.status;
          
          if (jobStatus === 'Completed') {
            finalResult = statusRes.data.result;
          } else if (jobStatus === 'Failed') {
            throw new Error(statusRes.data.result?.error || 'Analysis failed');
          }
        }

        console.log(`[RoleSelection] Final API response for role "${role.role_name}":`, finalResult);
        results.push({ ...finalResult, role_name: role.role_name });
      } catch (err) {
        console.error(`[RoleSelection] API error for role "${role.role_name}":`, err);
        const raw = err?.response?.data?.detail;
        const msg = Array.isArray(raw)
          ? raw.map(e => e.msg || JSON.stringify(e)).join('; ')
          : (typeof raw === 'string' ? raw : `Analysis failed for ${role.role_name}`);
        toast.error(msg);
        results.push({
          isError: true,
          role_name: role.role_name,
          error: msg,
        });
      }
    }

    console.log('[RoleSelection] Final results state to navigate with:', results);
    setAnalyzing(false);
    // Persist so AIRecommendations can read the data without needing router state
    localStorage.setItem('rocas_last_analysis', JSON.stringify(results));
    // Fetch resume name to persist in sidebar
    try {
      const resumesRes = await resumeAPI.getAll();
      const resumes = resumesRes?.data ?? resumesRes ?? [];
      const found = resumes.find(r => r.id === resumeId);
      if (found) {
        setCurrentResume(resumeId, found.original_filename || found.filename || `Resume_${resumeId.slice(0,8)}.pdf`);
      }
    } catch (_) { /* best-effort */ }
    navigate('/analysis', { state: { results, resumeId } });
  };

  const selectedRolesList = allRoles.filter(r => selectedIds.has(r.id));

  return (
    <div className="flex min-h-screen bg-page">
      {analyzing && (
        <AnalysisProgress roles={selectedRolesList} current={analysisCurrent} />
      )}

      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-textDark">Select Career Roles</h1>
                <p className="text-content-muted mt-1">Choose your target roles to get a personalised skill-gap analysis</p>
              </div>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="py-3 px-8 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  🔍 Analyse {selectedIds.size} Role{selectedIds.size > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {/* Selected chips */}
            {selectedIds.size > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-primary/20 rounded-xl flex flex-wrap items-center gap-2 animate-fade-in">
                <span className="text-primary font-semibold mr-1">🎯 Selected:</span>
                {selectedRolesList.map(r => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1 bg-surface border border-primary/30 text-primary text-sm font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-red-50"
                    onClick={() => toggleRole(r.id)}
                  >
                    {r.role_name} <span className="text-xs">✕</span>
                  </span>
                ))}
              </div>
            )}

            {/* Custom role input */}
            <div className="mb-8 p-6 bg-surface border border-border-subtle shadow-sm rounded-xl">
              <h3 className="font-semibold text-textDark mb-3">Can't find your role? Add a custom one:</h3>
              <form onSubmit={handleAddCustom} className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. Product Manager, UI/UX Designer…"
                  className="flex-1 border border-border-default rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-semibold text-primary border border-primary hover:bg-primary hover:text-white transition-all text-sm"
                >
                  ➕ Add Role
                </button>
              </form>
            </div>

            {/* Role grid */}
            {loadingRoles ? (
              <div className="text-center py-16 text-content-muted">
                <div className="text-4xl mb-3 animate-spin inline-block">⏳</div>
                <p>Loading career roles…</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {allRoles.map(role => {
                  const isSelected    = selectedIds.has(role.id);
                  const icon          = getRoleIcon(role.role_name);
                  const skills        = getSkills(role);
                  const isEditing     = editingRoleId === role.id;
                  const isAdding      = addingRoleId  === role.id;

                  return (
                    <div
                      key={role.id}
                      className={`text-left p-5 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-primary/20'
                          : 'border-border-subtle bg-surface hover:border-primary/30'
                      }`}
                    >
                      {/* Top row — select toggle */}
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleRole(role.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{icon}</span>
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                            isSelected ? 'bg-primary border-primary text-white' : 'border-border-default'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                        <h3 className={`font-bold text-base mb-1 ${isSelected ? 'text-primary' : 'text-textDark'}`}>
                          {role.role_name}
                        </h3>
                        {role._isCustom && (
                          <p className="text-xs text-orange-500 font-medium">✨ Custom role</p>
                        )}
                      </div>

                      {/* Skill list */}
                      {skills.length > 0 && !isEditing && !isAdding && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {skills.map(s => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">{s}</span>
                          ))}
                        </div>
                      )}

                      {/* ── Edit panel ── */}
                      {isEditing && (
                        <div className="mt-3 space-y-1.5" onClick={e => e.stopPropagation()}>
                          {Object.entries(editDraft).map(([original, current]) => (
                            <div key={original} className="flex items-center gap-1.5">
                              <input
                                className="flex-1 text-xs border border-border-default rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                value={current}
                                onChange={e => setEditDraft(d => ({ ...d, [original]: e.target.value }))}
                              />
                              <button
                                className="text-xs text-error hover:bg-red-50 rounded px-1.5 py-1 transition-colors"
                                onClick={e => removeSkillInEdit(original, e)}
                                title="Remove skill"
                              >🗑</button>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <button
                              className="text-xs font-semibold text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors"
                              onClick={e => saveEdit(role, e)}
                            >Save</button>
                            <button
                              className="text-xs font-semibold text-content-muted border border-border-default rounded-lg px-3 py-1.5 hover:bg-surface-hover transition-colors"
                              onClick={cancelEdit}
                            >Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* ── Add More Skills panel ── */}
                      {isAdding && (
                        <div className="mt-3" onClick={e => e.stopPropagation()}>
                          <p className="text-xs text-content-muted mb-1.5">Add skills (comma-separated or one at a time):</p>
                          <div className="flex gap-1.5">
                            <input
                              className="flex-1 text-xs border border-border-default rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40"
                              placeholder="e.g. TensorFlow, PyTorch"
                              value={newSkillInput}
                              onChange={e => setNewSkillInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') addSkill(role, e); }}
                              autoFocus
                            />
                            <button
                              className="text-xs font-semibold text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors"
                              onClick={e => addSkill(role, e)}
                            >Add</button>
                            <button
                              className="text-xs text-content-muted border border-border-default rounded-lg px-2 py-1.5 hover:bg-surface-hover transition-colors"
                              onClick={e => { e.stopPropagation(); setAddingRoleId(null); }}
                            >✕</button>
                          </div>
                        </div>
                      )}

                      {/* ── Action buttons ── */}
                      {!isEditing && !isAdding && (
                        <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            className="text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-1 hover:bg-primary/5 transition-colors"
                            onClick={e => openEdit(role, e)}
                          >✏️ Edit Skills</button>
                          <button
                            className="text-xs font-semibold text-emerald-700 border border-emerald-300 rounded-lg px-3 py-1 hover:bg-emerald-50 transition-colors"
                            onClick={e => openAdd(role, e)}
                          >➕ Add More Skills</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom CTA */}
            {selectedIds.size > 0 && (
              <div className="mt-10 text-center">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="py-3.5 px-14 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary shadow-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-base"
                >
                  🚀 Analyse My Resume for {selectedIds.size} Role{selectedIds.size > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoleSelection;
