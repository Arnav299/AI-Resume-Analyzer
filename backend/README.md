# AI Resume Analyzer & Career Recommendation Portal Backend

This is the FastAPI-based backend for the AI Resume Analyzer & Career Recommendation Portal.

## Technical Stack
- **FastAPI**: Modern, fast web framework for building APIs.
- **SQLAlchemy**: SQL toolkit and ORM.
- **SQLite**: Local relational database.
- **PyMuPDF**: High-performance PDF parser for resume text extraction.
- **JWT**: JSON Web Tokens for authentication.
- **Pydantic**: Data validation and settings management.

## Project Structure
```
backend/
├── app/
│   ├── main.py              # Application entrypoint & seeding logic
│   ├── database.py          # SQLAlchemy setup and DB session hook
│   ├── models/              # SQLAlchemy database ORM models
│   ├── schemas/             # Pydantic schemas for validation/serialization
│   ├── routes/              # FastAPI routers/endpoints
│   ├── services/            # Custom logic engines (PDF parsing, scoring, etc.)
│   └── utils/               # JWT authentication & password hashing utilities
├── uploads/                 # Local directory for uploaded PDFs
├── test_backend.py          # Integration tests using fastapi TestClient
└── requirements.txt         # Package dependencies
```

## Getting Started

### 1. Prerequisites
Make sure Python 3.8+ is installed on your system.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Running the Server
Start the development server with:
```bash
uvicorn app.main:app --reload
```
Once started, the API will be available at `http://127.0.0.1:8000`.

### 4. Interactive API Documentation
FastAPI automatically generates documentation. You can view the docs at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Seed Data & Test Accounts
The application automatically seeds a set of default career roles and testing credentials on startup:
- **Student User**:
  - Email: `student@example.com`
  - Password: `password`
- **Mentor User**:
  - Email: `mentor@example.com`
  - Password: `password`
- **Admin User**:
  - Email: `admin@example.com`
  - Password: `password`

## Running Tests
Ensure dependencies are installed, then run:
```bash
pytest test_backend.py
```
