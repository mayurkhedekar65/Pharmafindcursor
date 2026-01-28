# PharmaFind Backend API Documentation

## Base URL
All APIs are prefixed with: `/api/pharmacies/`

---

## CONSUMER-SIDE APIs (For Users)

### 1. Medicine Search
**Endpoint:** `POST /api/pharmacies/medicine-search/`

**Description:** Search for medicines by name and find nearest pharmacies with stock.

**Request Body:**
```json
{
  "user_location": "Panaji",
  "medicine_name": "Paracetamol"
}
```

**Response (Success):**
```json
{
  "resolved_location": "Panaji",
  "results": [
    {
      "pharmacy_name": "Panaji City Pharmacy",
      "area": "Panaji",
      "city": "Panaji",
      "distance_km": 0.5,
      "medicine_name": "Paracetamol",
      "quantity": 50,
      "delivery_available": true
    }
  ]
}
```

**Response (No Results):**
```json
{
  "detail": "No medicines found matching the given name.",
  "resolved_location": "Panaji"
}
```

---

### 2. Create Reservation
**Endpoint:** `POST /api/pharmacies/reservations/`

**Description:** Create a reservation for pickup or delivery (demo/conceptual only).

**Request Body:**
```json
{
  "pharmacy": 1,
  "medicine": 1,
  "quantity": 2,
  "mode": "pickup",
  "user_identifier": "user123"
}
```

**Response:**
```json
{
  "id": 1,
  "pharmacy": 1,
  "medicine": 1,
  "quantity": 2,
  "mode": "pickup",
  "timestamp": "2026-01-27T10:30:00Z",
  "user_identifier": "user123"
}
```

---

## PHARMACY PORTAL APIs (For Pharmacy Management)

### 3. List All Pharmacies
**Endpoint:** `GET /api/pharmacies/pharmacies/`

**Description:** Get a list of all pharmacies in the system.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Panaji City Pharmacy",
    "area": "Panaji",
    "city": "Panaji",
    "latitude": 15.4909,
    "longitude": 73.8278,
    "delivery_available": true,
    "contact": "9876543210"
  }
]
```

---

### 4. List All Medicines
**Endpoint:** `GET /api/pharmacies/medicines/`

**Description:** Get a list of all medicines in the system.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Paracetamol",
    "description": "Pain reliever and fever reducer."
  }
]
```

---

### 5. Get/Update Pharmacy Profile
**Endpoint:** `GET /api/pharmacies/pharmacy/<pharmacy_id>/profile/`  
**Endpoint:** `PUT /api/pharmacies/pharmacy/<pharmacy_id>/profile/`

**Description:** Get or update pharmacy profile details.

**PUT Request Body:**
```json
{
  "name": "Updated Pharmacy Name",
  "area": "Panaji",
  "city": "Panaji",
  "latitude": 15.4909,
  "longitude": 73.8278,
  "delivery_available": true,
  "contact": "9876543210"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Pharmacy Name",
  "area": "Panaji",
  "city": "Panaji",
  "latitude": 15.4909,
  "longitude": 73.8278,
  "delivery_available": true,
  "contact": "9876543210"
}
```

---

### 6. List Pharmacy Stock
**Endpoint:** `GET /api/pharmacies/pharmacy/<pharmacy_id>/stock/`

**Description:** Get all medicines and their stock quantities for a specific pharmacy.

**Response:**
```json
[
  {
    "id": 1,
    "medicine": {
      "id": 1,
      "name": "Paracetamol",
      "description": "Pain reliever and fever reducer."
    },
    "pharmacy_name": "Panaji City Pharmacy",
    "quantity": 50
  }
]
```

---

### 7. Add Medicine to Pharmacy
**Endpoint:** `POST /api/pharmacies/pharmacy/<pharmacy_id>/stock/add/`

**Description:** Add a medicine to a pharmacy's stock. Creates the medicine if it doesn't exist. Updates stock if it already exists.

**Request Body:**
```json
{
  "medicine_name": "Aspirin",
  "medicine_description": "Pain reliever",
  "quantity": 30
}
```

**Response:**
```json
{
  "id": 14,
  "pharmacy": 1,
  "medicine": 5,
  "quantity": 30
}
```

---

### 8. Update Stock Quantity
**Endpoint:** `PUT /api/pharmacies/pharmacy/<pharmacy_id>/stock/<stock_id>/`

**Description:** Update the stock quantity for a specific medicine in a pharmacy.

**Request Body:**
```json
{
  "quantity": 75
}
```

**Response:**
```json
{
  "id": 1,
  "pharmacy": 1,
  "medicine": 1,
  "quantity": 75
}
```

---

### 9. Remove Medicine from Pharmacy
**Endpoint:** `DELETE /api/pharmacies/pharmacy/<pharmacy_id>/stock/<stock_id>/delete/`

**Description:** Remove a medicine from a pharmacy's stock (delete stock entry).

**Response:**
```json
{
  "detail": "Medicine removed from pharmacy stock."
}
```

---

### 10. Toggle Delivery Service
**Endpoint:** `PUT /api/pharmacies/pharmacy/<pharmacy_id>/delivery-toggle/`

**Description:** Enable or disable delivery service for a pharmacy.

**Request Body:**
```json
{
  "delivery_available": true
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Panaji City Pharmacy",
  "area": "Panaji",
  "city": "Panaji",
  "latitude": 15.4909,
  "longitude": 73.8278,
  "delivery_available": true,
  "contact": "9876543210"
}
```

---

## Error Responses

All APIs return standard HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Resource not found

Error response format:
```json
{
  "detail": "Error message here"
}
```

---

## Notes

- All APIs use JSON for request/response
- No authentication required at this stage (educational project)
- Location identification is conceptual (no real GPS/geocoding APIs)
- Distance calculations are approximate
- Demo data only - not connected to real pharmacy systems
