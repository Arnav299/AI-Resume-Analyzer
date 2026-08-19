import sys
import os
import re

filepath = r'c:\Users\TANUJA SOPAN SHELKE\OneDrive\Desktop\Antigrvaity\AI_Resume_Analyzer\backend\app\services\resume_parser.py'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where extract_years_of_experience starts
start_idx = 0
for i, line in enumerate(lines):
    if line.startswith('def extract_years_of_experience'):
        start_idx = i
        break

correct_code = r'''def extract_years_of_experience(text: str) -> float:
    """
    Parse date ranges from resume text and compute total years of experience.
    Handles formats:
      - "Jan 2020 – Present"
      - "2018 - 2022"
      - "March 2019 to December 2021"

    Returns:
        Total years as a float (e.g. 3.5). Returns 0.0 if no dates found.
    """
    current_year = datetime.now().year
    current_month = datetime.now().month

    year_range_re = re.compile(
        r"\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4})\b"
        r"\s*(?:[-–—]|to)\s*"
        r"\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?"
        r"(\d{4}|present|current|now)\b",
        re.IGNORECASE
    )

    month_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
    }

    total_months = 0.0
    seen_ranges: set[tuple] = set()

    for m in year_range_re.finditer(text):
        start_month_str = (m.group(1) or "").strip().lower()[:3]
        start_year = int(m.group(2))
        end_month_str = (m.group(3) or "").strip().lower()[:3]
        end_str = m.group(4).lower()

        start_month = month_map.get(start_month_str, 1) if start_month_str else 1
        if end_str in ('present', 'current', 'now'):
            end_year = current_year
            end_month = current_month
        else:
            try:
                end_year = int(end_str)
                end_month = month_map.get(end_month_str, 12) if end_month_str else 12
            except ValueError:
                continue

        if end_year < start_year or start_year < 1970 or end_year > current_year + 1:
            continue

        range_key = (start_year, start_month, end_year, end_month)
        if range_key in seen_ranges:
            continue
        seen_ranges.add(range_key)

        months = (end_year - start_year) * 12 + (end_month - start_month)
        total_months += max(0, months)

    years = round(min(total_months / 12.0, 40.0), 1)
    return years


# ═══════════════════════════════════════════════════════════════════════════
# Public function 0 — Robust candidate name extractor
# ═══════════════════════════════════════════════════════════════════════════

_NOT_A_NAME_RE = re.compile(
    r"[@\d\(\)\[\]{}|/\\<>]"                  # special chars → email/phone/URL
    r"|\.com|\.in|\.net|\.org|\.io|\.co"      # domain extensions
    r"|linkedin|github|gitlab|twitter|facebook|instagram"
    r"|resume|curriculum|vitae|portfolio|profile"
    r"|department|university|college|institute|school|academy"
    r"|pvt|ltd|inc|llc|corp|co\.|company",
    re.IGNORECASE,
)

_NON_NAME_WORDS = re.compile(
    r"^("
    r"excel|word|powerpoint|outlook|access|onenote|teams|sharepoint|"
    r"sql|mysql|postgresql|mongodb|sqlite|oracle|redis|cassandra|"
    r"python|java|javascript|typescript|golang|ruby|php|swift|kotlin|scala|"
    r"react|angular|vue|nodejs|node|django|flask|spring|laravel|rails|"
    r"aws|azure|gcp|cloud|docker|kubernetes|terraform|ansible|jenkins|"
    r"linux|windows|macos|unix|ubuntu|debian|centos|"
    r"tableau|powerbi|looker|qlik|quickbooks|sap|"
    r"tensorflow|pytorch|sklearn|keras|numpy|pandas|matplotlib|"
    r"html|css|bootstrap|sass|less|jquery|webpack|"
    r"git|jira|confluence|slack|trello|"
    r"microsoft|google|amazon|apple|facebook|meta|netflix|uber|"
    r"ibm|cisco|adobe|salesforce|hubspot|zoho|"
    r"analyst|engineer|developer|programmer|architect|designer|manager|"
    r"director|specialist|consultant|coordinator|executive|lead|head|"
    r"senior|junior|associate|intern|trainee|fresher|staff|officer|"
    r"assistant|administrator|supervisor|technical|principal|"
    r"software|hardware|data|network|system|application|web|mobile|"
    r"machine|intelligence|artificial|deep|backend|frontend|"
    r"fullstack|devops|agile|scrum|kanban|project|product|business|"
    r"marketing|sales|operations|finance|accounting|auditing|"
    r"recruitment|hr|human|resources|supply|chain|logistics|"
    r"bachelor|master|phd|doctorate|diploma|degree|science|engineering|"
    r"commerce|arts|technology|information|management|mba|btech|mtech|"
    r"bca|mca|bsc|msc|"
    r"summary|objective|experience|education|skills|certifications|"
    r"projects|achievements|awards|references|contact|address|"
    r"overview|specialization|expertise|competency"
    r")$",
    re.IGNORECASE,
)

_EXPLICIT_NAME_RE = re.compile(
    r"^(?:name|full\s*name|candidate\s*name|applicant\s*name|student\s*name)\s*[:\-–]\s*(.+)$",
    re.IGNORECASE | re.MULTILINE,
)

def extract_candidate_name(text: str, fallback_filename: str = "") -> str:
    if not text:
        return _clean_filename_as_fallback(fallback_filename)

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    for m in _EXPLICIT_NAME_RE.finditer(text):
        candidate = m.group(1).strip()
        candidate = re.sub(r"[^a-zA-Z\s.''\-]", "", candidate).strip()
        candidate = " ".join(candidate.split()[:4])
        if _is_valid_human_name(candidate):
            return _title_case_name(candidate)

    sections = split_sections(text)
    header_text = sections.get("header", "")
    header_lines = [l.strip() for l in header_text.split("\n") if l.strip()]
    for hline in header_lines[:5]:
        candidate = re.sub(r"[^a-zA-Z\s.''\-]", "", hline).strip()
        candidate = " ".join(candidate.split()[:4])
        if _is_valid_human_name(candidate):
            return _title_case_name(candidate)

    for line in lines[:30]:
        first_part = re.split(r"[\|•,\-–]", line)[0].strip()
        if _NOT_A_NAME_RE.search(first_part):
            continue
        if len(first_part) < 3 or len(first_part) > 55:
            continue
        candidate = re.sub(r"[^a-zA-Z\s.''\-]", "", first_part).strip()
        candidate = " ".join(candidate.split()[:4])
        if _is_valid_human_name(candidate):
            return _title_case_name(candidate)

    return _clean_filename_as_fallback(fallback_filename)

def _is_valid_human_name(candidate: str) -> bool:
    if not candidate or len(candidate) < 4:
        return False
    words = candidate.split()
    if not (2 <= len(words) <= 4):
        return False
    for w in words:
        if len(w) < 2 or not w[0].isalpha():
            return False
    if _NOT_A_NAME_RE.search(candidate):
        return False
    for w in words:
        if _NON_NAME_WORDS.match(w):
            return False
    if candidate == candidate.lower():
        return False
    if not words[0][0].isupper():
        return False
    return True

def _title_case_name(name: str) -> str:
    if name == name.upper() and len(name) > 2:
        return name.title()
    return name

def _clean_filename_as_fallback(filename: str) -> str:
    if not filename:
        return "Unknown Candidate"
    name = re.sub(r"\.[^.]+$", "", filename)
    name = re.sub(r"[_\-]+", " ", name).strip()
    return name or "Unknown Candidate"

def parse_resume_text(text: str) -> dict[str, str]:
    sections = split_sections(text)
    header_text = sections.get('header', text[:500])
    personal_info = _extract_personal_info(header_text, text)

    def _section_text(keys):
        for k in keys:
            val = sections.get(k, "").strip()
            if val:
                return val
        return ""

    return {
        "name": personal_info["fullName"],
        "email": personal_info["email"],
        "phone": personal_info["phone"],
        "location": personal_info["location"],
        "summary": _section_text(['summary', 'professional summary', 'career summary',
                                   'objective', 'career objective', 'profile', 'about']),
        "education": _section_text(['education', 'academic background', 'qualifications',
                                    'academics', 'educational background']),
        "experience": _section_text(['experience', 'work experience', 'professional experience',
                                     'employment', 'work history', 'professional background',
                                     'employment history', 'career history', 'internships']),
        "projects": _section_text(['projects', 'key projects', 'academic projects',
                                   'personal projects', 'notable projects']),
        "certifications": _section_text(['certifications', 'certificates', 'credentials',
                                         'awards', 'achievements']),
    }

# ═══════════════════════════════════════════════════════════════════════════
# Public function 2 — returns the full frontend resumeData shape
# ═══════════════════════════════════════════════════════════════════════════
def parse_resume_to_builder_json(text: str) -> dict:
    sections = split_sections(text)
    header_text = sections.get('header', text[:500])
    personal_info = _extract_personal_info(header_text, text)

    return {
        "personalInfo": personal_info,
        "summary": _extract_summary(sections),
        "skills": _extract_skills(sections),
        "experience": _extract_experience(sections),
        "internships": _extract_internships(sections),
        "education": _extract_education(sections),
        "projects": _extract_projects(sections),
        "certifications": _extract_certifications(sections),
        "achievements": _extract_achievements(sections),
        "languages": _extract_languages(sections),
        "interests": _extract_interests(sections),
        "references": _extract_references(sections),
    }
'''

new_lines = lines[:start_idx]
with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
    f.write(correct_code)

print('File restored successfully.')
