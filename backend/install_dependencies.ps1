# Script to install Python dependencies for PharmaFind backend
# Run this script after fixing network/proxy issues

Write-Host "Activating virtual environment..." -ForegroundColor Green
& ".\venv\Scripts\Activate.ps1"

Write-Host "Upgrading pip..." -ForegroundColor Green
python -m pip install --upgrade pip

Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Green
python -m pip install -r requirements.txt

Write-Host "Verifying installation..." -ForegroundColor Green
python -m pip list

Write-Host "`nInstallation complete! You can now run the Django server with:" -ForegroundColor Green
Write-Host "  python manage.py runserver" -ForegroundColor Yellow
