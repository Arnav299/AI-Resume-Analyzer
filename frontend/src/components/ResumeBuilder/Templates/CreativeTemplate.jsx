import React from 'react';

const CreativeTemplate = ({ data }) => {
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

  // Colors based on the reference image
  const bannerColor = '#b88d6d'; // Main brown banner
  const lightTan = '#d5c4b3'; // Top-left triangle color
  const bgColor = '#fffaf7'; // Very light pinkish-beige background

  // Try to split the name into two parts for the header if it has multiple words
  const nameParts = (personalInfo.fullName || 'YOUR NAME').trim().split(' ');
  const firstName = nameParts.length > 1 ? nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ') : nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') : '';

  // Flatten skills for display
  const flattenedSkills = Array.isArray(skills) 
    ? skills 
    : Object.values(skills).flat().filter(Boolean);

  return (
    <div className="w-[800px] min-h-[1131px] text-content font-sans mx-auto box-border overflow-hidden shadow-sm relative flex flex-col" style={{ backgroundColor: bgColor }}>
      
      {/* Decorative Top Header Banner */}
      <div className="relative w-full h-[160px] shrink-0 overflow-hidden">
        {/* Background layer (light tan) */}
        <div className="absolute inset-0" style={{ backgroundColor: lightTan }}></div>
        
        {/* White angled stripe */}
        <div className="absolute top-8 left-[-10%] right-[-10%] h-[15px] bg-surface transform -rotate-2"></div>
        
        {/* Main brown banner */}
        <div 
          className="absolute top-[45px] left-[-5%] right-[-5%] h-[200px] transform -rotate-1" 
          style={{ backgroundColor: bannerColor }}
        ></div>

        {/* Header Text (Name) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pl-[25%] z-10">
          <h1 className="text-[32px] font-[800] tracking-[1.5px] uppercase text-white leading-[1.1]">
            {firstName} {lastName}
          </h1>
        </div>
      </div>

      {/* Main Content Area (Two Columns) */}
      <div className="flex flex-1 z-10 relative">
        
        {/* Left Sidebar */}
        <aside className="w-[32%] pl-8 pr-6 border-r border-border-default/60 pb-8 flex flex-col pt-2">
          
          {/* Candidate Photo Overlapping Banner */}
          <div className="flex justify-center -mt-20 mb-8 relative z-20">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-[4px] border-white shadow-md bg-surface"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-[4px] border-white shadow-md bg-gray-200 flex items-center justify-center text-3xl text-content-muted font-bold">
                {firstName.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Contact */}
            <div>
              <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b pb-1 mb-3 text-black" style={{ borderColor: bannerColor }}>
                Contact
              </h2>
              <div className="space-y-3">
                {personalInfo.phone && (
                  <div className="flex items-start gap-3 text-[12px] text-content-secondary">
                    <span className="text-[14px]">📞</span>
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-start gap-3 text-[12px] text-content-secondary">
                    <span className="text-[14px]">✉️</span>
                    <span className="break-all">{personalInfo.email}</span>
                  </div>
                )}
                {(personalInfo.location || personalInfo.city) && (
                  <div className="flex items-start gap-3 text-[12px] text-content-secondary">
                    <span className="text-[14px]">📍</span>
                    <span>{personalInfo.location || `${personalInfo.city}, ${personalInfo.country}`}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-start gap-3 text-[12px] text-content-secondary">
                    <span className="text-[14px]">🔗</span>
                    <span className="break-all">{personalInfo.linkedin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {flattenedSkills.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b pb-1 mb-3 text-black" style={{ borderColor: bannerColor }}>
                  Skills
                </h2>
                <ul className="space-y-1.5">
                  {flattenedSkills.map((skill, index) => (
                    <li key={index} className="text-[12px] text-content-secondary flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: bannerColor }}></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b pb-1 mb-3 text-black" style={{ borderColor: bannerColor }}>
                  Languages
                </h2>
                <ul className="space-y-1.5">
                  {languages.map((lang, index) => (
                    <li key={index} className="text-[12px] text-content-secondary flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: bannerColor }}></span>
                      {lang}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="w-[68%] pl-8 pr-8 pt-8 pb-10 flex flex-col">
          
          {/* Job Title */}
          <div className="mb-6">
             <h2 className="text-[16px] font-medium text-content-muted uppercase">
               {personalInfo.jobTitle || 'PROFESSIONAL TITLE'}
             </h2>
          </div>

          {/* Profile Summary */}
          {summary && (
            <section className="mb-6">
              <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b pb-1 mb-3 text-black flex items-center gap-2" style={{ borderColor: bannerColor }}>
                <span className="w-6 h-[2px]" style={{ backgroundColor: bannerColor }}></span>
                Professional Summary
              </h2>
              <p className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words">
                {summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section className="mb-6">
              <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b pb-1 mb-3 text-black flex items-center gap-2" style={{ borderColor: bannerColor }}>
                <span className="w-6 h-[2px]" style={{ backgroundColor: bannerColor }}></span>
                Experience
              </h2>
              <div className="flex flex-col gap-4">
                {experience.map((exp, index) => (
                  <div key={exp.id || index} className="relative pl-5">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[3px] top-[14px] bottom-0 w-px bg-gray-300"></div>
                    {/* Timeline dot */}
                    <div className="absolute left-[0px] top-[6px] w-2 h-2 rounded-full" style={{ backgroundColor: bannerColor }}></div>
                    
                    <div className="flex justify-between items-start mb-0.5">
                      <div>
                        <h3 className="text-[13px] font-bold text-black">{exp.company} {exp.location ? `| ${exp.location}` : ''}</h3>
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
              <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b pb-1 mb-3 text-black flex items-center gap-2" style={{ borderColor: bannerColor }}>
                <span className="w-6 h-[2px]" style={{ backgroundColor: bannerColor }}></span>
                Education
              </h2>
              <div className="flex flex-col gap-4">
                {education.map((edu, index) => (
                  <div key={edu.id || index} className="relative pl-5">
                    <div className="absolute left-[3px] top-[14px] bottom-0 w-px bg-gray-300"></div>
                    <div className="absolute left-[0px] top-[6px] w-2 h-2 rounded-full" style={{ backgroundColor: bannerColor }}></div>
                    
                    <div className="flex justify-between items-start mb-0.5">
                      <div>
                        <h3 className="text-[13px] font-bold text-black">{edu.institution || edu.university}</h3>
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
              <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b pb-1 mb-3 text-black flex items-center gap-2" style={{ borderColor: bannerColor }}>
                <span className="w-6 h-[2px]" style={{ backgroundColor: bannerColor }}></span>
                Projects
              </h2>
              <div className="flex flex-col gap-4">
                {projects.map((proj, index) => (
                  <div key={proj.id || index} className="relative pl-5">
                    <div className="absolute left-[3px] top-[14px] bottom-0 w-px bg-gray-300"></div>
                    <div className="absolute left-[0px] top-[6px] w-2 h-2 rounded-full" style={{ backgroundColor: bannerColor }}></div>
                    
                    <div className="flex justify-between items-start mb-0.5">
                      <div>
                        <h3 className="text-[13px] font-bold text-black">{proj.name}</h3>
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
              <h2 className="text-[15px] font-bold uppercase tracking-[1px] border-b pb-1 mb-3 text-black flex items-center gap-2" style={{ borderColor: bannerColor }}>
                <span className="w-6 h-[2px]" style={{ backgroundColor: bannerColor }}></span>
                Certifications
              </h2>
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div key={cert.id || index} className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[13px] font-bold text-black">{cert.name}</h4>
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

        </main>
      </div>
    </div>
  );
};

export default CreativeTemplate;
