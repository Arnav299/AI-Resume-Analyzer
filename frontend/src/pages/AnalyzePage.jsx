import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ── Constants ────────────────────────────────────────────────────────────────
const PREDEFINED_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "React Developer", "Java Developer", "Python Developer",
  "Data Analyst", "Data Scientist", "UI/UX Designer",
  "DevOps Engineer", "Mobile App Developer", "QA Engineer"
];

// ── Gemini Analysis Prompt ─────────────────────────────────────────────────
const buildPrompt = (role) => `
You are an expert career coach and resume analyst. Carefully and thoroughly analyze the resume in the attached PDF document for the target role: "${role}".

IMPORTANT: Ground your analysis strictly in the actual experience, skills, and projects found in this specific PDF document. Do not include generic industry recommendations. If the candidate is missing key skills or experience, list them clearly as weaknesses/improvements.

Return ONLY a valid JSON object (no markdown code fences, no explanation text, just raw JSON) with this exact structure:
{
  "score": <integer 0-100 representing overall career readiness for the target role>,
  "candidate_name": "<full name from resume, or 'Candidate' if not found>",
  "experience_level": "<one of: Entry Level | Mid Level | Senior Level>",
  "current_role": "<current or most recent job title from resume>",
  "summary": "<2-3 sentence professional assessment of the candidate's fit for ${role}>",
  "matched_skills": ["python", "react", "git", "sql"],
  "missing_skills": ["docker", "aws", "typescript"],
  "recommendations": [
    {
      "icon": "<single relevant emoji>",
      "title": "<short action title>",
      "desc": "<specific, actionable recommendation in 1-2 sentences>",
      "priority": "<High | Medium | Low>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>"]
}

Guidelines:
- score: Base on skill match, experience relevance, and overall resume quality
- matched_skills: Extract AT LEAST 4-10 technical skills present in the resume that match the role. Do not leave this empty!
- missing_skills: Identify 3-8 critical technical skills for the role that are missing.
- recommendations: Provide 3-5 concrete, actionable recommendations
- strengths: 3-5 key strengths observed in the resume
- improvements: 3-5 specific areas to improve
`;

// ── File to Base64 ─────────────────────────────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });

// ── Score Ring Component ───────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto animate-bounce-in">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={radius} fill="none"
          stroke="url(#neonGrad)" strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-bar"
        />
        <defs>
          <linearGradient id="neonGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black neon-text">{score}</span>
        <span className="text-xs font-medium mt-1" style={{ color: 'var(--theme-text-secondary)' }}>out of 100</span>
      </div>
    </div>
  );
};

