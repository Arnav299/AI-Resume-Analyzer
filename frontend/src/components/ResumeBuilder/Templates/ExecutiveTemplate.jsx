import React from 'react';

const ExecutiveTemplate = ({ data }) => {
  const { 
    personalInfo = {}, 
    summary = "", 
    skills = {}, 
    experience = [], 
    internships = [], 
    education = [], 
    projects = [], 
    certifications = [], 
    languages = [],
    achievements = []
  } = data;

  // Flatten skills for display if it's an object
  const flattenedSkills = Array.isArray(skills) 
    ? skills 
    : Object.values(skills).flat().filter(Boolean);

  return (
    <div className="w-[800px] min-h-[1131px] bg-surface text-content font-sans p-0 mx-auto box-border shadow-sm flex flex-col">
      {/* Header */}
      <header className="bg-[#0F172A] text-white p-10 flex flex-col items-center text-center border-b-[6px] border-[#D4AF37]">
        {personalInfo.photo && (
          <img 
            src={personalInfo.photo} 
            alt="Profile" 
            className="w-28 h-28 rounded-full object-cover border-2 border-[#D4AF37] shadow-xl mb-6"
          />
        )}
        <h1 className="text-[32px] font-[800] tracking-[1.5px] uppercase mb-2 leading-[1.1]">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <h2 className="text-[16px] font-medium text-[#D4AF37] uppercase mb-4">
          {personalInfo.jobTitle || 'JOB TITLE'}
        </h2>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px] text-gray-300">
          {(personalInfo.location || personalInfo.city) && <span>{personalInfo.location || `${personalInfo.city}, ${personalInfo.country}`}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
          {(personalInfo.portfolio || personalInfo.personalWebsite) && <span>{personalInfo.portfolio || personalInfo.personalWebsite}</span>}
        </div>
      </header>

      <div className="p-10 flex-1 flex flex-col gap-6">
        {/* Profile Summary */}
        {summary && (
          <section>
            <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#D4AF37]"></span>
              Executive Profile
            </h3>
            <p className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#D4AF37]"></span>
              Professional Experience
            </h3>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={exp.id || index} className="relative pl-5 border-l-2 border-border-default">
                  <div className="absolute -left-[7px] top-[14px] w-3 h-3 bg-surface border-2 border-[#D4AF37] rounded-full"></div>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#0F172A]">{exp.company} {exp.location ? `| ${exp.location}` : ''}</h4>
                      <div className="text-[13px] font-medium text-content-secondary">{exp.role}</div>
                    </div>
                    <span className="text-[12px] text-content-muted text-right whitespace-nowrap ml-4">
                      {exp.startMonth} {exp.startYear || exp.startDate} — {exp.currentlyWorking ? 'Present' : (exp.endMonth ? `${exp.endMonth} ${exp.endYear}` : exp.endDate)}
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#D4AF37]"></span>
              Projects
            </h3>
            <div className="space-y-4">
              {projects.map((proj, index) => (
                <div key={proj.id || index} className="relative pl-5 border-l-2 border-border-default">
                  <div className="absolute -left-[7px] top-[14px] w-3 h-3 bg-surface border-2 border-[#D4AF37] rounded-full"></div>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#0F172A]">{proj.name}</h4>
                      {proj.tools && (
                        <div className="text-[12px] font-medium text-content-muted">Technologies: {proj.tools}</div>
                      )}
                    </div>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-[12px] text-[#D4AF37] hover:underline ml-4 text-right">
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

        <div className="grid grid-cols-2 gap-8">
          {/* Education */}
          {education.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#D4AF37]"></span>
                Education
              </h3>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={edu.id || index}>
                    <div className="flex justify-between items-start mb-0.5">
                      <div>
                        <h4 className="text-[13px] font-bold text-[#0F172A]">{edu.institution || edu.university}</h4>
                        <div className="text-[13px] font-medium text-content-secondary">{edu.degree} {edu.branch ? `in ${edu.branch}` : ''}</div>
                      </div>
                      <span className="text-[12px] text-content-muted text-right whitespace-nowrap ml-2">
                        {edu.startYear || ''} {edu.startYear && (edu.endYear || edu.year) ? '—' : ''} {edu.endYear || edu.year}
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

          {/* Skills */}
          {flattenedSkills.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#D4AF37]"></span>
                Core Competencies
              </h3>
              <ul className="list-disc list-outside ml-4 space-y-1 text-[12px] text-content-secondary">
                {flattenedSkills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Certifications and Languages in bottom row */}
        <div className="grid grid-cols-2 gap-8 mt-auto">
          {certifications.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#D4AF37]"></span>
                Certifications
              </h3>
              <ul className="list-disc list-outside ml-4 space-y-1 text-[12px] text-content-secondary">
                {certifications.map(cert => (
                  <li key={cert.id || cert.name}>{cert.name} - {cert.issuer} ({cert.issueDate || cert.date})</li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#D4AF37]"></span>
                Languages
              </h3>
              <ul className="list-disc list-outside ml-4 space-y-1 text-[12px] text-content-secondary">
                {languages.map((lang, index) => (
                  <li key={index}>{lang}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

      </div>
    </div>
  );
};

export default ExecutiveTemplate;
