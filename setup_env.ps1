Write-Host "Downloading Node.js..."
Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi" -OutFile "nodejs.msi"
Write-Host "Installing Node.js... (Please click YES on your screen if Windows asks for Administrator permissions)"
Start-Process -Wait -FilePath msiexec.exe -ArgumentList "/i nodejs.msi /passive"

Write-Host "Downloading Python..."
Invoke-WebRequest -Uri "https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe" -OutFile "python.exe"
Write-Host "Installing Python... (Please click YES on your screen if Windows asks for Administrator permissions)"
Start-Process -Wait -FilePath ".\python.exe" -ArgumentList "/passive InstallAllUsers=0 PrependPath=1 Include_pip=1 Include_test=0"

Write-Host "Cleaning up installers..."
Remove-Item -Path "nodejs.msi" -Force
Remove-Item -Path "python.exe" -Force

Write-Host "Installation complete! Please restart your terminal/IDE for the changes to take effect."
