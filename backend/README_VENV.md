# Virtual Environment Setup Instructions

## Issue Fixed
The virtual environment has been recreated with the correct Python path (Python 3.8.2).

## Current Status
- ✅ Virtual environment created successfully
- ⚠️ Package installation blocked by network/proxy issues

## Required Packages
The following packages need to be installed:
- Django (>=4.2,<5.0) - Compatible with Python 3.8
- djangorestframework (>=3.14)
- django-cors-headers (>=4.3)
- Pillow (>=10.0)
- requests (>=2.31)
- python-dotenv (>=1.0)

## Installation Options

### Option 1: Using the Installation Script
1. Fix network/proxy connectivity issues
2. Run the installation script:
   ```powershell
   cd backend
   .\install_dependencies.ps1
   ```

### Option 2: Manual Installation
1. Activate the virtual environment:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   ```

2. Upgrade pip (if network allows):
   ```powershell
   python -m pip install --upgrade pip
   ```

3. Install packages:
   ```powershell
   python -m pip install -r requirements.txt
   ```

### Option 3: Offline Installation
If you have wheel files or a local package repository:
```powershell
python -m pip install --find-links <path_to_wheels> -r requirements.txt
```

## Verifying Installation
After installation, verify packages are installed:
```powershell
python -m pip list
```

You should see:
- Django
- djangorestframework
- django-cors-headers
- Pillow
- requests
- python-dotenv

## Running the Server
Once packages are installed:
```powershell
python manage.py runserver
```

## Network/Proxy Issues
If you continue to experience network issues:
1. Check your internet connection
2. Verify proxy settings (if required by your network)
3. Contact your network administrator
4. Consider using a different network or VPN
