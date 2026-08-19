"""
AI Resume Parser Service
========================
Uses Google Gemini to intelligently parse raw resume text into the
fully structured JSON shape expected by the frontend Resume Builder.

Key design decisions:
- Prompt instructs AI to NEVER generate dummy/placeholder data.
- If AI is unavailable, falls back to the legacy regex parser.
- Uses Gemini's response_schema to guarantee massive granular JSON shape.
"""
from __future__ import annotations

import asyncio
import json
import re
import logging
from typing import Any, Dict

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ─── Gemini API Constants ───────────────────────────────────────────────────
GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_TIMEOUT = 60.0

# ─── System Prompt ───────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """You are an expert, production-grade Resume Parser API. Your sole task is to extract information from the raw resume text provided and return it as a structured JSON object.

CRITICAL RULES:
1. NEVER invent, generate, or hallucinate any data. Every field must come directly from the text.
2. If a field is not present in the resume text, return an empty string "" for string fields, or an empty array [] for array fields.
3. Do NOT use placeholder values like "John Doe", "example@email.com", "github.com/user", etc.
4. Preserve the EXACT wording from the resume — do not paraphrase, shorten, or reformat content.
5. For text descriptions (like experience/projects), preserve all bullet points.
6. Assign a unique simple numeric string ID (e.g., "1", "2", "3") to each item in arrays.
7. Classify sections intelligently — if a section is ambiguous, use context to determine if it's experience, education, project, etc. (e.g., "Employment History" maps to experience).
8. Data Cleaning: Clean OCR mistakes, remove duplicate skills, trim whitespace, normalize emails, phone numbers, and dates.
9. Separate "internships" from full-time "experience".
10. Ensure dates are parsed logically into startMonth, startYear, endMonth, endYear where possible.
11. Return ONLY the JSON object defined in the schema.
"""

_SCHEMA = {
  "type": "OBJECT",
  "properties": {
    "personalInfo": {
      "type": "OBJECT",
      "properties": {
        "fullName": {"type": "STRING"},
        "jobTitle": {"type": "STRING"},
        "email": {"type": "STRING"},
        "phone": {"type": "STRING"},
        "alternatePhone": {"type": "STRING"},
        "location": {"type": "STRING"},
        "address": {"type": "STRING"},
        "city": {"type": "STRING"},
        "state": {"type": "STRING"},
        "country": {"type": "STRING"},
        "postalCode": {"type": "STRING"},
        "nationality": {"type": "STRING"},
        "dob": {"type": "STRING"},
        "linkedin": {"type": "STRING"},
        "github": {"type": "STRING"},
        "portfolio": {"type": "STRING"},
        "personalWebsite": {"type": "STRING"}
      }
    },
    "summary": {"type": "STRING"},
    "experience": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": {"type": "STRING"},
          "company": {"type": "STRING"},
          "role": {"type": "STRING"},
          "employmentType": {"type": "STRING"},
          "location": {"type": "STRING"},
          "startMonth": {"type": "STRING"},
          "startYear": {"type": "STRING"},
          "endMonth": {"type": "STRING"},
          "endYear": {"type": "STRING"},
          "currentlyWorking": {"type": "BOOLEAN"},
          "description": {"type": "STRING"},
          "responsibilities": {"type": "ARRAY", "items": {"type": "STRING"}},
          "achievements": {"type": "ARRAY", "items": {"type": "STRING"}}
        }
      }
    },
    "education": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": {"type": "STRING"},
          "degree": {"type": "STRING"},
          "branch": {"type": "STRING"},
          "specialization": {"type": "STRING"},
          "institution": {"type": "STRING"},
          "university": {"type": "STRING"},
          "board": {"type": "STRING"},
          "city": {"type": "STRING"},
          "country": {"type": "STRING"},
          "startYear": {"type": "STRING"},
          "endYear": {"type": "STRING"},
          "cgpa": {"type": "STRING"},
          "percentage": {"type": "STRING"},
          "grade": {"type": "STRING"}
        }
      }
    },
    "skills": {
      "type": "OBJECT",
      "properties": {
        "technical": {"type": "ARRAY", "items": {"type": "STRING"}},
        "soft": {"type": "ARRAY", "items": {"type": "STRING"}},
        "programmingLanguages": {"type": "ARRAY", "items": {"type": "STRING"}},
        "frameworks": {"type": "ARRAY", "items": {"type": "STRING"}},
        "libraries": {"type": "ARRAY", "items": {"type": "STRING"}},
        "databases": {"type": "ARRAY", "items": {"type": "STRING"}},
        "cloudPlatforms": {"type": "ARRAY", "items": {"type": "STRING"}},
        "devOpsTools": {"type": "ARRAY", "items": {"type": "STRING"}},
        "aiTools": {"type": "ARRAY", "items": {"type": "STRING"}},
        "operatingSystems": {"type": "ARRAY", "items": {"type": "STRING"}},
        "other": {"type": "ARRAY", "items": {"type": "STRING"}}
      }
    },
    "projects": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": {"type": "STRING"},
          "name": {"type": "STRING"},
          "tools": {"type": "STRING"},
          "description": {"type": "STRING"},
          "responsibilities": {"type": "ARRAY", "items": {"type": "STRING"}},
          "github": {"type": "STRING"},
          "link": {"type": "STRING"}
        }
      }
    },
    "certifications": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": {"type": "STRING"},
          "name": {"type": "STRING"},
          "issuer": {"type": "STRING"},
          "issueDate": {"type": "STRING"},
          "expiryDate": {"type": "STRING"},
          "credentialId": {"type": "STRING"}
        }
      }
    },
    "awards": {"type": "ARRAY", "items": {"type": "STRING"}},
    "achievements": {"type": "ARRAY", "items": {"type": "STRING"}},
    "publications": {"type": "ARRAY", "items": {"type": "STRING"}},
    "patents": {"type": "ARRAY", "items": {"type": "STRING"}},
    "volunteer": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": {"type": "STRING"},
          "role": {"type": "STRING"},
          "organization": {"type": "STRING"},
          "startDate": {"type": "STRING"},
          "endDate": {"type": "STRING"},
          "description": {"type": "STRING"}
        }
      }
    },
    "internships": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": {"type": "STRING"},
          "role": {"type": "STRING"},
          "company": {"type": "STRING"},
          "startMonth": {"type": "STRING"},
          "startYear": {"type": "STRING"},
          "endMonth": {"type": "STRING"},
          "endYear": {"type": "STRING"},
          "description": {"type": "STRING"}
        }
      }
    },
    "courses": {"type": "ARRAY", "items": {"type": "STRING"}},
    "interests": {"type": "ARRAY", "items": {"type": "STRING"}},
    "languages": {"type": "ARRAY", "items": {"type": "STRING"}},
    "references": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": {"type": "STRING"},
          "name": {"type": "STRING"},
          "position": {"type": "STRING"},
          "company": {"type": "STRING"},
          "contact": {"type": "STRING"}
        }
      }
    }
  }
}

def _build_prompt(raw_text: str) -> str:
    return f"{_SYSTEM_PROMPT}\n\n--- RESUME TEXT START ---\n{raw_text[:15000]}\n--- RESUME TEXT END ---\n"


# ─── Core AI call ────────────────────────────────────────────────────────────
async def _call_gemini(api_key: str, raw_text: str) -> Dict[str, Any]:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={api_key.strip()}"
    )
    payload = {
        "contents": [{"parts": [{"text": _build_prompt(raw_text)}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "response_schema": _SCHEMA,
            "temperature": 0.0,
            "maxOutputTokens": 8192,
        },
    }

    async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT) as client:
        response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})

    if response.status_code != 200:
        raise ValueError(f"Gemini API returned {response.status_code}: {response.text[:500]}")

    resp_data = response.json()
    raw_json_text = resp_data["candidates"][0]["content"]["parts"][0]["text"].strip()

    # Strip markdown code fences if Gemini wrapped the JSON
    raw_json_text = re.sub(r"^```(?:json)?\s*", "", raw_json_text)
    raw_json_text = re.sub(r"\s*```$", "", raw_json_text.strip())

    return json.loads(raw_json_text)


def _merge_with_defaults(data: dict) -> dict:
    """Ensure all required top-level keys exist with safe defaults."""
    defaults = {
        "personalInfo": {
            "fullName": "", "jobTitle": "", "email": "", "phone": "",
            "alternatePhone": "", "location": "", "address": "", "city": "",
            "state": "", "country": "", "postalCode": "", "nationality": "",
            "dob": "", "linkedin": "", "github": "", "portfolio": "",
            "personalWebsite": "", "photo": None,
        },
        "summary": "",
        "experience": [],
        "education": [],
        "skills": {
            "technical": [], "soft": [], "programmingLanguages": [],
            "frameworks": [], "libraries": [], "databases": [],
            "cloudPlatforms": [], "devOpsTools": [], "aiTools": [],
            "operatingSystems": [], "other": []
        },
        "projects": [],
        "certifications": [],
        "awards": [],
        "achievements": [],
        "publications": [],
        "patents": [],
        "volunteer": [],
        "internships": [],
        "courses": [],
        "interests": [],
        "languages": [],
        "references": [],
    }

    for key, default_val in defaults.items():
        if key not in data:
            data[key] = default_val
            
    # Clean and sanitize nested dicts
    if "personalInfo" in data and isinstance(data["personalInfo"], dict):
        for k, v in defaults["personalInfo"].items():
            if k not in data["personalInfo"] or data["personalInfo"][k] is None:
                data["personalInfo"][k] = v
    else:
        data["personalInfo"] = defaults["personalInfo"]

    if "skills" in data and isinstance(data["skills"], dict):
        for k, v in defaults["skills"].items():
            if k not in data["skills"] or data["skills"][k] is None:
                data["skills"][k] = v
    else:
        data["skills"] = defaults["skills"]

    return data


# ─── Public API ──────────────────────────────────────────────────────────────
async def parse_resume_with_ai(raw_text: str) -> Dict[str, Any]:
    """
    Parse raw resume text using Gemini AI with full schema validation.
    Falls back to the legacy regex parser if AI is unavailable or fails.
    """
    settings = get_settings()

    if settings.GEMINI_API_KEY:
        try:
            logger.info("[ai_resume_parser] Attempting Gemini-based parsing...")
            parsed = await _call_gemini(settings.GEMINI_API_KEY, raw_text)
            parsed = _merge_with_defaults(parsed)
            logger.info("[ai_resume_parser] Gemini parsing succeeded.")
            return parsed
        except Exception as exc:
            logger.warning(
                f"[ai_resume_parser] Gemini parsing failed ({exc}). Falling back to regex parser."
            )
    else:
        logger.info("[ai_resume_parser] No GEMINI_API_KEY set. Using regex parser.")

    # ── Regex Fallback ────────────────────────────────────────────────────
    from app.services.resume_parser import parse_resume_to_builder_json
    fallback_result = parse_resume_to_builder_json(raw_text)
    return _merge_with_defaults(fallback_result)