// ── Loading Spinner ────────────────────────────────────────────────────────
const LoadingDots = ({ text }) => (
  <div className="flex flex-col items-center gap-6">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow"
        style={{ borderTopColor: '#6C63FF', borderRightColor: '#00D4FF' }} />
      <div className="absolute inset-3 rounded-full border-2 border-transparent"
        style={{ borderBottomColor: '#6C63FF', animation: 'spin 4s linear infinite reverse' }} />
      <div className="absolute inset-0 flex items-center justify-center text-3xl animate-float">🤖</div>
    </div>
    <div>
      <p className="text-content font-semibold text-lg text-center">{text}</p>
      <div className="flex justify-center gap-1 mt-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-purple-400"
            style={{ animation: `float 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  </div>
);

// ── AnalyzePage ────────────────────────────────────────────────────────────
const AnalyzePage = () => {
  const [step, setStep] = useState('upload'); // upload | analyzing | results
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [targetRoles, setTargetRoles] = useState([]);
  
  const toggleTargetRole = (role) => {
    setTargetRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const [apiKey, setApiKey] = useState(
    localStorage.getItem('gemini_api_key') ||
    (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY : '') || ''
  );
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [analyzeStage, setAnalyzeStage] = useState('Reading your resume...');
  const fileInputRef = useRef(null);

  // ── File Handling ──────────────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setError('');
    setFile(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // ── Analysis ───────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file || targetRoles.length === 0) {
      setError('Please select a resume file and at least one target role.');
      return;
    }
    if (!apiKey.trim()) {
      setShowKeyInput(true);
      setError('Please enter your Gemini API key to proceed.');
      return;
    }

    setError('');
    setStep('analyzing');

    const stages = [
      'Reading your resume...',
      'Extracting skills and experience...',
      'Comparing with role requirements...',
      'Generating recommendations...',
      'Finalizing your report...',
    ];
    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setAnalyzeStage(stages[stageIdx]);
    }, 2000);

    try {
      // Save key for convenience
      localStorage.setItem('gemini_api_key', apiKey.trim());

      // Read PDF as base64
      const base64 = await fileToBase64(file);

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: 'application/pdf', data: base64 } },
                { text: buildPrompt(targetRoles.join(', ')) }
              ]
            }],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.3,
            }
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini.');

      // Parse JSON (Gemini may sometimes wrap it)
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error('Could not parse AI response as JSON.');
      }

      setResults(parsed);
      setStep('results');
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
      setStep('upload');
    } finally {
      clearInterval(stageInterval);
    }
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setResults(null);
    setError('');
    setTargetRoles([]);
  };

  // ── Score Color ────────────────────────────────────────────────────────
  const scoreLabel = results
    ? results.score >= 80 ? { text: 'Excellent Match', color: '#10B981' }
      : results.score >= 60 ? { text: 'Good Match', color: '#6C63FF' }
        : results.score >= 40 ? { text: 'Fair Match', color: '#F59E0B' }
          : { text: 'Needs Work', color: '#EF4444' }
    : null;

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute -top-40 -left-40 w-96 h-96 glow-orb"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.35) 0%, transparent 70%)' }} />
        <div className="blob blob-delay-2 absolute top-1/2 -right-40 w-80 h-80 glow-orb"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.25) 0%, transparent 70%)' }} />
        <div className="blob blob-delay-4 absolute -bottom-20 left-1/3 w-72 h-72 glow-orb"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>R</div>
          <span className="font-bold text-content hidden sm:block opacity-90 group-hover:opacity-100 transition-opacity">
            AI Resume Analyzer
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs font-medium px-4 py-2 rounded-xl transition-all"
            style={{ background: 'var(--theme-border-subtle)', color: 'var(--theme-text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            🔑 API Key
          </button>
          <Link to="/"
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={{ color: 'var(--theme-text-secondary)' }}>
            ← Back
          </Link>
        </div>
      </nav>

      {/* API Key Modal */}
      {showKeyInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-surface border border-border-subtle rounded-3xl p-8 max-w-md w-full animate-slide-up"
            style={{ boxShadow: '0 0 60px rgba(108,99,255,0.2)' }}>
            <h3 className="text-content font-bold text-xl mb-2">🔑 Gemini API Key</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--theme-text-secondary)' }}>
              Required to analyze resumes with AI. Get a free key from{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                className="text-purple-400 underline">Google AI Studio</a>.
              Your key is stored locally only.
            </p>
            <input
              type="password"
              className="bg-page border border-border-default text-content rounded-xl px-4 py-2 w-full focus:border-primary outline-none transition-colors mb-4"
              placeholder="Paste your Gemini API key here..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (apiKey.trim()) localStorage.setItem('gemini_api_key', apiKey.trim());
                  setShowKeyInput(false);
                  setError('');
                }}
                className="btn-primary flex-1"
              >Save Key</button>
              <button
                onClick={() => setShowKeyInput(false)}
                className="btn-secondary flex-1"
                style={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border-default)' }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        {/* ── UPLOAD STEP ─────────────────────────────────────────── */}
        {step === 'upload' && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
                style={{ background: 'rgba(108,99,255,0.15)', color: '#A5A0FF', border: '1px solid rgba(108,99,255,0.3)' }}>
                🤖 Powered by Gemini 1.5 Flash
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-content mb-4 leading-tight">
                Analyze Your <span className="neon-text">Resume</span><br />
                with AI Intelligence
              </h1>
              <p className="text-lg" style={{ color: 'var(--theme-text-secondary)' }}>
                Upload your PDF resume, choose a target role, and get a detailed AI-powered career analysis in seconds.
              </p>
            </div>

            {/* Upload Card */}
            <div className="bg-surface border border-border-subtle rounded-3xl p-8 mb-6"
              style={{ boxShadow: '0 0 60px rgba(108,99,255,0.08)' }}>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer rounded-2xl p-10 text-center transition-all duration-300 mb-6"
                style={{
                  border: `2px dashed ${dragging ? '#6C63FF' : file ? '#10B981' : 'var(--theme-border-default)'}`,
                  background: dragging
                    ? 'rgba(108,99,255,0.1)'
                    : file
                      ? 'rgba(16,185,129,0.06)'
                      : 'var(--theme-surface-hover)',
                  transform: dragging ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-4 animate-bounce-in">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                      style={{ background: 'rgba(16,185,129,0.15)' }}>📄</div>
                    <div>
                      <p className="font-bold text-content text-lg">{file.name}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        {(file.size / 1024).toFixed(1)} KB · PDF
                      </p>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', borderColor: 'rgba(16,185,129,0.3)' }}>
                      ✓ Ready to analyze
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-sm font-medium transition-colors"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >Remove file ×</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl animate-float"
                      style={{ background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.2)' }}>
                      {dragging ? '⬇️' : '📂'}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-content">
                        {dragging ? 'Drop it here!' : 'Drop your resume here'}
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        or click to browse · PDF only · Max 10MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'rgba(108,99,255,0.2)', color: '#A5A0FF', border: '1px solid rgba(108,99,255,0.3)' }}
                    >
                      Browse Files
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>

              {/* Target Roles */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-content mb-0">🎯 Select Target Job Roles *</label>
                  <div className="flex gap-2">
                    <button onClick={() => setTargetRoles(PREDEFINED_ROLES)} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Select All</button>
                    <button onClick={() => setTargetRoles([])} className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">Clear All</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_ROLES.map(role => (
                    <button key={role} onClick={() => toggleTargetRole(role)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${targetRoles.includes(role) ? 'bg-gradient-to-r from-purple-500 to-blue-400 text-content shadow-[0_0_10px_rgba(108,99,255,0.5)] border-transparent' : 'bg-surface/5 text-content-muted border border-white/10 hover:bg-surface/10'}`}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Quick Set */}
              <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
                style={{ background: apiKey ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${apiKey ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                <span className="text-xl">{apiKey ? '✅' : '⚠️'}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: apiKey ? '#34D399' : '#FCD34D' }}>
                    {apiKey ? 'Gemini API Key Configured' : 'Gemini API Key Required'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                    Get a free key from{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                      className="underline" style={{ color: '#A5A0FF' }}>Google AI Studio</a>
                  </p>
                </div>
                <button onClick={() => setShowKeyInput(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(108,99,255,0.25)', color: '#A5A0FF' }}>
                  {apiKey ? 'Change Key' : 'Add Key'}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span className="text-xl">❌</span>
                  <p className="text-sm font-medium" style={{ color: '#F87171' }}>{error}</p>
                </div>
              )}

              {/* Analyze Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || targetRoles.length === 0}
                  className="btn-primary flex-1 text-lg py-4"
                >
                  🚀 Analyze with AI
                </button>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {['✓ Career Readiness Score', '✓ Skill Gap Analysis', '✓ AI Recommendations', '✓ No signup required'].map(f => (
                <span key={f} className="text-xs font-medium px-4 py-2 rounded-full"
                  style={{ background: 'var(--theme-surface-hover)', color: 'var(--theme-text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYZING STEP ──────────────────────────────────────── */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="bg-surface border border-border-subtle rounded-3xl p-12 text-center max-w-md w-full"
              style={{ boxShadow: '0 0 80px rgba(108,99,255,0.15)' }}>
              <LoadingDots text={analyzeStage} />
              <p className="text-xs mt-8" style={{ color: 'var(--theme-text-muted)' }}>
                Analyzing <strong style={{ color: 'var(--theme-text-secondary)' }}>{file?.name}</strong> for <strong style={{ color: '#A5A0FF' }}>{targetRoles.join(', ')}</strong>
              </p>
            </div>
          </div>
        )}

        {/* ── RESULTS STEP ────────────────────────────────────────── */}
        {step === 'results' && results && (
          <div className="animate-fade-in">
            {/* Results Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-semibold"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>
                ✅ Analysis Complete
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-content mb-2">
                Your Resume Analysis
              </h1>
              <p style={{ color: 'var(--theme-text-secondary)' }}>
                For <span className="font-semibold" style={{ color: '#A5A0FF' }}>{targetRoles.join(', ')}</span>
                {results.candidate_name !== 'Candidate' && (
                  <> · <span className="font-semibold text-content">{results.candidate_name}</span></>
                )}
              </p>
            </div>

            {/* Score + Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Score Card */}
              <div className="bg-surface border border-border-subtle rounded-3xl p-8 text-center md:col-span-1"
                style={{ boxShadow: '0 0 60px rgba(108,99,255,0.1)' }}>
                <p className="text-sm font-semibold mb-6 uppercase tracking-widest"
                  style={{ color: 'var(--theme-text-muted)' }}>Career Readiness</p>
                <ScoreRing score={results.score} />
                <div className="mt-6 inline-flex px-4 py-2 rounded-full text-sm font-bold"
                  style={{
                    background: `rgba(${results.score >= 75 ? '16,185,129' : results.score >= 50 ? '108,99,255' : '245,158,11'}, 0.15)`,
                    color: scoreLabel?.color
                  }}>
                  {scoreLabel?.text}
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-surface border border-border-subtle rounded-3xl p-8 md:col-span-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: 'rgba(108,99,255,0.15)' }}>👤</div>
                  <div>
                    <h3 className="text-xl font-bold text-content">{results.candidate_name}</h3>
                    <p style={{ color: 'var(--theme-text-secondary)' }} className="text-sm mt-0.5">
                      {results.current_role || 'Professional'}
                    </p>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold mt-2 inline-block">{results.experience_level}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                  {results.summary}
                </p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    { label: 'Matched', value: results.matched_skills?.length || 0, color: '#34D399' },
                    { label: 'Missing', value: results.missing_skills?.length || 0, color: '#F87171' },
                    { label: 'Score', value: `${results.score}%`, color: '#A5A0FF' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-3 text-center"
                      style={{ background: 'var(--theme-surface-hover)' }}>
                      <p className="text-2xl font-black" style={{ color }}>{value}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Matched Skills */}
              <div className="bg-surface border border-border-subtle rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">✅</span>
                  <h3 className="font-bold text-content">Matched Skills</h3>
                  <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>
                    {results.matched_skills?.length || 0} skills
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(results.matched_skills || []).map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-surface border border-border-subtle rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">🎯</span>
                  <h3 className="font-bold text-content">Skills to Acquire</h3>
                  <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171' }}>
                    {results.missing_skills?.length || 0} gaps
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(results.missing_skills || []).map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-surface border border-border-subtle rounded-3xl p-6 mb-6">
              <h3 className="font-bold text-content text-lg mb-5 flex items-center gap-2">
                💡 AI Recommendations
              </h3>
              <div className="space-y-4">
                {(results.recommendations || []).map((rec, i) => {
                  const priorityStyle = rec.priority === 'High'
                    ? { bg: 'rgba(239,68,68,0.12)', color: '#F87171', border: 'rgba(239,68,68,0.25)' }
                    : rec.priority === 'Medium'
                      ? { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: 'rgba(245,158,11,0.25)' }
                      : { bg: 'rgba(16,185,129,0.12)', color: '#34D399', border: 'rgba(16,185,129,0.25)' };
                  return (
                    <div key={i}
                      className="flex gap-4 p-4 rounded-xl transition-all animate-slide-right"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${i * 0.1}s` }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: 'rgba(108,99,255,0.12)' }}>
                        {rec.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className="font-semibold text-content text-sm">{rec.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: priorityStyle.bg, color: priorityStyle.color, border: `1px solid ${priorityStyle.border}` }}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                          {rec.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-surface border border-border-subtle rounded-3xl p-6">
                <h3 className="font-bold text-content mb-4 flex items-center gap-2">💪 Strengths</h3>
                <ul className="space-y-3">
                  {(results.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm animate-fade-in"
                      style={{ color: 'var(--theme-text-secondary)', animationDelay: `${i * 0.1}s` }}>
                      <span className="text-green-400 mt-0.5 flex-shrink-0">●</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface border border-border-subtle rounded-3xl p-6">
                <h3 className="font-bold text-content mb-4 flex items-center gap-2">📈 Areas to Improve</h3>
                <ul className="space-y-3">
                  {(results.improvements || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm animate-fade-in"
                      style={{ color: 'var(--theme-text-secondary)', animationDelay: `${i * 0.1}s` }}>
                      <span className="text-purple-400 mt-0.5 flex-shrink-0">●</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={reset} className="btn-primary flex-1 py-4">
                🔄 Analyze Another Resume
              </button>
              <Link to="/" className="flex-1">
                <button className="w-full py-4 rounded-2xl font-semibold text-sm transition-all border border-border-default hover:bg-surface-hover"
                  style={{ background: 'var(--theme-border-subtle)', color: 'var(--theme-text-secondary)' }}>
                  ← Back to Home
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyzePage;
