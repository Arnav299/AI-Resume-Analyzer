/**
 * ResumeForm.jsx
 * ==============
 * Pure controlled form component.
 * Upload logic is now owned by ResumeBuilder (parent).
 * This component only renders and edits the resumeData fields.
 *
 * Props:
 *   data         - resumeData object
 *   onChange     - fn(section, value)
 *   setResumeData- fn(newData) — for bulk updates
 *   onCropOpen   - fn(imageSrc) — triggers photo crop modal in parent
 *   hideUploadButtons - bool (parent handles uploads)
 */
import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, Plus, Trash2,
  User, Briefcase, GraduationCap, Code2,
  FolderOpen, Award, BookOpen, Camera, Star
} from 'lucide-react';

// ─── Section Accordion ────────────────────────────────────────────────────────
const Section = ({ id, title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border-b border-border-subtle">
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface/[0.02] transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size={15} className="text-[#6C63FF] flex-shrink-0" />}
        <span className="font-semibold text-content text-sm">{title}</span>
      </div>
      {isOpen
        ? <ChevronUp size={15} className="text-content-primary/30 flex-shrink-0" />
        : <ChevronDown size={15} className="text-content-primary/30 flex-shrink-0" />}
    </button>
    {isOpen && (
      <div className="px-5 pb-5 pt-1">
        {children}
      </div>
    )}
  </div>
);

// ─── Label ───────────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-[10px] font-bold text-content-muted uppercase tracking-widest mb-1.5">
    {children}
  </label>
);

// ─── Input Field ─────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = 'text', placeholder = '', className = '' }) => {
  if (type === 'textarea') return (
    <div className={`mb-3 ${className}`}>
      {label && <Label>{label}</Label>}
      <textarea
        rows={4}
        className="w-full bg-page text-content border border-border-default rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/55 focus:ring-1 focus:ring-primary/30 transition-all resize-none placeholder:text-content-muted"
        value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      />
    </div>
  );
  if (type === 'checkbox') return (
    <label className={`flex items-center gap-2.5 cursor-pointer mb-3 group ${className}`}>
      <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-[#6C63FF] bg-page border-border-default" />
      <span className="text-sm text-content-primary/55 group-hover:text-content-primary/75 transition-colors">{label}</span>
    </label>
  );
  return (
    <div className={`mb-3 ${className}`}>
      {label && <Label>{label}</Label>}
      <input
        type={type}
        className="w-full bg-page text-content border border-border-default rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/55 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-content-muted"
        value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      />
    </div>
  );
};

// ─── Tag Input ────────────────────────────────────────────────────────────────
const TagInput = ({ label, items = [], onChange, placeholder = 'Type and press Enter…' }) => {
  const [input, setInput] = useState('');

  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const val = input.trim().replace(/,$/, '');
      if (val && !items.includes(val)) onChange([...items, val]);
      setInput('');
    } else if (e.key === 'Backspace' && !input && items.length) {
      onChange(items.slice(0, -1));
    }
  };

  return (
    <div className="mb-3">
      {label && <Label>{label}</Label>}
      <div className="min-h-[42px] flex flex-wrap gap-1.5 bg-page border border-border-default rounded-lg p-2 focus-within:border-[#6C63FF]/55 transition-all">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-primary/15 text-primary text-xs font-medium px-2 py-0.5 rounded-md border border-[#6C63FF]/20">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-[#6C63FF]/50 hover:text-red-400 ml-0.5 text-xs">×</button>
          </span>
        ))}
        <input
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={items.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent text-content-secondary text-sm outline-none placeholder:text-content-muted"
        />
      </div>
    </div>
  );
};

// ─── Item Card ────────────────────────────────────────────────────────────────
const Card = ({ children, onRemove }) => (
  <div className="relative bg-page rounded-xl border border-border-subtle p-4 mb-3">
    <button onClick={onRemove} className="absolute top-3 right-3 text-content-muted hover:text-red-400 transition-colors">
      <Trash2 size={14} />
    </button>
    {children}
  </div>
);

