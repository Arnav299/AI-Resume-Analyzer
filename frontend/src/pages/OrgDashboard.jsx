import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrgSidebar from '../components/OrgSidebar';
import CandidateDossierPanel from '../components/CandidateDossierPanel';
import { toast } from 'react-hot-toast';
import { jdAPI, recruiterAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  Briefcase, FileText, CheckCircle, ShieldCheck, Trophy,
  Filter, ChevronDown, GripVertical, Users, XCircle,
  MapPin, GraduationCap, Award, Clock, Building2, Wifi, DollarSign, Info
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

const PREDEFINED_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "React Developer", "Java Developer", "Python Developer",
  "Data Analyst", "Data Scientist", "UI/UX Designer",
  "DevOps Engineer", "Mobile App Developer", "QA Engineer"
];

const PREDEFINED_SKILLS = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js",
  "Node.js", "Express.js", "Java", "Spring Boot", "Python", "Django",
  "Flask", "SQL", "MongoDB", "PostgreSQL", "Git", "GitHub", "Docker",
  "Kubernetes", "AWS", "Tailwind CSS", "Bootstrap", "REST API"
];

const EDUCATION_TIERS = [
  { value: 'any', label: 'Any Education' },
  { value: 'iit', label: '🎓 IIT / IIM / NIT' },
  { value: 'premier', label: '⭐ Premier Universities (Top 50)' },
  { value: 'graduate', label: 'Any Graduate' },
];

const EXP_BUCKETS = [
  { value: 'all', label: 'All Experience' },
  { value: '0-2', label: '0–2 Years' },
  { value: '2-5', label: '2–5 Years' },
  { value: '5-10', label: '5–10 Years' },
  { value: '10+', label: '10+ Years' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const matchesEducation = (edu, filter) => {
  if (filter === 'any' || !edu) return true;
  const lower = edu.toLowerCase();
  if (filter === 'iit') return lower.includes('iit') || lower.includes('iim') || lower.includes('nit');
  if (filter === 'premier') return lower.includes('iit') || lower.includes('iim') || lower.includes('nit') || lower.includes('bits');
  return true;
};

/**
 * Convert a JD experience_level string into [minYears, maxYears].
 * Handles formats like: "Mid-Level", "Senior", "2-5 years", "0-2", "10+"
 */
const parseExperienceLevel = (expLevel) => {
  if (!expLevel) return [0, 20];
  const s = expLevel.toLowerCase().trim();
  // Numeric range patterns: "2-5 years", "2-5", "0 - 2"
  const rangeMatch = s.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    return [parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10)];
  }
  // "10+" or "10+ years"
  const plusMatch = s.match(/(\d+)\+/);
  if (plusMatch) return [parseInt(plusMatch[1], 10), 20];
  // Semantic labels
  if (s.includes('entry') || s.includes('junior') || s.includes('fresher')) return [0, 2];
  if (s.includes('mid') || s.includes('intermediate')) return [2, 5];
  if (s.includes('senior') || s.includes('lead')) return [5, 10];
  if (s.includes('executive') || s.includes('director') || s.includes('principal')) return [10, 20];
  if (s.includes('associate')) return [0, 3];
  return [0, 20];
};

const matchesExpBucket = (exp, bucket) => {
  if (bucket === 'all' || !exp) return true;
  const num = parseFloat(exp);
  if (isNaN(num)) return true;
  if (bucket === '0-2') return num <= 2;
  if (bucket === '2-5') return num > 2 && num <= 5;
  if (bucket === '5-10') return num > 5 && num <= 10;
  if (bucket === '10+') return num > 10;
  return true;
};

const matchesLocation = (loc, query) => {
  if (!query.trim()) return true;
  return (loc || '').toLowerCase().includes(query.toLowerCase());
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const RankMedal = ({ rank }) => {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-content-muted bg-surface-hover">
      {rank}
    </span>
  );
};

const StatusChip = ({ status }) => {
  const styles = {
    Shortlisted: { bg: 'rgba(16,185,129,0.12)', color: '#059669', border: 'rgba(16,185,129,0.3)' },
    Borderline:  { bg: 'rgba(245,158,11,0.12)', color: '#B45309', border: 'rgba(245,158,11,0.3)' },
    Rejected:    { bg: 'rgba(239,68,68,0.10)',  color: '#DC2626', border: 'rgba(239,68,68,0.25)' },
  };
  const s = styles[status] || styles.Borderline;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status === 'Shortlisted' ? '✅' : status === 'Rejected' ? '❌' : '⚡'} {status}
    </span>
  );
};

const BucketChip = ({ bucket }) => {
  if (bucket === 'successful') return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
      style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
      <CheckCircle size={10} /> Successful
    </span>
  );
  if (bucket === 'not_successful') return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
      style={{ background: 'rgba(239,68,68,0.10)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}>
      <XCircle size={10} /> Not Successful
    </span>
  );
  return null;
};

// ── SkillsSection ──────────────────────────────────────────────────────────────
// Renders a skill chip group with Select All / Clear All and custom add input
const SkillsSection = ({ label, accent, selectedSkills, allSkills, onToggle, onSelectAll, onClearAll, customInput, onCustomChange, onAddCustom }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-2 mb-0 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: accent }} />
        {label}
      </label>
      <div className="flex gap-2">
        <button onClick={onSelectAll} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Select All</button>
        <button onClick={onClearAll}  className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">Clear All</button>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {allSkills.map(skill => (
        <button key={skill} onClick={() => onToggle(skill)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
            selectedSkills.includes(skill)
              ? `text-white shadow-lg border-transparent`
              : 'bg-page text-content-secondary border border-border-default hover:bg-surface-hover'
          }`}
          style={selectedSkills.includes(skill) ? { background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`, boxShadow: `0 0 10px ${accent}55` } : {}}>
          {skill}
        </button>
      ))}
    </div>
    <form onSubmit={onAddCustom} className="mt-3 flex gap-2">
      <input type="text" className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none flex-1 text-sm py-1.5 px-3"
        placeholder={`Add custom ${label.split(' ')[0].toLowerCase()} skill…`}
        value={customInput} onChange={e => onCustomChange(e.target.value)} />
      <button type="submit" className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:bg-surface/10" 
        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
        + Add
      </button>
    </form>
  </div>
);

// ── File & Folder Selection Zone ────────────────────────────────────────────────

const FileSelector = ({ files, onFiles, maxFiles }) => {
  const fileInputRef   = useRef(null);
  const folderInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleInput = (e) => {
    const selected = Array.from(e.target.files).filter(f =>
      f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.name.endsWith('.docx') || f.name.endsWith('.doc')
    );
    onFiles(prev => [...prev, ...selected].slice(0, maxFiles));
    if (e.target) e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.name.endsWith('.docx') || f.name.endsWith('.doc')
    );
    onFiles(prev => [...prev, ...dropped].slice(0, maxFiles));
  };

  const removeFile = (idx) => onFiles(prev => prev.filter((_, i) => i !== idx));

  return (
    <div>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`rounded-2xl p-5 text-center mb-3 transition-all cursor-pointer border-2 border-dashed ${
          dragOver 
            ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
            : 'border-border-default bg-surface hover:bg-surface-hover'
        }`}
      >
        <p className="text-2xl mb-1">📂</p>
        <p className="text-sm font-semibold text-content">Drag & Drop Resumes Here</p>
        <p className="text-xs text-content-muted mt-1">or choose below</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-3">
        <input ref={fileInputRef}   type="file" multiple accept=".pdf,.docx,.doc" onChange={handleInput} className="hidden" />
        <input ref={folderInputRef} type="file" webkitdirectory="true" directory="true" multiple onChange={handleInput} className="hidden" />

        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-5 border border-border-default bg-surface hover:bg-surface-hover rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm">
          <span className="text-3xl mb-1">📄</span>
          <span className="font-semibold text-content">Select Files</span>
          <span className="text-xs text-content-muted">Choose multiple resumes</span>
        </button>

        <button type="button" onClick={() => folderInputRef.current?.click()}
          className="flex-1 py-5 border border-border-default bg-surface hover:bg-surface-hover rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm">
          <span className="text-3xl mb-1">📁</span>
          <span className="font-semibold text-content">Select Folder</span>
          <span className="text-xs text-content-muted">Upload all resumes in a folder</span>
        </button>
      </div>

      <div className="flex justify-between items-center text-xs text-content-muted px-2">
        <span>Supported: PDF, DOC, DOCX</span>
        <span>Up to {maxFiles} files</span>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface/5 border border-white/10 shadow-sm transition-all hover:bg-surface/10">
              <div className="flex items-center gap-3">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-[300px]">{f.name}</p>
                  <p className="text-xs text-content-muted">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-content-muted hover:text-red-400 transition-colors text-xl font-bold px-2">&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Screening Drop Zone (in Step 3) ───────────────────────────────────────────
