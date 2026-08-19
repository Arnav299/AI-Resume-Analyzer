"""
Resume Parser Service
=====================
Extracts structured data from raw resume text using pattern matching.
Provides two public functions:
  - parse_resume_text(text)        → flat dict (used by existing DB upload pipeline)
  - parse_resume_to_builder_json() → full nested dict matching the frontend resumeData shape

v3 improvements:
  - Broader section heading detection: ALL-CAPS headers, trailing colons, emoji prefixes
  - More section aliases: work history, professional background, technical expertise, training
  - Skill extraction handles one-per-line, comma, pipe, and semicolon delimiters
  - Experience parsing improved: better date ranges, bullet extraction
  - New public helpers:
      extract_experience_bullets(text) → list[str]  (experience description bullets)
      extract_years_of_experience(text) → float      (total years parsed from date ranges)
"""
from __future__ import annotations
import re
from datetime import datetime
from typing import List

_UID_COUNTER = 0

def _uid() -> str:
    global _UID_COUNTER
    _UID_COUNTER += 1
    return f"py{_UID_COUNTER}"


# ─── Section splitter ──────────────────────────────────────────────────────
_SECTION_HEADINGS = [
    'summary', 'objective', 'profile', 'about', 'professional summary',
    'career objective', 'career summary',
    'skills', 'technical skills', 'core competencies', 'expertise',
    'key skills', 'skills & technologies', 'tools & technologies',
    'technical expertise', 'technologies', 'tools',
    'experience', 'work experience', 'professional experience', 'employment',
    'work history', 'professional background', 'employment history',
    'career history', 'job experience',
    'education', 'academic background', 'qualifications', 'academics',
    'educational background',
    'projects', 'key projects', 'academic projects', 'personal projects',
    'notable projects', 'portfolio',
    'certifications', 'certificates', 'credentials',
    'awards', 'achievements', 'honors', 'accomplishments',
    'languages',
    'internships', 'internship experience',
    'interests', 'hobbies', 'hobbies & interests',
    'volunteer', 'volunteering', 'volunteer experience',
    'publications', 'research', 'courses', 'training',
    'references',
]


def split_sections(text: str) -> dict[str, str]:
    """Splits raw text into sections based on typical resume headers.

    Detection strategies (in order):
      1. Exact match from _SECTION_HEADINGS (case-insensitive, trimmed)
      2. ALL-CAPS line (≥ 4 chars) that isn't a long sentence
      3. Heading followed by colon e.g. "Skills:"
    """
    heading_pattern = r"^[\s\W]*(" + "|".join(
        re.escape(h) for h in sorted(_SECTION_HEADINGS, key=len, reverse=True)
    ) + r")[\s\W:]*$"
    heading_re = re.compile(heading_pattern, re.IGNORECASE)

    # ALL-CAPS heading pattern (e.g. "EXPERIENCE", "EDUCATION")
    allcaps_re = re.compile(r"^([A-Z][A-Z\s&/]{3,30})$")
    # Heading with colon e.g. "Skills:" or "Certifications:"
    colon_re = re.compile(
        r"^(" + "|".join(re.escape(h) for h in sorted(_SECTION_HEADINGS, key=len, reverse=True)) + r")\s*:\s*$",
        re.IGNORECASE
    )

    sections: dict[str, str] = {}
    raw_lines = text.split('\n')
    
    # Pre-process lines to split headers that share a line with content
    # Allow matching anywhere in the line if the line is extremely long (like a single-line OCR dump)
    inline_heading_pattern = r"(" + "|".join(re.escape(h) for h in sorted(_SECTION_HEADINGS, key=len, reverse=True)) + r")\s*[:\-]*\s+(?=[A-Z0-9(])"
    inline_heading_re = re.compile(inline_heading_pattern, re.IGNORECASE)
    
    lines = []
    for line in raw_lines:
        trimmed = line.strip()
        if not trimmed:
            continue
            
        # If the line is very long, it might be a collapsed OCR dump. Search for headings within it.
        if len(trimmed) > 200:
            parts = inline_heading_re.split(trimmed)
            # parts will be [text_before, header1, text_after1, header2, text_after2...]
            if len(parts) > 1:
                if parts[0].strip():
                    lines.append(parts[0].strip())
                for i in range(1, len(parts), 2):
                    lines.append(parts[i].strip())
                    if i + 1 < len(parts) and parts[i+1].strip():
                        lines.append(parts[i+1].strip())
                continue

        # For normal lines, check if it starts with a heading
        m_inline = re.match(r"^" + inline_heading_pattern, trimmed, re.IGNORECASE)
        if m_inline and len(trimmed) > len(m_inline.group(1)) + 5:
            lines.append(m_inline.group(1).strip())
            lines.append(trimmed[m_inline.end():].strip())
        else:
            lines.append(trimmed)

    current_section = 'header'
    current_body: list[str] = []

    for line in lines:
        trimmed = line.strip()

        # Check heading_re first (known headings)
        m = heading_re.match(trimmed)
        if m and len(trimmed) < 60:
            sections[current_section] = "\n".join(current_body).strip()
            current_section = m.group(1).lower().strip()
            current_body = []
            continue

        # Check colon heading
        m2 = colon_re.match(trimmed)
        if m2 and len(trimmed) < 50:
            sections[current_section] = "\n".join(current_body).strip()
            current_section = m2.group(1).lower().strip()
            current_body = []
            continue

        # Check ALL-CAPS headings (not too long, not a typical sentence)
        m3 = allcaps_re.match(trimmed)
        if m3 and len(trimmed) < 40 and not re.search(r'\d', trimmed):
            cap_lower = trimmed.lower().strip()
            # Only treat as heading if it maps to a known section name
            for known in _SECTION_HEADINGS:
                if cap_lower == known or cap_lower == known + 's':
                    sections[current_section] = "\n".join(current_body).strip()
                    current_section = known
                    current_body = []
                    break
            else:
                current_body.append(line)
            continue

        current_body.append(line)

    sections[current_section] = "\n".join(current_body).strip()
    return sections


