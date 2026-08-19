/**
 * ResumeBuilder.jsx — Production-Ready AI Resume Upload → Builder Workflow
 * =========================================================================
 *
 * Architecture:
 *   Left Panel (tabs):
 *     • Upload   – big blue buttons for PDF/DOC/Image
 *     • Fields   – form inputs (accordion)
 *     • Editor   – editable raw text with debounced re-parse
 *   Right Panel:
 *     • Template selector thumbnails
 *     • Live preview (scales to fit)
 *     • Zoom controls
 *
 * Workflow (Case 1 – no editing):
 *   Upload → Extract → Populate Fields → Render Preview → Download PDF
 *
 * Workflow (Case 2 – with editing):
 *   Upload → Extract → Edit Text → Debounced Re-parse → Update Fields → Refresh Preview → Download PDF
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import {
  Download, Sparkles, ChevronLeft, Eye, Edit3,
  Upload, FileText, ScanLine, Loader2, AlertCircle,
  CheckCircle2, LayoutTemplate, FormInput, AlignLeft
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { resumeAPI } from '../services/api';
import ResumeForm from '../components/ResumeBuilder/ResumeForm';
import ResumePreview from '../components/ResumeBuilder/ResumePreview';
import TemplateSelector from '../components/ResumeBuilder/TemplateSelector';
import ImageUploadModal from '../components/ResumeBuilder/ImageUploadModal';

// ─── Initial empty state (matches full schema) ───────────────────────────────
const EMPTY_RESUME = {
  personalInfo: {
    fullName: '', jobTitle: '', email: '', phone: '',
    alternatePhone: '', location: '', address: '', city: '', state: '',
    country: '', postalCode: '', nationality: '', dob: '',
    linkedin: '', github: '', portfolio: '', personalWebsite: '', photo: null,
  },
  summary: '',
  skills: {
    technical: [], soft: [], programmingLanguages: [], frameworks: [],
    libraries: [], databases: [], cloudPlatforms: [], devOpsTools: [],
    aiTools: [], operatingSystems: [], other: [],
  },
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  awards: [],
  achievements: [],
  publications: [],
  patents: [],
  volunteer: [],
  internships: [],
  courses: [],
  interests: [],
  languages: [],
  references: [],
};

const STORAGE_KEY_DATA = 'rb_data_v3';
const STORAGE_KEY_TPLT = 'rb_template_v3';
const STORAGE_KEY_TEXT = 'rb_text_v3';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (!raw) return EMPTY_RESUME;
    const parsed = JSON.parse(raw);
    // Upgrade: if skills is an old flat array, convert to object
    if (Array.isArray(parsed.skills)) parsed.skills = { ...EMPTY_RESUME.skills };
    return { ...EMPTY_RESUME, ...parsed };
  } catch { return EMPTY_RESUME; }
}

// ─── Parse steps for the overlay UI ─────────────────────────────────────────
const STEPS = [
  { label: 'Reading file…',           pct: 15 },
  { label: 'Extracting text…',        pct: 30 },
  { label: 'Running OCR…',            pct: 50 },
  { label: 'Analysing with AI…',      pct: 75 },
  { label: 'Populating fields…',      pct: 95 },
];

// ─── Debounce helper ─────────────────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// ─── Main Component ──────────────────────────────────────────────────────────
const ResumeBuilder = () => {
  // ── Core state ──────────────────────────────────────────────────────────
  const [resumeData, setResumeData] = useState(loadSaved);
  const [rawText, setRawText]       = useState(() => localStorage.getItem(STORAGE_KEY_TEXT) || '');
  const [template, setTemplate]     = useState(() => localStorage.getItem(STORAGE_KEY_TPLT) || 'creative');

  // ── UI state ────────────────────────────────────────────────────────────
  const [leftTab, setLeftTab]             = useState('upload'); // 'upload' | 'fields' | 'editor'
  const [mobilePreview, setMobilePreview] = useState(false);
  const [zoom, setZoom]                   = useState(0.72);

  // ── Parse state ──────────────────────────────────────────────────────────
  const [parsing, setParsing]     = useState(false);
  const [stepIdx, setStepIdx]     = useState(0);
  const [reparsing, setReparsing] = useState(false);

  // ── Error state ──────────────────────────────────────────────────────────
  const [parseError, setParseError] = useState(null);

  // ── Photo crop ───────────────────────────────────────────────────────────
  const [cropSrc, setCropSrc] = useState(null);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const previewRef  = useRef(null);
  const pdfFileRef  = useRef(null);
  const docFileRef  = useRef(null);
  const imgFileRef  = useRef(null);
  const stepTimer   = useRef(null);
  const navigate    = useNavigate();

  // ── Persist state to localStorage ────────────────────────────────────────
  useEffect(() => {
    try {
      const toSave = { ...resumeData, personalInfo: { ...resumeData.personalInfo, photo: null } };
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(toSave));
    } catch { /* quota */ }
  }, [resumeData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TPLT, template);
  }, [template]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_TEXT, rawText.slice(0, 100_000)); } catch { /* quota */ }
  }, [rawText]);

  useEffect(() => () => clearInterval(stepTimer.current), []);

  // ── PDF print ────────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: `${resumeData.personalInfo?.fullName || 'Resume'}_Resume`,
  });

  // ── Update a top-level field ──────────────────────────────────────────────
  const updateField = useCallback((section, value) => {
    setResumeData(prev => ({ ...prev, [section]: value }));
  }, []);

  // ── Start parsing progress animation ─────────────────────────────────────
  const startProgress = () => {
    setStepIdx(0);
    let i = 0;
    stepTimer.current = setInterval(() => {
      i = Math.min(i + 1, STEPS.length - 1);
      setStepIdx(i);
    }, 2800);
  };

  const stopProgress = () => {
    clearInterval(stepTimer.current);
    setParsing(false);
  };

  // ── Merge parsed data safely ──────────────────────────────────────────────
  const mergeData = useCallback((parsed, existingPhoto) => {
    const safeSkills = Array.isArray(parsed.skills)
      ? { ...EMPTY_RESUME.skills, technical: parsed.skills }
      : { ...EMPTY_RESUME.skills, ...(parsed.skills || {}) };

    return {
      ...EMPTY_RESUME,
      ...parsed,
      personalInfo: {
        ...EMPTY_RESUME.personalInfo,
        ...(parsed.personalInfo || {}),
        photo: existingPhoto ?? null,
      },
      skills: safeSkills,
    };
  }, []);

  // ── Handle file upload (unified for all types) ────────────────────────────
  const handleUpload = useCallback(async (file, type) => {
    if (!file) return;

    const MAX_MB = type === 'image' ? 20 : 20;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_MB}MB allowed.`);
      return;
    }

    const allowedDoc  = ['.pdf', '.doc', '.docx'];
    const allowedImg  = ['.jpg', '.jpeg', '.png'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (type === 'image' && !allowedImg.includes(ext)) {
      toast.error(`Unsupported image type. Use JPG, JPEG, or PNG.`);
      return;
    }
    if (type !== 'image' && !allowedDoc.includes(ext)) {
      toast.error(`Unsupported document type. Use PDF, DOC, or DOCX.`);
      return;
    }

    setParseError(null);
    setParsing(true);
    startProgress();

    try {
      let resText = '';
      let resData = null;

      if (type === 'image') {
        const res = await resumeAPI.parseImage(file);
        resText = res.data?.text || '';
        resData = res.data?.data || null;
      } else {
        // PDF, DOC, DOCX — use parse-structured which now returns both text + data
        const res = await resumeAPI.parseStructured(file);
        resText = res.data?.text || '';
        resData = res.data?.data || null;
      }

      if (!resData) throw new Error('The AI parser returned no structured data.');

      const merged = mergeData(resData, resumeData.personalInfo?.photo);
      setResumeData(merged);
      setRawText(resText);
      setLeftTab('fields'); // Auto-switch to form fields tab

      toast.success(`✅ Resume parsed! ${file.name}`, { duration: 4000 });
    } catch (err) {
      // Try to extract the real error message from response body first,
      // then from Vite proxy error JSON, then fall back to a generic message.
      let msg = null;

      if (err?.response?.data?.detail) {
        // Axios got a real HTTP response from the backend (or proxy JSON)
        msg = err.response.data.detail;
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message && err.message !== 'Network Error') {
        msg = err.message;
      } else if (err?.message === 'Network Error') {
        msg = 'Cannot connect to the server. Please make sure the backend is running on port 8000.';
      } else {
        msg = 'Upload failed. Please try again.';
      }

      setParseError(msg);
      toast.error(`❌ Parse Failed\n${msg}`, { duration: 8000 });
    } finally {
      stopProgress();
    }
  }, [resumeData.personalInfo?.photo, mergeData]);

  // ── Debounced re-parse from text editor ──────────────────────────────────
  const doReparse = useCallback(async (text) => {
    if (!text.trim()) return;
    setReparsing(true);
    try {
      const res = await resumeAPI.reparseText(text);
      const parsed = res.data?.data;
      if (parsed) {
        const merged = mergeData(parsed, resumeData.personalInfo?.photo);
        setResumeData(merged);
      }
    } catch (err) {
      console.warn('[ResumeBuilder] reparseText failed:', err.message);
    } finally {
      setReparsing(false);
    }
  }, [resumeData.personalInfo?.photo, mergeData]);

  const debouncedReparse = useDebounce(doReparse, 2000);

  const handleTextChange = useCallback((text) => {
    setRawText(text);
    if (text.trim().length > 50) {
      debouncedReparse(text);
    }
  }, [debouncedReparse]);

  // ── Photo crop ────────────────────────────────────────────────────────────
  const handlePhotoSave = useCallback((croppedUrl) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, photo: croppedUrl },
    }));
    setCropSrc(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-page">
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: '#151B2B', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      />

      {/* Photo crop modal */}
      {cropSrc && (
        <ImageUploadModal imageSrc={cropSrc} onSave={handlePhotoSave} onClose={() => setCropSrc(null)} />
      )}

      {/* Hidden file inputs */}
      <input ref={pdfFileRef} type="file" accept=".pdf"        className="hidden" onChange={e => { handleUpload(e.target.files?.[0], 'pdf');  e.target.value=''; }} />
      <input ref={docFileRef} type="file" accept=".doc,.docx"  className="hidden" onChange={e => { handleUpload(e.target.files?.[0], 'doc');  e.target.value=''; }} />
      <input ref={imgFileRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={e => { handleUpload(e.target.files?.[0], 'image'); e.target.value=''; }} />

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-border-default bg-page/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-content-primary/50 hover:text-content-primary transition-colors p-1">
            <ChevronLeft size={22} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-content-primary text-sm bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">R</div>
            <span className="font-bold text-content-primary text-base">Resume Builder</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/builder-manual" className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-semibold text-content-primary/70 hover:text-content-primary hover:bg-surface-hover rounded-xl transition-colors" title="User Manual">
            <span className="text-base">📖</span> <span className="hidden lg:inline">User Manual</span>
          </Link>
          <Link to="/builder-about" className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-semibold text-content-primary/70 hover:text-content-primary hover:bg-surface-hover rounded-xl transition-colors" title="About the Product">
            <span className="text-base">📦</span> <span className="hidden lg:inline">About</span>
          </Link>
          <button
            onClick={handlePrint}
            disabled={!resumeData.personalInfo?.fullName}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-border-default text-content-primary hover:bg-surface-hover border border-border-default disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </nav>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <div className={`
          w-full lg:w-[400px] xl:w-[440px] flex flex-col h-full shrink-0
          bg-surface-hover border-r border-border-subtle
          ${mobilePreview ? 'hidden lg:flex' : 'flex'}
        `}>

          {/* ── Tab Bar ──────────────────────────────────────────────── */}
          <div className="shrink-0 flex border-b border-border-subtle bg-page/50">
            {[
              { id: 'upload', icon: Upload,       label: 'Upload'  },
              { id: 'fields', icon: FormInput,     label: 'Fields'  },
              { id: 'editor', icon: AlignLeft,     label: 'Editor'  },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2
                  ${leftTab === tab.id
                    ? 'border-[#6C63FF] text-primary bg-primary/5'
                    : 'border-transparent text-content-muted hover:text-content-muted hover:bg-surface-hover'}
                `}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab Content ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden relative">

            {/* ── Parse overlay ─────────────────────────────────────── */}
            {parsing && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-page/92 backdrop-blur-sm">
                <div className="bg-surface rounded-2xl border border-border-default p-8 flex flex-col items-center gap-4 shadow-2xl max-w-[280px] text-center mx-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle
                        cx="32" cy="32" r="28" fill="none"
                        stroke="#6C63FF" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray="175.9"
                        strokeDashoffset={175.9 * (1 - STEPS[stepIdx].pct / 100)}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="animate-spin text-[#6C63FF]" size={22} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary mb-1">Processing Resume</h3>
                    <p className="text-sm text-primary font-medium">{STEPS[stepIdx].label}</p>
                    <p className="text-xs text-content-primary/30 mt-1">{STEPS[stepIdx].pct}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* ══ UPLOAD TAB ══════════════════════════════════════════ */}
            {leftTab === 'upload' && (
              <div className="h-full overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-4">

                  {/* Error banner */}
                  {parseError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl">
                      <AlertCircle size={18} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Parse Failed</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">{parseError}</p>
                      </div>
                      <button onClick={() => setParseError(null)} className="ml-auto text-red-400/50 hover:text-red-500 dark:hover:text-red-300 text-lg leading-none">×</button>
                    </div>
                  )}

                  {/* Upload heading */}
                  <div className="text-center pb-2">
                    <h2 className="text-lg font-bold text-content-primary mb-1">Upload Your Resume</h2>
                    <p className="text-xs text-content-primary/40">Upload once — fields populate automatically. No manual entry needed.</p>
                  </div>

                  {/* PDF Button */}
                  <button
                    onClick={() => pdfFileRef.current?.click()}
                    disabled={parsing}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl text-content-primary font-semibold text-sm transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                    style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2, #2196F3)' }}
                  >
                    <Upload size={18} />
                    Upload Resume PDF
                  </button>

                  {/* OR */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border-default" />
                    <span className="text-[11px] font-bold text-content-primary/25 tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-border-default" />
                  </div>

                  {/* DOC Button */}
                  <button
                    onClick={() => docFileRef.current?.click()}
                    disabled={parsing}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl text-content-primary font-semibold text-sm transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                    style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2, #2196F3)' }}
                  >
                    <FileText size={18} />
                    Upload Resume DOC / DOCX
                  </button>

                  {/* OR */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border-default" />
                    <span className="text-[11px] font-bold text-content-primary/25 tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-border-default" />
                  </div>

                  {/* Image Button */}
                  <button
                    onClick={() => imgFileRef.current?.click()}
                    disabled={parsing}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl text-content-primary font-semibold text-sm transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                    style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2, #2196F3)' }}
                  >
                    <ScanLine size={18} />
                    Upload Resume Image (OCR)
                    <span className="text-[10px] text-content-primary/50 ml-1">JPG · JPEG · PNG</span>
                  </button>

                  {/* Info cards */}
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {[
                      { icon: '🤖', title: 'AI Extraction', desc: 'Gemini AI extracts every field accurately' },
                      { icon: '👁️', title: 'OCR Support', desc: 'Scanned images processed automatically' },
                      { icon: '⚡', title: 'Instant Preview', desc: 'Preview renders immediately after upload' },
                      { icon: '✏️', title: 'Editable', desc: 'Edit fields or raw text anytime' },
                    ].map((card, i) => (
                      <div key={i} className="p-3 rounded-xl bg-surface-hover border border-border-subtle">
                        <div className="text-xl mb-1">{card.icon}</div>
                        <p className="text-xs font-bold text-content-primary/70">{card.title}</p>
                        <p className="text-[11px] text-content-muted mt-0.5 leading-tight">{card.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* If data exists, show prompt */}
                  {resumeData.personalInfo?.fullName && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/25 rounded-xl mt-2">
                      <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Resume loaded: <strong>{resumeData.personalInfo.fullName}</strong>. Check Fields or Editor tabs.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ FIELDS TAB ══════════════════════════════════════════ */}
            {leftTab === 'fields' && (
              <div className="h-full overflow-y-auto custom-scrollbar">
                <ResumeForm
                  data={resumeData}
                  onChange={updateField}
                  setResumeData={setResumeData}
                  onCropOpen={setCropSrc}
                  hideUploadButtons
                />
              </div>
            )}

            {/* ══ EDITOR TAB ══════════════════════════════════════════ */}
            {leftTab === 'editor' && (
              <div className="h-full flex flex-col">
                {/* Editor header */}
                <div className="shrink-0 px-5 py-3 border-b border-border-subtle flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-content-primary/60 uppercase tracking-wider">Resume Text Editor</p>
                    <p className="text-[11px] text-content-primary/30 mt-0.5">Edits auto-update the preview after 2 seconds</p>
                  </div>
                  {reparsing && (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs">Re-parsing…</span>
                    </div>
                  )}
                  {!reparsing && rawText && (
                    <span className="text-[11px] text-content-primary/25">{rawText.length.toLocaleString()} chars</span>
                  )}
                </div>

                {/* The textarea */}
                <textarea
                  className="flex-1 w-full bg-page text-content-secondary text-sm font-mono leading-relaxed px-5 py-4 resize-none focus:outline-none placeholder:text-content-muted custom-scrollbar"
                  value={rawText}
                  onChange={e => handleTextChange(e.target.value)}
                  placeholder="Upload a resume above and the extracted text will appear here automatically.

You can also paste raw text here and the fields will populate automatically.

Editing this text will update the preview in real time."
                  spellCheck={false}
                />

                {/* Char limit warning */}
                {rawText.length > 45_000 && (
                  <div className="shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-500/20 flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-700 dark:text-amber-300">Large text may slow re-parsing.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <div className={`
          w-full flex-1 flex flex-col h-full bg-page
          ${!mobilePreview ? 'hidden lg:flex' : 'flex absolute inset-0 z-40'}
        `}>
          {/* Template selector */}
          <div className="shrink-0 border-b border-border-subtle bg-surface-hover/60 backdrop-blur-md">
            <TemplateSelector selected={template} onSelect={setTemplate} />
          </div>

          {/* Preview canvas — light: soft slate, dark: deep gradient */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center items-start p-4 sm:p-8 bg-slate-100 dark:bg-[radial-gradient(ellipse_at_top_left,#1e1b4b18,transparent_50%),radial-gradient(ellipse_at_bottom_right,#0f172a,#090C15)]">
            <div
              className="origin-top transition-transform duration-200 shrink-0"
              style={{ transform: `scale(${zoom})` }}
            >
              <div ref={previewRef} className="shadow-2xl shadow-black/60 printable-resume bg-white">
                <ResumePreview data={resumeData} template={template} />
              </div>
            </div>
          </div>

          {/* Zoom bar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-3 bg-surface/95 backdrop-blur-md px-4 py-2 rounded-full border border-border-default shadow-2xl">
            <button onClick={() => setZoom(z => Math.max(0.3, +(z - 0.05).toFixed(2)))} className="text-content-primary/50 hover:text-content-primary w-6 h-6 flex items-center justify-center text-xl leading-none">−</button>
            <span className="text-content-primary text-xs font-semibold w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, +(z + 0.05).toFixed(2)))} className="text-content-primary/50 hover:text-content-primary w-6 h-6 flex items-center justify-center text-xl leading-none">+</button>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 transition-transform active:scale-95 shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', color:"#ffffff" }}
        onClick={() => setMobilePreview(v => !v)}
      >
        {mobilePreview ? <Edit3 size={22} /> : <Eye size={22} />}
      </button>
    </div>
  );
};

export default ResumeBuilder;
