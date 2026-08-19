# AI Resume Analyzer - Developer Guide

This guide contains instructions for setting up, running, testing, and extending the AI Resume Analyzer project.

## 1. Local Development Setup

### Prerequisites
- **Node.js** (v18+) and npm/yarn
- **Python** (3.10+)
- **Git**
- **Tesseract OCR** (Required for processing scanned image PDFs)

### Installing Tesseract OCR (Windows)
1. Download the installer from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki).
2. Install it. (Or use `choco install tesseract` via Chocolatey).
3. Ensure the installation path (e.g., `C:\Program Files\Tesseract-OCR`) is added to your system's `PATH` environment variable.

### Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required API keys (e.g., OpenAI, Supabase connection details).

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will run on `http://localhost:8000`.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file and set the backend URL:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## 2. API Documentation & Contract

The backend uses FastAPI, which automatically generates Swagger/OpenAPI documentation.
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Exporting the OpenAPI Spec
To ensure the frontend and backend are aligned, you can export the OpenAPI spec to a JSON file. Run the included script from the project root:
```bash
python scripts/export_openapi.py
```
This will generate `docs/openapi.json`. The frontend team can use this to verify API calls.

## 3. Deployment

### Backend (Render)
The repository contains a `render.yaml` file and a `backend/Dockerfile` configured for deploying to Render.
1. Connect your Render account to the GitHub repository.
2. Render will automatically detect the `render.yaml` Blueprint and provision the web service.
3. Ensure you set the necessary Environment Variables in the Render dashboard.

### Frontend (Vercel)
The repository contains a `frontend/vercel.json` for deployment on Vercel.
1. Import the project in Vercel.
2. Set the Framework Preset to Vite/React.
3. Set the Root Directory to `frontend`.
4. Add the `VITE_API_URL` environment variable pointing to your live backend URL.

## 4. Git Workflows & Troubleshooting

### Remote Git Authentication
If you receive a `404` or authentication error when running `git push`:
1. Ensure your GitHub account has been invited as a Collaborator to the repository (https://github.com/Innovant-MDM/AI-Resume-Analyzer).
2. If invited, check your email to accept the invitation.
3. Authenticate your local Git using a Personal Access Token (PAT) or GitHub CLI (`gh auth login`).