# ─── personalInfo ──────────────────────────────────────────────────────────
def _extract_personal_info(header_text: str, full_text: str) -> dict:
    email_m = re.search(r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})", full_text)
    email = email_m.group(1).strip() if email_m else ""

    phone_m = re.search(r"(\+?[\d][\d\s\-().]{7,}[\d])", full_text)
    phone = phone_m.group(1).strip() if phone_m else ""

    linkedin_m = re.search(r"((?:linkedin\.com\/in\/|linkedin\.com\/)[^\s,|]+)", full_text, re.IGNORECASE)
    linkedin = linkedin_m.group(1).strip() if linkedin_m else ""

    github_m = re.search(r"(github\.com\/[^\s,|/]+(?:\/[^\s,|]+)?)", full_text, re.IGNORECASE)
    github = github_m.group(1).strip() if github_m else ""

    portfolio_m = re.search(
        r"((?:gitlab\.com\/|https?:\/\/(?!(?:linkedin|github|mail))[^\s,|]+\.[^\s,|]{2,4}))",
        full_text, re.IGNORECASE
    )
    portfolio = portfolio_m.group(1).strip() if portfolio_m else ""

    loc_m = re.search(r"(?:location|address|city)[:\s]+([^\n,|]{3,40})", full_text, re.IGNORECASE)
    if loc_m:
        location = loc_m.group(1).strip()
    else:
        loc_m2 = re.search(r"\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*(?:[A-Z]{2}|[A-Z][a-z]+))\b", full_text)
        location = loc_m2.group(1).strip() if loc_m2 else ""

    header_lines = [l.strip() for l in header_text.split('\n') if l.strip()]
    full_name = ""
    if header_lines:
        clean_name = re.sub(r"[^a-zA-Z\s.\-']", "", header_lines[0]).strip()
        # Cap name length to avoid absorbing entire paragraphs
        full_name = " ".join(clean_name.split()[:4])[:50]

    job_title = ""
    for l in header_lines[1:]:
        if not re.search(r"[@()|•]", l) and 2 < len(l) < 80:
            job_title = l.strip()
            break

    return {
        "fullName": full_name,
        "jobTitle": job_title,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio,
        "photo": None,
    }