const ScreeningDropZone = ({ onDrop }) => {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onDrop(); }}
      className="rounded-2xl p-6 text-center transition-all duration-200"
      style={{
        border: over ? '2px dashed #3B82F6' : '2px dashed var(--theme-border-default)',
        background: over ? 'rgba(59,130,246,0.1)' : 'var(--theme-surface)',
        boxShadow: over ? '0 0 25px rgba(59,130,246,0.3)' : 'none',
      }}>
      <div className="text-3xl mb-2">{over ? '🎯' : '🔍'}</div>
      <p className="font-bold text-white text-sm">{over ? 'Release to Add to Screening' : 'Drop Candidates Here → Screening'}</p>
      <p className="text-xs mt-1 text-content-muted">
        Drag any candidate row here to move them to the Kanban Screening stage
      </p>
    </div>
  );
};

// ── Main OrgDashboard Component ───────────────────────────────────────────────

const OrgDashboard = () => {
  const { user } = useAuth();
  const isHRManager = user?.role === 'admin' || user?.role === 'hr_manager';

  const [step, setStep] = useState(1); // 1=config, 2=processing, 3=results
  const [selectedRoles, setSelectedRoles]   = useState([]);
  const [jobDesc, setJobDesc]               = useState('');
  const [numResumes, setNumResumes]         = useState(5);
  const [files, setFiles]                   = useState([]);

  // ── Required vs Desired skills
  const [requiredSkills, setRequiredSkills]   = useState([]);
  const [desiredSkills, setDesiredSkills]     = useState([]);
  const [customRequiredSkills, setCustomRequiredSkills] = useState([]);
  const [customDesiredSkills, setCustomDesiredSkills]   = useState([]);
  const [newRequiredInput, setNewRequiredInput] = useState('');
  const [newDesiredInput, setNewDesiredInput]   = useState('');

  // ── Filters (Step 1 config)
  const [minYears, setMinYears] = useState(0);
  const [maxYears, setMaxYears] = useState(20);
  const [locationFilter, setLocationFilter]   = useState('');
  const [educationFilter, setEducationFilter] = useState('any');

  // ── Results state
  const [progress, setProgress]             = useState({});
  const [results, setResults]               = useState([]);
  const [filterStatus, setFilterStatus]     = useState('all');
  const [searchQuery, setSearchQuery]       = useState('');
  const [expBucket, setExpBucket]           = useState('all');
  const [locSearch, setLocSearch]           = useState('');
  const [eduFilter, setEduFilter]           = useState('any');
  const [bucketFilter, setBucketFilter]     = useState('all'); // all | successful | not_successful
  const [topNValue, setTopNValue]           = useState(10);
  const [draggingResult, setDraggingResult] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null); // for dossier panel

  // ── Custom roles
  const [customRoles, setCustomRoles]       = useState([]);
  const [newRoleInput, setNewRoleInput]     = useState('');

  // ── JD Integration States
  const [jds, setJds]             = useState([]);
  const [jdsLoading, setJdsLoading] = useState(false);
  const [jdSource, setJdSource]   = useState('manual');
  const [selectedJdId, setSelectedJdId] = useState('');
  // Additional JD metadata fields populated on JD selection
  const [jdDepartment, setJdDepartment]       = useState('');
  const [jdEmploymentType, setJdEmploymentType] = useState('');
  const [jdWorkMode, setJdWorkMode]           = useState('');
  const [jdSalary, setJdSalary]               = useState('');
  const [jdCertifications, setJdCertifications] = useState([]);
  const [jdThresholds, setJdThresholds]       = useState({ ai: 70, selected: 90, waiting: 75 });
  const [jdLoadedObj, setJdLoadedObj]         = useState(null); // full JD object for display
  const [autoAnalysisPending, setAutoAnalysisPending] = useState(false);
  const [jdAnalyzing, setJdAnalyzing]               = useState(false);
  const [jdAnalyzed, setJdAnalyzed]                 = useState(false);
  const [numProjectsRequired, setNumProjectsRequired] = useState('');

  useEffect(() => {
    const fetchJds = async () => {
      setJdsLoading(true);
      try {
        const res = await jdAPI.getAll();
        setJds(res.data.filter(jd => jd.status !== 'Archived'));
      } catch (err) {
        console.error('Failed to fetch JDs', err);
      } finally {
        setJdsLoading(false);
      }
    };
    fetchJds();
  }, []);

  const clearJdMetaStates = () => {
    setJdDepartment('');
    setJdEmploymentType('');
    setJdWorkMode('');
    setJdSalary('');
    setJdCertifications([]);
    setJdThresholds({ ai: 70, selected: 90, waiting: 75 });
    setJdLoadedObj(null);
    setAutoAnalysisPending(false);
    setJdAnalyzed(false);
    setNumProjectsRequired('');
  };

  // ── JD Text Parser (client-side extraction) ────────────────────────────────
  const parseJdText = (text) => {
    const lower = text.toLowerCase();

    // ── Extract Roles ────────────────────────────────────────────────────
    const roleMatches = PREDEFINED_ROLES.filter(role =>
      lower.includes(role.toLowerCase())
    );

    // ── Extract Skills by section ─────────────────────────────────────────
    const extractedRequired = [];
    const extractedDesired  = [];
    const lines = text.split(/\n/).filter(l => l.trim());
    let section = 'required';

    lines.forEach(line => {
      const ll = line.toLowerCase();
      // Detect section headings
      if (/prefer|nice[- ]to[- ]have|good[- ]to[- ]have|\bbonus\b|\boptional\b/i.test(ll)) {
        section = 'desired';
      } else if (/requir|must[- ]have|mandatory|essential|necessary|critical/i.test(ll)) {
        section = 'required';
      }
      // Match against known skills
      const allKnown = [...PREDEFINED_SKILLS, ...customRequiredSkills, ...customDesiredSkills];
      allKnown.forEach(skill => {
        const re = new RegExp(`\\b${skill.replace(/[.+*?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i');
        if (re.test(ll)) {
          if (section === 'desired') {
            if (!extractedDesired.includes(skill)) extractedDesired.push(skill);
          } else {
            if (!extractedRequired.includes(skill)) extractedRequired.push(skill);
          }
        }
      });
    });

    // ── Extract Experience ────────────────────────────────────────────────
    let minYrsOut = 0, maxYrsOut = 20;
    const rangeMatch = text.match(/(\d+)\s*[-\u2013to]+\s*(\d+)\s*(?:years?|yrs?)/i);
    const plusMatch  = text.match(/(\d+)\+\s*(?:years?|yrs?)/i);
    const minMatch   = text.match(/(?:minimum|at\s+least|min\.?)\s+(\d+)\s*(?:years?|yrs?)/i);
    if (rangeMatch) {
      minYrsOut = Math.min(parseInt(rangeMatch[1]), 20);
      maxYrsOut = Math.min(parseInt(rangeMatch[2]), 20);
    } else if (minMatch) {
      minYrsOut = Math.min(parseInt(minMatch[1]), 20);
      maxYrsOut = 20;
    } else if (plusMatch) {
      minYrsOut = Math.min(parseInt(plusMatch[1]), 20);
      maxYrsOut = 20;
    }

    // ── Extract Location ─────────────────────────────────────────────────
    let locationOut = '';
    const locMatch = text.match(/location\s*[:\-\u2013]?\s*([^\n,;]{2,50})/i);
    if (locMatch) locationOut = locMatch[1].trim();

    // ── Extract Education ─────────────────────────────────────────────────
    let educationOut = 'any';
    if (/\biit\b|\biim\b|\bnit\b/i.test(text)) {
      educationOut = 'iit';
    } else if (/premier|top\s*\d+\s*(?:university|universities|institution)|bits\s+pilani/i.test(text)) {
      educationOut = 'premier';
    } else if (/\bb\.?\s*tech\b|\bb\.?\s*e\.?\b|\bgraduate\b|\bbachelor|\bdegree\b|\bb\.?\s*sc\b/i.test(text)) {
      educationOut = 'graduate';
    }

    // ── Extract Number of Projects ────────────────────────────────────────
    let numProjectsOut = 'Not Specified';
    const projPatterns = [
      text.match(/(?:minimum|at\s+least)\s+(\d+)\s+(?:live\s+)?projects?/i),
      text.match(/(\d+)\+\s*(?:live\s+)?projects?/i),
      text.match(/portfolio\s+(?:with\s+)?(\d+)\s+projects?/i),
      text.match(/(\d+)\s+(?:completed\s+|live\s+|personal\s+)?projects?/i),
    ];
    for (const m of projPatterns) {
      if (m) { numProjectsOut = m[1]; break; }
    }

    return { roles: roleMatches, requiredSkills: extractedRequired, desiredSkills: extractedDesired,
      minYears: minYrsOut, maxYears: maxYrsOut, education: educationOut, location: locationOut, numProjects: numProjectsOut };
  };

  // ── Analyze JD Button Handler ─────────────────────────────────────────────
  const handleAnalyzeJd = async () => {
    if (!jobDesc.trim()) return;
    setJdAnalyzing(true);
    // Small delay for perceived AI processing
    await new Promise(r => setTimeout(r, 700));
    try {
      const parsed = parseJdText(jobDesc);

      // Populate Roles
      if (parsed.roles.length > 0) {
        setSelectedRoles(parsed.roles);
      }

      // Populate Required Skills
      setCustomRequiredSkills(prev => {
        const updated = [...prev];
        parsed.requiredSkills.forEach(s => {
          if (!PREDEFINED_SKILLS.includes(s) && !updated.includes(s)) updated.push(s);
        });
        return updated;
      });
      if (parsed.requiredSkills.length > 0) setRequiredSkills(parsed.requiredSkills);

      // Populate Desired Skills
      setCustomDesiredSkills(prev => {
        const updated = [...prev];
        parsed.desiredSkills.forEach(s => {
          if (!PREDEFINED_SKILLS.includes(s) && !updated.includes(s)) updated.push(s);
        });
        return updated;
      });
      if (parsed.desiredSkills.length > 0) setDesiredSkills(parsed.desiredSkills);

      // Populate Filters
      setMinYears(parsed.minYears);
      setMaxYears(parsed.maxYears);
      if (parsed.location) setLocationFilter(parsed.location);
      setEducationFilter(parsed.education);
      setNumProjectsRequired(parsed.numProjects);

      setJdAnalyzed(true);
      const roleSummary   = parsed.roles.length > 0 ? `${parsed.roles.length} role${parsed.roles.length !== 1 ? 's' : ''}` : 'no roles';
      const reqSummary    = `${parsed.requiredSkills.length} required skill${parsed.requiredSkills.length !== 1 ? 's' : ''}`;
      const desSummary    = `${parsed.desiredSkills.length} desired skill${parsed.desiredSkills.length !== 1 ? 's' : ''}`;
      toast.success(`JD Analyzed! Extracted: ${roleSummary}, ${reqSummary}, ${desSummary}.`, { icon: '\uD83E\uDD16', duration: 4000 });
    } catch (err) {
      console.error('JD parse error', err);
      toast.error('Could not parse JD. Please fill the fields manually.');
    } finally {
      setJdAnalyzing(false);
    }
  };

  const handleSourceChange = (source) => {
    setJdSource(source);
    if (source === 'manual') {
      setSelectedJdId('');
      setSelectedRoles([]);
      setRequiredSkills([]);
      setDesiredSkills([]);
      setJobDesc('');
      setLocationFilter('');
      setEducationFilter('any');
      setMinYears(0);
      setMaxYears(20);
      clearJdMetaStates(); // also resets jdAnalyzed and numProjectsRequired
    } else {
      // Switching to existing JD mode: reset manual analysis state
      setJdAnalyzed(false);
      setNumProjectsRequired('');
    }
  };

  const handleJdSelect = (e) => {
    const id = e.target.value;
    setSelectedJdId(id);
    // Reset results when a new JD is selected
    setResults([]);
    setStep(1);
    setAutoAnalysisPending(false);

    const jd = jds.find(j => j.id === id);
    if (!jd) {
      clearJdMetaStates();
      return;
    }

    // ── 1. Job Role / Title ──────────────────────────────────────────────────
    const newRoles = [];
    if (jd.title) newRoles.push(jd.title);
    setCustomRoles(prev => {
      const updated = [...prev];
      newRoles.forEach(r => { if (!PREDEFINED_ROLES.includes(r) && !updated.includes(r)) updated.push(r); });
      return updated;
    });
    setSelectedRoles(newRoles);

    // ── 2. Required Skills ───────────────────────────────────────────────────
    const reqSkills = jd.skills || [];
    setCustomRequiredSkills(prev => {
      const updated = [...prev];
      reqSkills.forEach(s => { if (!PREDEFINED_SKILLS.includes(s) && !updated.includes(s)) updated.push(s); });
      return updated;
    });
    setRequiredSkills(reqSkills);

    // ── 3. Desired / Preferred Skills ────────────────────────────────────────
    const prefSkills = jd.preferred_skills || [];
    setCustomDesiredSkills(prev => {
      const updated = [...prev];
      prefSkills.forEach(s => { if (!PREDEFINED_SKILLS.includes(s) && !updated.includes(s)) updated.push(s); });
      return updated;
    });
    setDesiredSkills(prefSkills);

    // ── 4. Experience Level → Min/Max Years ──────────────────────────────────
    const [expMin, expMax] = parseExperienceLevel(jd.experience_level);
    setMinYears(expMin);
    setMaxYears(expMax);

    // ── 5. Location ──────────────────────────────────────────────────────────
    if (jd.location) setLocationFilter(jd.location);

    // ── 6. Education Criteria ─────────────────────────────────────────────────
    if (jd.education) {
      const eduLower = (jd.education || '').toLowerCase();
      if (eduLower.includes('iit') || eduLower.includes('iim') || eduLower.includes('nit')) {
        setEducationFilter('iit');
      } else if (eduLower.includes('top') || eduLower.includes('premier') || eduLower.includes('bits')) {
        setEducationFilter('premier');
      } else if (eduLower.includes('graduate') || eduLower.includes('bachelor') || eduLower.includes('degree')) {
        setEducationFilter('graduate');
      } else {
        setEducationFilter('any');
      }
    }

    // ── 7. Certifications ─────────────────────────────────────────────────────
    setJdCertifications(jd.certifications || []);

    // ── 8. JD Metadata (display-only) ────────────────────────────────────────
    setJdDepartment(jd.department || '');
    setJdEmploymentType(jd.employment_type || '');
    setJdWorkMode(jd.work_mode || '');
    setJdSalary(jd.salary || '');
    setJdThresholds({
      ai:       jd.ai_matching_threshold  ?? 70,
      selected: jd.selected_threshold     ?? 90,
      waiting:  jd.waiting_threshold      ?? 75,
    });

    // ── 9. Target selection count from JD thresholds ──────────────────────────
    // Keep topNValue user-controlled but reset to sensible default
    setTopNValue(Math.min(10, numResumes));

    // ── 10. Job Description text ──────────────────────────────────────────────
    const descParts = [];
    if (jd.description)  descParts.push(`Overview:\n${jd.description}`);
    if (jd.requirements) descParts.push(`Responsibilities/Requirements:\n${jd.requirements}`);
    if (jd.benefits)     descParts.push(`Benefits:\n${jd.benefits}`);
    const combinedDesc = descParts.join('\n\n');
    setJobDesc(combinedDesc);

    // ── 11. Store full JD object for display ──────────────────────────────────
    setJdLoadedObj(jd);

    // ── 12. Number of Projects Required — extract from JD text; default Not Specified
    const parsedProjects = parseJdText(combinedDesc).numProjects;
    setNumProjectsRequired(parsedProjects || 'Not Specified');

    // ── 13. Mark as "analyzed" so configuration fields are shown as populated
    setJdAnalyzed(true);

    toast.success(`JD Loaded: ${jd.title}`, { icon: '✅', duration: 3000 });

    // Auto-analysis will fire via useEffect once files are also present
    setAutoAnalysisPending(true);
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRoleInput.trim()) return;
    const role = newRoleInput.trim();
    if (!PREDEFINED_ROLES.includes(role) && !customRoles.includes(role)) setCustomRoles(prev => [...prev, role]);
    if (!selectedRoles.includes(role)) setSelectedRoles(prev => [...prev, role]);
    setNewRoleInput('');
  };

  const handleAddRequired = (e) => {
    e.preventDefault();
    if (!newRequiredInput.trim()) return;
    const skill = newRequiredInput.trim();
    if (!PREDEFINED_SKILLS.includes(skill) && !customRequiredSkills.includes(skill)) setCustomRequiredSkills(prev => [...prev, skill]);
    if (!requiredSkills.includes(skill)) setRequiredSkills(prev => [...prev, skill]);
    setNewRequiredInput('');
  };

  const handleAddDesired = (e) => {
    e.preventDefault();
    if (!newDesiredInput.trim()) return;
    const skill = newDesiredInput.trim();
    if (!PREDEFINED_SKILLS.includes(skill) && !customDesiredSkills.includes(skill)) setCustomDesiredSkills(prev => [...prev, skill]);
    if (!desiredSkills.includes(skill)) setDesiredSkills(prev => [...prev, skill]);
    setNewDesiredInput('');
  };

  const allRoles          = [...PREDEFINED_ROLES, ...customRoles];
  const allRequiredSkills = [...PREDEFINED_SKILLS, ...customRequiredSkills];
  const allDesiredSkills  = [...PREDEFINED_SKILLS, ...customDesiredSkills];

  const toggleRole = (role) =>
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  const toggleRequired = (skill) =>
    setRequiredSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  const toggleDesired = (skill) =>
    setDesiredSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

  // ── Auto-analysis: trigger when JD is selected and files are already loaded
  useEffect(() => {
    if (autoAnalysisPending && files.length > 0 && selectedRoles.length > 0 && step === 1) {
      setAutoAnalysisPending(false);
      toast.success('Files detected — starting auto-analysis…', { icon: '🚀', duration: 2500 });
      // Small delay so state settles before analysis kicks off
      const timer = setTimeout(() => startAnalysis(), 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalysisPending, files.length, selectedRoles.length, step]);

  // ── Start analysis
  const startAnalysis = async () => {
    if (files.length === 0 || selectedRoles.length === 0) return;
    setAutoAnalysisPending(false);
    setStep(2);
    const initial = {};
    files.forEach(f => { initial[f.name] = 20; });
    setProgress(initial);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('roles', selectedRoles.join(','));
      // Legacy combined skills field (for backward compatibility)
      formData.append('skills', [...requiredSkills, ...desiredSkills].join(','));
      // New fine-grained fields consumed by updated backend
      formData.append('required_skills', requiredSkills.join(','));
      formData.append('desired_skills', desiredSkills.join(','));
      formData.append('certifications', jdCertifications.join(','));
      formData.append('jobDesc', jobDesc);
      formData.append('min_years', String(minYears));
      formData.append('max_years', String(maxYears));
      formData.append('location_filter', locationFilter);
      formData.append('education_tier', educationFilter);
      // Pass JD ID so backend can re-fetch latest JD data directly from DB
      if (selectedJdId) formData.append('jd_id', selectedJdId);

      const interval = setInterval(() => {
        setProgress(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => { if (next[k] < 80) next[k] += Math.floor(Math.random() * 10); });
          return next;
        });
      }, 500);

      const res = await recruiterAPI.bulkAnalyze(formData);
      clearInterval(interval);
      const rawResults = res.data;

      const finalProgress = {};
      files.forEach(f => { finalProgress[f.name] = 100; });
      setProgress(finalProgress);
      await new Promise(r => setTimeout(r, 500));

      const ranked = rawResults.map((r, i) => {
        const total = rawResults.length;
        const aiRank = i + 1;
        const percentile = total > 0 ? (((total - aiRank) / total) * 100).toFixed(2) : 0.0;
        let selStatus = '⏳ Waiting';
        if (r.status === 'Shortlisted') selStatus = '✅ Selected';
        else if (r.status === 'Rejected') selStatus = '❌ Not Selected';
        return {
          ...r,
          rank: aiRank,
          ai_rank: r.ai_rank || aiRank,
          percentile: r.percentile !== undefined ? r.percentile : percentile,
          selection_status: r.selection_status || selStatus,
          bucket: r.status === 'Shortlisted' ? 'successful' : r.status === 'Rejected' ? 'not_successful' : null,
          // Ensure candidate profile fields from backend are preserved
          location:      r.location      || '',
          education:     r.education     || '',
          email:         r.email         || '',
          phone:         r.phone         || '',
          certifications: r.certifications || [],
        };
      });

      setResults(ranked);
      setTopNValue(Math.min(10, ranked.length));
      setStep(3);
      // ── Broadcast to other dashboards so they auto-refresh ─────────────────
      localStorage.setItem('rocas_analysis_done', Date.now().toString());
      toast.success(`Analysis complete! ${ranked.length} candidate${ranked.length !== 1 ? 's' : ''} ranked.`, { icon: '🏆' });
    } catch (e) {
      console.error('Failed to send data to backend', e);
      toast.error('Failed to analyze resumes. Please ensure the backend is running.');
      setStep(1);
    }
  };

  // ── Pick Top N
  const pickTopN = () => {
    setResults(prev => prev.map((r, i) => ({
      ...r,
      bucket: i < topNValue ? 'successful' : 'not_successful',
      selection_status: i < topNValue ? '✅ Selected' : '❌ Not Selected',
    })));
    toast.success(`Top ${topNValue} candidates marked as Successful!`);
  };

  // ── Mark bucket manually
  const markBucket = (rank, bucket) => {
    setResults(prev => prev.map(r => r.rank === rank
      ? { ...r, bucket, selection_status: bucket === 'successful' ? '✅ Selected' : '❌ Not Selected' }
      : r));
  };

  // ── Export CSV
  const exportCSV = () => {
    const header = 'AI Rank,Candidate,Match Score (%),Percentile,Skill Match,Experience,ATS Score,Status,Bucket,Missing Skills\n';
    const rows = results.map(r =>
      `${r.ai_rank || r.rank},"${r.name}",${r.overall},${r.percentile},${r.skillMatch},${r.experience},${r.ats},"${r.status}","${r.bucket || 'pending'}","${r.missing?.join('; ')}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `resume_rankings_${selectedRoles.join('_') || 'job'}_${Date.now()}.csv`;
    a.click();
  };

  // ── Filter results
  const filteredResults = results.filter(r => {
    const matchStatus   = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch   = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchExp      = matchesExpBucket(r.experience, expBucket);
    const matchLoc      = matchesLocation(r.location, locSearch);
    const matchEdu      = matchesEducation(r.education, eduFilter);
    const matchBucket   = bucketFilter === 'all' || r.bucket === bucketFilter;
    return matchStatus && matchSearch && matchExp && matchLoc && matchEdu && matchBucket;
  });

  const successfulCount    = results.filter(r => r.bucket === 'successful').length;
  const notSuccessfulCount = results.filter(r => r.bucket === 'not_successful').length;
  const shortlisted        = results.filter(r => r.status === 'Shortlisted').length;
  const borderline         = results.filter(r => r.status === 'Borderline').length;
  const rejected           = results.filter(r => r.status === 'Rejected').length;

  // ── STEP 1: Configuration (JD-Driven Workflow) ───────────────────────────
  const renderStep1 = () => (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-content hidden">Bulk Resume Analyzer</h1>
        <p className="mt-1 text-content-muted hidden">
          Upload multiple resumes — our AI will rank and score every candidate.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {['Configure', 'Analyze', 'Results'].map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > i + 1 ? 'bg-emerald-500 text-white'
                  : step === i + 1 ? 'bg-gradient-to-br from-primary to-accent text-white'
                  : 'bg-surface-hover text-content-muted border border-border-default'
                }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === i + 1 ? 'text-content' : 'text-content-muted'}`}>{s}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-surface-hover border border-border-default" />}
          </React.Fragment>
        ))}
      </div>

      {/* Config Card */}
      <div className="rounded-2xl p-7 space-y-6"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>

        {/* ══════════════════════════════════════════════════════════════════
             1. JOB DESCRIPTION SOURCE  — First thing visible on the page
            ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-surface-hover dark:bg-surface/5 border border-border-default dark:border-white/10 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <h3 className="text-content dark:text-white font-bold mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-blue-500 dark:text-blue-400" /> Job Description Source
          </h3>

          {/* Source toggle */}
          <div className="flex gap-2 p-1 bg-black/5 dark:bg-black/20 rounded-lg w-max mb-5 border border-border-default dark:border-white/5">
            <button
              onClick={() => handleSourceChange('manual')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                jdSource === 'manual'
                  ? 'bg-surface text-content shadow-sm dark:bg-surface/10 dark:text-white'
                  : 'text-content-muted hover:text-content hover:bg-surface/5'
              }`}>
              Manual Configuration (Paste JD)
            </button>
            <button
              onClick={() => handleSourceChange('existing')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                jdSource === 'existing'
                  ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                  : 'text-content-muted hover:text-content hover:bg-surface/5'
              }`}>
              Select Existing JD
            </button>
          </div>

          {/* Existing JD dropdown */}
          {jdSource === 'existing' && (
            <div className="space-y-4 animate-fade-in">
              {jdsLoading ? (
                <div className="h-12 bg-surface-hover dark:bg-surface/5 rounded-xl animate-pulse border border-border-default dark:border-white/5" />
              ) : jds.length === 0 ? (
                <div className="text-center py-6 bg-black/5 dark:bg-black/20 rounded-xl border border-border-default dark:border-white/5">
                  <p className="text-content-muted text-sm mb-3">No Job Descriptions Available</p>
                  <Link to="/jd-studio" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    <FileText size={16} /> Create New JD
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <select value={selectedJdId} onChange={handleJdSelect}
                    className="w-full appearance-none bg-black/5 dark:bg-black/20 border border-border-default dark:border-white/10 rounded-xl px-4 py-3 text-content dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer">
                    <option value="" disabled className="text-content-muted">-- Select a Job Description --</option>
                    {jds.map(jd => (
                      <option key={jd.id} value={jd.id} className="bg-surface text-content dark:text-white">
                        {jd.title} {jd.department ? `(${jd.department})` : ''} • {jd.experience_level || 'Any Exp.'}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-content-muted">▼</div>
                </div>
              )}

              {/* JD Auto-Populated summary card */}
              {selectedJdId && jdSource === 'existing' && jdLoadedObj && (
                <div className="mt-4 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)' }}>
                  <div className="px-5 py-3 flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.12)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={15} className="text-emerald-400" />
                    <span className="text-white font-bold text-sm">JD Auto-Populated</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.2)', color: '#34D399' }}>
                      {jdLoadedObj.status || 'Active'}
                    </span>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><Briefcase size={11} /> Position</div>
                      <p className="text-white font-semibold truncate">{jdLoadedObj.title || '—'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><Building2 size={11} /> Department</div>
                      <p className="text-white font-semibold">{jdDepartment || '—'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><FileText size={11} /> Employment Type</div>
                      <p className="text-white font-semibold">{jdEmploymentType || '—'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><Wifi size={11} /> Work Mode</div>
                      <p className="text-white font-semibold">{jdWorkMode || '—'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><MapPin size={11} /> Location</div>
                      <p className="text-white font-semibold">{jdLoadedObj.location || '—'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><DollarSign size={11} /> Salary Range</div>
                      <p className="text-white font-semibold">{jdSalary || '—'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><Clock size={11} /> Experience</div>
                      <p className="text-white font-semibold">
                        {jdLoadedObj.experience_level
                          ? `${jdLoadedObj.experience_level} (${minYears}–${maxYears === 20 ? '20+' : maxYears} yrs)`
                          : `${minYears}–${maxYears === 20 ? '20+' : maxYears} yrs`}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><GraduationCap size={11} /> Education</div>
                      <p className="text-white font-semibold">{jdLoadedObj.education || '—'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1"><ShieldCheck size={11} /> AI Match Threshold</div>
                      <p className="text-white font-semibold">{jdThresholds.ai}% min</p>
                    </div>
                  </div>
                  {jdCertifications.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-2"><Award size={11} /> Required Certifications</div>
                      <div className="flex flex-wrap gap-1.5">
                        {jdCertifications.map(cert => (
                          <span key={cert} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.3)' }}>
                            🏅 {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {requiredSkills.length > 0 && (
                    <div className="px-5 pb-4">
                      <p className="text-content-muted text-xs mb-2">Required Skills ({requiredSkills.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {requiredSkills.slice(0, 8).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: 'rgba(108,99,255,0.15)', color: '#A5A0FF', border: '1px solid rgba(108,99,255,0.25)' }}>
                            {s}
                          </span>
                        ))}
                        {requiredSkills.length > 8 && (
                          <span className="text-xs text-content-muted">+{requiredSkills.length - 8} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="px-5 pb-4">
                    {files.length > 0 ? (
                      <p className="text-emerald-400 text-xs flex items-center gap-1.5">
                        <CheckCircle size={11} /> All fields auto-populated · Analysis will start automatically.
                      </p>
                    ) : (
                      <p className="text-blue-400 text-xs flex items-center gap-1.5">
                        <Info size={11} /> All fields auto-populated · Upload resumes below to begin auto-analysis.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
             2. JOB DESCRIPTION TEXTAREA
            ══════════════════════════════════════════════════════════════════ */}
        <div className="animate-fade-in">
          <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText size={13} className="text-blue-400" />
            {jdSource === 'manual'
              ? 'Job Description — Paste JD to Auto-Extract Configuration'
              : 'Job Description (Auto-populated from selected JD)'}
          </label>
          <textarea
            className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none resize-none"
            rows={jdSource === 'manual' ? 7 : 4}
            placeholder={
              jdSource === 'manual'
                ? 'Paste the full job description here. AI will extract role, skills, experience, location, projects required, and more…'
                : 'Job description will appear here after selecting a JD above…'
            }
            value={jobDesc}
            onChange={e => {
              setJobDesc(e.target.value);
              // Reset analyzed flag if user edits the JD text
              if (jdAnalyzed && jdSource === 'manual') setJdAnalyzed(false);
            }}
            readOnly={jdSource === 'existing' && !!selectedJdId}
          />

          {/* ── Analyze JD button — manual mode only ── */}
          {jdSource === 'manual' && jobDesc.trim().length > 30 && !jdAnalyzed && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                id="btn-analyze-jd"
                onClick={handleAnalyzeJd}
                disabled={jdAnalyzing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
                  boxShadow: '0 4px 18px rgba(108,99,255,0.45)',
                }}>
                {jdAnalyzing
                  ? <><span className="inline-block animate-spin">⏳</span> Analyzing JD…</>
                  : <>🤖 Analyze JD</>}
              </button>
              <p className="text-xs text-content-muted">AI will auto-fill role, skills, experience, projects &amp; more</p>
            </div>
          )}

          {/* ── Success banner after JD analysis ── */}
          {jdAnalyzed && jdSource === 'manual' && (
            <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold animate-fade-in bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              <CheckCircle size={15} />
              <span>JD analyzed — all fields auto-populated below. Review and edit before proceeding.</span>
              <button
                onClick={() => setJdAnalyzed(false)}
                className="ml-auto text-xs px-2 py-1 rounded-lg transition-colors hover:bg-emerald-100 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400/70"
                >Re-analyze</button>
            </div>
          )}
        </div>

        {/* ── Hint banner if manual mode and not yet analyzed ── */}
        {jdSource === 'manual' && !jdAnalyzed && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-dashed animate-fade-in bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/30">
            <span className="text-lg mt-0.5">💡</span>
            <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-200/90">
              Paste your Job Description above and click{' '}
              <strong className="text-blue-700 dark:text-blue-300 font-bold">Analyze JD</strong>{' '}
              to auto-fill all configuration fields below. You can also fill them manually.
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             3. JOB ROLE / POSITION
            ══════════════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-0 flex items-center gap-2">
              Select Job Roles/Positions *
              {(jdAnalyzed || (jdSource === 'existing' && selectedJdId)) && selectedRoles.length > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(108,99,255,0.2)', color: '#A5A0FF' }}>AI</span>
              )}
            </label>
            <div className="flex gap-2">
              <button onClick={() => setSelectedRoles(allRoles)} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Select All</button>
              <button onClick={() => setSelectedRoles([])} className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">Clear All</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allRoles.map(role => (
              <button key={role} onClick={() => toggleRole(role)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  selectedRoles.includes(role)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25 border-transparent'
                    : 'bg-page text-content-secondary border border-border-default hover:bg-surface-hover'
                }`}>
                {role}
              </button>
            ))}
          </div>
          <form onSubmit={handleAddRole} className="mt-3 flex gap-2">
            <input type="text"
              className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none flex-1 py-1.5 px-3"
              placeholder="Add custom role…"
              value={newRoleInput} onChange={e => setNewRoleInput(e.target.value)} />
            <button type="submit"
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:bg-surface/10"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>+ Add Role</button>
          </form>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
             4. REQUIRED SKILLS (Must Have)
            ══════════════════════════════════════════════════════════════════ */}
        <SkillsSection
          label="Required Skills (Must Have) *"
          accent="#6C63FF"
          selectedSkills={requiredSkills}
          allSkills={allRequiredSkills}
          onToggle={toggleRequired}
          onSelectAll={() => setRequiredSkills(allRequiredSkills)}
          onClearAll={() => setRequiredSkills([])}
          customInput={newRequiredInput}
          onCustomChange={setNewRequiredInput}
          onAddCustom={handleAddRequired}
        />

        {/* ══════════════════════════════════════════════════════════════════
             5. DESIRED SKILLS (Nice to Have)
            ══════════════════════════════════════════════════════════════════ */}
        <SkillsSection
          label="Desired Skills (Nice to Have)"
          accent="#F59E0B"
          selectedSkills={desiredSkills}
          allSkills={allDesiredSkills}
          onToggle={toggleDesired}
          onSelectAll={() => setDesiredSkills(allDesiredSkills)}
          onClearAll={() => setDesiredSkills([])}
          customInput={newDesiredInput}
          onCustomChange={setNewDesiredInput}
          onAddCustom={handleAddDesired}
        />

        {/* ══════════════════════════════════════════════════════════════════
             6–9. CANDIDATE FILTERS  (Experience · Location · Education · Projects)
            ══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl p-5 bg-surface border border-border-default shadow-sm">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Filter size={16} className="text-blue-400" /> Candidate Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* 6. Year of Experience Slider */}
            <div>
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">
                Years of Experience: {minYears}–{maxYears === 20 ? '20+' : maxYears} yrs
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-content-muted w-8">Min</span>
                  <input type="range" min={0} max={20} value={minYears}
                    onChange={e => setMinYears(Math.min(Number(e.target.value), maxYears))}
                    className="flex-1" style={{ accentColor: '#6C63FF' }} />
                  <span className="text-xs font-bold text-white w-6 text-right">{minYears}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-content-muted w-8">Max</span>
                  <input type="range" min={0} max={20} value={maxYears}
                    onChange={e => setMaxYears(Math.max(Number(e.target.value), minYears))}
                    className="flex-1" style={{ accentColor: '#00D4FF' }} />
                  <span className="text-xs font-bold text-white w-6 text-right">{maxYears === 20 ? '20+' : maxYears}</span>
                </div>
              </div>
            </div>

            {/* 7. Education Criteria */}
            <div>
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">Education Criteria</label>
              <div className="relative">
                <select
                  value={educationFilter}
                  onChange={e => setEducationFilter(e.target.value)}
                  className="w-full appearance-none input-dark text-sm pr-8">
                  {EDUCATION_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
              </div>
            </div>

            {/* 8. Location Filter */}
            <div>
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">Preferred Location</label>
              <input
                type="text"
                className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none"
                placeholder="e.g. Bangalore, Mumbai, Remote…"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>

            {/* 9. Number of Projects Required — replaces Target Selection Count */}
            <div>
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                Number of Projects Required
                {(jdAnalyzed || (jdSource === 'existing' && selectedJdId)) && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(108,99,255,0.2)', color: '#A5A0FF' }}>AI</span>
                )}
              </label>
              <input
                type="text"
                value={numProjectsRequired}
                onChange={e => setNumProjectsRequired(e.target.value)}
                placeholder="e.g. 3  (or Not Specified)"
                className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none"
              />
              <p className="text-xs text-content-muted mt-1.5">AI-extracted from JD (e.g. "Minimum 3 projects"). Editable.</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
             10. NUMBER OF RESUMES TO ACCEPT
            ══════════════════════════════════════════════════════════════════ */}
        <div>
          <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">Number of Resumes to Accept (max)</label>
          <div className="flex items-center gap-3">
            <input type="range" min={1} max={200} value={numResumes}
              onChange={e => setNumResumes(Number(e.target.value))}
              className="flex-1" style={{ accentColor: '#6C63FF' }} />
            <span className="text-2xl font-extrabold gradient-text w-10 text-center">{numResumes}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
             11. UPLOAD RESUMES
            ══════════════════════════════════════════════════════════════════ */}
        <div>
          <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider mb-3">Upload Resumes ({files.length}/{numResumes})</label>
          <FileSelector files={files} onFiles={setFiles} maxFiles={numResumes} />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
             12. ANALYZE BUTTON
            ══════════════════════════════════════════════════════════════════ */}
        <button
          onClick={startAnalysis}
          disabled={files.length === 0 || selectedRoles.length === 0}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
            boxShadow: '0 0 30px rgba(108,99,255,0.4)',
          }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 0 50px rgba(108,99,255,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(108,99,255,0.4)'; }}>
          {files.length === 0
            ? '⬆️ Upload Resumes First'
            : `🚀 Analyze ${files.length} Resume${files.length > 1 ? 's' : ''}`}
        </button>
        {!selectedRoles.length && files.length > 0 && (
          <p className="text-xs text-center" style={{ color: '#F59E0B' }}>⚠️ Please select at least one Job Role to continue.</p>
        )}

      </div>
    </div>
  );

  // ── STEP 2: Processing ────────────────────────────────────────────────────
  const renderStep2 = () => {
    const totalProgress = files.length > 0
      ? Object.values(progress).reduce((a, b) => a + b, 0) / (files.length * 100) * 100
      : 0;

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 animate-float"
            style={{ background: 'linear-gradient(135deg, #6C63FF22, #00D4FF22)', border: '1px solid rgba(108,99,255,0.3)' }}>
            🤖
          </div>
          <h2 className="text-2xl font-extrabold text-white">AI Analysis in Progress</h2>
          <p className="mt-1 text-content-muted">
            Analyzing {files.length} resume{files.length > 1 ? 's' : ''} for <strong className="text-white">{selectedRoles.join(', ')}</strong>
          </p>
        </div>

        {/* Overall progress */}
        <div className="rounded-2xl p-6 mb-6 bg-surface border border-border-default shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Overall Progress</span>
            <span className="font-extrabold gradient-text">{Math.round(totalProgress)}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-surface-hover border border-border-default">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%`, background: 'linear-gradient(90deg, #6C63FF, #00D4FF)', boxShadow: '0 0 12px rgba(108,99,255,0.6)' }} />
          </div>
        </div>

        {/* Per-resume progress */}
        <div className="space-y-3">
          {files.map((f, i) => {
            const p = progress[f.name] || 0;
            const isDone = p === 100;
            return (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border-default shadow-sm">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isDone ? 'rgba(16,185,129,0.2)' : 'rgba(108,99,255,0.15)' }}>
                  <span className="text-lg">{isDone ? '✅' : '⏳'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{f.name}</p>
                    <span className="text-xs font-bold ml-2" style={{ color: isDone ? '#10B981' : '#6C63FF' }}>{p}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-surface-hover border border-border-default">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${p}%`, background: isDone ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #6C63FF, #00D4FF)' }} />
                  </div>
                  <p className="text-xs mt-1 text-content-muted">
                    {isDone ? 'Analysis complete' : p > 0 ? 'Extracting skills & scoring…' : 'Queued…'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── STEP 3: Results ───────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            🏆 Resume Rankings — <span className="gradient-text">{selectedRoles.join(', ')}</span>
          </h1>
          <p className="text-sm mt-1 text-content-muted">
            {results.length} candidates analyzed and ranked by AI
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => {
            setStep(1); setFiles([]); setResults([]); setProgress({});
            setSelectedJdId(''); setJdSource('manual');
            setSelectedRoles([]); setRequiredSkills([]); setDesiredSkills([]);
            setJobDesc(''); setLocationFilter(''); setEducationFilter('any');
            setMinYears(0); setMaxYears(20);
            clearJdMetaStates();
          }}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-surface-hover text-content border border-border-default">
            🔄 New Analysis
          </button>
          {isHRManager && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.25)' }}>
              <ShieldCheck size={14} /> HR Manager Mode
            </span>
          )}
          <button onClick={exportCSV}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* ── Bucket Pills ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
          Buckets:
        </span>
        {[
          { key: 'all', label: `All (${results.length})`, color: '#6C63FF', bg: 'rgba(108,99,255,0.15)', border: 'rgba(108,99,255,0.3)' },
          { key: 'successful', label: `✅ Successful (${successfulCount})`, color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
          { key: 'not_successful', label: `❌ Not Successful (${notSuccessfulCount})`, color: '#F87171', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)' },
        ].map(b => (
          <button key={b.key} onClick={() => setBucketFilter(b.key)}
            className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-200"
            style={{
              background: bucketFilter === b.key ? b.bg : 'var(--theme-surface)',
              color: bucketFilter === b.key ? b.color : 'var(--theme-text-muted)',
              border: `1px solid ${bucketFilter === b.key ? b.border : 'rgba(255,255,255,0.08)'}`,
              transform: bucketFilter === b.key ? 'scale(1.04)' : 'scale(1)',
              boxShadow: bucketFilter === b.key ? `0 0 14px ${b.border}` : 'none',
            }}>
            {b.label}
          </button>
        ))}
      </div>

      {/* ── Pick Top N Control ── */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
        <Trophy size={24} className="text-yellow-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-white text-sm">Pick Top N Candidates</p>
          <p className="text-xs mt-0.5 text-content-muted">
            Auto-mark top candidates as Successful, rest as Not Successful
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number" min={1} max={results.length}
            value={topNValue}
            onChange={e => setTopNValue(Number(e.target.value))}
            className="w-20 rounded-xl px-3 py-2 text-center font-bold text-white text-sm bg-surface border border-border-default shadow-sm"
          />
          <button onClick={pickTopN}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', boxShadow: '0 4px 15px rgba(108,99,255,0.35)' }}>
            Apply Top {topNValue}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyzed', value: results.length,   icon: '📊', color: '#6C63FF' },
          { label: 'Shortlisted',    value: shortlisted,       icon: '✅', color: '#10B981' },
          { label: 'Borderline',     value: borderline,        icon: '⚡', color: '#F59E0B' },
          { label: 'Rejected',       value: rejected,          icon: '❌', color: '#EF4444' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-2xl p-5 text-center bg-surface border border-border-default shadow-sm">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1 text-content-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Top 3 Podium */}
      {results.length >= 3 && (
        <div className="rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.08))', border: '1px solid rgba(108,99,255,0.25)' }}>
          <h2 className="font-bold text-white mb-5 text-center">🎖️ Top 3 Candidates</h2>
          <div className="grid grid-cols-3 gap-4">
            {results.slice(0, 3).map((r, i) => (
              <button key={r.rank}
                onClick={() => setSelectedCandidate(r)}
                className="rounded-xl p-4 text-center transition-all hover:-translate-y-1 duration-200 cursor-pointer"
                style={{
                  background: i === 0 ? 'rgba(255,215,0,0.1)' : i === 1 ? 'rgba(192,192,192,0.1)' : 'rgba(205,127,50,0.1)',
                  border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.3)' : i === 1 ? 'rgba(192,192,192,0.25)' : 'rgba(205,127,50,0.25)'}`,
                }}>
                <div className="text-3xl mb-2"><RankMedal rank={r.rank} /></div>
                <p className="font-bold text-white text-sm truncate">{r.name}</p>
                <p className="text-3xl font-extrabold mt-2" style={{
                  color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32'
                }}>{r.overall}</p>
                <p className="text-xs text-content-muted">Overall Score</p>
                <StatusChip status={r.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters Bar ── */}
      <div className="rounded-2xl p-4 bg-surface border border-border-default shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <input type="text" placeholder="Search candidates…"
            className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none text-sm"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

          {/* Status filter */}
          <select className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Borderline">Borderline</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Year-wise experience filter */}
          <select className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none text-sm" value={expBucket} onChange={e => setExpBucket(e.target.value)}>
            {EXP_BUCKETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>

          {/* Location search */}
          <input type="text" placeholder="Filter by location…"
            className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none text-sm"
            value={locSearch} onChange={e => setLocSearch(e.target.value)} />

          {/* Education filter */}
          <select className="w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-slate-400 focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none text-sm" value={eduFilter} onChange={e => setEduFilter(e.target.value)}>
            {EDUCATION_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Results Table ── */}
      <div className="rounded-2xl overflow-hidden bg-surface border border-border-default shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-surface-hover">
                {[
                  'Drag', 'Rank', 'AI Rank', 'Candidate', 'Overall', 'Match %', 'Percentile',
                  'Skill Match', 'Experience', 'Location', 'Education', 'ATS', 'Missing Skills',
                  'Status', 'Bucket',
                  ...(isHRManager ? ['Contact', 'Salary Band', 'Notes'] : []),
                  'Actions',
                ].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-content-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r, idx) => (
                <tr key={r.rank}
                  draggable
                  onDragStart={() => setDraggingResult(r)}
                  onDragEnd={() => setDraggingResult(null)}
                  className="transition-colors duration-150 hover:bg-surface/5 cursor-grab active:cursor-grabbing select-none"
                  style={{ borderBottom: idx < filteredResults.length - 1 ? '1px solid var(--theme-border-default)' : 'none' }}>

                  {/* Drag handle */}
                  <td className="py-4 px-3">
                    <GripVertical size={14} className="text-content-muted" />
                  </td>

                  {/* Rank */}
                  <td className="py-4 px-3">
                    <div className="flex items-center justify-center w-8">
                      <RankMedal rank={r.rank} />
                    </div>
                  </td>

                  {/* AI Rank */}
                  <td className="py-4 px-3">
                    <span className="font-bold text-white text-sm">#{r.ai_rank || r.rank}</span>
                  </td>

                  {/* Candidate Name — clickable */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                        {r.name[0]?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <button
                          onClick={() => setSelectedCandidate(r)}
                          className="font-bold text-white text-sm hover:text-blue-300 transition-colors text-left leading-tight underline-offset-2 hover:underline">
                          {r.name}
                        </button>
                        <p className="text-xs text-content-muted">
                          {r.matched?.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Overall score */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden bg-surface-hover border border-border-default">
                        <div className="h-full rounded-full"
                          style={{ width: `${r.overall}%`, background: r.overall >= 75 ? '#10B981' : r.overall >= 55 ? '#6C63FF' : '#F59E0B' }} />
                      </div>
                      <span className="font-extrabold text-white text-sm">{r.overall}</span>
                    </div>
                  </td>

                  <td className="py-4 px-3"><span className="font-bold text-sm" style={{ color: '#00D4FF' }}>{r.overall}%</span></td>
                  <td className="py-4 px-3"><span className="font-bold text-sm" style={{ color: '#34D399' }}>{r.percentile}%</span></td>
                  <td className="py-4 px-3"><span className="font-bold text-sm" style={{ color: '#00D4FF' }}>{r.skillMatch}%</span></td>
                  <td className="py-4 px-3"><span className="font-bold text-sm" style={{ color: '#A5A0FF' }}>{r.experience}</span></td>
                  <td className="py-4 px-3"><span className="text-xs text-content-muted">{r.location || '—'}</span></td>
                  <td className="py-4 px-3"><span className="text-xs text-content-muted truncate max-w-[100px] block">{r.education || '—'}</span></td>
                  <td className="py-4 px-3"><span className="font-bold text-sm" style={{ color: '#34D399' }}>{r.ats}</span></td>

                  {/* Missing skills */}
                  <td className="py-4 px-3">
                    <div className="flex flex-wrap gap-1">
                      {r.missing?.slice(0, 2).map(s => (
                        <span key={s} className="skill-dark-missing text-xs">{s}</span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-3"><StatusChip status={r.status} /></td>

                  {/* Bucket column */}
                  <td className="py-4 px-3">
                    {r.bucket ? <BucketChip bucket={r.bucket} /> : <span className="text-xs text-content-muted">—</span>}
                  </td>

                  {/* HR Manager columns */}
                  {isHRManager && (
                    <>
                      <td className="py-4 px-3"><span className="text-xs text-blue-300">{r.email || '—'}</span></td>
                      <td className="py-4 px-3"><span className="text-xs text-yellow-300">{r.salary_band || '—'}</span></td>
                      <td className="py-4 px-3">
                        <input className="rounded-lg px-2 py-1 text-xs text-white w-24 bg-surface border border-border-default shadow-sm"
                          placeholder="Notes…" />
                      </td>
                    </>
                  )}

                  {/* Actions */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => markBucket(r.rank, 'successful')}
                        title="Mark Successful"
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 border shadow-sm ${r.bucket === 'successful' ? 'bg-success/20 border-success/30' : 'bg-surface border-border-default hover:bg-surface-hover'}`}>
                        <CheckCircle size={13} style={{ color: '#10B981' }} />
                      </button>
                      <button onClick={() => markBucket(r.rank, 'not_successful')}
                        title="Mark Not Successful"
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 border shadow-sm ${r.bucket === 'not_successful' ? 'bg-error/20 border-error/30' : 'bg-surface border-border-default hover:bg-surface-hover'}`}>
                        <XCircle size={13} style={{ color: '#F87171' }} />
                      </button>
                      <button onClick={() => setSelectedCandidate(r)}
                        title="View Profile"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}>
                        <Users size={13} style={{ color: '#A5A0FF' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={20} className="text-center py-12 text-content-muted">
                    No candidates match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Screening Drop Zone ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-content-muted">
          Drag to Pipeline
        </p>
        <ScreeningDropZone onDrop={() => {
          if (draggingResult) {
            toast.success(`${draggingResult.name} moved to Screening!`, { icon: '🔍' });
          }
        }} />
      </div>

      {/* Score Distribution Bar */}
      <div className="rounded-2xl p-6 bg-surface border border-border-default shadow-sm">
        <h3 className="font-bold text-white mb-5">📊 Score Distribution</h3>
        <div className="space-y-3">
          {[
            { label: 'Excellent (80–100)', count: results.filter(r => r.overall >= 80).length, color: '#10B981' },
            { label: 'Good (60–79)',       count: results.filter(r => r.overall >= 60 && r.overall < 80).length, color: '#6C63FF' },
            { label: 'Fair (40–59)',       count: results.filter(r => r.overall >= 40 && r.overall < 60).length, color: '#F59E0B' },
            { label: 'Poor (<40)',         count: results.filter(r => r.overall < 40).length, color: '#EF4444' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="text-xs font-medium w-36 flex-shrink-0" style={{ color: '#64748B' }}>{label}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden bg-surface-hover border border-border-default">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: results.length > 0 ? `${(count / results.length) * 100}%` : '0%', background: color }} />
              </div>
              <span className="text-xs font-bold w-4 text-right" style={{ color }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen font-sans bg-page">
      <div className="hidden md:block"><OrgSidebar /></div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Premium Header */}
        <header className="bg-surface border-b border-border-default/80 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
          <div>
            <div className="flex items-center gap-2 text-xs text-content-muted mb-1">
              <span>Portal</span>
              <span>›</span>
              <span className="text-blue-600 font-medium">Bulk Analysis</span>
            </div>
            <h1 className="text-2xl font-black text-content tracking-tight">Bulk Analysis</h1>
            <p className="text-sm text-content-muted mt-0.5">Upload multiple resumes — our AI will rank and score every candidate.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
            {isHRManager && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.25)' }}>
                <ShieldCheck size={13} /> HR Manager
              </span>
            )}
            <Link to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              👤 User Dashboard
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </main>
      </div>

      {/* Candidate Dossier Slide-over Panel */}
      {selectedCandidate && (
        <CandidateDossierPanel
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          requiredSkills={requiredSkills}
          desiredSkills={desiredSkills}
          isHRManager={isHRManager}
        />
      )}
    </div>
  );
};

export default OrgDashboard;
