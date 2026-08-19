"""
Gap Analysis Service
====================
Computes the intersection and difference between a student's extracted skills
and the required skills for a target career role.

Improvements (v3):
- Synonym / alias normalization so "React.js" == "react", "JS" == "javascript", etc.
- Partial / substring matching as a secondary pass to catch abbreviations.
- Semantic similarity pass (requires sentence-transformers) as a third pass.
  Skills with cosine similarity >= 0.75 are treated as matches.
- Returns semantic_matches dict and extra_skills list for transparent reporting.
- Expanded _SYNONYM_MAP covering Data Analytics domain and certification aliases.
"""
from __future__ import annotations

import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Skill synonym / alias map
# Each KEY is the canonical (normalized) form.
# Every VALUE is a list of aliases that should map to the same canonical form.
# ---------------------------------------------------------------------------
_SYNONYM_MAP: Dict[str, List[str]] = {
    # JavaScript ecosystem
    "javascript":   ["js", "java script", "ecmascript", "es6", "es2015", "es2016", "es2017", "es2019", "es2020"],
    "typescript":   ["ts", "type script", "typscript"],
    "react":        ["react.js", "reactjs", "react js", "react native"],
    "next.js":      ["nextjs", "next js", "next"],
    "vue":          ["vue.js", "vuejs", "vue js"],
    "angular":      ["angularjs", "angular.js", "angular js"],
    "node.js":      ["nodejs", "node js", "node"],
    "express":      ["express.js", "expressjs", "express js"],
    "jquery":       ["jquery.js"],

    # Python ecosystem
    "python":       ["py", "python3", "python 3"],
    "django":       ["django rest", "django rest framework", "drf"],
    "flask":        ["flask api"],
    "fastapi":      ["fast api"],
    "scikit-learn": ["sklearn", "scikit learn"],
    "pytorch":      ["torch"],

    # Databases
    "postgresql":   ["postgres", "psql", "pg", "postgre sql", "postgre"],
    "mongodb":      ["mongo", "mongo db", "mongoDB"],
    "mysql":        ["my sql"],
    "mssql":        ["sql server", "ms sql", "microsoft sql server"],
    "elasticsearch":["elastic search", "elastic"],
    "redis":        ["redis cache"],
    "dynamodb":     ["dynamo db", "dynamo", "amazon dynamodb"],

    # Cloud / DevOps
    "aws":          ["amazon web services", "amazon aws", "aws cloud", "ec2", "s3", "lambda",
                     "aws ec2", "aws s3", "aws lambda", "aws rds", "amazon ec2",
                     "amazon s3", "amazon lambda", "cloud formation"],
    "azure":        ["microsoft azure", "azure cloud", "ms azure"],
    "gcp":          ["google cloud", "google cloud platform", "google gcp", "google cloud services"],
    "docker":       ["docker container", "containerization", "containers"],
    "kubernetes":   ["k8s", "kube", "kube cluster"],
    "terraform":    ["tf", "hashicorp terraform"],
    "ci/cd":        ["cicd", "ci cd", "continuous integration", "continuous deployment",
                     "continuous delivery", "github actions", "gitlab ci", "jenkins",
                     "continuous integration/continuous deployment"],
    "github actions":["gh actions", "github-actions"],

    # Java ecosystem
    "java":         ["core java", "java se", "java ee", "java programming"],
    "spring":       ["spring boot", "spring framework", "spring mvc", "springboot"],

    # Markup / Style
    "html":         ["html5", "html 5"],
    "css":          ["css3", "css 3"],
    "sass":         ["scss"],
    "tailwind":     ["tailwindcss", "tailwind css"],

    # Data / ML
    "machine learning":  ["ml", "machine-learning", "ml models"],
    "deep learning":     ["dl", "deep-learning"],
    "natural language processing": ["nlp", "natural-language-processing", "text processing"],
    "computer vision":   ["cv", "image recognition", "image processing"],
    "tensorflow":        ["tf", "tensor flow"],
    "power bi":          ["powerbi", "power-bi", "ms power bi", "microsoft power bi"],
    "data analysis":     ["data analytics", "data analyst", "analytical skills"],
    "data science":      ["data scientist"],
    "data engineering":  ["data engineer"],

    # ── Data Analytics specific (new) ───────────────────────────────────────
    "microsoft excel":   ["ms excel", "excel", "advanced excel", "excel spreadsheets",
                          "excel vba", "vba", "pivot tables", "vlookup"],
    "sql":               ["structured query language", "relational database", "relational db",
                          "mysql", "t-sql", "pl/sql", "plsql", "ansi sql"],
    "tableau":           ["tableau desktop", "tableau server", "tableau public"],
    "google analytics":  ["ga", "ga4", "google analytics 4", "universal analytics"],
    "looker":            ["looker studio", "google data studio", "google looker"],
    "python for data":   ["pandas", "numpy", "matplotlib", "seaborn", "scipy", "plotly"],
    "r":                 ["r programming", "r language", "rstudio", "tidyverse", "ggplot2"],
    "alteryx":           ["alteryx designer", "alteryx server"],
    "qlik":              ["qlikview", "qlik sense", "qliksense"],
    "data visualization":["data viz", "data visualisation", "visualization", "dashboard", "dashboarding"],
    "etl":               ["extract transform load", "data pipeline", "data integration", "data ingestion"],
    "statistics":        ["statistical analysis", "statistical modeling", "stats", "inferential statistics",
                          "descriptive statistics"],
    "regression":        ["linear regression", "logistic regression", "regression analysis",
                          "regression modeling"],
    "a/b testing":       ["ab testing", "split testing", "hypothesis testing", "statistical testing"],
    "forecasting":       ["time series", "time series analysis", "predictive analytics",
                          "demand forecasting"],

    # Tools
    "git":          ["version control", "git scm", "git version control"],
    "github":       ["gh", "github.com"],
    "gitlab":       ["gitlab.com"],
    "linux":        ["ubuntu", "debian", "centos", "unix", "bash scripting"],
    "rest api":     ["rest", "restful", "restful api", "restful apis", "rest apis",
                     "api development", "http api", "web api"],
    "graphql":      ["graph ql"],

    # Methodologies
    "agile":        ["agile methodology", "agile development", "agile scrum"],
    "scrum":        ["scrum methodology", "scrum framework"],

    # Languages with special characters
    "c++":          ["cpp", "c plus plus", "cplusplus"],
    "c#":           ["csharp", "c sharp", "dotnet c#"],

    # ── Certification aliases (new) ─────────────────────────────────────────
    "aws certified developer":          ["aws certified developer associate",
                                         "aws developer associate",
                                         "aws-dva-c01", "aws-dva-c02"],
    "aws certified solutions architect":["aws solutions architect", "aws-saa",
                                         "aws-saa-c02", "aws-saa-c03",
                                         "aws certified solutions architect associate"],
    "aws certified cloud practitioner": ["aws cloud practitioner", "aws-clf-c01", "aws clf"],
    "google analytics certified":       ["ga certification", "google analytics certification",
                                         "google analytics individual qualification"],
    "tableau desktop certified":        ["tableau certification", "tableau certified",
                                         "tableau desktop specialist"],
    "microsoft certified":              ["ms certified", "mcp", "mcsa", "mcse", "azure certified"],
    "pmp":                              ["project management professional", "pmi pmp"],

    # ── Soft / Business Skills (new) ────────────────────────────────────────
    "attention to detail":   ["detail oriented", "detail-oriented", "eye for detail",
                              "meticulous", "thorough", "accuracy"],
    "business acumen":       ["business understanding", "business knowledge",
                              "commercial awareness", "business sense",
                              "business savvy", "business insight"],
    "critical thinking":     ["analytical thinking", "logical thinking",
                              "strategic thinking", "systems thinking"],
    "problem solving":       ["problem-solving", "problem resolution",
                              "troubleshooting", "root cause analysis"],
    "communication skills":  ["communication", "verbal communication",
                              "written communication", "interpersonal skills",
                              "presentation skills"],
    "teamwork":              ["collaboration", "team player", "cross-functional",
                              "team collaboration", "cooperative"],
    "statistical analysis":  ["statistical modeling", "stats", "statistics",
                              "descriptive statistics", "inferential statistics",
                              "data analysis", "quantitative analysis"],
    "data visualization":    ["data viz", "data visualisation", "visualization",
                              "dashboard", "dashboarding", "charting", "reporting"],
    "data cleaning":         ["data wrangling", "data preparation", "data preprocessing",
                              "data transformation", "data quality"],
    "microsoft excel":       ["ms excel", "excel", "advanced excel", "excel spreadsheets",
                              "excel vba", "vba", "pivot tables", "vlookup"],
}