// ─── Add Button ───────────────────────────────────────────────────────────────
const AddBtn = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border-default text-content-muted hover:text-content-muted hover:border-white/25 transition-all text-sm font-medium mt-1"
  >
    <Plus size={14} /> {label}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════
const ResumeForm = ({ data, onChange, setResumeData, onCropOpen }) => {
  const [openSec, setOpenSec] = useState('personal');

  const toggle    = id => setOpenSec(prev => prev === id ? null : id);
  const pi        = (field, val) => onChange('personalInfo', { ...data.personalInfo, [field]: val });
  const arrUpdate = (sec, id, field, val) =>
    onChange(sec, (data[sec] || []).map(item => item.id === id ? { ...item, [field]: val } : item));
  const arrAdd    = (sec, empty) =>
    onChange(sec, [...(data[sec] || []), { id: `${Date.now()}`, ...empty }]);
  const arrDel    = (sec, id) =>
    onChange(sec, (data[sec] || []).filter(item => item.id !== id));
  const skill     = (cat, val) =>
    onChange('skills', { ...data.skills, [cat]: val });

  // safe getter for nested skills
  const sk = cat => data.skills?.[cat] || [];

  return (
    <div className="w-full">

      {/* ── Personal Information ─────────────────────────────────────── */}
      <Section id="personal" title="Personal Information" icon={User} isOpen={openSec === 'personal'} onToggle={toggle}>

        {/* Profile photo */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-page/50 border border-border-subtle">
          <button
            onClick={() => {
              const inp = document.createElement('input');
              inp.type = 'file'; inp.accept = 'image/*';
              inp.onchange = (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => onCropOpen?.(reader.result);
                reader.readAsDataURL(f);
              };
              inp.click();
            }}
            className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden bg-border-default border-2 border-border-default hover:border-[#6C63FF]/50 transition-all group relative"
          >
            {data.personalInfo?.photo
              ? <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
              : <User size={22} className="text-content-muted absolute inset-0 m-auto" />
            }
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={15} className="text-content-primary" />
            </div>
          </button>
          <div>
            <p className="text-xs font-semibold text-content-primary/55 mb-0.5">Profile Photo</p>
            <p className="text-[11px] text-content-primary/28 leading-tight">Click to upload.<br/>Best size 1:1 ratio.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name"  value={data.personalInfo?.fullName}  onChange={v => pi('fullName', v)}  placeholder="John Doe" />
          <Field label="Job Title"  value={data.personalInfo?.jobTitle}  onChange={v => pi('jobTitle', v)}  placeholder="Software Engineer" />
        </div>
        <Field label="Email"  value={data.personalInfo?.email}  onChange={v => pi('email', v)}  type="email"  placeholder="john@example.com" />
        <Field label="Phone"  value={data.personalInfo?.phone}  onChange={v => pi('phone', v)}  placeholder="+1 555 000 0000" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="LinkedIn"  value={data.personalInfo?.linkedin}  onChange={v => pi('linkedin', v)}  placeholder="linkedin.com/in/…" />
          <Field label="GitHub"    value={data.personalInfo?.github}    onChange={v => pi('github', v)}    placeholder="github.com/…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Location"  value={data.personalInfo?.location}  onChange={v => pi('location', v)}  placeholder="City, Country" />
          <Field label="Portfolio" value={data.personalInfo?.portfolio} onChange={v => pi('portfolio', v)} placeholder="yoursite.com" />
        </div>

        <details>
          <summary className="text-[11px] text-[#6C63FF]/60 cursor-pointer hover:text-[#6C63FF] font-semibold mt-1 mb-3 select-none">
            + More fields (DOB, Address, Nationality…)
          </summary>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Field label="Alternate Phone" value={data.personalInfo?.alternatePhone} onChange={v => pi('alternatePhone', v)} />
            <Field label="Date of Birth"   value={data.personalInfo?.dob}            onChange={v => pi('dob', v)} />
            <Field label="Nationality"     value={data.personalInfo?.nationality}    onChange={v => pi('nationality', v)} />
            <Field label="Postal Code"     value={data.personalInfo?.postalCode}     onChange={v => pi('postalCode', v)} />
            <Field label="City"            value={data.personalInfo?.city}           onChange={v => pi('city', v)} />
            <Field label="State"           value={data.personalInfo?.state}          onChange={v => pi('state', v)} />
            <Field label="Country"         value={data.personalInfo?.country}        onChange={v => pi('country', v)} />
            <Field label="Website"         value={data.personalInfo?.personalWebsite} onChange={v => pi('personalWebsite', v)} />
          </div>
          <Field label="Street Address" value={data.personalInfo?.address} onChange={v => pi('address', v)} />
        </details>
      </Section>

      {/* ── Summary ──────────────────────────────────────────────────── */}
      <Section id="summary" title="Professional Summary" icon={Star} isOpen={openSec === 'summary'} onToggle={toggle}>
        <Field type="textarea" value={data.summary} onChange={v => onChange('summary', v)}
          placeholder="A brief summary of your professional background and goals…" />
      </Section>

      {/* ── Work Experience ──────────────────────────────────────────── */}
      <Section id="exp" title="Work Experience" icon={Briefcase} isOpen={openSec === 'exp'} onToggle={toggle}>
        {(data.experience || []).map(exp => (
          <Card key={exp.id} onRemove={() => arrDel('experience', exp.id)}>
            <div className="grid grid-cols-2 gap-3 pr-5">
              <Field label="Company"         value={exp.company}        onChange={v => arrUpdate('experience', exp.id, 'company', v)} />
              <Field label="Job Title"       value={exp.role}           onChange={v => arrUpdate('experience', exp.id, 'role', v)} />
              <Field label="Employment Type" value={exp.employmentType} onChange={v => arrUpdate('experience', exp.id, 'employmentType', v)} placeholder="Full-time" />
              <Field label="Location"        value={exp.location}       onChange={v => arrUpdate('experience', exp.id, 'location', v)} />
              <Field label="Start Month"     value={exp.startMonth}     onChange={v => arrUpdate('experience', exp.id, 'startMonth', v)} placeholder="Jan" />
              <Field label="Start Year"      value={exp.startYear}      onChange={v => arrUpdate('experience', exp.id, 'startYear', v)} placeholder="2022" />
              <Field label="End Month"       value={exp.endMonth}       onChange={v => arrUpdate('experience', exp.id, 'endMonth', v)} placeholder="Dec" />
              <Field label="End Year"        value={exp.endYear}        onChange={v => arrUpdate('experience', exp.id, 'endYear', v)} placeholder="2024" />
            </div>
            <Field type="checkbox" label="Currently working here" value={exp.currentlyWorking}
              onChange={v => arrUpdate('experience', exp.id, 'currentlyWorking', v)} />
            <Field type="textarea" label="Description" value={exp.description}
              onChange={v => arrUpdate('experience', exp.id, 'description', v)}
              placeholder="Key responsibilities and achievements…" />
          </Card>
        ))}
        <AddBtn label="Add Experience"
          onClick={() => arrAdd('experience', { company:'', role:'', employmentType:'Full-time', location:'', startMonth:'', startYear:'', endMonth:'', endYear:'', currentlyWorking:false, description:'' })} />
      </Section>

      {/* ── Education ────────────────────────────────────────────────── */}
      <Section id="edu" title="Education" icon={GraduationCap} isOpen={openSec === 'edu'} onToggle={toggle}>
        {(data.education || []).map(edu => (
          <Card key={edu.id} onRemove={() => arrDel('education', edu.id)}>
            <div className="grid grid-cols-2 gap-3 pr-5">
              <Field label="Degree"      value={edu.degree}      onChange={v => arrUpdate('education', edu.id, 'degree', v)}      placeholder="B.Tech / MBA" />
              <Field label="Branch / Major" value={edu.branch}   onChange={v => arrUpdate('education', edu.id, 'branch', v)}   placeholder="Computer Science" />
              <Field label="Institution" value={edu.institution} onChange={v => arrUpdate('education', edu.id, 'institution', v)} />
              <Field label="University"  value={edu.university}  onChange={v => arrUpdate('education', edu.id, 'university', v)} />
              <Field label="Start Year"  value={edu.startYear}   onChange={v => arrUpdate('education', edu.id, 'startYear', v)}   placeholder="2020" />
              <Field label="End Year"    value={edu.endYear}     onChange={v => arrUpdate('education', edu.id, 'endYear', v)}     placeholder="2024" />
              <Field label="CGPA"        value={edu.cgpa}        onChange={v => arrUpdate('education', edu.id, 'cgpa', v)}        placeholder="8.5 / 10" />
              <Field label="Percentage"  value={edu.percentage}  onChange={v => arrUpdate('education', edu.id, 'percentage', v)}  placeholder="85%" />
            </div>
          </Card>
        ))}
        <AddBtn label="Add Education"
          onClick={() => arrAdd('education', { degree:'', branch:'', institution:'', university:'', startYear:'', endYear:'', cgpa:'', percentage:'' })} />
      </Section>

      {/* ── Skills ───────────────────────────────────────────────────── */}
      <Section id="skills" title="Skills" icon={Code2} isOpen={openSec === 'skills'} onToggle={toggle}>
        <TagInput label="Technical Skills"        items={sk('technical')}          onChange={v => skill('technical', v)} />
        <TagInput label="Programming Languages"   items={sk('programmingLanguages')} onChange={v => skill('programmingLanguages', v)} />
        <TagInput label="Frameworks"              items={sk('frameworks')}          onChange={v => skill('frameworks', v)} />
        <TagInput label="Libraries"               items={sk('libraries')}           onChange={v => skill('libraries', v)} />
        <TagInput label="Databases"               items={sk('databases')}           onChange={v => skill('databases', v)} />
        <TagInput label="Cloud Platforms"         items={sk('cloudPlatforms')}      onChange={v => skill('cloudPlatforms', v)} />
        <TagInput label="DevOps Tools"            items={sk('devOpsTools')}         onChange={v => skill('devOpsTools', v)} />
        <TagInput label="AI / ML Tools"           items={sk('aiTools')}             onChange={v => skill('aiTools', v)} />
        <TagInput label="Soft Skills"             items={sk('soft')}                onChange={v => skill('soft', v)} />
        <TagInput label="Other Skills"            items={sk('other')}               onChange={v => skill('other', v)} />
      </Section>

      {/* ── Projects ─────────────────────────────────────────────────── */}
      <Section id="proj" title="Projects" icon={FolderOpen} isOpen={openSec === 'proj'} onToggle={toggle}>
        {(data.projects || []).map(proj => (
          <Card key={proj.id} onRemove={() => arrDel('projects', proj.id)}>
            <div className="grid grid-cols-2 gap-3 pr-5">
              <Field label="Project Name" value={proj.name}  onChange={v => arrUpdate('projects', proj.id, 'name', v)} />
              <Field label="Tech / Tools" value={proj.tools} onChange={v => arrUpdate('projects', proj.id, 'tools', v)} placeholder="React, Node.js, AWS" />
              <Field label="GitHub URL"   value={proj.github} onChange={v => arrUpdate('projects', proj.id, 'github', v)} />
              <Field label="Live URL"     value={proj.link}  onChange={v => arrUpdate('projects', proj.id, 'link', v)} />
            </div>
            <Field type="textarea" label="Description" value={proj.description}
              onChange={v => arrUpdate('projects', proj.id, 'description', v)} />
          </Card>
        ))}
        <AddBtn label="Add Project"
          onClick={() => arrAdd('projects', { name:'', tools:'', github:'', link:'', description:'' })} />
      </Section>

      {/* ── Certifications ───────────────────────────────────────────── */}
      <Section id="certs" title="Certifications" icon={Award} isOpen={openSec === 'certs'} onToggle={toggle}>
        {(data.certifications || []).map(cert => (
          <Card key={cert.id} onRemove={() => arrDel('certifications', cert.id)}>
            <div className="grid grid-cols-2 gap-3 pr-5">
              <Field label="Name"         value={cert.name}         onChange={v => arrUpdate('certifications', cert.id, 'name', v)} />
              <Field label="Issuer"       value={cert.issuer}       onChange={v => arrUpdate('certifications', cert.id, 'issuer', v)} />
              <Field label="Issue Date"   value={cert.issueDate}    onChange={v => arrUpdate('certifications', cert.id, 'issueDate', v)}   placeholder="Jan 2024" />
              <Field label="Expiry Date"  value={cert.expiryDate}   onChange={v => arrUpdate('certifications', cert.id, 'expiryDate', v)}  placeholder="Jan 2027" />
            </div>
            <Field label="Credential ID" value={cert.credentialId} onChange={v => arrUpdate('certifications', cert.id, 'credentialId', v)} placeholder="UC-XXXXXXX" />
          </Card>
        ))}
        <AddBtn label="Add Certification"
          onClick={() => arrAdd('certifications', { name:'', issuer:'', issueDate:'', expiryDate:'', credentialId:'' })} />
      </Section>

      {/* ── Internships ──────────────────────────────────────────────── */}
      <Section id="intern" title="Internships" icon={Briefcase} isOpen={openSec === 'intern'} onToggle={toggle}>
        {(data.internships || []).map(exp => (
          <Card key={exp.id} onRemove={() => arrDel('internships', exp.id)}>
            <div className="grid grid-cols-2 gap-3 pr-5">
              <Field label="Company"     value={exp.company}    onChange={v => arrUpdate('internships', exp.id, 'company', v)} />
              <Field label="Role"        value={exp.role}       onChange={v => arrUpdate('internships', exp.id, 'role', v)} />
              <Field label="Start Month" value={exp.startMonth} onChange={v => arrUpdate('internships', exp.id, 'startMonth', v)} />
              <Field label="Start Year"  value={exp.startYear}  onChange={v => arrUpdate('internships', exp.id, 'startYear', v)} />
              <Field label="End Month"   value={exp.endMonth}   onChange={v => arrUpdate('internships', exp.id, 'endMonth', v)} />
              <Field label="End Year"    value={exp.endYear}    onChange={v => arrUpdate('internships', exp.id, 'endYear', v)} />
            </div>
            <Field type="textarea" label="Description" value={exp.description}
              onChange={v => arrUpdate('internships', exp.id, 'description', v)} />
          </Card>
        ))}
        <AddBtn label="Add Internship"
          onClick={() => arrAdd('internships', { company:'', role:'', startMonth:'', startYear:'', endMonth:'', endYear:'', description:'' })} />
      </Section>

      {/* ── Additional ───────────────────────────────────────────────── */}
      <Section id="more" title="Additional Sections" icon={BookOpen} isOpen={openSec === 'more'} onToggle={toggle}>
        <TagInput label="Awards"             items={data.awards}        onChange={v => onChange('awards', v)} />
        <TagInput label="Achievements"       items={data.achievements}  onChange={v => onChange('achievements', v)} />
        <TagInput label="Publications"       items={data.publications}  onChange={v => onChange('publications', v)} />
        <TagInput label="Patents"            items={data.patents}       onChange={v => onChange('patents', v)} />
        <TagInput label="Courses"            items={data.courses}       onChange={v => onChange('courses', v)} />
        <TagInput label="Languages"          items={data.languages}     onChange={v => onChange('languages', v)} />
        <TagInput label="Interests / Hobbies" items={data.interests}   onChange={v => onChange('interests', v)} />
      </Section>

      <div className="h-8" />
    </div>
  );
};

export default ResumeForm;