def _extract_summary(sections: dict) -> str:
    for k in ['summary', 'professional summary', 'career summary', 'objective',
              'career objective', 'profile', 'about']:
        val = sections.get(k, "").strip()
        if val:
            # Prevent the summary from absorbing the whole resume if parsing failed
            if len(val) > 800:
                paragraphs = [p.strip() for p in re.split(r"\n\s*\n", val) if p.strip()]
                if paragraphs:
                    return paragraphs[0]
            return val
            
    # Fallback: if no sections were found AT ALL, the entire text is in 'header'.
    if len(sections) == 1 and 'header' in sections:
        header_text = sections['header']
        header_lines = [l.strip() for l in header_text.split('\n') if l.strip()]
        if header_lines:
            remainder = "\n".join(header_lines[1:]).strip()
            # If the entire text was on one line and massive
            if not remainder and len(header_lines[0]) > 100:
                words = header_lines[0].split()
                if len(words) > 4:
                    return " ".join(words[4:])
            return remainder
            
    return ""


# ─── skills ────────────────────────────────────────────────────────────────
def _extract_skills(sections: dict) -> list[str]:
    for k in ['skills', 'technical skills', 'core competencies', 'expertise',
              'key skills', 'skills & technologies', 'tools & technologies',
              'technical expertise', 'technologies', 'tools']:
        raw = sections.get(k, "").strip()
        if not raw:
            continue

        # Detect delimiter type
        if ',' in raw or '|' in raw or ';' in raw or '•' in raw:
            items = [s.strip() for s in re.split(r"[,\n•|;·▪▸\-]+", raw)]
        else:
            # One skill per line (no comma delimiter)
            items = [s.strip() for s in raw.split('\n')]
            # If lines are too short, try splitting by common single-char delimiters
            if all(len(i) < 3 for i in items if i):
                items = [s.strip() for s in re.split(r"[,\n•|;·▪▸\-]+", raw)]

        items = [s for s in items if 1 < len(s) < 60 and not re.match(r"^\d+$", s)]
        # Remove lines that look like section headers or filler
        items = [s for s in items if not re.match(
            r"^(skills|technical|competencies|expertise|tools|technologies)$", s, re.IGNORECASE
        )]
        if items:
            return items
    return []


# ─── experience ────────────────────────────────────────────────────────────
_DATE_RE = re.compile(
    r"(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\.?\s*\d{4}\b|\bPresent\b|\bCurrent\b|\bNow\b)",
    re.IGNORECASE
)


def _parse_experience_block(raw: str) -> list[dict]:
    blocks = [b.strip() for b in re.split(r"\n\s*\n", raw) if b.strip()]
    result = []
    for block in blocks:
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        if not lines:
            continue
        date_idx = next((i for i, l in enumerate(lines) if _DATE_RE.search(l)), -1)
        date_line = lines[date_idx] if date_idx >= 0 else ""
        dates = _DATE_RE.findall(date_line)
        start_date = dates[0] if dates else ""
        end_date = dates[1] if len(dates) > 1 else ""
        non_date = [l for i, l in enumerate(lines) if i != date_idx]
        role = non_date[0] if len(non_date) > 0 else ""
        company = non_date[1] if len(non_date) > 1 else ""
        desc_lines = non_date[2:]
        description = "\n".join(desc_lines)
        result.append({
            "id": _uid(),
            "role": role,
            "company": company,
            "startDate": start_date,
            "endDate": end_date,
            "description": description,
            "bullets": [l for l in desc_lines if re.match(r"^[•\-\*▪▸✓→]", l)],
        })
    return result


def _extract_experience(sections: dict) -> list[dict]:
    for k in ['experience', 'work experience', 'professional experience', 'employment',
              'work history', 'professional background', 'employment history',
              'career history', 'job experience']:
        raw = sections.get(k, "").strip()
        if raw:
            res = _parse_experience_block(raw)
            if res:
                return res
    return []


# ─── internships ───────────────────────────────────────────────────────────
def _extract_internships(sections: dict) -> list[dict]:
    for k in ['internships', 'internship experience']:
        raw = sections.get(k, "").strip()
        if raw:
            return _parse_experience_block(raw)
    return []


