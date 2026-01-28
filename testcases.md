# Test Cases – PharmaFind

## Objective

To verify that all major features of PharmaFind work correctly as per requirements.

---

## Test Case 1: Location Suggestion

**Input**:  
User types “Pa” in location input

**Expected Result**:  
Suggestions such as “Panaji”, “Panjim”, “Panaji Market” are shown

**Status**: Pass

---

## Test Case 2: Custom Location Input

**Input**:  
User enters “Near Margao Market”

**Expected Result**:  
System maps the text to nearest known Goa location (Margao)

**Status**: Pass

---

## Test Case 3: Medicine Search (Exact Match)

**Input**:  
Location: Panaji  
Medicine: Paracetamol

**Expected Result**:  
Nearest pharmacies with Paracetamol in stock are displayed

**Status**: Pass

---

## Test Case 4: Medicine Search (Partial Match)

**Input**:  
Location: Mapusa  
Medicine: Para

**Expected Result**:  
Paracetamol and similar medicines are matched (case-insensitive)

**Status**: Pass

---

## Test Case 5: No Medicine Found

**Input**:  
Medicine: RandomXYZ

**Expected Result**:  
User-friendly message: “No pharmacy found for this medicine”

**Status**: Pass

---

## Test Case 6: Distance Calculation

**Input**:  
User location: Panaji

**Expected Result**:  
Pharmacies are sorted by nearest distance

**Status**: Pass

---

## Test Case 7: Reserve for Pickup

**Action**:  
User clicks “Reserve for Pickup”

**Expected Result**:  
Reservation record created successfully

**Status**: Pass

---

## Test Case 8: Request Delivery (Available)

**Action**:  
User clicks “Home Delivery” for delivery-enabled pharmacy

**Expected Result**:  
Reservation created with delivery mode

**Status**: Pass

---

## Test Case 9: Request Delivery (Not Available)

**Action**:  
User clicks delivery for non-delivery pharmacy

**Expected Result**:  
Button disabled / proper message shown

**Status**: Pass

---

## Test Case 10: Cart Functionality

**Action**:  
User adds medicines to cart

**Expected Result**:  
Cart updates correctly with item count and details

**Status**: Pass

---

## Test Case 11: Empty Cart

**Action**:  
User opens cart without items

**Expected Result**:  
Message: “Your cart is empty
