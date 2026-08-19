@echo off
TITLE AI Resume Analyzer - Automated Setup & Launch System
COLOR 0A

echo ===============================================================================
echo            AI Resume Analyzer -- Automated Setup & Launch System
echo ===============================================================================
echo.
echo Launching PowerShell Prerequisite Verification and Launch Engine...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install_and_run.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    COLOR 0C
    echo [ERROR] Setup encountered an issue. Please check the logs above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===============================================================================
echo   Setup and Launch Complete! Your web browser should open automatically.
echo ===============================================================================
echo.
echo Keep the newly opened backend and frontend server windows open while testing.
echo.
pause
