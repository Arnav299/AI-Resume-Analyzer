"""
Completeness Checker Service
=============================
Evaluates how complete a resume is by checking for the presence of
standard resume sections.
"""
from __future__ import annotations

import re
from typing import List, Dict, Any

# Section keywords to look for (regex, case-insensitive)
_REQUIRED_SECTIONS: List[tuple[str, str]] = [
    ("contact",       r"\b(email|phone|linkedin|github|contact)\b"),
    ("education",     r"\b(education|degree|university|college|b\.tech|m\.tech|bachelor|master)\b"),
    ("skills",        r"\b(skills|technologies|tech stack|tools)\b"),
    ("experience",    r"\b(experience|internship|intern|work history|employment)\b"),
    ("projects",      r"\b(projects?|portfolio|built|developed|created)\b"),
]

_OPTIONAL_SECTIONS: List[tuple[str, str]] = [
    ("certifications", r"\b(certif|credential|badge|course|udemy|coursera)\b"),
    ("achievements",   r"\b(achievement|award|honor|honour|scholarship|rank)\b"),
    ("summary",        r"\b(summary|objective|profile|about me)\b"),
]


async def evaluate_completeness(text: str) -> Dict[str, Any]:
    """
    Score how complete a resume is.

    Returns:
        dict with:
            completeness_score  – 0.0–100.0
            sections_found      – list of detected section names
            missing_sections    – list of required sections not found
    """
    sections_found: list[str] = []
    missing_sections: list[str] = []

    for section_name, pattern in _REQUIRED_SECTIONS:
        if re.search(pattern, text, re.IGNORECASE):
            sections_found.append(section_name)
        else:
            missing_sections.append(section_name)

    for section_name, pattern in _OPTIONAL_SECTIONS:
        if re.search(pattern, text, re.IGNORECASE):
            sections_found.append(section_name)

    # Score: required sections each worth 15 pts (max 75) + bonus 5 per optional (max 25)
    required_found  = len(_REQUIRED_SECTIONS) - len(missing_sections)
    optional_found  = len(sections_found) - required_found
    score = (required_found / len(_REQUIRED_SECTIONS)) * 75
    score += min(optional_found * 8.33, 25)
    score = min(round(score, 2), 100.0)

    return {
        "completeness_score": score,
        "sections_found":     sections_found,
        "missing_sections":   missing_sections,
    }
