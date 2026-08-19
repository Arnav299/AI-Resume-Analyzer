# =============================================================================
# backend/app/routers/xai.py
# Explainable AI (XAI) endpoints — formats existing AnalysisResult and
# SkillGapAnalysis data into the score-breakdown + rationale-card shape
# expected by XAIRationaleCards.jsx and CandidateDossier.jsx.
#
# v4 FIX: Uses REAL stored sub-scores from AnalysisResult instead of
# invented proxy calculations (old: skill_score/70*100 etc.).
# =============================================================================
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis_result import AnalysisResult
from app.models.skill_gap_analysis import SkillGapAnalysis, GapType
from app.models.skill import Skill
from app.models.career_role import CareerRole

router = APIRouter()


# ── helpers ──────────────────────────────────────────────────────────────────

# Score breakdown metadata matching what the frontend expects.
# Weights here match the EXACT SPEC formula (35/10/20/15/5/5/10).
_SCORE_BREAKDOWN_META = [
    {
        "category": "Required Skills",
        "field":    "required_skills_score",
        "weight":   35,
        "color":    "#6C63FF",
        "icon":     "⚡",
    },
    {
        "category": "Preferred Skills",
        "field":    "preferred_skills_score",
        "weight":   10,
        "color":    "#818CF8",
        "icon":     "✨",
    },
    {
        "category": "Responsibilities",
        "field":    "responsibility_match_score",
        "weight":   20,
        "color":    "#00D4FF",
        "icon":     "📋",
    },
    {
        "category": "Experience",
        "field":    "experience_score",
        "weight":   15,
        "color":    "#06B6D4",
        "icon":     "💼",
    },
    {
        "category": "Education",
        "field":    "education_score",
        "weight":   5,
        "color":    "#10B981",
        "icon":     "🎓",
    },
    {
        "category": "Certifications",
        "field":    "certification_score",
        "weight":   5,
        "color":    "#F59E0B",
        "icon":     "📜",
    },
    {
        "category": "ATS Formatting",
        "field":    "ats_formatting_score",
        "weight":   10,
        "color":    "#F472B6",
        "icon":     "🗂️",
    },
]


def _derive_recommendation(score: float) -> str:
    if score >= 80:
        return "Shortlist"
    if score >= 65:
        return "Borderline"
    return "Reject"


def _build_xai_from_analysis(
    ar: AnalysisResult,
    gap_skills: list[tuple[str, GapType]],
) -> dict:
    """
    Convert an AnalysisResult + SkillGapAnalysis rows into the XAI shape:
    { totalScore, recommendation, scoreBreakdown, positiveCards, gapCards }

    v4 FIX: Reads REAL stored sub-scores instead of invented proxies.
    The sub-scores are stored by the score engine as 0–100 percentages.
    """
    # Use overall_match_score as the primary display score
    # (= final_ats_score from calculate_ats_score, i.e. the weighted overall)
    total = float(ar.overall_match_score or ar.readiness_score or 0)

    # ── Score breakdown — read REAL stored sub-scores ────────────────────
    score_breakdown = []
    for meta in _SCORE_BREAKDOWN_META:
        field_name = meta["field"]
        # Get real stored value; default to 0 if not set (e.g. older records)
        raw_val = getattr(ar, field_name, None)
        score_val = float(raw_val or 0)
        score_breakdown.append({
            "category": meta["category"],
            "score":    round(score_val),
            "weight":   meta["weight"],
            "color":    meta["color"],
            "icon":     meta["icon"],
        })

    # Log what we built
    import logging
    logger = logging.getLogger(__name__)
    logger.info(
        f"[XAI] Score breakdown for resume {ar.resume_id}:\n"
        + "\n".join(
            f"  {item['category']}: {item['score']} (weight {item['weight']}%)"
            for item in score_breakdown
        )
        + f"\n  Overall: {total:.1f}%"
    )

    # ── Positive rationale cards (matched skills + strengths) ─────────────
    positive_cards = []
    gap_cards = []

    matched     = [s for s, t in gap_skills if t == GapType.matched]
    missing     = [s for s, t in gap_skills if t == GapType.missing]
    recommended = [s for s, t in gap_skills if t == GapType.recommended]

    if matched:
        positive_cards.append({
            "category": "Required Skills",
            "reason":   f"Matched {len(matched)} required skill(s)",
            "evidence": ", ".join(matched[:8]),
            "icon":     "⚡",
        })

    if ar.strengths:
        for strength in (ar.strengths or [])[:3]:
            positive_cards.append({
                "category": "Experience",
                "reason":   strength,
                "evidence": "",
                "icon":     "💼",
            })

    # Show high-scoring components as positives
    for item in score_breakdown:
        if item["score"] >= 90 and item["category"] not in ("Required Skills",):
            positive_cards.append({
                "category": item["category"],
                "reason":   f"{item['category']} score: {item['score']}% — strong match",
                "evidence": f"Weight: {item['weight']}% of overall score",
                "icon":     item["icon"],
            })

    # ── Gap rationale cards (missing skills + weaknesses) ─────────────────
    if missing:
        gap_cards.append({
            "category": "Required Skills",
            "reason":   f"{len(missing)} required skill(s) not found in resume",
            "evidence": ", ".join(missing[:8]),
            "icon":     "⚠️",
        })

    if ar.weaknesses:
        for weakness in (ar.weaknesses or [])[:2]:
            gap_cards.append({
                "category": "Experience",
                "reason":   weakness,
                "evidence": "",
                "icon":     "⚡",
            })

    if recommended:
        gap_cards.append({
            "category": "Preferred Skills",
            "reason":   f"Consider adding: {', '.join(recommended[:5])}",
            "evidence": "Preferred skills that would improve match",
            "icon":     "📋",
        })

    # Show low-scoring components as gaps
    for item in score_breakdown:
        if item["score"] < 70:
            gap_cards.append({
                "category": item["category"],
                "reason":   f"{item['category']} score: {item['score']}% — below threshold",
                "evidence": f"Weight: {item['weight']}% of overall score",
                "icon":     item["icon"],
            })

    return {
        "totalScore":      round(total),
        "recommendation":  _derive_recommendation(total),
        "scoreBreakdown":  score_breakdown,
        "positiveCards":   positive_cards,
        "gapCards":        gap_cards,
        # Also expose the detailed breakdown in the new spec format
        "detailedBreakdown": {
            "requiredSkills":  round(float(ar.required_skills_score or 0), 2),
            "preferredSkills": round(float(ar.preferred_skills_score or 0), 2),
            "responsibilities": round(float(ar.responsibility_match_score or 0), 2),
            "experience":      round(float(ar.experience_score or 0), 2),
            "education":       round(float(ar.education_score or 0), 2),
            "certifications":  round(float(ar.certification_score or 0), 2),
            "atsFormatting":   round(float(getattr(ar, "ats_formatting_score", 0) or 0), 2),
            "overall":         round(total, 2),
        },
    }


