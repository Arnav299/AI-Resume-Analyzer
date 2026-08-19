"""
Soft Skill Detector Service
============================
Detects soft/behavioural skills mentioned in resume text using a keyword list.
"""
from __future__ import annotations

import re
from typing import List

_SOFT_SKILLS: List[str] = [
    "communication", "teamwork", "leadership", "problem solving",
    "problem-solving", "critical thinking", "time management",
    "adaptability", "creativity", "collaboration", "interpersonal",
    "presentation", "analytical", "detail-oriented", "self-motivated",
    "project management", "conflict resolution", "decision making",
    "decision-making", "emotional intelligence", "mentoring", "coaching",
    "organizational", "multitasking", "negotiation", "active listening",
    "customer service", "work ethic", "initiative", "accountability",
    "flexibility", "research", "innovation",
]

_PATTERNS: list[tuple[str, re.Pattern]] = [
    (skill, re.compile(r"\b" + re.escape(skill) + r"\b", re.IGNORECASE))
    for skill in _SOFT_SKILLS
]


async def detect_soft_skills(text: str) -> List[str]:
    """
    Detect soft skills present in resume text.

    Returns:
        Deduplicated list of detected soft skill names.
    """
    found: list[str] = []
    for skill, pattern in _PATTERNS:
        if pattern.search(text):
            found.append(skill)

    seen: set[str] = set()
    unique: list[str] = []
    for s in found:
        if s not in seen:
            seen.add(s)
            unique.append(s)
    return unique
