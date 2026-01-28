## Assumptions and Limitations

### From Project Description (STEP 1)

**Assumptions**:
- The project focuses only on **Goa** locations with demo pharmacy data.
- Users know their approximate area/city (e.g., “Panaji bus stand”, “near Margao market”) and can type it.
- Conceptual geocoding is done using:
  - Predefined latitude/longitude for major Goa areas/cities.
  - Each pharmacy has its own fixed latitude/longitude.
- Distance between user location and pharmacies is calculated using approximate formulas (no external map APIs).
- OCR for prescription images is **simulated**:
  - Assumed via a dummy function or sample output.
  - No real third-party OCR service is integrated.

**Limitations**:
- Manual location entry may be less accurate than GPS.
- No live traffic or route-based distance, only straight-line or simplified distance.
- Medicine availability is based on manually entered demo data; it is **not** real-time.
- The system is **educational and for demo only**:
  - Not suitable for real-world medical or emergency use.
- Security, privacy, and scalability are handled at a basic level only, suitable for a college mini-project.

### From Requirements (STEP 2)

### 2.5 Constraints and Limitations

- **Technology Constraints**:
  - Backend must use Django REST Framework.
  - Frontend must use React.
  - Database must be SQLite for local development.
  - No Google Maps API or similar services.
  - No GPS-based location detection.

- **Project Constraints**:
  - Limited time and scope (college mini-project).
  - Demo data only; not connected to real pharmacy inventories.
  - Focus on clarity and demonstration instead of production-grade robustness.

- **Data Constraints**:
  - Pharmacy and medicine data are manually entered and may not be complete or accurate.
  - Location data is limited to key areas/cities in Goa.

### From Execution Plan (STEP 3)

**Assumption**:  
All conceptual geocoding is done using a static table of Goa areas with associated latitude/longitude values. No external geocoding APIs are used.

**Assumption**:  
Distance is approximate and only for demonstration. It does not consider real travel routes or traffic.

### From Cost Estimation (STEP 4)

**Assumption**:  
This is a student project done on personal laptops using free tools. No production hosting costs are included.

### From Time Estimation (STEP 5)

**Assumption**:  
- 1–2 students working part-time.  
- Around 2–3 hours per day.  
- Focus is on completing a working demo with basic features.

