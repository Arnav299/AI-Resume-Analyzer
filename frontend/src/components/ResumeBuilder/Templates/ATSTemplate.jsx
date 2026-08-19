import React from 'react';

const ATSTemplate = ({ data }) => {
  const { 
    personalInfo = {}, 
    summary = "", 
    skills = {}, 
    experience = [], 
    education = [], 
    projects = [], 
    certifications = [], 
    languages = [],
    achievements = [],
    interests = []
  } = data;

  const photoUrl = personalInfo.photo || personalInfo.avatar;

  // Flatten skills for display if it's an object
  const flattenedSkills = Array.isArray(skills) 
    ? skills 
    : Object.values(skills).flat().filter(Boolean);

  return (
    <div className="w-[800px] min-h-[1131px] bg-surface text-content font-sans flex mx-auto box-border overflow-hidden">
      
      {/* Left Sidebar - Dark Theme */}
      <aside className="w-[30%] bg-slate-900 text-slate-100 flex flex-col pt-12 pb-8 px-6">
        
        {/* Candidate Photo */}
        {photoUrl && (
          <div className="flex justify-center mb-8">
            <img 
              src={photoUrl} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-700"
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="mb-8 space-y-4">
          <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-slate-700 pb-1 mb-3 text-slate-300">Contact</h2>
          
          {personalInfo.phone && (
            <div className="text-[12px] break-words">
              <span className="font-semibold block text-content-muted mb-0.5">Phone</span>
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.email && (
            <div className="text-[12px] break-words">
              <span className="font-semibold block text-content-muted mb-0.5">Email</span>
              <span>{personalInfo.email}</span>
            </div>
          )}
          {(personalInfo.location || personalInfo.city) && (
            <div className="text-[12px] break-words">
              <span className="font-semibold block text-content-muted mb-0.5">Location</span>
              <span>{personalInfo.location || `${personalInfo.city}, ${personalInfo.country}`}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="text-[12px] break-words">
              <span className="font-semibold block text-content-muted mb-0.5">LinkedIn</span>
              <span>{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="text-[12px] break-words">
              <span className="font-semibold block text-content-muted mb-0.5">GitHub</span>
              <span>{personalInfo.github}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {flattenedSkills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-slate-700 pb-1 mb-3 text-slate-300">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {flattenedSkills.map((skill, index) => (
                <span key={index} className="text-[12px] bg-slate-800 text-slate-200 px-2 py-1 rounded border border-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-slate-700 pb-1 mb-3 text-slate-300">Languages</h2>
            <div className="text-[12px] space-y-1">
              {languages.map((lang, index) => (
                <div key={index}>{lang}</div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Right Main Content */}
      <main className="w-[70%] bg-surface pt-12 pb-8 px-10">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-[32px] font-[800] tracking-[1.5px] uppercase text-content mb-2">{personalInfo.fullName}</h1>
          <h2 className="text-[16px] font-medium text-content-muted uppercase">{personalInfo.jobTitle}</h2>
        </header>

        {/* Professional Summary */}
        {summary && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-content">
              Professional Summary
            </h3>
            <p className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-content">
              Experience
            </h3>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={exp.id || index}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-content">{exp.company} {exp.location ? `| ${exp.location}` : ''}</h4>
                      <div className="text-[13px] font-medium text-content-secondary">{exp.role}</div>
                    </div>
                    <span className="text-[12px] text-content-muted text-right whitespace-nowrap ml-4">
                      {exp.startMonth} {exp.startYear || exp.startDate} - {exp.currentlyWorking ? 'Present' : (exp.endMonth ? `${exp.endMonth} ${exp.endYear}` : exp.endDate)}
                    </span>
                  </div>
                  <div className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words mt-1">
                    {exp.description && exp.description.includes('•') ? (
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.description.split('•').map((point, i) => {
                          const cleanPoint = point.trim();
                          return cleanPoint ? <li key={i}>{cleanPoint}</li> : null;
                        })}
                      </ul>
                    ) : (
                      exp.description
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-content">
              Education
            </h3>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={edu.id || index}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-content">{edu.institution || edu.university}</h4>
                      <div className="text-[13px] font-medium text-content-secondary">{edu.degree} {edu.branch ? `in ${edu.branch}` : ''}</div>
                    </div>
                    <span className="text-[12px] text-content-muted text-right whitespace-nowrap ml-4">
                      {edu.startYear || ''} {edu.startYear && (edu.endYear || edu.year) ? '-' : ''} {edu.endYear || edu.year}
                    </span>
                  </div>
                  {edu.cgpa && (
                    <div className="text-[12px] text-content-muted mt-0.5">
                      CGPA: {edu.cgpa}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-content">
              Projects
            </h3>
            <div className="space-y-4">
              {projects.map((proj, index) => (
                <div key={proj.id || index}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-content">{proj.name}</h4>
                      {proj.tools && (
                        <div className="text-[12px] font-medium text-content-muted">Technologies: {proj.tools}</div>
                      )}
                    </div>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-[12px] text-blue-600 hover:underline ml-4 text-right">
                        View Project
                      </a>
                    )}
                  </div>
                  <div className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words mt-1">
                    {proj.description && proj.description.includes('•') ? (
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {proj.description.split('•').map((point, i) => {
                          const cleanPoint = point.trim();
                          return cleanPoint ? <li key={i}>{cleanPoint}</li> : null;
                        })}
                      </ul>
                    ) : (
                      proj.description
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-content">
              Certifications
            </h3>
            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={cert.id || index} className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[13px] font-bold text-content">{cert.name}</h4>
                    <div className="text-[13px] font-medium text-content-secondary">{cert.issuer}</div>
                  </div>
                  <span className="text-[12px] text-content-muted text-right whitespace-nowrap ml-4">
                    {cert.issueDate || cert.date}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-content">
              Achievements
            </h3>
            <ul className="list-disc list-outside ml-4 space-y-1 text-[12px] leading-[1.6] text-content-secondary">
              {achievements.map((ach, index) => (
                <li key={index}>{ach}</li>
              ))}
            </ul>
          </section>
        )}

      </main>
    </div>
  );
};

export default ATSTemplate;
