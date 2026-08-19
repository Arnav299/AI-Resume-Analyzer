import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import OrgSidebar from '../components/OrgSidebar';
import NotificationBell from '../components/NotificationBell';
import InterviewScorecard from '../components/InterviewScorecard';
import { pipelineAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Search, Plus, Filter, LayoutDashboard, UserCheck, CheckCircle,
  XCircle, RefreshCw, AlertTriangle, WifiOff, LogIn, Kanban, Star,
  ChevronDown
} from 'lucide-react';

// ── Stage Config ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: 'new',       label: 'New',       icon: LayoutDashboard, dot: 'bg-slate-400',   header: 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700',                     count: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'              },
  { id: 'screening', label: 'Screening', icon: Search,          dot: 'bg-blue-500',    header: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/70',                      count: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'               },
  { id: 'interview', label: 'Interview', icon: UserCheck,       dot: 'bg-purple-500',  header: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/70',              count: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400'        },
  { id: 'offer',     label: 'Offer',     icon: Star,            dot: 'bg-amber-500',   header: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/70',                  count: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'           },
  { id: 'hired',     label: 'Hired',     icon: CheckCircle,     dot: 'bg-emerald-500', header: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/70',          count: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'   },
  { id: 'rejected',  label: 'Rejected',  icon: XCircle,         dot: 'bg-red-400',     header: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/70',                         count: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'                  },
];

// Bucket columns — visually distinct
const BUCKET_STAGES = [
  {
    id: 'successful',
    label: '✅ Successful',
    icon: CheckCircle,
    dot: 'bg-emerald-500',
    header: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-900/70',
    count: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
    isBucket: true,
  },
  {
    id: 'not_successful',
    label: '❌ Not Successful',
    icon: XCircle,
    dot: 'bg-red-400',
    header: 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-900/70',
    count: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
    isBucket: true,
  },
];

const ALL_COLUMNS = [...STAGES, ...BUCKET_STAGES];

const AVATAR_GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-green-600',
  'from-orange-400 to-amber-600',
  'from-purple-400 to-violet-600',
  'from-pink-400 to-rose-600',
  'from-teal-400 to-cyan-600',
];

const getScoreBadge = (s) => {
  if (s >= 80) return { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', bar: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800' };
  if (s >= 60) return { text: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/30',       bar: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800'       };
  if (s >= 40) return { text: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/30',     bar: 'bg-amber-500',   border: 'border-amber-200 dark:border-amber-800'     };
  return        { text: 'text-red-700 dark:text-red-400',               bg: 'bg-red-50 dark:bg-red-900/30',         bar: 'bg-red-500',     border: 'border-red-200 dark:border-red-800'         };
};

// ── Candidate Card ────────────────────────────────────────────────────────────
const CandidateCard = ({ candidate, onDragStart, onOpenScorecard, isDragging }) => {
  const idx          = (candidate.name || '?').charCodeAt(0) % AVATAR_GRADIENTS.length;
  const displayScore = typeof candidate.score === 'number' ? candidate.score : 0;
  const score        = getScoreBadge(displayScore);
  const initials     = (candidate.name || '?').substring(0, 2).toUpperCase();

  return (
    <div
      draggable
      onDragStart={() => onDragStart(candidate)}
      className={`bg-white dark:bg-slate-800 rounded-2xl p-4 cursor-grab active:cursor-grabbing border transition-all duration-200 group select-none ${
        isDragging
          ? 'border-blue-400 opacity-50 rotate-2 scale-95 shadow-2xl'
          : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-700'
      }`}
    >
      {/* Avatar + Name row */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx]} flex items-center justify-center text-white text-sm font-black shadow-md flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/candidate/${candidate.id}`}
            onClick={e => e.stopPropagation()}
            className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
            {candidate.name || 'Unknown'}
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{candidate.role || candidate.filename || '—'}</p>
        </div>
      </div>

      {/* Score Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Match Score</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${score.text} ${score.bg} ${score.border}`}>
            {displayScore}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${score.bar}`}
            style={{ width: `${Math.min(100, displayScore)}%` }}
          />
        </div>
      </div>

      {/* Quick actions - visible on hover */}
      <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <Link
          to={`/candidate/${candidate.id}`}
          onClick={e => e.stopPropagation()}
          className="text-center py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors">
          View Profile
        </Link>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenScorecard(candidate); }}
          className="text-center py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
          Scorecard
        </button>
      </div>
    </div>
  );
};

// ── Kanban Column ─────────────────────────────────────────────────────────────
const KanbanColumn = ({ stage, candidates, draggingId, onDragStart, onDrop, onDragOver, onOpenScorecard, isDragOver, isCollapsed, onToggleCollapse }) => (
  <div
    className={`flex flex-col shrink-0 rounded-2xl transition-all duration-200 border ${
      isCollapsed ? 'w-14' : 'min-w-[290px] w-[290px]'
    } ${isDragOver ? 'border-dashed border-blue-400 bg-blue-50/60 dark:bg-blue-900/20 scale-[1.01]' : 'border-transparent bg-slate-100/60 dark:bg-slate-800/30'}`}
    onDragOver={onDragOver}
    onDrop={onDrop}
  >
    {/* Column Header */}
    <div className={`flex items-center justify-between px-3 py-3.5 rounded-t-xl border-b ${stage.header} ${isCollapsed ? 'flex-col gap-2 px-2' : ''}`}>
      {isCollapsed ? (
        <>
          <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 [writing-mode:vertical-lr] rotate-180">{stage.label}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${stage.count}`}>{candidates.length}</span>
          <button onClick={onToggleCollapse} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Expand">
            <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${stage.dot} shadow-sm`} />
            <stage.icon size={15} className="text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{stage.label}</span>
            {stage.isBucket && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                Bucket
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stage.count}`}>{candidates.length}</span>
            <button onClick={onToggleCollapse} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Collapse">
              <ChevronDown size={13} style={{ transform: 'rotate(90deg)' }} />
            </button>
          </div>
        </>
      )}
    </div>

    {/* Cards */}
    {!isCollapsed && (
      <div className="p-3 flex flex-col gap-3 flex-1 min-h-[200px] overflow-y-auto">
        {candidates.map(c => (
          <CandidateCard
            key={c.id}
            candidate={c}
            onDragStart={onDragStart}
            onOpenScorecard={onOpenScorecard}
            isDragging={draggingId === c.id}
          />
        ))}
        {candidates.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 min-h-[140px] gap-2">
            <Plus size={22} className="opacity-40" />
            <span className="text-xs font-semibold">Drop here</span>
          </div>
        )}
      </div>
    )}
  </div>
);