def _build_mock_xai(resume_id: str) -> dict:
    """Return a deterministic zero-state when no analysis exists yet."""
    return {
        "totalScore":  0,
        "recommendation": "Pending",
        "scoreBreakdown": [
            {"category": meta["category"], "score": 0, "weight": meta["weight"], "color": meta["color"], "icon": meta["icon"]}
            for meta in _SCORE_BREAKDOWN_META
        ],
        "positiveCards": [],
        "gapCards": [{
            "category": "Required Skills",
            "reason":   "Resume has not been analyzed against a job role yet",
            "evidence": "Run an analysis from the Recruiter Dashboard to see scores",
            "icon":     "⚠️",
        }],
        "detailedBreakdown": {
            "requiredSkills": 0, "preferredSkills": 0, "responsibilities": 0,
            "experience": 0, "education": 0, "certifications": 0,
            "atsFormatting": 0, "overall": 0,
        },
    }


# ── routes ────────────────────────────────────────────────────────────────────

@router.get("/rationale/{candidate_id}", summary="Get XAI rationale for a candidate")
async def get_xai_rationale(
    candidate_id: str,
    jd_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns XAI score breakdown and rationale cards for a candidate (resume).
    Uses the most recent AnalysisResult. If none exists returns zero-state payload.
    """
    # Verify candidate exists
    r = await db.execute(select(Resume).where(Resume.id == candidate_id))
    if not r.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Fetch most recent analysis result for this resume
    ar_result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.resume_id == candidate_id)
        .order_by(desc(AnalysisResult.analyzed_at))
        .limit(1)
    )
    ar: AnalysisResult | None = ar_result.scalar_one_or_none()

    if ar is None:
        return _build_mock_xai(candidate_id)

    # Fetch skill gap rows for this analysis
    gap_result = await db.execute(
        select(Skill.skill_name, SkillGapAnalysis.gap_type)
        .join(SkillGapAnalysis, SkillGapAnalysis.skill_id == Skill.id)
        .where(SkillGapAnalysis.analysis_result_id == ar.id)
    )
    gap_skills: list[tuple[str, GapType]] = [(row[0], row[1]) for row in gap_result.all()]

    return _build_xai_from_analysis(ar, gap_skills)


@router.get("/score/{candidate_id}", summary="Get score breakdown only")
async def get_score_breakdown(
    candidate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lightweight score-only endpoint (no rationale cards)."""
    r = await db.execute(select(Resume).where(Resume.id == candidate_id))
    if not r.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Candidate not found")

    ar_result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.resume_id == candidate_id)
        .order_by(desc(AnalysisResult.analyzed_at))
        .limit(1)
    )
    ar: AnalysisResult | None = ar_result.scalar_one_or_none()

    if ar is None:
        return {"totalScore": 0, "recommendation": "Pending", "scoreBreakdown": []}

    data = _build_xai_from_analysis(ar, [])
    return {
        "totalScore":        data["totalScore"],
        "recommendation":    data["recommendation"],
        "scoreBreakdown":    data["scoreBreakdown"],
        "detailedBreakdown": data["detailedBreakdown"],
    }
