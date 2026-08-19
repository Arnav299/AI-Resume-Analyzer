import React from 'react';
import { Mail, Phone, MapPin, Link as LinkIcon, Globe, Briefcase, GraduationCap, FolderOpen, Code2, Award, Star } from 'lucide-react';

const ModernTemplate = ({ data }) => {
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
    references = [] 
  } = data;

  // Flatten skills for display if it's an object
  const flattenedSkills = Array.isArray(skills) 
    ? skills 
    : Object.values(skills).flat().filter(Boolean);

  return (
    <div className="w-[800px] min-h-[1131px] bg-surface text-content font-sans flex shadow-sm box-border">
      {/* Left Sidebar */}
      <div className="w-[32%] bg-[#1E3A8A] text-white p-8 flex flex-col min-h-[1131px]">
        {personalInfo.photo && (
          <div className="flex justify-center mb-6">
            <img 
              src={personalInfo.photo} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
        )}
        
        {/* Contact Info */}
        <section className="mb-8">
          <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-blue-400 pb-1 mb-3 text-blue-200">Contact</h3>
          <div className="flex flex-col gap-3 text-[12px]">
            {personalInfo.phone && (
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-blue-300" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.email && (
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-blue-300" />
                <span className="break-all">{personalInfo.email}</span>
              </div>
            )}
            {(personalInfo.location || personalInfo.city) && (
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-blue-300" />
                <span>{personalInfo.location || `${personalInfo.city}, ${personalInfo.country}`}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-3">
                <LinkIcon size={14} className="text-blue-300" />
                <span className="break-all">{personalInfo.linkedin}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-3">
                <Code2 size={14} className="text-blue-300" />
                <span className="break-all">{personalInfo.github}</span>
              </div>
            )}
            {(personalInfo.portfolio || personalInfo.personalWebsite) && (
              <div className="flex items-center gap-3">
                <Globe size={14} className="text-blue-300" />
                <span className="break-all">{personalInfo.portfolio || personalInfo.personalWebsite}</span>
              </div>
            )}
          </div>
        </section>

        {/* Skills */}
        {flattenedSkills.length > 0 && (
          <section className="mb-8">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-blue-400 pb-1 mb-3 text-blue-200">Skills</h3>
            <ul className="flex flex-col gap-2 text-[12px]">
              {flattenedSkills.map((skill, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-300 rounded-full shrink-0" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section className="mb-8">
            <h3 className="text-[15px] font-bold uppercase tracking-[1px] border-b border-blue-400 pb-1 mb-3 text-blue-200">Languages</h3>
            <ul className="flex flex-col gap-2 text-[12px]">
              {languages.map((lang, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-300 rounded-full shrink-0" />
                  <span>{lang}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Right Content */}
      <div className="w-[68%] p-10 flex flex-col bg-page min-h-[1131px]">
        
        {/* Header */}
        <header className="mb-8 pb-4 border-b-2 border-border-default">
          <h1 className="text-[32px] font-[800] text-content uppercase tracking-[1.5px] leading-[1.1] mb-2">
            {personalInfo.fullName}
          </h1>
          <h2 className="text-[16px] font-medium text-[#1E3A8A] uppercase">
            {personalInfo.jobTitle}
          </h2>
        </header>

        {/* Summary */}
        {summary && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold text-content border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#1E3A8A]"></span>
              Professional Summary
            </h3>
            <p className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words">
              {summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold text-content border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <Briefcase className="text-[#1E3A8A]" size={16} />
              Experience
            </h3>
            <div className="flex flex-col gap-4">
              {experience.map((exp, index) => (
                <div key={exp.id || index} className="relative pl-5 border-l-2 border-border-default">
                  <div className="absolute w-3 h-3 bg-[#1E3A8A] rounded-full -left-[7px] top-[4px] border-2 border-white" />
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-content">{exp.company} {exp.location ? `| ${exp.location}` : ''}</h4>
                      <div className="text-[13px] font-medium text-[#1E3A8A]">{exp.role}</div>
                    </div>
                    <div className="text-[12px] font-semibold text-content-muted bg-slate-200 px-2 py-0.5 rounded whitespace-nowrap ml-4">
                      {exp.startMonth} {exp.startYear || exp.startDate} - {exp.currentlyWorking ? 'Present' : (exp.endMonth ? `${exp.endMonth} ${exp.endYear}` : exp.endDate)}
                    </div>
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
        {education.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold text-content border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <GraduationCap className="text-[#1E3A8A]" size={16} />
              Education
            </h3>
            <div className="flex flex-col gap-4">
              {education.map((edu, index) => (
                <div key={edu.id || index}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-content">{edu.institution || edu.university}</h4>
                      <div className="text-[13px] font-medium text-[#1E3A8A]">{edu.degree} {edu.branch ? `in ${edu.branch}` : ''}</div>
                    </div>
                    <div className="text-[12px] text-content-muted font-semibold text-right whitespace-nowrap ml-4">
                      {edu.startYear || ''} {edu.startYear && (edu.endYear || edu.year) ? '-' : ''} {edu.endYear || edu.year}
                    </div>
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
        {projects.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold text-content border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <FolderOpen className="text-[#1E3A8A]" size={16} />
              Projects
            </h3>
            <div className="flex flex-col gap-4">
              {projects.map((proj, index) => (
                <div key={proj.id || index} className="bg-surface p-4 rounded border border-border-default shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[13px] font-bold text-content">{proj.name}</h4>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] hover:underline text-[12px] flex items-center gap-1">
                        <LinkIcon size={12} /> View Project
                      </a>
                    )}
                  </div>
                  {proj.tools && (
                    <div className="text-[12px] font-medium text-[#1E3A8A] mb-2 bg-blue-50 inline-block px-2 py-0.5 rounded">
                      {proj.tools}
                    </div>
                  )}
                  <div className="text-[12px] leading-[1.6] text-content-secondary whitespace-pre-wrap break-words">
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
        {certifications.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[15px] font-bold text-content border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <Award className="text-[#1E3A8A]" size={16} />
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
            <h3 className="text-[15px] font-bold text-content border-b border-border-default pb-1 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              <Star className="text-[#1E3A8A]" size={16} />
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
  );
};

export default ModernTemplate;