# ─── education ─────────────────────────────────────────────────────────────
def _extract_education(sections: dict) -> list[dict]:
    year_re = re.compile(r"\b(19|20)\d{2}\b")
    for k in ['education', 'academic background', 'qualifications', 'academics',
              'educational background']:
        raw = sections.get(k, "").strip()
        if not raw:
            continue
        blocks = [b.strip() for b in re.split(r"\n\s*\n", raw) if b.strip()]
        result = []
        for block in blocks:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not lines:
                continue
            year_line = next((l for l in lines if year_re.search(l)), "")
            year_m = year_re.search(year_line)
            year = year_m.group(0) if year_m else ""
            non_year = [l for l in lines if l != year_line]
            degree = non_year[0] if len(non_year) > 0 else ""
            institution = non_year[1] if len(non_year) > 1 else ""
            result.append({"id": _uid(), "institution": institution, "degree": degree, "year": year})
        if result:
            return result
    return []


# ─── projects ──────────────────────────────────────────────────────────────
def _extract_projects(sections: dict) -> list[dict]:
    for k in ['projects', 'key projects', 'academic projects', 'personal projects',
              'notable projects', 'portfolio']:
        raw = sections.get(k, "").strip()
        if not raw:
            continue
        blocks = [b.strip() for b in re.split(r"\n\s*\n", raw) if b.strip()]
        result = []
        for block in blocks:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not lines:
                continue
            name = lines[0]
            tools_line = next((l for l in lines if re.search(r"tech|tools|stack|built with|language", l, re.IGNORECASE)), "")
            tools = re.sub(r"^[^:]+:\s*", "", tools_line).strip() if tools_line else ""
            link = next((l for l in lines if re.search(r"https?://|github\.com|gitlab\.com", l, re.IGNORECASE)), "")
            desc_lines = [l for l in lines if l != name and l != tools_line and l != link]
            result.append({"id": _uid(), "name": name, "description": "\n".join(desc_lines), "tools": tools, "link": link})
        if result:
            return result
    return []


# ─── certifications ────────────────────────────────────────────────────────
def _extract_certifications(sections: dict) -> list[dict]:
    year_re = re.compile(r"\b(19|20)\d{2}\b")
    for k in ['certifications', 'certificates', 'credentials']:
        raw = sections.get(k, "").strip()
        if not raw:
            continue
        lines = [l.strip() for l in raw.split('\n') if l.strip()]
        result = []
        for line in lines:
            year_m = year_re.search(line)
            year = year_m.group(0) if year_m else ""
            parts = re.sub(r"[–—]", ",", line)
            parts = re.sub(r"\(.*?\)", lambda m: f",{m.group(0)[1:-1]}", parts)
            parts = [p.strip() for p in parts.split(',') if p.strip()]
            name = parts[0] if parts else line
            issuer = parts[1] if len(parts) > 1 else ""
            date = next((p for p in parts if year_re.search(p)), year)
            result.append({"id": _uid(), "name": name, "issuer": issuer, "date": date})
        if result:
            return result
    return []


# ─── achievements ──────────────────────────────────────────────────────────
def _extract_achievements(sections: dict) -> list[str]:
    for k in ['achievements', 'awards', 'honors', 'accomplishments']:
        raw = sections.get(k, "").strip()
        if not raw:
            continue
        items = [l.strip() for l in re.split(r"\n|[•▪▸]", raw) if l.strip() and len(l.strip()) > 5]
        if items:
            return items
    return []


# ─── languages ─────────────────────────────────────────────────────────────
def _extract_languages(sections: dict) -> list[str]:
    raw = sections.get('languages', "").strip()
    if not raw:
        return []
    items = [s.strip() for s in re.split(r"[,\n•|;·▪▸\-]+", raw)]
    return [s for s in items if 1 < len(s) < 30]


# ─── interests ─────────────────────────────────────────────────────────────
def _extract_interests(sections: dict) -> list[str]:
    for k in ['interests', 'hobbies', 'hobbies & interests']:
        raw = sections.get(k, "").strip()
        if not raw:
            continue
        items = [s.strip() for s in re.split(r"[,\n•|;·▪▸\-]+", raw)]
        items = [s for s in items if 1 < len(s) < 50]
        if items:
            return items
    return []


