"""
Opportunity Cost Service
=========================
Compares a student's extracted skills against all available career roles and
returns a ranked list showing how close the student is to each role.
This helps the student understand which roles they are most ready for, and
what gaps exist for roles they aspire to.
"""
from __future__ import annotations

from typing import List, Dict, Any


def calculate_opportunity_cost(
    extracted_skills: List[str],
    roles: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Rank all roles by match percentage against the student's current skills.

    Args:
        extracted_skills: Skills detected in the student's resume.
        roles: List of dicts with at least {"id": str, "role_name": str,
               "required_skills": list[str]}.

    Returns:
        List of role comparison dicts, sorted by match_rate descending.
        Each dict has: role_id, role_name, match_rate, matched, missing.
    """
    extracted_set = {s.lower() for s in extracted_skills}
    result: list[Dict[str, Any]] = []

    for role in roles:
        required = [s.lower() for s in (role.get("required_skills") or [])]
        if not required:
            continue

        required_set = set(required)
        matched      = sorted(extracted_set & required_set)
        missing      = sorted(required_set - extracted_set)
        match_rate   = round(len(matched) / len(required_set), 4)

        result.append({
            "role_id":    role.get("id"),
            "role_name":  role.get("role_name", "Unknown"),
            "match_rate": match_rate,
            "matched":    matched,
            "missing":    missing,
        })

    # Sort by match_rate descending
    result.sort(key=lambda x: x["match_rate"], reverse=True)
    return result
