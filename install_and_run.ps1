# =============================================================================
# AI Resume Analyzer — Automated Prerequisite Verification & Launch Engine
# =============================================================================

$ErrorActionPreference = "Stop"
$RootPath = $PSScriptRoot

function Write-Header ($Text) {
    Write-Host "`n===============================================================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "===============================================================================" -ForegroundColor Cyan
}

function Write-Step ($StepNum, $Text) {
    Write-Host "`n[$StepNum] $Text" -ForegroundColor Yellow
}

function Write-Success ($Text) {
    Write-Host "  [OK] $Text" -ForegroundColor Green
}

function Write-Info ($Text) {
    Write-Host "  [INFO] $Text" -ForegroundColor Gray
}

function Write-WarningMsg ($Text) {
    Write-Host "  [WARN] $Text" -ForegroundColor Yellow
}

Write-Header "AI Resume Analyzer - Pre-requisite Verification & Launch"
Write-Host "  Current Detected Directory : $RootPath" -ForegroundColor White
Write-Host "`n  [C] Choose a custom installation/run directory using a Windows Pop-up Dialog" -ForegroundColor Yellow
Write-Host "  [ENTER] Use the current directory ($RootPath)" -ForegroundColor Green
$choice = Read-Host "`nSelect an option (Press ENTER for default)"

if ($choice -eq "C" -or $choice -eq "c") {
    Write-Info "Opening Windows Folder Selector Pop-Up..."
    Add-Type -AssemblyName System.Windows.Forms
    $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $dialog.Description = "Select the target root folder for AI Resume Analyzer"
    $dialog.ShowNewFolderButton = $true
    $dialog.SelectedPath = $RootPath
    
    $result = $dialog.ShowDialog()
    if ($result -eq [System.Windows.Forms.DialogResult]::OK -and $dialog.SelectedPath) {
        $RootPath = $dialog.SelectedPath
        Write-Success "Custom installation/run directory selected: $RootPath"
    } else {
        Write-Info "Pop-up cancelled or closed. Continuing with current directory: $RootPath"
    }
} else {
    Write-Success "Proceeding with current directory: $RootPath"
}

# -----------------------------------------------------------------------------
# STEP 1: Verify Python Pre-requisite
# -----------------------------------------------------------------------------
Write-Step "1/6" "Checking Python Installation..."
$PythonCmd = $null
if (Get-Command "python" -ErrorAction SilentlyContinue) {
    $PythonCmd = "python"
} elseif (Get-Command "python3" -ErrorAction SilentlyContinue) {
    $PythonCmd = "python3"
} elseif (Test-Path "C:\jDroid-X-AI-Tools\Python314\python.exe") {
    $PythonCmd = "C:\jDroid-X-AI-Tools\Python314\python.exe"
}

if (-not $PythonCmd) {
    Write-Host "  [ERROR] Python was not found in PATH or standard directories!" -ForegroundColor Red
    Write-Host "  Please install Python 3.10+ and ensure it is added to your PATH." -ForegroundColor Red
    exit 1
}

$PythonVersion = & $PythonCmd --version 2>&1
Write-Success "Python exists: $PythonVersion ($PythonCmd)"

# -----------------------------------------------------------------------------
# STEP 2: Verify Node.js & npm Pre-requisites
# -----------------------------------------------------------------------------
Write-Step "2/6" "Checking Node.js & npm Installation..."
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "  [ERROR] npm (Node Package Manager) was not found in PATH!" -ForegroundColor Red
    Write-Host "  Please install Node.js (which includes npm) from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$NodeVersion = node -v
$NpmVersion = npm -v
Write-Success "Node.js exists: $NodeVersion | npm exists: v$NpmVersion"

# -----------------------------------------------------------------------------
# STEP 3: Check & Install Backend Dependencies
# -----------------------------------------------------------------------------
Write-Step "3/6" "Verifying Python Backend Dependencies..."
$BackendDir = Join-Path $RootPath "backend"

