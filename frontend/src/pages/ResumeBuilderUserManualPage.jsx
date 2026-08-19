import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

// ── Accordion ─────────────────────────────────────────────────────────────────
const AccordionItem = ({ icon, title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-bold text-content text-sm md:text-base">{title}</span>
        </div>
        <span className={`text-content-muted text-lg transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-6 pb-6 pt-4 border-t border-border-subtle text-sm text-content-secondary leading-relaxed space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

const Bullet = ({ text }) => (
  <li className="flex items-start gap-2 text-sm text-content-secondary">
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
    {text}
  </li>
);

const Step = ({ num, text }) => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{num}</span>
    <span className="text-sm text-content-secondary leading-relaxed">{text}</span>
  </li>
);

const InfoCard = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
    <span className="text-2xl flex-shrink-0">{icon}</span>
    <div>
      <p className="font-semibold text-content text-sm">{title}</p>
      {desc && <p className="text-xs text-content-muted mt-0.5 leading-relaxed">{desc}</p>}
    </div>
  </div>
);

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-page hover:bg-indigo-50 transition-colors"
      >
        <span className="text-sm font-semibold text-content">{q}</span>
        <span className={`text-content-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-5 py-4 text-sm text-content-secondary leading-relaxed bg-surface">{a}</div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ResumeBuilderUserManualPage = () => (
  <div className="min-h-screen bg-page">
    {/* Top bar */}
    <header className="bg-surface border-b border-border-default sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
        <Link
          to="/builder"
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ← Back to Resume Builder
        </Link>
        <span className="text-content-muted">|</span>
        <span className="text-sm text-content-muted">Resume Builder · User Manual</span>
        </div>
        <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
      </div>
    </header>

    <main className="max-w-4xl mx-auto px-6 py-10 space-y-5">

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-content">📖 Resume Builder — User Manual</h1>
        <p className="text-content-muted mt-1">Complete guide to creating, editing, and downloading ATS-friendly resumes.</p>
      </div>

      {/* Quick-nav pills */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-5">
        <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">Sections</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Introduction', 'Getting Started', 'Uploading a Resume', 'Editing Resume Fields',
            'Resume Templates', 'Resume Preview', 'OCR Upload', 'ATS-Friendly Tips',
            'Downloading', 'Best Practices', 'FAQ', 'Troubleshooting', 'Contact & Support',
          ].map((s) => (
            <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium border border-indigo-100">{s}</span>
          ))}
        </div>
      </div>

      {/* 1. Introduction */}
      <AccordionItem icon="ℹ️" title="1. Introduction">
        <p>
          The <strong>Resume Builder</strong> is an AI-powered tool that lets you create a professional,
          ATS-optimized resume in minutes. You can upload an existing resume (PDF, DOCX, or image) and the
          system will automatically extract your information using Gemini AI or OCR technology. You can then
          edit every field, choose a visual template, preview in real time, and download a polished PDF.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <InfoCard icon="🤖" title="AI Extraction" desc="Gemini AI accurately extracts every field from your uploaded resume." />
          <InfoCard icon="👁️" title="OCR Support" desc="Scanned image resumes are processed automatically using OCR." />
          <InfoCard icon="⚡" title="Instant Preview" desc="The live preview updates immediately as you make changes." />
          <InfoCard icon="✏️" title="Fully Editable" desc="Edit individual fields or the full raw text at any time." />
        </div>
      </AccordionItem>

      {/* 2. Getting Started */}
      <AccordionItem icon="🚀" title="2. Getting Started">
        <p>To begin using the Resume Builder, navigate to <strong>/builder</strong> from the portal or click Resume Builder from the navigation.</p>
        <ol className="space-y-2 mt-2">
          <Step num={1} text="Open the Resume Builder page." />
          <Step num={2} text="Choose how to start: upload an existing resume (PDF/DOCX), upload a resume image (OCR), or start from scratch using the Fields tab." />
          <Step num={3} text="After uploading, the AI extracts your resume data automatically." />
          <Step num={4} text="Switch to the Fields tab to review and edit any extracted information." />
          <Step num={5} text="Select a template from the right panel to style your resume." />
          <Step num={6} text="Preview your resume on the right and download when satisfied." />
        </ol>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
          💡 <strong>Tip:</strong> Use a text-based PDF for the most accurate AI extraction. Avoid scanned or image-only PDFs unless using the OCR upload option.
        </div>
      </AccordionItem>

      {/* 3. Uploading a Resume */}
      <AccordionItem icon="📤" title="3. Uploading a Resume">
        <p>The Upload tab offers two upload methods:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {[
            { icon: '📄', label: 'PDF / DOC / DOCX', desc: 'Best for text-based resumes. Gemini AI extracts all fields.' },
            { icon: '🖼️', label: 'Image (JPG/PNG)', desc: 'For scanned resumes. OCR reads text from the image.' },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-3 p-4 bg-page rounded-xl border border-border-subtle">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-semibold text-content text-sm">{f.label}</p>
                <p className="text-xs text-content-muted mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <ol className="space-y-2 mt-3">
          <Step num={1} text="Click 'Upload Resume (PDF / DOC / DOCX)' or drag and drop your file." />
          <Step num={2} text="Wait for the AI to parse and extract your resume data (usually a few seconds)." />
          <Step num={3} text="A success banner will confirm the file was loaded with your name." />
          <Step num={4} text="Switch to the Fields tab to review all extracted data." />
        </ol>
        <p className="mt-2 text-xs text-content-muted">Maximum file size: 10 MB.</p>
      </AccordionItem>

      {/* 4. Editing Resume Fields */}
      <AccordionItem icon="✏️" title="4. Editing Resume Fields">
        <p>The <strong>Fields tab</strong> displays all extracted resume data in an organized, editable form:</p>
        <ul className="space-y-2 mt-2">
          <Bullet text="Personal Info — Full name, job title, email, phone, location, LinkedIn, GitHub, website." />
          <Bullet text="Summary — A professional summary / objective paragraph." />
          <Bullet text="Work Experience — Company, role, dates, and bullet-point achievements for each position." />
          <Bullet text="Education — Degree, institution, graduation year, and GPA." />
          <Bullet text="Skills — Technical and soft skills list." />
          <Bullet text="Certifications — Certificate name, issuer, and year." />
          <Bullet text="Projects — Project title, description, technologies used, and links." />
          <Bullet text="Languages — Language and proficiency level." />
          <Bullet text="Awards — Award name, issuing organization, and year." />
        </ul>
        <p className="mt-2">
          You can also switch to the <strong>Editor tab</strong> to edit the raw extracted text directly.
          Changes in the Editor are automatically re-parsed into structured fields.
        </p>
      </AccordionItem>

      {/* 5. Resume Templates */}
      <AccordionItem icon="🎨" title="5. Resume Templates">
        <p>
          The right panel displays a set of visual resume templates. Click any template thumbnail to apply it instantly to the live preview.
        </p>
        <ul className="space-y-2 mt-2">
          <Bullet text="Templates are designed to be ATS-compatible — clean layouts without tables or graphics that confuse parsers." />
          <Bullet text="Each template has a distinct typographic style and color scheme." />
          <Bullet text="You can switch templates at any time without losing your data." />
          <Bullet text="The selected template is applied when downloading the PDF." />
        </ul>
      </AccordionItem>

      {/* 6. Resume Preview */}
      <AccordionItem icon="👁️" title="6. Resume Preview">
        <p>
          The <strong>live preview panel</strong> on the right shows exactly how your resume will look when downloaded.
        </p>
        <ul className="space-y-2 mt-2">
          <Bullet text="The preview updates automatically as you edit fields or switch templates." />
          <Bullet text="Use the zoom controls (+ / −) to zoom in or out on the preview." />
          <Bullet text="The preview is a pixel-accurate representation of the final PDF output." />
          <Bullet text="On mobile, tap 'Preview' to toggle the preview panel." />
        </ul>
      </AccordionItem>

      {/* 7. OCR Upload */}
      <AccordionItem icon="🔍" title="7. OCR Upload">
        <p>
          The <strong>OCR upload</strong> option allows you to upload a scanned resume image (JPG, JPEG, or PNG).
          The system uses Optical Character Recognition to extract text from the image.
        </p>
        <ol className="space-y-2 mt-2">
          <Step num={1} text="Click 'Upload Resume Image (OCR)' in the Upload tab." />
          <Step num={2} text="Select a JPG, JPEG, or PNG file of your scanned resume." />
          <Step num={3} text="The OCR engine extracts text from the image automatically." />
          <Step num={4} text="Extracted text is parsed into structured fields in the Fields tab." />
          <Step num={5} text="Review and correct any OCR errors in the Editor tab." />
        </ol>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
          ⚠️ <strong>Note:</strong> OCR accuracy depends on image quality. Use high-resolution, well-lit scans for best results.
        </div>
      </AccordionItem>

      {/* 8. ATS Tips */}
      <AccordionItem icon="🏆" title="8. ATS-Friendly Resume Tips">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '🔑', title: 'Use Job Keywords', desc: 'Include exact keywords from the job description to pass ATS filters.' },
            { icon: '📏', title: 'Keep It Concise', desc: '1 page for freshers, 2 pages max for experienced candidates.' },
            { icon: '📋', title: 'Simple Formatting', desc: 'Avoid tables, columns, graphics — use the built-in templates.' },
            { icon: '📈', title: 'Quantify Impact', desc: 'Use numbers to describe achievements (e.g., "Reduced load time by 40%").' },
            { icon: '🎯', title: 'Tailor Each Resume', desc: 'Customize for every role. Generic resumes rarely pass ATS.' },
            { icon: '✅', title: 'Standard Sections', desc: 'Use conventional section names: Experience, Education, Skills.' },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-3 p-4 bg-page rounded-xl border border-border-subtle">
              <span className="text-xl flex-shrink-0">{b.icon}</span>
              <div>
                <p className="font-semibold text-content text-sm">{b.title}</p>
                <p className="text-xs text-content-muted mt-0.5 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* 9. Downloading */}
      <AccordionItem icon="⬇️" title="9. Downloading the Resume">
        <ol className="space-y-2">
          <Step num={1} text="Once satisfied with your resume, click the Download button in the top-right corner of the builder." />
          <Step num={2} text="The system renders the resume using your selected template and generates a PDF." />
          <Step num={3} text="The PDF is saved to your device using the filename based on your full name." />
          <Step num={4} text="You can re-download at any time after making edits." />
        </ol>
        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-medium">
          📄 The downloaded PDF is fully ATS-compatible when using one of the provided templates.
        </div>
      </AccordionItem>

      {/* 10. Best Practices */}
      <AccordionItem icon="⭐" title="10. Best Practices">
        <ul className="space-y-2">
          <Bullet text="Always review AI-extracted fields before downloading — correct any inaccuracies in the Fields tab." />
          <Bullet text="Use the Editor tab to fine-tune bullet points and descriptions for maximum impact." />
          <Bullet text="Choose a template that matches the industry: clean/minimal for tech, structured for finance." />
          <Bullet text="Keep your summary concise — 2 to 3 sentences maximum." />
          <Bullet text="Use strong action verbs: Built, Designed, Led, Implemented, Optimized." />
          <Bullet text="Verify contact details (email, phone, LinkedIn) are accurate before downloading." />
          <Bullet text="Upload the latest version of your resume each time for the most accurate extraction." />
        </ul>
      </AccordionItem>

      {/* 11. FAQ */}
      <AccordionItem icon="❓" title="11. Frequently Asked Questions (FAQ)">
        <div className="space-y-2">
          <FAQItem q="What file formats can I upload?" a="You can upload PDF, DOC, and DOCX files for AI extraction, or JPG, JPEG, and PNG images for OCR processing." />
          <FAQItem q="Does uploading a resume overwrite my existing data?" a="Yes — uploading a new resume will replace the currently extracted data. Download your current resume first if you want to keep it." />
          <FAQItem q="Can I edit the resume without uploading a file?" a="Yes. Switch to the Fields tab and fill in your information manually, or use the Editor tab to type raw text." />
          <FAQItem q="Why did the AI extract incorrect information?" a="AI extraction depends on the structure and formatting of your resume. Use the Fields or Editor tabs to correct any errors." />
          <FAQItem q="Can I change the template after uploading?" a="Yes. Templates can be switched at any time without losing your data." />
          <FAQItem q="Is the downloaded PDF ATS-compatible?" a="Yes. All built-in templates are designed with clean, parseable layouts that ATS systems can read correctly." />
          <FAQItem q="Can I use the Resume Builder without logging in?" a="Yes. The Resume Builder is publicly accessible and does not require a login." />
        </div>
      </AccordionItem>

      {/* 12. Troubleshooting */}
      <AccordionItem icon="🔧" title="12. Troubleshooting">
        <div className="space-y-3">
          {[
            {
              problem: 'Upload fails or shows an error',
              solutions: ['Ensure the file format is PDF, DOC, DOCX, JPG, JPEG, or PNG.', 'Check the file is under 10 MB.', 'Make sure the backend server is running on port 8000.'],
            },
            {
              problem: 'AI extraction is slow or times out',
              solutions: ['Large files may take up to 2 minutes.', 'Try a smaller or simpler resume file.', 'Refresh the page and try again.'],
            },
            {
              problem: 'Fields appear empty after upload',
              solutions: ['Ensure the PDF contains selectable text (not a scanned image).', 'For scanned resumes, use the OCR image upload option.', 'Check the Editor tab — text may have been extracted but not structured.'],
            },
            {
              problem: 'Preview does not update',
              solutions: ['Save your changes in the Fields tab.', 'Try switching templates and switching back.', 'Refresh the page — your data may still be in state.'],
            },
            {
              problem: 'Download button produces a blank PDF',
              solutions: ['Ensure at least the Full Name field is filled in.', 'Try switching to a different template and downloading again.', 'Check browser console for any errors.'],
            },
          ].map((item) => (
            <div key={item.problem} className="p-4 bg-page rounded-xl border border-border-subtle">
              <p className="font-semibold text-content text-sm mb-2">⚠️ {item.problem}</p>
              <ul className="space-y-1">
                {item.solutions.map((s, i) => <Bullet key={i} text={s} />)}
              </ul>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* 13. Contact & Support */}
      <AccordionItem icon="📞" title="13. Contact & Support">
        <p>If you need further assistance with the Resume Builder:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <InfoCard icon="📧" title="Email Support" desc="Contact the support team via the email provided by your institution or organization administrator." />
          <InfoCard icon="🐞" title="Report a Bug" desc="Report technical issues to your system administrator with steps to reproduce the problem." />
          <InfoCard icon="📖" title="This Manual" desc="Refer back to this User Manual from the Resume Builder upload panel at any time." />
          <InfoCard icon="🤝" title="General Portal Help" desc="For other parts of the portal, visit the User Manual from the Student Dashboard sidebar." />
        </div>
        <div className="mt-4 p-4 rounded-xl text-center bg-indigo-50 border border-indigo-100">
          <p className="text-sm font-semibold text-indigo-700">AI Resume Analyzer &amp; Career Recommendation Portal</p>
          <p className="text-xs text-content-muted mt-1">Resume Builder · Version 1.0.0 · © 2026 All Rights Reserved</p>
        </div>
      </AccordionItem>

    </main>
  </div>
);

export default ResumeBuilderUserManualPage;