# ─── references ────────────────────────────────────────────────────────────
def _extract_references(sections: dict) -> list[dict]:
    raw = sections.get('references', "").strip()
    if not raw:
        return []
    blocks = [b.strip() for b in re.split(r"\n\s*\n", raw) if b.strip()]
    result = []
    for block in blocks:
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        if not lines:
            continue
        email_m = re.search(r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})", block)
        phone_m = re.search(r"(\+?[\d][\d\s\-().]{7,}[\d])", block)
        contact = email_m.group(1) if email_m else (phone_m.group(1) if phone_m else "")
        name = lines[0]
        position = lines[1] if len(lines) > 1 else ""
        company = lines[2] if len(lines) > 2 else ""
        result.append({"id": _uid(), "name": name, "position": position, "company": company, "contact": contact})
    return result


# ═══════════════════════════════════════════════════════════════════════════
# New Public Helpers (v3)
# ═══════════════════════════════════════════════════════════════════════════

def extract_experience_bullets(text: str) -> List[str]:
    """
    Extract all bullet-point descriptions from the experience section of a resume.
    Used for semantic responsibility matching in the ATS score engine.

    Returns:
        List of bullet/description strings, deduplicated and cleaned.
    """
    sections = split_sections(text)
    bullets: list[str] = []

    exp_keys = [
        'experience', 'work experience', 'professional experience', 'employment',
        'work history', 'professional background', 'employment history',
        'career history', 'job experience', 'internships', 'internship experience',
    ]

    for k in exp_keys:
        raw = sections.get(k, "").strip()
        if not raw:
            continue
        # Look for lines starting with bullet markers
        for line in raw.split('\n'):
            stripped = line.strip()
            if stripped and (
                re.match(r"^[•\-\*▪▸✓→►◆▶]", stripped) or
                re.match(r"^\d+\.\s+", stripped)
            ):
                # Remove the bullet marker
                clean = re.sub(r"^[•\-\*▪▸✓→►◆▶]\s*|^\d+\.\s*", "", stripped).strip()
                if clean and len(clean) > 10:
                    bullets.append(clean)

    # If no bullet markers found, return non-empty lines from experience section
    if not bullets:
        for k in exp_keys:
            raw = sections.get(k, "").strip()
            if raw:
                lines = [l.strip() for l in raw.split('\n')
                         if l.strip() and len(l.strip()) > 15
                         and not _DATE_RE.search(l)]
                bullets.extend(lines[:30])  # Cap at 30 lines
                break

    # Deduplicate while preserving order
    seen: set[str] = set()
    result: list[str] = []
    for b in bullets:
        if b not in seen:
            seen.add(b)
            result.append(b)

    return result


def extract_years_of_experience(text: str) -> float:
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
    r"overview|specialization|expertise|competency|"
    r"power|bi|communications|media|computational|technology|technologies|"
    r"services|solutions|systems|group|holdings|it|computer|electrical|"
    r"electronic|course|certification|certificate|certified|professional|"
    r"national|international|global|regional|local"
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

    # Strategy 3: Scan ONLY the top 10 lines. Scanning deeper hits project titles and headings.
    for line in lines[:10]:
        first_part = re.split(r"[\|•,\-–]", line)[0].strip()
        if _NOT_A_NAME_RE.search(first_part):
            continue
        if len(first_part) < 3 or len(first_part) > 55:
            continue
        candidate = re.sub(r"[^a-zA-Z\s.''\-]", "", first_part).strip()
        candidate = " ".join(candidate.split()[:4])
        if _is_valid_human_name(candidate):
            return _title_case_name(candidate)

    # Strategy 4: Fallback to name extracted from Email (useful if OCR missed the actual name)
    email_re = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")
    email_match = email_re.search(text)
    if email_match:
        email = email_match.group(0)
        local_part = email.split('@')[0]
        local_part = re.sub(r'\d+', '', local_part)
        parts = re.split(r'[._\-]', local_part)
        parts = [p for p in parts if len(p) > 0]
        
        if len(parts) >= 2:
            name = " ".join(parts)
            if len(name) >= 3:
                return _title_case_name(name)
        elif len(parts) == 1 and len(parts[0]) >= 3:
            return _title_case_name(parts[0])

    # Strategy 5: Fallback to cleaned filename
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
    if len(name) > 2 and (name == name.upper() or name == name.lower()):
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