Push-Location $BackendDir
try {
    & $PythonCmd -c "import fastapi, uvicorn, aiosqlite, sqlalchemy, alembic, pydantic, reportlab, passlib" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All required Python backend packages are confirmed present."
    } else {
        Write-WarningMsg "Some Python packages are missing. Installing via pip with --only-binary :all:..."
        & $PythonCmd -m pip install fastapi uvicorn aiosqlite sqlalchemy alembic pydantic pydantic-settings python-jose passlib bcrypt reportlab python-multipart slowapi email-validator httpx structlog python-dotenv pytest --only-binary :all:
        if ($LASTEXITCODE -ne 0) {
            Write-WarningMsg "Primary pip install returned non-zero, trying fallback install..."
            & $PythonCmd -m pip install -r requirements.txt --only-binary :all:
        }
        Write-Success "Backend dependencies installed successfully."
    }
} finally {
    Pop-Location
}

# -----------------------------------------------------------------------------
# STEP 4: Check & Install Frontend Dependencies (`node_modules`)
# -----------------------------------------------------------------------------
Write-Step "4/6" "Verifying Frontend React / Vite Dependencies..."
$FrontendDir = Join-Path $RootPath "frontend"
$NodeModulesDir = Join-Path $FrontendDir "node_modules"

Push-Location $FrontendDir
try {
    if (Test-Path $NodeModulesDir) {
        Write-Success "Frontend 'node_modules' directory exists. Dependencies verified."
    } else {
        Write-WarningMsg "node_modules not found in frontend/. Running 'npm install'..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERROR] npm install failed! Please check your network or Node setup." -ForegroundColor Red
            exit 1
        }
        Write-Success "Frontend node_modules installed successfully."
    }
} finally {
    Pop-Location
}

# -----------------------------------------------------------------------------
# STEP 5: Check & Seed Database (`resume_analyzer.db`)
# -----------------------------------------------------------------------------
Write-Step "5/6" "Verifying SQLite Database & Sample Seed Data..."
$DbPath = Join-Path $BackendDir "resume_analyzer.db"

Push-Location $BackendDir
try {
    if (Test-Path $DbPath) {
        Write-Success "Database file confirmed exists: $DbPath"
        Write-Info "Verifying table integrity..."
        & $PythonCmd -c "import sqlite3; conn = sqlite3.connect('resume_analyzer.db'); cur = conn.cursor(); cur.execute('SELECT count(*) FROM users'); count = cur.fetchone()[0]; print(f'Users in database: {count}'); conn.close()" 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-WarningMsg "Database schema uninitialized or incomplete. Running setup_database.py..."
            & $PythonCmd setup_database.py
        } else {
            Write-Success "Database schema and seed data integrity confirmed."
        }
    } else {
        Write-WarningMsg "Database not found. Initializing and seeding new SQLite database..."
        & $PythonCmd setup_database.py
        Write-Success "Database setup complete."
    }
} finally {
    Pop-Location
}

# -----------------------------------------------------------------------------
# STEP 6: Launch Servers & Open Web Browser
# -----------------------------------------------------------------------------
Write-Step "6/6" "Launching Backend API Server & Frontend Web Application..."

Write-Info "Starting FastAPI Backend Server (Port 8000) in a new terminal window..."
$BackendLaunchCmd = "cd '$BackendDir'; & '$PythonCmd' -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000; Read-Host 'Backend server closed. Press Enter to exit'"
Start-Process powershell.exe -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $BackendLaunchCmd

Write-Info "Waiting 3 seconds for Backend API server to bind port..."
Start-Sleep -Seconds 3

Write-Info "Starting Vite React Frontend Server (Port 5173) in a new terminal window..."
$FrontendLaunchCmd = "cd '$FrontendDir'; npm run dev; Read-Host 'Frontend server closed. Press Enter to exit'"
Start-Process powershell.exe -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $FrontendLaunchCmd

Write-Info "Waiting 3 seconds for Vite server to start..."
Start-Sleep -Seconds 3

Write-Success "Both servers are live in dedicated background windows!"
Write-Info "Launching web browser to http://localhost:5173 ..."
Start-Process "http://localhost:5173"

Write-Header "Setup & Launch Protocol Completed Successfully!"
Write-Host "  API Backend URL : http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "  API Docs URL    : http://127.0.0.1:8000/api/docs" -ForegroundColor Green
Write-Host "  Frontend Web App: http://localhost:5173" -ForegroundColor Green
Write-Host "`nYou may now close this setup window. Keep the two server windows open while testing." -ForegroundColor Yellow
