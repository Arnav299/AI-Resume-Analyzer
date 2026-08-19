Write-Host "Updating Node.js to version 22.13.1..."
Invoke-WebRequest -Uri "https://nodejs.org/dist/v22.13.1/node-v22.13.1-x64.msi" -OutFile "nodejs22.msi"
Write-Host "Installing Node.js... (Please click YES if prompted)"
Start-Process -Wait -FilePath msiexec.exe -ArgumentList "/i nodejs22.msi /passive"
Remove-Item -Path "nodejs22.msi" -Force
Write-Host "Done."
