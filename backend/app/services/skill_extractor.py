"""
Skill Extractor Service
=======================
Extracts hard/technical skills from resume text using a curated keyword list.
No external AI model required — fully offline, deterministic, and fast.

v2 improvements:
- Extended keyword list with more aliases and abbreviations.
- Added `extract_skills_from_jd_text()` for parsing free-text JD descriptions.
- Skills are returned in their normalized canonical form via gap_analysis.normalize_skill.
"""
from __future__ import annotations

import re
import logging
from typing import List

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Master skill vocabulary (lower-case forms; includes common aliases)
# ---------------------------------------------------------------------------
_SKILL_KEYWORDS: List[str] = [
    # Programming Languages
    "python", "java", "javascript", "js", "typescript", "ts",
    "c++", "c#", "c", "go", "golang", "rust", "kotlin", "swift",
    "ruby", "php", "scala", "r", "matlab", "dart", "bash",
    "shell", "powershell", "perl", "lua", "haskell", "elixir",

    # Web / Frontend
    "html", "html5", "css", "css3", "react", "react.js", "reactjs",
    "react native", "angular", "angularjs", "vue", "vue.js", "vuejs",
    "next.js", "nextjs", "nuxt.js", "nuxtjs", "svelte", "sveltekit",
    "bootstrap", "tailwind", "tailwindcss", "jquery", "redux",
    "webpack", "vite", "sass", "scss", "less", "ember", "backbone",

    # Backend / APIs
    "node.js", "nodejs", "node", "express", "express.js", "expressjs",
    "fastapi", "django", "flask", "spring", "spring boot",
    "laravel", "rails", "ruby on rails", "asp.net", "dotnet", ".net",
    "graphql", "rest api", "restful", "grpc", "soap", "websocket",
    "nest.js", "nestjs", "hapi", "koa",

    # Databases
    "sql", "mysql", "postgresql", "postgres", "sqlite", "mongodb", "mongo",
    "redis", "cassandra", "dynamodb", "oracle", "mssql", "sql server",
    "elasticsearch", "firebase", "supabase", "neo4j", "influxdb",
    "couchdb", "mariadb", "cockroachdb",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "gitlab ci",
    "ci/cd", "cicd", "nginx", "apache", "linux", "ubuntu", "unix",
    "serverless", "lambda", "ec2", "s3", "rds", "cloudformation",
    "helm", "istio", "prometheus", "grafana", "datadog", "splunk",

    # Data Science / ML / AI
    "machine learning", "ml", "deep learning", "dl",
    "neural network", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras",
    "scikit-learn", "sklearn", "pandas", "numpy",
    "matplotlib", "seaborn", "hugging face", "transformers",
    "openai", "langchain", "llm", "rag", "bert", "gpt",
    "xgboost", "lightgbm", "random forest", "svm",
    "opencv", "pillow", "scipy",

    # Data / Analytics
    "data analysis", "data science", "data engineering",
    "power bi", "powerbi", "tableau", "spark", "apache spark",
    "hadoop", "kafka", "apache kafka", "airflow", "apache airflow",
    "dbt", "etl", "data pipeline", "data warehouse",
    "snowflake", "bigquery", "redshift", "looker",

    # Tools / Misc
    "git", "github", "gitlab", "bitbucket",
    "jira", "confluence", "trello", "asana",
    "postman", "swagger", "figma", "xd", "sketch",
    "agile", "scrum", "kanban", "devops",
    "unit testing", "tdd", "bdd", "jest", "pytest", "mocha",
    "selenium", "cypress", "playwright",

    # Mobile
    "android", "ios", "flutter", "react native", "xamarin", "ionic",

    # Security
    "cybersecurity", "penetration testing", "ethical hacking",
    "owasp", "ssl", "tls", "oauth", "jwt", "authentication",

    # General
    "api", "microservices", "monolith", "soa",
    "object oriented", "oop", "functional programming",
    "design patterns", "solid principles",
    "data structures", "algorithms",

    # Data Analytics — soft/domain skills
    "microsoft excel", "ms excel", "advanced excel", "excel",
    "pivot tables", "vlookup", "data visualization", "data viz",
    "data cleaning", "data wrangling", "data quality",
    "statistical analysis", "statistical modeling", "statistics",
    "descriptive statistics", "inferential statistics",
    "predictive analytics", "regression analysis", "forecasting",
    "a/b testing", "hypothesis testing",
    "sql server", "microsoft sql server", "t-sql", "pl/sql",
    "google sheets", "google data studio",
    "report writing", "reporting", "dashboard", "dashboarding",

    # Soft Skills — Business & Professional
    "attention to detail", "detail oriented", "detail-oriented",
    "business acumen", "business understanding", "business knowledge",
    "critical thinking", "analytical thinking", "analytical skills",
    "problem solving", "problem-solving", "troubleshooting",
    "communication skills", "communication", "verbal communication", "written communication",
    "presentation skills", "presentation",
    "teamwork", "collaboration", "cross-functional",
    "leadership", "team leadership", "people management",
    "project management", "time management",
    "adaptability", "flexibility",
    "creativity", "innovation",
    "negotiation", "stakeholder management",
    "customer service", "client management",
    "decision making", "decision-making",
    "organizational skills", "multitasking",
    "research", "data-driven", "data driven", "insight",
    "visualization", "storytelling", "data storytelling",
    "etl", "extract transform load", "data pipeline", "data integration",
]

