@echo off
title AI Resume Analyzer - Dev Server
color 0A
echo ============================================
echo   AI Resume Analyzer - Starting Servers
echo ============================================
echo.

REM Kill any leftover node/python processes on ports 5173/8000
echo [1/3] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" 2^>nul') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 /nobreak >nul

REM Start the backend in a new window
echo [2/3] Starting Backend (FastAPI on port 8000)...
IF EXIST "%~dp0backend\venv\Scripts\python.exe" (
    set PYTHON_CMD="%~dp0backend\venv\Scripts\python.exe"
    set PIP_CMD="%~dp0backend\venv\Scripts\pip.exe"
) ELSE (
    python --version >nul 2>&1
    IF %ERRORLEVEL% EQU 0 (
        set PYTHON_CMD=python
        set PIP_CMD=pip
    ) ELSE (
        IF EXIST "C:\jDroid-X-AI-Tools\Python314\python.exe" (
            set PYTHON_CMD="C:\jDroid-X-AI-Tools\Python314\python.exe"
            set PIP_CMD="C:\jDroid-X-AI-Tools\Python314\Scripts\pip.exe"
        ) ELSE (
            set PYTHON_CMD=python
            set PIP_CMD=pip
        )
    )
)
start "Backend - FastAPI :8000" cmd /k "cd /d "%~dp0backend" && %PIP_CMD% install -r requirements.txt && %PYTHON_CMD% -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

REM Start the frontend in a new window
echo [3/3] Starting Frontend (Vite on port 5173)...
start "Frontend - Vite :5173" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo ============================================
echo   Both servers are starting!
echo   Backend:  http://127.0.0.1:8000/api/docs
echo   Frontend: http://localhost:5173
echo ============================================
echo.
echo This window can be closed. The servers are running in their own windows.
pause
