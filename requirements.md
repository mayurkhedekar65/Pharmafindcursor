## Requirements for PharmaFind

### Functional Requirements

#### Consumer Side

- **Location input and suggestions**  
  - The system shall provide a location input box where users can type their current area/city in Goa.  
  - While typing, the system shall display suggestions based on:  
    - A predefined list of Goa areas and cities.  
    - Pharmacy locations already stored in the database.  
  - Users shall be able to:  
    - Select a suggested location, or  
    - Enter a custom text location manually.  

- **Location identification (conceptual geocoding)**  
  - If the entered location does not exactly match a pharmacy’s stored location:  
    - The system shall map the text location to the nearest known area/city in Goa using predefined data.  
    - The system shall assign a conceptual latitude and longitude to the user’s location based on this mapping.  

- **Medicine search**  
  - Users shall be able to search for medicines by name.  
  - Cart-based reservation flow for users
  - Support for healthcare products in addition to medicines
  - Support for multiple pharmacies per location

  - The system shall support basic search by:  
    - Exact name.  
    - Partial name (case-insensitive).  

- **Optional OCR-based search (conceptual)**  
  - Users may upload a prescription image.  
  - The system shall conceptually process the image and extract a list of medicine names.  
  - Extracted medicine names shall be shown to the user for confirmation before searching.  
  - OCR is simulated using sample outputs or a simple mock function, not a real OCR service.  

- **Nearest pharmacy calculation and listing**  
  - Once the location is finalized (selected or entered), the system shall:  
    - Calculate the distance between the user’s conceptual coordinates and all pharmacies in the database.  
    - Sort pharmacies by nearest distance.  
  - The system shall:  
    - Filter pharmacies where the requested medicine is available (stock quantity > 0).  
    - Display the nearest pharmacies with that medicine.  
  - For each matching pharmacy, the system shall display:  
    - Pharmacy name.  
    - Area/City.  
    - Distance from user’s location (approximate).  
    - Medicine availability (in stock / out of stock).  
    - Delivery option (Yes/No).  

- **Reservation and delivery request (conceptual)**  
  - The user shall be able to:  
    - Reserve the medicine for store pickup.  
    - Request home delivery if delivery is available.  
  - On reservation, the system shall create a simple reservation record with:  
    - User identifier (or guest), pharmacy, medicine, quantity, timestamp, and mode (pickup/delivery).  
  - No actual payment or logistics are handled; it is stored only as demo data.  

#### Pharmacy Side

- **Pharmacy portal (CRUD)**  
  - Pharmacies shall be able to:  
    - Create and update their profile (name, address/area, contact, delivery availability).  
    - Add, update, and delete medicines.  
    - Update stock quantities for medicines.  
    - Enable or disable delivery option.  

### Non-Functional Requirements

- **Usability**  
  - The user interface shall be simple and intuitive, suitable for first-time users.  
  - Location input and suggestions shall respond quickly and clearly.  

- **Performance**  
  - For the demo dataset (limited number of pharmacies and medicines), responses should typically be under 2 seconds on a normal college laptop.  

- **Reliability**  
  - The system should handle basic validation errors gracefully (for example, empty search or invalid location).  
  - If no pharmacy is found, a clear message should be displayed.  

- **Security (basic, educational)**  
  - Basic form validation should be implemented on both frontend and backend.  
  - Simple authentication for pharmacy accounts (for example, username/password) is assumed.  
  - No advanced security mechanisms (like complex token handling or advanced encryption) are required, but passwords must not be stored in plain text.  

- **Scalability**  
  - The system is designed for a small dataset (a few dozen pharmacies).  
  - It is not intended to support thousands of concurrent users.  

- **Maintainability**  
  - The project should be organized into separate `backend` and `frontend` folders.  
  - API endpoints and database models should be clearly documented in text.  

### Software Requirements

- **Backend**  
  - Python (version compatible with Django and Django REST Framework).  
  - Django.  
  - Django REST Framework.  
  - SQLite (default Django database, local only).  

- **Frontend**  
  - Node.js and npm (or yarn) for managing React dependencies.  
  - React library and related tooling (for example, React Router if needed).  

- **Development tools**  
  - Code editor/IDE (for example, VS Code or Cursor).  
  - Git (optional, for version control).  
  - Modern web browser (Chrome, Edge, or Firefox) for testing.  

- **Other tools**  
  - Free tools for simple diagrams or wireframes (optional, for example, Draw.io or Figma free tier).  
  - For OCR simulation, no external service is required; a mock/demo approach is assumed.  

### Hardware Requirements

- **Development machine**  
  - Processor: Minimum dual-core (for example, Intel i3 or similar).  
  - RAM: Minimum 4 GB (8 GB recommended for smoother React and Django development).  
  - Storage: At least 2–5 GB free space for project files, dependencies, and tools.  
  - Operating system: Windows, Linux, or macOS (in this project, Windows 10 or above).  

- **Execution environment (demo)**  
  - The same machine can be used to run both frontend and backend locally.  
  - No cloud infrastructure is required for the mini-project.  

### Constraints and Limitations

- **Technology constraints**  
  - Backend must use Django REST Framework.  
  - Frontend must use React.  
  - Database must be SQLite for local development.  
  - No Google Maps API or similar map services.  
  - No GPS-based or browser-based automatic location detection.  

- **Project constraints**  
  - Limited time and scope because it is a college mini-project.  
  - Demo data only; the system is not connected to real pharmacy inventories.  
  - Focus is on clarity and demonstration, not on production-grade robustness.  

- **Data constraints**  
  - Pharmacy and medicine data are manually entered and may not be complete or fully accurate.  
  - Location data is limited to key areas and cities in Goa.  
