## Execution Plan for PharmaFind

### System Architecture Overview

- **Client (frontend)**  
  - Built using React.  
  - Responsibilities:  
    - Show pages for users and pharmacies.  
    - Handle location input and show suggestions.  
    - Send API requests to the backend for:  
      - Location suggestions.  
      - Medicine search.  
      - Nearest pharmacy retrieval.  
      - Pharmacy CRUD operations.  

- **Server (backend)**  
  - Built using Django REST Framework.  
  - Responsibilities:  
    - Expose REST-style APIs for:  
      - Location suggestion.  
      - Medicine search and availability.  
      - Nearest pharmacy calculation.  
      - Pharmacy profile and inventory management.  
      - Reservation creation (pickup or delivery request).  

- **Database (SQLite)**  
  - Stores:  
    - Pharmacy master data (name, area, coordinates, delivery flag).  
    - Medicine master data.  
    - Pharmacy–medicine stock mapping.  
    - Reservation records.  
    - Basic pharmacy user accounts (for the pharmacy portal).  

### Frontend–Backend Separation

- **Folder structure**  
  - `backend/` – contains the Django + DRF project (APIs only, no UI templates).  
  - `frontend/` – contains the React application (user and pharmacy interfaces).  

- **Communication**  
  - The frontend communicates with the backend using HTTP requests (for example, `fetch` or similar, but not coded here).  
  - Data is exchanged as JSON.  
  - The backend does not render HTML pages; it only sends and receives JSON data.  

### Location Suggestion and Identification Flow

#### Location Suggestion Flow

1. The user starts typing location text in the frontend input box.  
2. The frontend sends the current text (for example, “Pa”, “Pan”) to a backend API endpoint.  
3. The backend searches:  
   - A predefined list of Goa areas and cities (for example, Panaji, Mapusa, Margao).  
   - Pharmacy locations stored in the database.  
4. The backend returns a list of matching suggestions (for example, “Panaji”, “Panaji Market Area”).  
5. The frontend displays these suggestions below the input field.  
6. The user selects one suggestion or continues with a manually entered location.  

#### Location Identification (Conceptual Geocoding)

1. When the user confirms the location (for example, by clicking a search button):  
   - The frontend sends the final location string to the backend.  
2. The backend checks:  
   - If the location exactly matches a known area or pharmacy location:  
     - It uses the stored latitude and longitude for that area.  
   - Otherwise:  
     - It applies simple logic to find the nearest known area, for example:  
       - String similarity (for example, “Panajee” → “Panaji”).  
       - Manual mapping table for common variations (for example, “Panjim” → “Panaji”).  
3. The backend then assigns approximate latitude and longitude values for the user’s location based on this mapping.  
4. This coordinate pair is treated as the user’s current location for distance calculations.  

All conceptual geocoding is done using a static table of Goa areas with associated latitude and longitude values. No external geocoding APIs are used.  

### Nearest Pharmacy Calculation Logic (Conceptual)

- **Input**  
  - User’s conceptual latitude and longitude.  
  - List of pharmacies with their latitude and longitude from the database.  

- **Processing steps**  
  1. For each pharmacy, calculate an approximate distance from the user’s location.  
  2. Use a simple distance formula, such as:  
     - Straight-line distance in latitude/longitude space (approximate).  
  3. Store the calculated distance with each pharmacy record.  
  4. Filter pharmacies where the requested medicine is available (stock > 0).  
  5. Sort the filtered list of pharmacies by distance in ascending order.  
  6. Return the nearest pharmacies to the frontend.  

- **Output**  
  - For each returned pharmacy, include:  
    - Name.  
    - Area/City.  
    - Approximate distance from the user.  
    - Medicine availability.  
    - Delivery flag (Yes/No).  

Distance is approximate and only for demonstration. It does not consider real travel routes or traffic.  

### Data Flow Explanation

1. **User enters location text**  
   - Frontend collects the text and calls the backend location suggestion API.  
   - Backend returns a list of suggested areas and locations.  

2. **User confirms location and enters medicine name**  
   - Frontend sends the final location and medicine name (or ID) to the backend.  

3. **Backend identifies location and finds pharmacies**  
   - Backend identifies the user’s conceptual coordinates using the predefined location table.  
   - Backend searches the pharmacy and stock tables to find pharmacies that have the requested medicine.  
   - Backend calculates approximate distances and sorts the pharmacies.  

4. **Backend sends results**  
   - Backend sends a list of nearby pharmacies and related details (distance, stock, delivery flag) back to the frontend.  

5. **User reserves medicine**  
   - If the user chooses a pharmacy and selects pickup or delivery, the frontend sends a reservation request to the backend.  
   - Backend creates a reservation record in the database and returns a simple confirmation message.  

6. **Pharmacy portal actions**  
   - Pharmacy user logs into the portal (conceptually).  
   - Frontend for the pharmacy sends CRUD requests (profile updates, medicines, stock changes) to the backend APIs.  
   - Backend updates the corresponding tables in the SQLite database.  

### Technology Justification

- **Django REST Framework (backend)**  
  - Provides a clean and structured way to build REST APIs.  
  - Integrates easily with SQLite.  
  - Good for educational projects, as it clearly separates models, serializers, and views (even though we are not writing them here).  

- **React (frontend)**  
  - Popular JavaScript library for building single-page applications.  
  - Well-suited for dynamic features such as:  
    - Autocomplete location suggestions.  
    - Live update of search results for pharmacies and medicines.  
  - Gives students practice with a modern frontend stack.  

- **SQLite (database)**  
  - Simple, file-based database that ships with Django by default.  
  - Easy to set up and ideal for a local mini-project.  
  - No separate database server is needed.  

- **Separate frontend and backend folders**  
  - Reflects a real-world client–server architecture.  
  - Allows independent development and testing of the API and the user interface.  
  - Makes it easier to replace or upgrade one side (for example, a different frontend) without changing the other, as long as the APIs remain the same.  
