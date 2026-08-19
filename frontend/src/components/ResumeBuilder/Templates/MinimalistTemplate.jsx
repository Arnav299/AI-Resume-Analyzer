import React from 'react';

const MinimalistTemplate = ({ data }) => {
  const { 
    personalInfo = {}, 
    summary = "", 
    skills = {}, 
    experience = [], 
    internships = [],
    education = [], 
    certifications = [], 
    projects = [],
    languages = [],
    achievements = []
  } = data;

  const photoUrl = personalInfo.photo || personalInfo.avatar;
  const brandColor = '#b74127'; // Rust / Orange color from the layout
  
  // Split name for two-tone color if possible
  const nameParts = (personalInfo.fullName || 'YOUR NAME').trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  // Flatten skills for display
  const flattenedSkills = Array.isArray(skills) 
    ? skills 
    : Object.values(skills).flat().filter(Boolean);

  return (
    <div className="w-[800px] min-h-[1131px] bg-surface text-content font-sans mx-auto box-border overflow-hidden shadow-sm flex flex-row">
      
      {/* Left Sidebar - Dark Theme */}
      <aside className="w-[35%] bg-[#252525] text-white flex flex-col py-10">
        
        {/* Candidate Photo */}
        {photoUrl && (
          <div className="flex justify-center mb-8 px-8">
            <div className="w-40 h-40 rounded-full overflow-hidden border-[4px] border-white bg-surface">
              <img 
                src={photoUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Contact */}
          <div>
            <h2 className="text-[15px] font-bold tracking-[1px] uppercase text-white py-1.5 pl-10 mb-4" style={{ backgroundColor: brandColor, marginRight: '1.5rem' }}>
              Contact
            </h2>
            <div className="px-10 flex flex-col gap-4">
              {personalInfo.phone && (
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ color: brandColor }} className="text-[14px]">📞</span>
                    <span className="font-bold tracking-widest uppercase text-[11px]">Phone</span>
                  </div>
                  <div className="text-[12px] text-gray-300 ml-6">{personalInfo.phone}</div>
                </div>
              )}
              {personalInfo.email && (
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ color: brandColor }} className="text-[14px]">✉️</span>
                    <span className="font-bold tracking-widest uppercase text-[11px]">Email</span>
                  </div>
                  <div className="text-[12px] text-gray-300 ml-6 break-words">{personalInfo.email}</div>
                </div>
              )}
              {(personalInfo.location || personalInfo.city) && (
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ color: brandColor }} className="text-[14px]">📍</span>
                    <span className="font-bold tracking-widest uppercase text-[11px]">Location</span>
                  </div>
                  <div className="text-[12px] text-gray-300 ml-6">{personalInfo.location || `${personalInfo.city}, ${personalInfo.country}`}</div>
                </div>
              )}
              {personalInfo.linkedin && (
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ color: brandColor }} className="text-[14px]">🔗</span>
                    <span className="font-bold tracking-widest uppercase text-[11px]">LinkedIn</span>
                  </div>
                  <div className="text-[12px] text-gray-300 ml-6 break-words">{personalInfo.linkedin}</div>
                </div>
              )}
            </div>
          </div>

          {/* Key Skills */}
          {flattenedSkills.length > 0 && (
            <div>
              <h2 className="text-[15px] font-bold tracking-[1px] uppercase text-white py-1.5 pl-10 mb-4" style={{ backgroundColor: brandColor, marginRight: '1.5rem' }}>
                Skills
              </h2>
              <ul className="px-10 space-y-2">
                {flattenedSkills.map((skill, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span style={{ color: brandColor }} className="text-[12px]">●</span>
                    <span className="text-[12px] text-gray-200">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-[15px] font-bold tracking-[1px] uppercase text-white py-1.5 pl-10 mb-4" style={{ backgroundColor: brandColor, marginRight: '1.5rem' }}>
                Languages
              </h2>
              <ul className="px-10 space-y-2">
                {languages.map((lang, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span style={{ color: brandColor }} className="text-[12px]">●</span>
                    <span className="text-[12px] text-gray-200">{lang}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="w-[65%] flex flex-col pt-12 pb-10 pr-10 pl-10 bg-[#F8F9FA]">
        
        {/* Name and Title */}
        <header className="mb-8">
          <h1 className="text-[32px] font-[800] tracking-[1.5px] uppercase mb-2 text-[#252525] leading-[1.1]">
            {firstName} <span style={{ color: brandColor }}>{lastName}</span>
          </h1>
          <h2 className="text-[16px] font-medium text-content-muted uppercase">
            {personalInfo.jobTitle || 'PROFESSIONAL TITLE'}
          </h2>
        </header>

        {/* Profile */}
        {summary && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-[#252525] flex items-center gap-2">
              <span className="w-6 h-[2px]" style={{ backgroundColor: brandColor }}></span>
              Professional Summary
            </h3>
            <p className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words">
              {summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-[#252525] flex items-center gap-2">
              <span className="w-6 h-[2px]" style={{ backgroundColor: brandColor }}></span>
              Experience
            </h3>
            <div className="flex flex-col gap-4">
              {experience.map((exp, index) => (
                <div key={exp.id || index}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#252525]">{exp.company} {exp.location ? `| ${exp.location}` : ''}</h4>
                      <div className="text-[13px] font-medium" style={{ color: brandColor }}>{exp.role}</div>
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
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-[#252525] flex items-center gap-2">
              <span className="w-6 h-[2px]" style={{ backgroundColor: brandColor }}></span>
              Education
            </h3>
            <div className="flex flex-col gap-4">
              {education.map((edu, index) => (
                <div key={edu.id || index}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#252525]">{edu.institution || edu.university}</h4>
                      <div className="text-[13px] font-medium" style={{ color: brandColor }}>{edu.degree} {edu.branch ? `in ${edu.branch}` : ''}</div>
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
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-[#252525] flex items-center gap-2">
              <span className="w-6 h-[2px]" style={{ backgroundColor: brandColor }}></span>
              Projects
            </h3>
            <div className="flex flex-col gap-4">
              {projects.map((proj, index) => (
                <div key={proj.id || index}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#252525]">{proj.name}</h4>
                      {proj.tools && (
                        <div className="text-[12px] font-medium" style={{ color: brandColor }}>Technologies: {proj.tools}</div>
                      )}
                    </div>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-[12px] text-[#252525] hover:underline ml-4 text-right">
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
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-[#252525] flex items-center gap-2">
              <span className="w-6 h-[2px]" style={{ backgroundColor: brandColor }}></span>
              Certifications
            </h3>
            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={cert.id || index} className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#252525]">{cert.name}</h4>
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
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-border-default pb-1 mb-3 text-[#252525] flex items-center gap-2">
              <span className="w-6 h-[2px]" style={{ backgroundColor: brandColor }}></span>
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

export default MinimalistTemplate;
