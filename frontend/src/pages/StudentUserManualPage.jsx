import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// ── Accordion Item ────────────────────────────────────────────────────────────
const AccordionItem = ({ icon, title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-bold text-textDark text-sm md:text-base">{title}</span>
        </div>
        <span
          className={`text-content-muted transition-transform duration-300 text-lg ${open ? 'rotate-180' : 'rotate-0'}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-border-subtle pt-4 text-sm text-content-secondary leading-relaxed space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

// ── Info Card ─────────────────────────────────────────────────────────────────
const InfoCard = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
    <span className="text-2xl flex-shrink-0">{icon}</span>
    <div>
      <p className="font-semibold text-textDark text-sm">{title}</p>
      {desc && <p className="text-xs text-content-muted mt-0.5 leading-relaxed">{desc}</p>}
    </div>
  </div>
);

// ── Step Item ─────────────────────────────────────────────────────────────────
const Step = ({ num, text }) => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {num}
    </span>
    <span className="text-sm text-content-secondary leading-relaxed">{text}</span>
  </li>
);

// ── Bullet Item ───────────────────────────────────────────────────────────────
const Bullet = ({ text }) => (
  <li className="flex items-start gap-2 text-sm text-content-secondary">
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
    {text}
  </li>
);

// ── FAQ Item ──────────────────────────────────────────────────────────────────
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-page hover:bg-blue-50 transition-colors"
      >
        <span className="text-sm font-semibold text-textDark">{q}</span>
        <span className={`text-content-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-5 py-4 text-sm text-content-secondary leading-relaxed bg-surface">
          {a}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudentUserManualPage = () => {
  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ── Page Header ── */}
            <div>
              <h1 className="text-3xl font-bold text-textDark">📖 User Manual</h1>
              <p className="text-content-muted mt-1">Everything you need to know to get the most out of your AI Career Portal.</p>
            </div>

            {/* ── Quick Nav ── */}
            <div className="card shadow-sm p-5">
              <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">Sections</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Introduction', 'Getting Started', 'Dashboard Overview',
                  'Uploading Resumes', 'Resume Analysis', 'ATS Score',
                  'Career Recommendations', 'Improvement Suggestions',
                  'Best Practices', 'FAQ', 'Troubleshooting', 'Contact & Support',
                ].map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-blue-50 text-primary rounded-full text-xs font-medium border border-blue-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* ── 1. Introduction ── */}
            <AccordionItem icon="ℹ️" title="1. Introduction">
              <p>
                The <strong>AI Resume Analyzer &amp; Career Recommendation Portal</strong> is an intelligent platform
                designed to help students and job seekers evaluate their resumes, understand their career readiness,
                and get actionable AI-driven recommendations to land their dream role.
              </p>
              <p>
                The portal automates resume analysis, calculates ATS (Applicant Tracking System) compatibility scores,
                identifies skill gaps, and provides personalized learning paths and career recommendations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <InfoCard icon="🤖" title="AI-Powered Analysis" desc="Instant resume scoring against real job roles." />
                <InfoCard icon="🎯" title="Career Guidance" desc="Personalized recommendations based on your profile." />
                <InfoCard icon="📈" title="Progress Tracking" desc="Monitor your improvement over multiple analyses." />
                <InfoCard icon="🗺️" title="Learning Paths" desc="Curated courses to close skill gaps faster." />
              </div>
            </AccordionItem>

            {/* ── 2. Getting Started ── */}
            <AccordionItem icon="🚀" title="2. Getting Started">
              <p>Follow these steps to start using the portal:</p>
              <ol className="space-y-2 mt-2">
                <Step num={1} text="Register for a free account at the Register page, selecting 'Student' as your role." />
                <Step num={2} text="Log in with your email and password via the Student Login page." />
                <Step num={3} text="Complete your profile by navigating to My Profile in the sidebar." />
                <Step num={4} text="Upload your first resume using the Upload Resume option." />
                <Step num={5} text="Select a target career role and run your first analysis." />
                <Step num={6} text="Review your ATS score, skill gaps, and AI recommendations." />
              </ol>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
                💡 <strong>Tip:</strong> Use a text-based PDF resume (not a scanned image) for the most accurate parsing results.
              </div>
            </AccordionItem>

            {/* ── 3. Dashboard Overview ── */}
            <AccordionItem icon="🏠" title="3. Dashboard Overview">
              <p>Your Student Dashboard gives you a central view of your career readiness at a glance.</p>
              <ul className="space-y-2 mt-2">
                <Bullet text="Profile Card — Displays your name, email, total resumes uploaded, and latest ATS score." />
                <Bullet text="ATS Score Trend — A bar chart showing how your scores have improved over multiple analyses." />
                <Bullet text="Stat Cards — Quick stats: Total Resumes, Latest Score, Target Role, Analyses Done." />
                <Bullet text="Quick Actions — One-click shortcuts to Upload Resume, View Analysis, Career Roles, and Feedback." />
                <Bullet text="Recent Analyses Table — Full history of all your past analyses with scores and actions." />
                <Bullet text="Career Readiness Tips — Rotating tips to help improve your resume and job applications." />
              </ul>
            </AccordionItem>

            {/* ── 4. Uploading Resumes ── */}
            <AccordionItem icon="📤" title="4. Uploading Resumes">
              <p>Navigate to <strong>Upload Resume</strong> in the sidebar to add your resume.</p>
              <ol className="space-y-2 mt-2">
                <Step num={1} text="Click 'Upload Resume' or drag-and-drop your file onto the upload area." />
                <Step num={2} text="Supported formats: PDF (.pdf) and Word Documents (.docx)." />
                <Step num={3} text="Maximum file size: 10 MB." />
                <Step num={4} text="Once uploaded, the system automatically extracts and parses your resume content." />
                <Step num={5} text="You can upload multiple resumes and keep a full history." />
              </ol>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {[
                  { icon: '✅', label: 'PDF', sub: 'Best accuracy' },
                  { icon: '✅', label: 'DOCX', sub: 'Fully supported' },
                  { icon: '❌', label: 'Scanned images', sub: 'Avoid for best results' },
                ].map((f) => (
                  <div key={f.label} className="p-3 bg-page rounded-xl text-center border border-border-subtle">
                    <p className="text-xl mb-1">{f.icon}</p>
                    <p className="text-xs font-bold text-textDark">{f.label}</p>
                    <p className="text-xs text-content-muted">{f.sub}</p>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* ── 5. Resume Analysis ── */}
            <AccordionItem icon="📊" title="5. Resume Analysis">
              <p>After uploading your resume, run an analysis to get detailed AI-powered insights.</p>
              <ol className="space-y-2 mt-2">
                <Step num={1} text="Select your uploaded resume from the list." />
                <Step num={2} text="Choose a target career role (e.g., Software Engineer, Data Analyst)." />
                <Step num={3} text="Click 'Analyze' — the AI engine will process your resume against the selected role." />
                <Step num={4} text="View your full analysis report including matched skills, missing skills, and score breakdown." />
              </ol>
              <p className="mt-2">The analysis report includes:</p>
              <ul className="space-y-1 mt-1">
                <Bullet text="Overall readiness score (0–100)" />
                <Bullet text="Skills matched vs. required" />
                <Bullet text="Skill gap identification" />
                <Bullet text="Resume improvement suggestions" />
                <Bullet text="AI-generated career recommendations" />
              </ul>
            </AccordionItem>

            {/* ── 6. ATS Score ── */}
            <AccordionItem icon="🏆" title="6. ATS Score">
              <p>
                The <strong>ATS (Applicant Tracking System) Score</strong> represents how well your resume aligns with
                the requirements of a specific job role. Most companies use ATS software to filter resumes automatically.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {[
                  { range: '80–100', label: 'Excellent', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: '🟢' },
                  { range: '60–79', label: 'Good', color: 'bg-blue-50 border-blue-200 text-blue-700', icon: '🔵' },
                  { range: '0–59', label: 'Needs Work', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: '🟡' },
                ].map((s) => (
                  <div key={s.range} className={`p-4 rounded-xl border text-center ${s.color}`}>
                    <p className="text-2xl mb-1">{s.icon}</p>
                    <p className="font-bold text-sm">{s.range}</p>
                    <p className="text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3">
                A higher ATS score means your resume is more likely to pass automated screening and reach a human recruiter.
                Aim for a score of <strong>80+</strong> for competitive roles.
              </p>
            </AccordionItem>

            {/* ── 7. Career Recommendations ── */}
            <AccordionItem icon="🎯" title="7. Career Recommendations">
              <p>
                Navigate to <strong>AI Recommendations</strong> in the sidebar to see personalized suggestions based on your
                resume content and target role.
              </p>
              <ul className="space-y-2 mt-2">
                <Bullet text="Role fit recommendations — which roles best match your current skills." />
                <Bullet text="Skill priority list — which skills to develop first for maximum impact." />
                <Bullet text="Course and resource suggestions — curated learning resources for each skill gap." />
                <Bullet text="Career path guidance — short-term and long-term roadmaps for your chosen field." />
              </ul>
            </AccordionItem>

            {/* ── 8. Resume Improvement Suggestions ── */}
            <AccordionItem icon="✍️" title="8. Resume Improvement Suggestions">
              <p>The AI provides specific suggestions to strengthen your resume for your target role:</p>
              <ul className="space-y-2 mt-2">
                <Bullet text="Add missing keywords that ATS systems scan for." />
                <Bullet text="Quantify achievements with numbers (e.g., 'Improved performance by 30%')." />
                <Bullet text="Use action verbs to start bullet points (e.g., Built, Designed, Led)." />
                <Bullet text="Tailor the summary/objective section for each specific role." />
                <Bullet text="Include relevant certifications, projects, and GitHub/portfolio links." />
                <Bullet text="Keep formatting clean — avoid tables, columns, or embedded images in ATS-targeted resumes." />
              </ul>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-primary font-medium">
                📝 Use the <strong>Resume Builder</strong> tool to apply suggestions and rebuild your resume directly in the portal.
              </div>
            </AccordionItem>

            {/* ── 9. Best Practices ── */}
            <AccordionItem icon="⭐" title="9. Best Practices">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🎯', title: 'Tailor Every Resume', desc: 'Customize your resume for each job application. One-size-fits-all resumes rarely pass ATS filters.' },
                  { icon: '📏', title: 'Keep It Concise', desc: 'Aim for 1 page (freshers) or 2 pages max. Remove outdated or irrelevant experience.' },
                  { icon: '🔑', title: 'Use Job Keywords', desc: 'Mirror the exact language from the job description — tools like ours identify these automatically.' },
                  { icon: '📈', title: 'Quantify Results', desc: 'Replace vague statements with measurable outcomes to stand out from the competition.' },
                  { icon: '🔄', title: 'Re-analyze Regularly', desc: 'Upload updated resumes and re-run analysis to track improvement over time.' },
                  { icon: '🤝', title: 'Get Mentor Feedback', desc: 'Use the Mentor Review and Feedback features for expert human review of your resume.' },
                ].map((b) => (
                  <div key={b.title} className="flex items-start gap-3 p-4 bg-page rounded-xl border border-border-subtle">
                    <span className="text-2xl flex-shrink-0">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-textDark text-sm">{b.title}</p>
                      <p className="text-xs text-content-muted mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* ── 10. FAQ ── */}
            <AccordionItem icon="❓" title="10. Frequently Asked Questions (FAQ)">
              <div className="space-y-2">
                <FAQItem
                  q="How many resumes can I upload?"
                  a="There is no hard limit. You can upload multiple resumes and maintain a full history of all your past analyses."
                />
                <FAQItem
                  q="What file formats are supported?"
                  a="We support PDF (.pdf) and Word Document (.docx) formats. Text-based PDFs provide the best accuracy."
                />
                <FAQItem
                  q="How is the ATS score calculated?"
                  a="The ATS score is calculated by comparing your resume's skills, experience, and keywords against the requirements of your selected target career role using our AI scoring engine."
                />
                <FAQItem
                  q="Can I analyze the same resume against multiple roles?"
                  a="Yes. You can run multiple analyses on the same resume by selecting different target roles each time."
                />
                <FAQItem
                  q="Is my resume data private and secure?"
                  a="Yes. Your resume data is stored securely and is only accessible to you. We do not share your personal data with third parties."
                />
                <FAQItem
                  q="How do I improve my score quickly?"
                  a="Follow the AI improvement suggestions in your analysis report, focus on the top skill gaps identified, and use the Learning Path section for targeted upskilling."
                />
                <FAQItem
                  q="What is the Resume Builder?"
                  a="The Resume Builder is a tool that lets you create or edit a professional resume directly in the portal and export it as a PDF."
                />
              </div>
            </AccordionItem>

            {/* ── 11. Troubleshooting ── */}
            <AccordionItem icon="🔧" title="11. Troubleshooting">
              <div className="space-y-3">
                {[
                  {
                    problem: 'Upload fails or shows an error',
                    solutions: [
                      'Check that your file is PDF or DOCX format.',
                      'Ensure the file is under 10 MB.',
                      'Make sure the backend server is running on port 8000.',
                    ],
                  },
                  {
                    problem: 'Analysis takes too long or times out',
                    solutions: [
                      'Large resumes may take longer to process — please wait up to 2 minutes.',
                      'Refresh the page and check your History for completed analyses.',
                      'If the issue persists, try re-uploading a smaller or simplified resume.',
                    ],
                  },
                  {
                    problem: 'Dashboard shows no data',
                    solutions: [
                      'Complete your profile first under My Profile.',
                      'Upload and analyze at least one resume.',
                      'Ensure you are logged in as a Student (not a Recruiter).',
                    ],
                  },
                  {
                    problem: 'Login fails or "Backend is offline" warning appears',
                    solutions: [
                      'Ensure the FastAPI backend is running: cd backend && uvicorn app.main:app --reload --port 8000',
                      'Check that no other process is using port 8000.',
                      'Verify your email and password are correct.',
                    ],
                  },
                ].map((item) => (
                  <div key={item.problem} className="p-4 bg-page rounded-xl border border-border-subtle">
                    <p className="font-semibold text-textDark text-sm mb-2">⚠️ {item.problem}</p>
                    <ul className="space-y-1">
                      {item.solutions.map((s, i) => <Bullet key={i} text={s} />)}
                    </ul>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* ── 12. Contact & Support ── */}
            <AccordionItem icon="📞" title="12. Contact & Support">
              <p>If you need further assistance, the following support options are available:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <InfoCard
                  icon="💬"
                  title="Mentor Feedback"
                  desc="Use the Feedback section to request a review from a mentor. Available from the sidebar."
                />
                <InfoCard
                  icon="📧"
                  title="Email Support"
                  desc="Contact the support team via the email provided by your institution or organization administrator."
                />
                <InfoCard
                  icon="📖"
                  title="This Manual"
                  desc="Refer back to this User Manual at any time from the sidebar navigation."
                />
                <InfoCard
                  icon="🐞"
                  title="Report a Bug"
                  desc="If you encounter a technical issue, please report it to your system administrator with steps to reproduce."
                />
              </div>
              <div className="mt-4 p-4 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #6C63FF22, #00D4FF22)', border: '1px solid #6C63FF33' }}>
                <p className="text-sm font-semibold" style={{ color: '#6C63FF' }}>
                  AI Resume Analyzer &amp; Career Recommendation Portal
                </p>
                <p className="text-xs text-content-muted mt-1">Version 1.0.0 · © 2026 All Rights Reserved</p>
              </div>
            </AccordionItem>

          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentUserManualPage;
