# AI-Resume-Analyzer

**AI Resume Analyzer & Career Recommendation Portal**

A comprehensive web application that analyzes resumes (PDF format), extracts key details, and provides actionable career recommendations, skills gap analysis, and ATS scoring.

## Overview

The AI Resume Analyzer is built with a modern stack:
- **Backend:** FastAPI, Python, SQLAlchemy, Supabase/PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS
- **AI/ML:** Local NLP for entity extraction and OpenAI/Google API for intelligent analysis.

## Features

- **Resume Upload & Parsing:** Supports PDF uploads. Extracts text and parses key sections (Contact Info, Skills, Experience, Education).
- **ATS Scoring:** Calculates an ATS score based on format, keywords, and completeness.
- **Skill Gap Analysis:** Highlights missing skills compared to target roles.
- **Career Recommendations:** Recommends potential career paths based on the user's resume.
- **Dashboard:** Visualizes resume performance metrics.

## Limitations

- **PDF Support:** Text-based PDFs work perfectly (processed via `pdfplumber`/`PyMuPDF`). 
- **Scanned Image PDFs:** For scanned image PDFs, the system falls back to OCR. This requires **Tesseract OCR** to be installed on the host server/machine to function correctly. If Tesseract is not installed, scanned PDFs will fail to extract text.

## Documentation

- [User Guide](docs/user-guide.md) - How to use the portal.
- [Developer Guide](docs/developer-guide.md) - How to setup, run, and extend the project.
- [Demo Presentation](docs/demo_deck.md) - Project overview and demo script.
- [Testing Cases](docs/testing/test-cases.md) - Automated and manual testing plans.

## Setup & Deployment

Refer to the [Developer Guide](docs/developer-guide.md) for local setup instructions.

For deployment, configuration files are provided:
- **Backend:** `Dockerfile` and `render.yaml` (Ready for Render).
- **Frontend:** `vercel.json` (Ready for Vercel).
- **Database:** `database/schema.sql` to initialize remote database schemas.