# ---------------------------------------------------------------------------
# Build compiled patterns once at module load
# ---------------------------------------------------------------------------
def _make_boundary_pattern(skill: str) -> re.Pattern:
    """Create a word-boundary-aware pattern for the skill string."""
    left  = r"\b" if re.match(r"^\w", skill) else r"(?:^|(?<=[^a-zA-Z0-9_]))"
    right = r"\b" if re.match(r"\w$", skill) else r"(?=$|[^a-zA-Z0-9_])"
    return re.compile(left + re.escape(skill) + right, re.IGNORECASE)

_PATTERNS: list[tuple[str, re.Pattern]] = [
    (skill, _make_boundary_pattern(skill))
    for skill in _SKILL_KEYWORDS
]


async def extract_skills(text: str) -> List[str]:
    """
    Scan resume (or any) text and return a deduplicated list of detected
    skill names in their canonical normalized form.

    Args:
        text: Raw extracted text from a resume or JD.

    Returns:
        List of unique matched skill names (lower-case).
    """
    if not text:
        return []

    found: list[str] = []
    for skill, pattern in _PATTERNS:
        if pattern.search(text):
            found.append(skill)

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for s in found:
        if s not in seen:
            seen.add(s)
            unique.append(s)

    logger.debug(f"[SKILL EXTRACTOR] Found {len(unique)} skills in text of length {len(text)}: {unique}")
    return unique


async def extract_skills_from_jd_text(jd_text: str) -> List[str]:
    """
    Extract required skills from a free-text job description.
    Also looks for common JD patterns like 'required: X, Y' and
    'experience with: A, B, C' to capture skills that may be mentioned
    in context rather than as bullet-point lists.

    Args:
        jd_text: Raw job description text.

    Returns:
        List of unique skill names found.
    """
    if not jd_text:
        return []

    # First pass: same keyword scan as resumes
    base_skills = await extract_skills(jd_text)

    # Second pass: extract from structured JD phrases
    patterns = [
        r"(?:required|requirements?|must have|must know|proficient in|experience (?:with|in)|knowledge of|expertise in|skilled in)[:\s]+([^\n.;]+)",
        r"(?:preferred|nice to have|bonus|plus)[:\s]+([^\n.;]+)",
        r"(?:technologies?|tools?|stack|languages?)[:\s]+([^\n.;]+)",
    ]
    phrase_skills: set[str] = set()
    for pat in patterns:
        for m in re.finditer(pat, jd_text, re.IGNORECASE):
            items = re.split(r"[,/|;•·▪▸]+", m.group(1))
            for item in items:
                item = item.strip().lower()
                if 1 < len(item) < 50:
                    phrase_skills.add(item)

    # Re-scan phrase-extracted text with the keyword list
    phrase_text = " ".join(phrase_skills)
    phrase_extracted = await extract_skills(phrase_text) if phrase_text else []

    # Merge both passes
    combined = base_skills[:]
    seen = set(combined)
    for s in phrase_extracted:
        if s not in seen:
            combined.append(s)
            seen.add(s)

    logger.info(f"[JD SKILL EXTRACTOR] Found {len(combined)} skills from JD text: {combined}")
    return combined