# ---------------------------------------------------------------------------
# Build a reverse lookup: alias -> canonical
# ---------------------------------------------------------------------------
_ALIAS_TO_CANONICAL: Dict[str, str] = {}
for canonical, aliases in _SYNONYM_MAP.items():
    _ALIAS_TO_CANONICAL[canonical] = canonical          # canonical maps to itself
    for alias in aliases:
        _ALIAS_TO_CANONICAL[alias.lower()] = canonical


def normalize_skill(skill: str) -> str:
    """
    Normalize a skill string to its canonical form.
    Steps:
      1. Lowercase + strip
      2. Remove surrounding punctuation artifacts
      3. Look up in alias map; return canonical if found
      4. Otherwise return the lowercased, stripped form
    """
    # Step 1: lowercase & strip
    s = skill.lower().strip()
    # Step 2: remove surrounding punctuation artifacts
    s = re.sub(r"[^\w\s.+#/-]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    # Step 3: direct alias lookup
    if s in _ALIAS_TO_CANONICAL:
        return _ALIAS_TO_CANONICAL[s]
    # Step 4: try without trailing version numbers  e.g. "python 3.9" -> "python"
    base = re.sub(r"\s*[\d.]+$", "", s).strip()
    if base and base in _ALIAS_TO_CANONICAL:
        return _ALIAS_TO_CANONICAL[base]
    return s


def normalize_skills(skills: List[str]) -> List[str]:
    """Normalize a list of skills and deduplicate."""
    seen: set[str] = set()
    result: list[str] = []
    for s in skills:
        n = normalize_skill(s)
        if n and n not in seen:
            seen.add(n)
            result.append(n)
    return result


async def perform_gap_analysis(
    extracted_skills: List[str],
    required_skills: List[str],
    use_semantic: bool = True,
    resume_text: str = "",
) -> Dict[str, Any]:
    """
    Compare extracted skills against role requirements with multi-pass matching.

    Matching passes (in order):
      1. Exact / normalized canonical match
      2. Substring / partial match (catch abbreviations like "aws ec2" ↔ "aws")
      2.5 Full-text literal check — if the skill phrase appears literally in the
          resume text it can NEVER be marked as missing, regardless of whether
          the keyword extractor picked it up.
      3. Semantic similarity (sentence-transformers, threshold=0.75) — optional

    Args:
        extracted_skills:  Skills found in the student's resume.
        required_skills:   Skills required for the target career role / JD.
        use_semantic:      Enable semantic fallback (default True).
        resume_text:       Full raw resume text for literal full-text fallback.

    Returns:
        dict with:
            matched_skills       – skills present in both lists (normalized)
            missing_skills       – skills required but not present (normalized)
            semantic_matches     – dict[required_skill -> best_resume_skill] for semantic hits
            extra_skills         – resume skills NOT in required list
            match_rate           – fraction of required skills matched (0.0 – 1.0)
            normalized_extracted – full normalized extracted skill set
            normalized_required  – full normalized required skill set
    """
    # --- Normalize both sides ---
    norm_extracted = normalize_skills(extracted_skills)
    norm_required  = normalize_skills(required_skills)

    extracted_set = set(norm_extracted)
    required_set  = set(norm_required)

    # --- Pass 1: exact normalized match ---
    matched = sorted(extracted_set & required_set)
    missing = sorted(required_set - extracted_set)

    # --- Pass 2: substring / partial match on remaining missing ---
    still_missing: list[str] = []
    for req in missing:
        partial_hit = False
        for ext in extracted_set:
            if (req in ext or ext in req) and len(ext) >= 2 and len(req) >= 2:
                matched.append(req)
                partial_hit = True
                break
        if not partial_hit:
            still_missing.append(req)

    matched = sorted(set(matched))
    missing = sorted(set(still_missing))

    # --- Pass 2.5: Full-text literal check (CRITICAL safety net) ---
    # Any skill that literally appears in the raw resume text can NEVER be missing.
    # This catches soft skills like "Business Acumen", "Attention to Detail" that
    # may not be in the keyword extractor's vocabulary but ARE in the resume.
    if resume_text and missing:
        resume_text_lower = resume_text.lower()
        still_missing_after_text: list[str] = []
        for req in missing:
            found_in_text = False
            # Check canonical form
            if req.lower() in resume_text_lower:
                found_in_text = True
            else:
                # Check all aliases for this skill
                canonical = _ALIAS_TO_CANONICAL.get(req, req)
                # Check all alias variants
                aliases_to_check = [canonical] + list(_SYNONYM_MAP.get(canonical, []))
                for alias in aliases_to_check:
                    if alias.lower() in resume_text_lower:
                        found_in_text = True
                        break

            if found_in_text:
                matched.append(req)
                logger.info(f"[GAP ANALYSIS] Full-text literal match: '{req}' found in resume text")
            else:
                still_missing_after_text.append(req)

        matched = sorted(set(matched))
        missing = sorted(set(still_missing_after_text))

    # --- Pass 3: semantic similarity (if sentence-transformers available) ---
    semantic_matches: Dict[str, str] = {}

    if use_semantic and missing and extracted_set:
        try:
            from app.services.semantic_matcher import batch_compute_similarity, is_available
            if is_available():
                import asyncio
                missing_list = list(missing)
                extracted_list = list(extracted_set)
                results = await asyncio.to_thread(batch_compute_similarity, missing_list, extracted_list)

                still_missing_after_sem: list[str] = []
                for req, (best_match, score) in zip(missing_list, results):
                    if best_match is not None:
                        matched.append(req)
                        semantic_matches[req] = best_match
                        logger.info(
                            f"[GAP ANALYSIS] Semantic match: '{req}' → '{best_match}' (score={score:.2f})"
                        )
                    else:
                        still_missing_after_sem.append(req)
                missing = sorted(set(still_missing_after_sem))
                matched = sorted(set(matched))
        except Exception as exc:
            logger.warning(f"[GAP ANALYSIS] Semantic pass failed (non-fatal): {exc}")
            # Keep missing as-is — degraded gracefully

    match_rate = len(matched) / len(required_set) if required_set else 0.0

    # Extra skills = extracted skills not in required list
    extra_skills = sorted(extracted_set - required_set - set(semantic_matches.values()))

    # --- Debug logging ---
    logger.info(
        "[GAP ANALYSIS] Results:\n"
        f"  Extracted skills ({len(extracted_set)}): {sorted(extracted_set)}\n"
        f"  Required skills  ({len(required_set)}): {sorted(required_set)}\n"
        f"  Matched skills   ({len(matched)}): {matched}\n"
        f"  Semantic matches ({len(semantic_matches)}): {semantic_matches}\n"
        f"  Missing skills   ({len(missing)}): {missing}\n"
        f"  Extra skills     ({len(extra_skills)}): {extra_skills}\n"
        f"  Match rate: {match_rate:.2%}"
    )

    return {
        "matched_skills":        matched,
        "missing_skills":        missing,
        "semantic_matches":      semantic_matches,
        "extra_skills":          extra_skills,
        "match_rate":            round(match_rate, 4),
        "normalized_extracted":  norm_extracted,
        "normalized_required":   norm_required,
    }
