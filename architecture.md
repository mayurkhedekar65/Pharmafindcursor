# High-Level Architecture – PharmaFind

## Overview

PharmaFind follows a **client–server architecture** with a clear separation between frontend and backend.  
The system is designed as a **location-based medicine search and reservation platform** for Goa, using demo data.

The architecture ensures:
- Clear responsibility separation
- Easy debugging
- Scalability at a conceptual level
- Alignment with real-world web application design

---

## System Components

### 1. Frontend (Client Layer)

- Built using **React**
- Runs in the browser
- Responsible for:
  - User interface rendering
  - Location input and suggestions
  - Medicine search input
  - Displaying nearby pharmacies
  - Cart and reservation flow
  - Showing confirmation messages

Frontend does **not** contain any business logic related to distance calculation or stock validation.

---

### 2. Backend (Application Layer)

- Built using **Django REST Framework**
- Exposes REST APIs
- Responsible for:
  - Handling location suggestions
  - Conceptual geocoding (mapping text to coordinates)
  - Medicine search and filtering
  - Nearest pharmacy calculation
  - Stock availability checking
  - Reservation creation (pickup or delivery)

Backend does **not** render HTML pages.

---

### 3. Database (Data Layer)

- Uses **SQLite**
- Stores demo data only:
  - Pharmacy details
  - Medicine catalog
  - Stock mapping
  - Reservation records
  - Static Goa location reference data

---

## Architecture Diagram (Textual Representation)

User  
↓  
React Frontend  
↓ (HTTP / JSON)  
Django REST APIs  
↓  
SQLite Database  

---

## Communication Flow

- Frontend sends requests using HTTP (JSON format)
- Backend processes logic and returns JSON responses
- Frontend updates UI based on response

---

## Key Architectural Decisions

- Separate frontend and backend folders
- REST-based communication
- No external paid APIs
- Conceptual location and distance logic
- Demo-only scope

---

## Benefits of This Architecture

- Easy to understand and maintain
- Matches industry-standard web architecture
- Suitable for college mini-project evaluation
- Allows future extension (maps, payments, real inventory)

---

## Limitations

- Not production-ready
- No real-time GPS or maps
- No cloud deployment
- Limited to Goa demo data only
