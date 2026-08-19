import React from 'react';
import { Code2, Terminal, Link as LinkIcon } from 'lucide-react';

const StudentTemplate = ({ data }) => {
  const { 
    personalInfo = {}, 
    summary = "", 
    skills = {}, 
    experience = [], 
    internships = [], 
    education = [], 
    projects = [], 
    certifications = [], 
    achievements = [], 
    languages = [], 
    interests = [], 
    courses = []
  } = data;

  // Flatten skills for display if it's an object
  const flattenedSkills = Array.isArray(skills) 
    ? skills 
    : Object.values(skills).flat().filter(Boolean);

  return (
    <div className="w-[800px] min-h-[1131px] bg-surface text-content font-sans p-12 mx-auto box-border border-t-[12px] border-[#10B981] flex flex-col shadow-sm">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-[32px] font-[800] tracking-[1.5px] uppercase text-content leading-[1.1] mb-2">
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            <h2 className="text-[16px] font-medium text-[#10B981] uppercase">
              {personalInfo.jobTitle || 'Student / Fresher'}
            </h2>
          </div>
          {personalInfo.photo && (
            <img 
              src={personalInfo.photo} 
              alt="Profile" 
              className="w-20 h-20 rounded-xl object-cover border-2 border-border-subtle shadow-sm"
            />
          )}
        </div>
        
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-medium text-content-secondary bg-page p-4 rounded-xl border border-border-subtle">
          {personalInfo.email && <span>📧 {personalInfo.email}</span>}
          {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
          {(personalInfo.location || personalInfo.city) && <span>📍 {personalInfo.location || `${personalInfo.city}, ${personalInfo.country}`}</span>}
          {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
          {(personalInfo.portfolio || personalInfo.personalWebsite) && <span>🌐 {personalInfo.portfolio || personalInfo.personalWebsite}</span>}
          {personalInfo.github && <span className="flex items-center gap-1"><Code2 size={12} /> {personalInfo.github}</span>}
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section className="mb-6">
          <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
            Professional Summary
          </h3>
          <p className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words">{summary}</p>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
            Academic Background
          </h3>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={edu.id || index} className="bg-page p-4 rounded-lg border-l-4 border-[#10B981]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[13px] font-bold text-content">{edu.institution || edu.university}</h4>
                    <div className="text-[13px] font-medium text-content-secondary">{edu.degree} {edu.branch ? `in ${edu.branch}` : ''}</div>
                    {edu.cgpa && <div className="text-[12px] font-semibold text-emerald-600 mt-1">CGPA: {edu.cgpa}</div>}
                  </div>
                  <div className="text-[12px] font-bold text-white bg-[#10B981] px-3 py-1 rounded-full shadow-sm ml-4 whitespace-nowrap">
                    {edu.startYear || ''} {edu.startYear && (edu.endYear || edu.year) ? '-' : ''} {edu.endYear || edu.year || 'Present'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-[1fr_2fr] gap-8 mt-2">
        
        {/* Left Column (Skills, Courses, Certifications, etc) */}
        <div className="flex flex-col gap-6">
          {/* Technical Skills */}
          {flattenedSkills.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {flattenedSkills.map((skill, index) => (
                  <span key={index} className="text-[11px] font-bold bg-[#10B981]/10 text-[#10B981] px-3 py-1.5 rounded-md border border-[#10B981]/20">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Courses */}
          {courses.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
                Courses
              </h3>
              <ul className="list-disc list-outside ml-4 space-y-1 text-[12px] text-content-secondary">
                {courses.map((c, index) => (
                  <li key={index}>{c}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
                Certifications
              </h3>
              <div className="space-y-3">
                {certifications.map(cert => (
                  <div key={cert.id || cert.name}>
                    <div className="text-[13px] font-bold text-content">{cert.name}</div>
                    <div className="text-[12px] text-content-muted font-medium">{cert.issuer}</div>
                    <div className="text-[11px] text-content-muted mt-0.5">{cert.issueDate || cert.date}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Languages */}
          {languages.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
                Languages
              </h3>
              <ul className="list-disc list-outside ml-4 space-y-1 text-[12px] text-content-secondary">
                {languages.map((l, index) => (
                  <li key={index}>{l}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Column (Experience, Projects, Achievements) */}
        <div className="flex flex-col gap-6">
          {/* Internships & Experience */}
          {(internships.length > 0 || experience.length > 0) && (
            <section>
              <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
                Experience
              </h3>
              <div className="space-y-4">
                {[...internships, ...experience].map((exp, index) => (
                  <div key={exp.id || index} className="relative pl-5 border-l-2 border-emerald-100">
                    <div className="absolute -left-[5px] top-[4px] w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                    <div className="flex justify-between items-start mb-0.5">
                      <div>
                        <h4 className="text-[13px] font-bold text-content">{exp.company} {exp.location ? `| ${exp.location}` : ''}</h4>
                        <div className="text-[13px] font-medium text-emerald-600">{exp.role}</div>
                      </div>
                      <span className="text-[12px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md whitespace-nowrap ml-4 text-right">
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

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
                Projects
              </h3>
              <div className="space-y-4">
                {projects.map((proj, index) => (
                  <div key={proj.id || index} className="bg-page border border-border-default p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-0.5">
                      <div>
                        <h4 className="text-[13px] font-bold text-content">{proj.name}</h4>
                        {proj.tools && (
                          <div className="flex items-center gap-1 text-[12px] font-medium text-content-muted">
                            <Terminal size={12}/> {proj.tools}
                          </div>
                        )}
                      </div>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold text-[#10B981] hover:underline flex items-center gap-1 ml-4 text-right">
                          <LinkIcon size={12}/> View
                        </a>
                      )}
                    </div>
                    <div className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words mt-2">
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

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <section>
              <h3 className="text-[15px] font-bold uppercase tracking-[1px] text-content border-b-2 border-[#10B981] pb-1 mb-3 inline-block">
                Achievements
              </h3>
              <ul className="list-disc list-outside ml-4 space-y-1 text-[12px] leading-[1.6] text-content-secondary">
                {achievements.map((ach, index) => (
                  <li key={index}>{ach}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTemplate;
