# PharmaFind

PharmaFind is a real-time medicine availability and pharmacy locator platform. It helps users find nearby pharmacies, check for specific medicine stock in real-time, and manage prescriptions and reservations.

## Features
- **Real-time Availability:** Search for medicines and see which nearby pharmacies have them in stock.
- **Location-Based Search:** Automatic proximity calculation using OpenStreetMap and Geolocation.
- **Pharmacy Portal:** Dedicated dashboard for pharmacy owners to manage inventory, tracking batch numbers, and expiry dates.
- **Secure Reservations:** Reserve medicines for pickup or home delivery with integrated Stripe payments.
- **AI-Ready Prescription Upload:** Simplified workflow for uploading and managing medical prescriptions.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS (or Vanilla CSS), Vite
- **Backend:** Django, Django REST Framework
- **Database:** SQLite (Development) / PostgreSQL (Production)
- **APIs:** OpenStreetMap (Nominatim), Stripe API, SimpleJWT

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## License
MIT