// ── Backend Error Banner ──────────────────────────────────────────────────────
const BackendBanner = ({ errorMsg, onRetry, isRetrying }) => (
  <div className="mx-8 mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 shadow-sm">
    <WifiOff size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Pipeline API unreachable</p>
      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{errorMsg}</p>
    </div>
    <button
      onClick={onRetry}
      disabled={isRetrying}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shrink-0 disabled:opacity-60">
      <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
      {isRetrying ? 'Retrying…' : 'Retry'}
    </button>
  </div>
);

// ── KanbanBoard ───────────────────────────────────────────────────────────────
const KanbanBoard = () => {
  const navigate    = useNavigate();
  const location    = useLocation();

  // Parse URL params: ?stage=screening  or  ?bucket=successful
  const urlParams   = new URLSearchParams(location.search);
  const urlStage    = urlParams.get('stage');
  const urlBucket   = urlParams.get('bucket');

  const [candidates, setCandidates]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [connError, setConnError]           = useState(null);
  const [isRetrying, setIsRetrying]         = useState(false);
  const [draggingCandidate, setDragging]    = useState(null);
  const [dragOverStage, setDragOverStage]   = useState(null);
  const [scorecardOpen, setScorecardOpen]   = useState(null);
  const [search, setSearch]                 = useState('');
  const [filterRole, setFilterRole]         = useState('all');
  const [noSession, setNoSession]           = useState(false);

  // Collapsed columns state (column id → bool)
  const [collapsed, setCollapsed]           = useState({});

  // Focus view: if url has ?stage= or ?bucket=, collapse everything else
  useEffect(() => {
    if (urlStage || urlBucket) {
      const focusId = urlStage || urlBucket;
      const init = {};
      ALL_COLUMNS.forEach(c => { init[c.id] = c.id !== focusId; });
      setCollapsed(init);
    }
  }, [urlStage, urlBucket]);

  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Load candidates ──────────────────────────────────────────────────────────
  const loadCandidates = useCallback(async (isRetry = false) => {
    const token = localStorage.getItem('rocas_token');
    if (!token) { setNoSession(true); setLoading(false); return; }

    if (isRetry) setIsRetrying(true);
    else setLoading(true);
    setConnError(null); setNoSession(false);

    try {
      const res = await pipelineAPI.getCandidates();
      const data = res?.data ?? res;
      if (Array.isArray(data)) {
        setCandidates(data);
      } else {
        console.warn('[KanbanBoard] Unexpected pipeline response shape:', data);
        setCandidates([]);
      }
    } catch (err) {
      console.error('[KanbanBoard] Failed to load pipeline candidates:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('rocas_token'); localStorage.removeItem('rocas_user');
        toast.error('Session expired. Please log in again.');
        navigate('/org-login'); return;
      }
      let msg;
      if (status === 404) msg = 'Pipeline endpoint not found (404). Ensure the backend is running on port 8000.';
      else if (status === 502 || status === 503 || status === 504 || !err.response) msg = 'Backend server is offline. Start FastAPI on port 8000 and click Retry.';
      else msg = `Server error ${status ?? 'unknown'}. Check backend logs and click Retry.`;
      setConnError(msg); setCandidates([]);
    } finally {
      setLoading(false); setIsRetrying(false);
    }
  }, [navigate]);

  useEffect(() => { loadCandidates(false); }, [loadCandidates]);

  // Auto-refresh when bulk analysis completes in OrgDashboard (any tab)
  useEffect(() => {
    const onStorageChange = (e) => {
      if (e.key === 'rocas_analysis_done') loadCandidates(false);
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, [loadCandidates]);

  // ── Drag & Drop ──────────────────────────────────────────────────────────────
  const handleDragStart  = useCallback((candidate) => setDragging(candidate), []);
  const handleDragOver   = useCallback((e, stageId) => { e.preventDefault(); setDragOverStage(stageId); }, []);
  const handleDragEnd    = useCallback(() => { setDragging(null); setDragOverStage(null); }, []);

  const handleDrop = useCallback(async (stageId) => {
    if (!draggingCandidate || draggingCandidate.stage === stageId) {
      setDragging(null); setDragOverStage(null); return;
    }
    setCandidates(prev => prev.map(c => c.id === draggingCandidate.id ? { ...c, stage: stageId } : c));
    const stageLabel = ALL_COLUMNS.find(s => s.id === stageId)?.label ?? stageId;
    toast.success(`${draggingCandidate.name} moved to ${stageLabel}`);
    try {
      await pipelineAPI.moveCandidate(draggingCandidate.id, stageId);
    } catch (err) {
      setCandidates(prev => prev.map(c => c.id === draggingCandidate.id ? { ...c, stage: draggingCandidate.stage } : c));
      const status = err.response?.status;
      if (status === 401 || status === 403) toast.error('Session expired — please log in again to save stage changes.');
      else toast.error('Stage update failed — change reverted. Check backend connection.');
      console.error('[KanbanBoard] moveCandidate failed:', err);
    }
    setDragging(null); setDragOverStage(null);
  }, [draggingCandidate]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const uniqueRoles = [...new Set(candidates.map(c => c.role).filter(Boolean))];
  const filtered    = candidates.filter(c =>
    (c.name ?? '').toLowerCase().includes(search.toLowerCase()) &&
    (filterRole === 'all' || c.role === filterRole)
  );

  // Bucket assignment: candidates with bucket field go to bucket columns
  const grouped = ALL_COLUMNS.reduce((acc, s) => {
    if (s.isBucket) {
      acc[s.id] = filtered.filter(c => c.bucket === s.id);
    } else {
      acc[s.id] = filtered.filter(c => c.stage === s.id && !c.bucket);
    }
    return acc;
  }, {});

  const stats = {
    total:          candidates.length,
    active:         candidates.filter(c => !['hired', 'rejected', 'successful', 'not_successful'].includes(c.stage || c.bucket)).length,
    hired:          candidates.filter(c => c.stage === 'hired').length,
    rejected:       candidates.filter(c => c.stage === 'rejected').length,
    successful:     candidates.filter(c => c.bucket === 'successful').length,
    notSuccessful:  candidates.filter(c => c.bucket === 'not_successful').length,
  };

  // Compute current view label
  const viewLabel = urlStage
    ? STAGES.find(s => s.id === urlStage)?.label ?? 'Screening'
    : urlBucket
    ? BUCKET_STAGES.find(s => s.id === urlBucket)?.label ?? 'Bucket View'
    : 'All Stages';

  return (
    <div className="flex min-h-screen font-sans bg-slate-100 dark:bg-slate-950" onDragEnd={handleDragEnd}>
      <div className="hidden md:block"><OrgSidebar /></div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-700/60 px-8 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-1">
              <span>Portal</span><span>›</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Pipeline Board</span>
              {(urlStage || urlBucket) && (
                <>
                  <span>›</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{viewLabel}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recruitment Pipeline</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {(urlStage || urlBucket) ? `Focused view: ${viewLabel}` : 'Drag & drop candidates across hiring stages'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Show All Stages button when in focused view */}
            {(urlStage || urlBucket) && (
              <button
                onClick={() => { navigate('/kanban'); setCollapsed({}); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all border border-blue-200 dark:border-blue-900/60">
                <Kanban size={14} /> All Stages
              </button>
            )}
            <button
              onClick={() => loadCandidates(true)}
              disabled={loading || isRetrying}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-60">
              <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
              {isRetrying ? 'Refreshing…' : 'Refresh'}
            </button>
            <NotificationBell notifications={[]} />
            <Link
              to="/upload-wizard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/25">
              <Plus size={15} /> Add Candidates
            </Link>
          </div>
        </header>

        {/* Backend error banner */}
        {connError && !loading && (
          <BackendBanner errorMsg={connError} onRetry={() => loadCandidates(true)} isRetrying={isRetrying} />
        )}

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-700/60 px-8 py-3 flex items-center justify-between shrink-0">
          {/* Stats Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Total',          val: stats.total,         cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
              { label: 'Active',         val: stats.active,        cls: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400' },
              { label: 'Hired',          val: stats.hired,         cls: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' },
              { label: 'Rejected',       val: stats.rejected,      cls: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400' },
              { label: '✅ Successful',  val: stats.successful,    cls: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-black' },
              { label: '❌ Not Selected',val: stats.notSuccessful, cls: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 font-black' },
            ].map(({ label, val, cls }) => (
              <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cls}`}>
                {label}: <span className="text-sm font-black">{val}</span>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search candidates…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-750 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <Filter size={14} className="text-slate-400 dark:text-slate-500" />
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="text-xs font-semibold bg-transparent outline-none text-slate-700 dark:text-slate-300 cursor-pointer max-w-[140px]">
                <option value="all">All Roles</option>
                {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Board */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading pipeline candidates…</p>
            </div>
          ) : noSession ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
                <LogIn size={32} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100">Login Required</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Sign in with a recruiter account to access the pipeline.</p>
              </div>
              <Link
                to="/org-login"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/25 hover:-translate-y-0.5 transition-all">
                <LogIn size={16} /> Sign In to Portal
              </Link>
            </div>
          ) : connError && candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/25">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100">Pipeline unavailable</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Start the FastAPI backend on port 8000, then click Retry.</p>
              </div>
              <button
                onClick={() => loadCandidates(true)}
                disabled={isRetrying}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                <RefreshCw size={15} className={isRetrying ? 'animate-spin' : ''} />
                {isRetrying ? 'Connecting…' : 'Retry Connection'}
              </button>
            </div>
          ) : (
            <div className="flex h-full gap-5 px-2 min-w-max">
              {/* Regular pipeline stages */}
              {STAGES.map(stage => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  candidates={grouped[stage.id] || []}
                  draggingId={draggingCandidate?.id}
                  onDragStart={handleDragStart}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDrop={() => handleDrop(stage.id)}
                  onOpenScorecard={setScorecardOpen}
                  isDragOver={dragOverStage === stage.id}
                  isCollapsed={!!collapsed[stage.id]}
                  onToggleCollapse={() => toggleCollapse(stage.id)}
                />
              ))}

              {/* Divider */}
              <div className="flex flex-col items-center justify-center shrink-0 mx-2">
                <div className="h-full w-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 my-2 rotate-90 whitespace-nowrap px-2">BUCKETS</span>
                <div className="h-full w-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Bucket columns — Successful / Not Successful */}
              {BUCKET_STAGES.map(stage => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  candidates={grouped[stage.id] || []}
                  draggingId={draggingCandidate?.id}
                  onDragStart={handleDragStart}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDrop={() => handleDrop(stage.id)}
                  onOpenScorecard={setScorecardOpen}
                  isDragOver={dragOverStage === stage.id}
                  isCollapsed={!!collapsed[stage.id]}
                  onToggleCollapse={() => toggleCollapse(stage.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Interview Scorecard Modal */}
      {scorecardOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setScorecardOpen(null)}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-transparent dark:border-slate-700"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Interview Scorecard</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{scorecardOpen.name} · {scorecardOpen.role}</p>
              </div>
              <button
                onClick={() => setScorecardOpen(null)}
                className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <XCircle size={22} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <InterviewScorecard
                candidateId={scorecardOpen.id}
                candidateName={scorecardOpen.name}
                onSave={async (data) => {
                  try {
                    await pipelineAPI.saveScorecard(data);
                    toast.success('Scorecard saved successfully.');
                  } catch (err) {
                    console.error('[KanbanBoard] saveScorecard failed:', err);
                    const status = err.response?.status;
                    if (status === 401 || status === 403) throw new Error('Session expired — please log in again to save the scorecard.');
                    throw new Error('Failed to save scorecard to backend. Check connection and retry.');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
