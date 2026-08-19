import React, { useState } from 'react';
import OrgSidebar from '../components/OrgSidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Link } from 'react-router-dom';
import {
  BookOpen, ChevronRight, Info, Upload, LayoutDashboard,
  Cpu, Filter, BarChart2, Compass, Star, HelpCircle,
  AlertTriangle, Mail, FileText, ChevronDown, ChevronUp
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const sections = [
  {
    id: 'introduction',
    icon: Info,
    color: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/20',
    title: '1. Introduction',
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Overview</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            The <strong>AI Resume Analyzer &amp; Career Recommendation Portal</strong> is an enterprise-grade recruitment platform
            that leverages artificial intelligence to streamline the entire hiring pipeline — from job description creation
            to final candidate selection. It automates resume screening, calculates ATS compatibility scores, extracts skills,
            identifies skill gaps, and surfaces ranked candidate shortlists so recruiters can focus on what matters most:
            making great hires.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Purpose</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            The portal is designed to eliminate manual, time-consuming resume screening by providing:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-content-secondary">
            {[
              'Automated parsing and analysis of large volumes of resumes.',
              'AI-driven match scoring against structured Job Descriptions.',
              'Skill gap identification and candidate-level career recommendations.',
              'An end-to-end recruitment pipeline with Kanban-style pipeline tracking.',
              'Executive dashboards for strategic hiring insights.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'getting-started',
    icon: ChevronRight,
    color: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    title: '2. Getting Started',
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Supported Resume Formats</h3>
          <div className="flex gap-3">
            {['PDF (.pdf)', 'Word Document (.docx)'].map((fmt) => (
              <span key={fmt} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <FileText size={12} /> {fmt}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-content-muted">For best parsing accuracy, ensure resumes are text-based (not scanned images).</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Basic Workflow</h3>
          <ol className="space-y-2">
            {[
              'Log in with your recruiter or organization account.',
              'Create or select a Job Description in JD Studio.',
              'Navigate to the Bulk Dashboard or Upload Wizard.',
              'Upload candidate resumes (PDF or DOCX).',
              'Configure filters — skills, experience, location, education.',
              'Run the AI analysis and review ranked results.',
              'Move shortlisted candidates through the Pipeline Board.',
              'Export or act on finalized candidates.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-content-secondary">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard-overview',
    icon: LayoutDashboard,
    color: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/20',
    title: '3. Dashboard Overview',
    content: (
      <div className="space-y-3">
        {[
          {
            name: 'JD Studio',
            desc: 'Create, manage, and archive Job Descriptions. Define required and preferred skills, set AI matching thresholds, and configure employment details. JDs created here can be reused across multiple analysis sessions.',
          },
          {
            name: 'Bulk Dashboard',
            desc: 'The core analysis hub. Upload multiple resumes simultaneously, select a Job Description source (manual or existing), configure candidate filters (experience, location, education), and run batch AI analysis.',
          },
          {
            name: 'Recruiter Dashboard',
            desc: 'A focused view for day-to-day recruiters. Displays active pipelines, recent analyses, and candidate shortlists with quick-action controls for status updates and outreach.',
          },
          {
            name: 'Executive Dashboard',
            desc: 'High-level analytics and hiring metrics for leadership. Visualizes pipeline health, hiring velocity, domain breakdowns, and skill coverage across all active roles.',
          },
          {
            name: 'Upload Wizard',
            desc: 'A guided, step-by-step resume upload flow. Ideal for single or small-batch uploads where more manual control over job role and analysis parameters is preferred.',
          },
          {
            name: 'Pipeline Board',
            desc: 'A Kanban-style board to move candidates through stages: Screening → Interview → Offer → Hired. Supports drag-and-drop for fast status management.',
          },
          {
            name: 'Screening',
            desc: 'Filters the Pipeline Board to display only candidates in the Screening stage, providing a focused workspace for initial review.',
          },
          {
            name: 'Successful Bucket',
            desc: 'Displays all candidates who have been marked as "Successful" — those who passed evaluation and progressed through the hiring funnel.',
          },
          {
            name: 'Not Successful Bucket',
            desc: 'Archives candidates who were not selected. Useful for maintaining records and revisiting talent pools for future openings.',
          },
        ].map(({ name, desc }) => (
          <div key={name} className="bg-page rounded-xl p-4 border border-border-subtle">
            <p className="text-sm font-bold text-content mb-1">{name}</p>
            <p className="text-sm text-content-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'uploading-resumes',
    icon: Upload,
    color: 'from-sky-500 to-cyan-600',
    shadow: 'shadow-sky-500/20',
    title: '4. Uploading Resumes',
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Supported Formats</h3>
          <ul className="space-y-1.5 text-sm text-content-secondary">
            {['PDF (.pdf) — strongly recommended for consistent formatting.', 'Word Document (.docx) — supported with full text extraction.'].map((f, i) => (
              <li key={i} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />{f}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Tips for Better Resume Parsing</h3>
          <ul className="space-y-1.5 text-sm text-content-secondary">
            {[
              'Use text-based PDFs, not scanned image PDFs. Scanned resumes require OCR and may have lower accuracy.',
              'Avoid complex multi-column layouts or heavy graphics that can confuse the parser.',
              'Ensure section headings (Experience, Education, Skills) are clearly labeled.',
              'List skills explicitly in a dedicated "Skills" section for the best skill-extraction results.',
              'Keep file sizes reasonable — very large files may take longer to process.',
              'Use standard fonts and avoid special characters where possible.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'job-descriptions',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/20',
    title: '5. Working with Job Descriptions',
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Creating or Selecting a Job Description</h3>
          <ul className="space-y-1.5 text-sm text-content-secondary">
            {[
              'Navigate to JD Studio via the sidebar to create a new Job Description.',
              'Fill in the job title, domain, department, required skills, preferred skills, experience level, employment type, and work mode.',
              'Set AI Matching, Selection, and Waiting thresholds to calibrate how strictly candidates are scored.',
              'Save the JD. It will be available for selection in the Bulk Dashboard and Upload Wizard.',
              'In the Bulk Dashboard, toggle "Select Existing JD" to load a saved JD — this auto-populates skills, thresholds, and filters.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-content mb-2">How Job Descriptions Improve Resume Matching</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            A well-structured Job Description is the foundation of accurate AI matching. The AI compares each resume against
            the JD's required skills, experience level, and role context to compute a match percentage. The more detailed and
            accurate the JD, the more precise the candidate ranking. Vague or incomplete JDs will produce lower-confidence scores.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-analysis',
    icon: Cpu,
    color: 'from-rose-500 to-pink-600',
    shadow: 'shadow-rose-500/20',
    title: '6. AI Resume Analysis',
    content: (
      <div className="space-y-3">
        {[
          {
            name: 'Resume Parsing',
            desc: 'The AI engine extracts structured data from raw resume text — name, contact, work experience, education, skills, certifications, and more — regardless of formatting differences.',
          },
          {
            name: 'ATS Score Generation',
            desc: 'An Applicant Tracking System (ATS) compatibility score is calculated for each resume based on keyword alignment, formatting quality, and section completeness relative to the Job Description.',
          },
          {
            name: 'Skill Extraction',
            desc: 'The system automatically identifies both technical and soft skills mentioned in the resume, normalising variations (e.g. "JS" → "JavaScript") for consistent comparison.',
          },
          {
            name: 'Skill Gap Identification',
            desc: 'Required skills listed in the Job Description are compared against extracted resume skills. Any skills present in the JD but absent in the resume are flagged as gaps.',
          },
          {
            name: 'AI Recommendations',
            desc: 'For each candidate, the AI provides personalised recommendations — skills to acquire, certifications to pursue, and areas for professional development to improve their fit for the role.',
          },
          {
            name: 'Career Role Recommendations',
            desc: 'Based on the candidate\'s existing skills and experience profile, the AI suggests alternative or complementary job roles where the candidate may be a strong fit.',
          },
        ].map(({ name, desc }) => (
          <div key={name} className="bg-page rounded-xl p-4 border border-border-subtle">
            <p className="text-sm font-bold text-content mb-1">{name}</p>
            <p className="text-sm text-content-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'candidate-filtering',
    icon: Filter,
    color: 'from-teal-500 to-cyan-600',
    shadow: 'shadow-teal-500/20',
    title: '7. Candidate Filtering',
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Applying Filters</h3>
          <p className="text-sm text-content-secondary leading-relaxed mb-2">
            The Candidate Filters section in the Bulk Dashboard allows you to narrow the candidate pool before analysis:
          </p>
          <ul className="space-y-1.5 text-sm text-content-secondary">
            {[
              'Years of Experience — Set minimum and maximum experience range using dual sliders.',
              'Location — Enter a city or country to filter candidates by geographic preference.',
              'Education Criteria — Select the minimum education level required (e.g. Bachelor\'s, Master\'s, PhD).',
              'Number of Projects Required — AI-extracted requirement for candidate projects.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Selecting the Maximum Number of Resumes</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            Use the "Number of Resumes to Accept (max)" slider to set an upper bound on how many resumes are accepted for
            this analysis session. This is useful for controlling pipeline volume and ensuring manageable shortlists.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Reviewing Shortlisted Candidates</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            After analysis, the results page displays all candidates ranked by AI match score. Shortlisted candidates
            (those meeting the Selection Threshold set in the JD) are highlighted. Use the Recruiter Dashboard or
            Pipeline Board to manage next steps.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'understanding-results',
    icon: BarChart2,
    color: 'from-indigo-500 to-blue-600',
    shadow: 'shadow-indigo-500/20',
    title: '8. Understanding Results',
    content: (
      <div className="space-y-3">
        {[
          {
            name: 'ATS Score',
            desc: 'Measures how well a resume is formatted and keyword-aligned for Applicant Tracking Systems. A higher score indicates the resume is more likely to pass automated pre-screening tools.',
          },
          {
            name: 'Match Percentage',
            desc: 'The overall alignment between the candidate\'s profile and the Job Description, computed by the AI. This considers skills, experience, education, and role-specific factors.',
          },
          {
            name: 'Skills Matched',
            desc: 'A list of required and preferred skills from the JD that were found in the candidate\'s resume. Matched skills are a strong signal of candidate fit.',
          },
          {
            name: 'Missing Skills',
            desc: 'Required or preferred skills from the JD that were not found in the resume. These represent gaps that can inform hiring decisions or training plans.',
          },
          {
            name: 'Recommendations',
            desc: 'AI-generated suggestions for the candidate — skills to learn, certifications to obtain, and areas of improvement specific to the target role.',
          },
          {
            name: 'Candidate Ranking',
            desc: 'All analysed candidates are sorted by match percentage in descending order. Candidates above the Selection Threshold are flagged as recommended hires.',
          },
        ].map(({ name, desc }) => (
          <div key={name} className="flex gap-3 bg-page rounded-xl p-4 border border-border-subtle">
            <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-indigo-500" />
            <div>
              <p className="text-sm font-bold text-content mb-0.5">{name}</p>
              <p className="text-sm text-content-muted leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'career-recommendations',
    icon: Compass,
    color: 'from-fuchsia-500 to-pink-600',
    shadow: 'shadow-fuchsia-500/20',
    title: '9. Career Recommendations',
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Recommended Roles</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            The AI analyses the candidate's existing skill set, experience level, and education to recommend job roles
            where they would be a strong fit — including the target role and alternatives in adjacent domains.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Suggested Skills to Learn</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            Based on the target role's requirements and the candidate's current skill profile, the system identifies
            high-impact skills the candidate should acquire to increase their employability and match score.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-content mb-2">Career Improvement Roadmap</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            The AI generates a structured improvement roadmap for each candidate — outlining certifications to pursue,
            technologies to learn, and experience areas to develop in order to progress toward their target role or
            advance to the next career level.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'best-practices',
    icon: Star,
    color: 'from-yellow-500 to-amber-500',
    shadow: 'shadow-yellow-500/20',
    title: '10. Best Practices',
    content: (
      <div className="space-y-3">
        {[
          {
            title: 'Upload High-Quality Resumes',
            points: [
              'Use text-based PDFs for the most accurate parsing.',
              'Avoid scanned documents or image-only PDFs.',
              'Ensure resumes are up to date and clearly structured.',
            ],
          },
          {
            title: 'Use Complete Job Descriptions',
            points: [
              'Include all required and preferred skills in the JD.',
              'Set realistic AI matching and selection thresholds.',
              'Specify experience level, work mode, and education requirements.',
            ],
          },
          {
            title: 'Review AI Recommendations Before Making Hiring Decisions',
            points: [
              'Treat AI scores as a decision-support tool, not the sole decision-maker.',
              'Always review the candidate\'s full resume alongside AI insights.',
              'Use the Pipeline Board to collaborate and gather team feedback before final decisions.',
            ],
          },
        ].map(({ title, points }) => (
          <div key={title} className="bg-page rounded-xl p-4 border border-border-subtle">
            <p className="text-sm font-bold text-content mb-2">{title}</p>
            <ul className="space-y-1.5">
              {points.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-content-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />{p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'faq',
    icon: HelpCircle,
    color: 'from-blue-500 to-sky-500',
    shadow: 'shadow-blue-500/20',
    title: '11. Frequently Asked Questions (FAQ)',
    content: (
      <div className="space-y-3">
        {[
          {
            q: 'What file formats are supported for resume uploads?',
            a: 'PDF (.pdf) and Word Document (.docx) formats are supported. PDF is recommended for best accuracy.',
          },
          {
            q: 'How many resumes can I upload at once?',
            a: 'Up to 200 resumes can be uploaded per session via the Bulk Dashboard. Use the "Number of Resumes to Accept (max)" slider to set the session limit.',
          },
          {
            q: 'Can I use the portal without a Job Description?',
            a: 'Yes. The "Manual Configuration (Default)" mode in the Bulk Dashboard allows you to run analysis without selecting a saved JD. You can manually specify skills, filters, and paste a job description text directly.',
          },
          {
            q: 'What does the AI Matching Threshold mean?',
            a: 'This is the minimum match percentage a candidate must achieve to be considered a viable match. Candidates scoring above the Selection Threshold are flagged as recommended hires.',
          },
          {
            q: 'Is my data secure?',
            a: 'All uploaded resumes and candidate data are processed securely. Please refer to your organisation\'s data policy and the platform\'s privacy documentation for detailed information.',
          },
          {
            q: 'Can I export the analysis results?',
            a: 'Export functionality is available on the results and report pages. Supported formats may include PDF reports and Excel exports depending on your account configuration.',
          },
          {
            q: 'How do I archive a Job Description?',
            a: 'In JD Studio, open the JD card and use the Archive action. Archived JDs are hidden from the active list but can be viewed in the Archived tab.',
          },
        ].map(({ q, a }, i) => (
          <div key={i} className="bg-page rounded-xl p-4 border border-border-subtle">
            <p className="text-sm font-bold text-content mb-1.5">Q: {q}</p>
            <p className="text-sm text-content-muted leading-relaxed"><span className="font-semibold text-blue-600">A:</span> {a}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'troubleshooting',
    icon: AlertTriangle,
    color: 'from-red-500 to-rose-600',
    shadow: 'shadow-red-500/20',
    title: '12. Troubleshooting',
    content: (
      <div className="space-y-3">
        {[
          {
            issue: 'Resume not parsing correctly',
            fix: 'Ensure the file is a text-based PDF or DOCX, not a scanned image. Try re-saving the PDF from a word processor.',
          },
          {
            issue: '"Failed to load Job Descriptions" error',
            fix: 'The backend server may not be running. Ensure both the FastAPI backend (port 8000) and the Vite frontend (port 5173) are active. Refresh the page after confirming both services are running.',
          },
          {
            issue: 'Low or zero match percentage for all candidates',
            fix: 'Review your Job Description — ensure required skills are populated. Also verify that the uploaded resumes are text-readable and contain relevant skill keywords.',
          },
          {
            issue: 'Analysis is taking too long',
            fix: 'Large batches of complex resumes can take more time to process. Reduce the batch size or wait for the analysis to complete. Check the Processing screen for per-resume progress.',
          },
          {
            issue: 'Cannot log in to the portal',
            fix: 'Verify your credentials with your administrator. If using demo credentials, use recruiter@rocas.ai / recruiter123 or student@rocas.ai / student123. Clear browser cache and retry if the problem persists.',
          },
          {
            issue: 'Page is blank or shows a loading spinner indefinitely',
            fix: 'This usually indicates the backend is unreachable. Check that the backend server is running. If the frontend proxy is misconfigured, verify the Vite configuration targets 127.0.0.1:8000.',
          },
          {
            issue: 'Sidebar items are missing or navigation does not work',
            fix: 'Ensure you are logged in with a recruiter, organization, admin, or executive account. Some pages are restricted by role.',
          },
        ].map(({ issue, fix }, i) => (
          <div key={i} className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="text-sm font-bold text-content mb-1.5">⚠ {issue}</p>
            <p className="text-sm text-content-secondary leading-relaxed">{fix}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'contact',
    icon: Mail,
    color: 'from-slate-500 to-slate-700',
    shadow: 'shadow-slate-500/20',
    title: '13. Contact & Support',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-page rounded-xl p-4 border border-border-subtle">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1.5">Support Email</p>
            <p className="text-sm font-semibold text-blue-600">support@rocas.ai</p>
            <p className="text-xs text-content-muted mt-1">Placeholder — update with your support email address.</p>
          </div>
          <div className="bg-page rounded-xl p-4 border border-border-subtle">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1.5">Documentation Version</p>
            <p className="text-sm font-semibold text-content-secondary">v1.0.0</p>
            <p className="text-xs text-content-muted mt-1">Last updated: 2026. Subject to change with product updates.</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-700 leading-relaxed">
            For enterprise support, feature requests, or onboarding assistance, please contact your designated account
            manager or reach out via the support email above. Include your organisation name, user role, and a detailed
            description of the issue for the fastest response.
          </p>
        </div>
      </div>
    ),
  },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────

const SectionCard = ({ section }) => {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-page transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-md ${section.shadow} flex-shrink-0`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className="flex-1 text-base font-bold text-content">{section.title}</span>
        {open
          ? <ChevronUp size={16} className="text-content-muted flex-shrink-0" />
          : <ChevronDown size={16} className="text-content-muted flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-6 pt-0 border-t border-border-subtle">
          <div className="pt-4">{section.content}</div>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const UserManualPage = () => {
  return (
    <div className="flex min-h-screen font-sans" >
      <div className="hidden md:block"><OrgSidebar /></div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-border-default/80 px-8 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-content-muted mb-1">
              <span>Portal</span><span>›</span>
              <span className="text-blue-600 font-medium">User Manual</span>
            </div>
            <h1 className="text-2xl font-black text-content tracking-tight">User Manual</h1>
            <p className="text-sm text-content-muted mt-0.5">AI Resume Analyzer &amp; Career Recommendation Portal — Reference Documentation</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
            <BookOpen size={14} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-600">v1.0.0</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-4">

            {/* Intro Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 mb-2">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen size={22} />
                <h2 className="text-lg font-black">AI Resume Analyzer &amp; Career Recommendation Portal</h2>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                This manual provides a comprehensive guide to using the platform. Click any section below to expand it.
                Use the sidebar to navigate back to the portal at any time.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-content-muted mb-3">Table of Contents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="flex items-center gap-2 text-sm text-content-muted hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-blue-50"
                  >
                    <ChevronRight size={13} className="text-blue-400 flex-shrink-0" />
                    {s.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Sections */}
            {sections.map((section) => (
              <div key={section.id} id={section.id}>
                <SectionCard section={section} />
              </div>
            ))}

          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManualPage;
