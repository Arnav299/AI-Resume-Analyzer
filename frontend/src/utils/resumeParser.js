/**
 * resumeParser.js
 * ================
 * Client-side fallback regex parser for extracting data if the backend AI is unavailable.
 * Fully structured to match the massive schema expected by the frontend.
 */

const uid = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);
const first = (text, regex) => { const m = text.match(regex); return m ? m[1].trim() : ''; };

export function parseResumeText(rawText, existingData = {}) {
  // Safe default fallback matching the granular schema
  const parsed = {
    personalInfo: {
      fullName: first(rawText.slice(0, 500), /([A-Z][a-z]+ [A-Z][a-z]+)/) || '',
      jobTitle: '',
      email: first(rawText, /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/) || '',
      phone: first(rawText, /(\+?[\d][\d\s\-().]{7,}[\d])/) || '',
      alternatePhone: '',
      location: first(rawText, /(?:location|address|city)[:\s]+([^\n,|]{3,40})/i) || '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      nationality: '',
      dob: '',
      linkedin: first(rawText, /((?:linkedin\.com\/in\/|linkedin\.com\/)[^\s,|]+)/i) || '',
      github: first(rawText, /(github\.com\/[^\s,|/]+(?:\/[^\s,|]+)?)/i) || '',
      portfolio: '',
      personalWebsite: '',
      photo: existingData?.personalInfo?.photo || null,
    },
    summary: '',
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      programmingLanguages: [],
      frameworks: [],
      libraries: [],
      databases: [],
      cloudPlatforms: [],
      devOpsTools: [],
      aiTools: [],
      operatingSystems: [],
      other: []
    },
    projects: [],
    certifications: [],
    awards: [],
    achievements: [],
    publications: [],
    patents: [],
    volunteer: [],
    internships: [],
    courses: [],
    interests: [],
    languages: [],
    references: [],
  };
  
  // Basic Regex fallback extraction logic (very naive compared to AI)
  // This just safely provides empty structures if AI fails.
  const lines = rawText.split('\n').filter(Boolean);
  if (lines.length > 0 && !parsed.personalInfo.fullName) {
      parsed.personalInfo.fullName = lines[0].replace(/[^a-zA-Z\s.-]/g, '').trim();
  }

  // Very naive experience detection
  if (rawText.toLowerCase().includes('experience')) {
      parsed.experience.push({
          id: uid(),
          company: 'Fallback Company',
          role: 'Fallback Role',
          employmentType: 'Full-time',
          location: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          currentlyWorking: false,
          description: 'AI Parsing failed. Fallback regex engaged. Please edit manually.',
          responsibilities: [],
          achievements: []
      });
  }

  return parsed;
}
