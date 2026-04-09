# 🗺️ PharmaFind Pharmacy Module - Navigation Flow

## 📍 Application Routes

```
┌─────────────────────────────────────────────────────────────┐
│                    PHARMAFIND APPLICATION                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─── Public Routes
                              │    ├─ / (Home)
                              │    ├─ /login
                              │    ├─ /signup
                              │    ├─ /results
                              │    └─ /cart
                              │
                              └─── Protected Routes (Pharmacy)
                                   │
                                   ├─ /pharmacy/home ──────────────┐
                                   │                                │
                                   ├─ /pharmacy/inventory          │
                                   │                                │
                                   ├─ /pharmacy/orders              │
                                   │                                │
                                   ├─ /pharmacy/credits             │
                                   │                                │
                                   └─ /pharmacy/analytics           │
                                                                    │
                                   ┌────────────────────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  PharmacyLayout      │
                        │  ┌────────┬────────┐ │
                        │  │Sidebar │Content │ │
                        │  │        │        │ │
                        │  │  Nav   │ Page   │ │
                        │  │ Items  │ Render │ │
                        │  └────────┴────────┘ │
                        └──────────────────────┘
```

---

## 🏗️ Component Hierarchy

```
App.jsx
│
├─── Header (existing)
│
├─── Routes
│    │
│    ├─── Public Routes (existing)
│    │
│    └─── Pharmacy Routes (NEW)
│         │
│         └─── ProtectedRoute (requirePharmacy)
│              │
│              └─── PharmacyLayout
│                   │
│                   ├─── Sidebar
│                   │    ├─ Dashboard Link
│                   │    ├─ Inventory Link
│                   │    ├─ Orders Link
│                   │    ├─ Credit Link
│                   │    ├─ Analytics Link
│                   │    └─ Logout Button
│                   │
│                   ├─── Topbar
│                   │    ├─ Page Title
│                   │    ├─ Current Date
│                   │    └─ Profile Dropdown
│                   │
│                   └─── Content Area
│                        │
│                        ├─ Dashboard.jsx
│                        │  ├─ StatCard (x4)
│                        │  ├─ Revenue Chart
│                        │  ├─ Recent Orders Table
│                        │  └─ Low Stock Table
│                        │
│                        ├─ InventoryManagement.jsx
│                        │  ├─ Search Bar
│                        │  ├─ Filter Buttons
│                        │  ├─ Inventory Table
│                        │  ├─ InventoryModal
│                        │  └─ ConfirmModal
│                        │
│                        ├─ OrdersManagement.jsx
│                        │  ├─ Summary Cards (x3)
│                        │  ├─ Filter Buttons
│                        │  ├─ Date Range Inputs
│                        │  └─ Orders Table
│                        │
│                        ├─ CreditManagement.jsx
│                        │  ├─ Summary Cards (x3)
│                        │  ├─ Search Bar
│                        │  ├─ Credits Table
│                        │  └─ Settle Modal
│                        │
│                        └─ Analytics.jsx
│                           ├─ Growth Metrics (x4)
│                           ├─ Time Range Toggle
│                           ├─ Revenue Chart
│                           ├─ Profit Chart
│                           └─ Top Medicines Table
│
└─── Footer (existing)
```

---

## 🎯 User Journey

### 1️⃣ Login Flow
```
User visits /login
    ↓
Enters pharmacy credentials
    ↓
AuthContext.login() called
    ↓
User object stored (with role: 'pharmacy')
    ↓
Redirect to /pharmacy/home
```

### 2️⃣ Dashboard View
```
/pharmacy/home loads
    ↓
ProtectedRoute checks authentication
    ↓
PharmacyLayout renders
    ↓
Dashboard.jsx fetches data
    ↓
Shows loading skeletons
    ↓
Displays stats with count-up animation
    ↓
Renders charts and tables
```

### 3️⃣ Inventory Management
```
User clicks "Inventory" in sidebar
    ↓
Navigate to /pharmacy/inventory
    ↓
InventoryManagement.jsx loads
    ↓
Fetches inventory data
    ↓
User can:
  ├─ Search medicines
  ├─ Filter by status
  ├─ Add new medicine (opens modal)
  ├─ Edit existing (opens modal with data)
  └─ Delete (shows confirmation)
```

### 4️⃣ Order Processing
```
User clicks "Orders" in sidebar
    ↓
Navigate to /pharmacy/orders
    ↓
OrdersManagement.jsx loads
    ↓
Displays order list
    ↓
User can:
  ├─ Filter by payment status
  ├─ Filter by date range
  └─ Mark pending orders as paid
      ↓
      Success toast appears
      ↓
      Table updates
```

### 5️⃣ Credit Settlement
```
User clicks "Credit" in sidebar
    ↓
Navigate to /pharmacy/credits
    ↓
CreditManagement.jsx loads
    ↓
Shows customers with outstanding credit
    ↓
User clicks "Settle Credit"
    ↓
Modal opens with customer details
    ↓
User enters payment amount
    ↓
Submits payment
    ↓
Success animation plays
    ↓
Credit balance updates
```

### 6️⃣ Analytics Review
```
User clicks "Analytics" in sidebar
    ↓
Navigate to /pharmacy/analytics
    ↓
Analytics.jsx loads
    ↓
Displays growth metrics
    ↓
User can:
  ├─ Toggle time range (7/30/90 days)
  ├─ View revenue chart
  ├─ View profit chart
  └─ See top selling medicines
```

---

## 🔄 State Management Flow

```
Component Mounts
    ↓
useEffect triggers
    ↓
fetchData() called
    ↓
setLoading(true)
    ↓
API call (or mock data)
    ↓
Success?
    ├─ YES → setData(result)
    │        setLoading(false)
    │        Render content
    │
    └─ NO  → setError(message)
             setLoading(false)
             Show error message
```

---

## 🎨 Styling Architecture

```
pharmacy.css
│
├─── CSS Variables (Colors, spacing)
│
├─── Layout Styles
│    ├─ .pharmacy-layout
│    ├─ .pharmacy-sidebar
│    ├─ .pharmacy-main
│    └─ .pharmacy-content
│
├─── Component Styles
│    ├─ .stat-card-premium
│    ├─ .pf-table-container
│    ├─ .pf-modal
│    └─ .pf-badge
│
├─── Form Styles
│    ├─ .pf-form-input
│    ├─ .pf-form-select
│    └─ .pf-search-input
│
├─── Button Styles
│    ├─ .primary-button
│    ├─ .secondary-button
│    ├─ .small-button
│    └─ .danger-button
│
├─── Utility Classes
│    ├─ .pf-grid-2/3/4
│    ├─ .pf-flex-between
│    └─ .pf-mb-1/2
│
└─── Animations
     ├─ @keyframes fadeIn
     ├─ @keyframes slideUp
     ├─ @keyframes countUp
     └─ @keyframes skeleton-loading
```

---

## 📊 Data Flow

```
User Action
    ↓
Event Handler
    ↓
State Update (useState)
    ↓
Component Re-render
    ↓
UI Updates
    ↓
(Optional) API Call
    ↓
Backend Update
    ↓
Success Feedback
```

### Example: Add Medicine
```
User fills form in InventoryModal
    ↓
Clicks "Add Medicine"
    ↓
handleAddMedicine() called
    ↓
Validates form data
    ↓
Calls API: addMedicineToPharmacy()
    ↓
Success?
    ├─ YES → Update local state
    │        Close modal
    │        Show success alert
    │        Refresh inventory list
    │
    └─ NO  → Show error message
             Keep modal open
```

---

## 🔐 Authentication Flow

```
App Loads
    ↓
AuthProvider wraps app
    ↓
Checks localStorage for token
    ↓
Token exists?
    ├─ YES → Parse user data
    │        Set authenticated state
    │        User can access protected routes
    │
    └─ NO  → User is not authenticated
             Protected routes redirect to /login
```

### Protected Route Check
```
User navigates to /pharmacy/home
    ↓
ProtectedRoute component renders
    ↓
Checks: isAuthenticated?
    ├─ NO  → Redirect to /login
    │
    └─ YES → Checks: isPharmacy?
             ├─ NO  → Redirect to /
             │
             └─ YES → Render Dashboard
```

---

## 📱 Responsive Behavior

```
Screen Width
    │
    ├─ > 1200px (Desktop)
    │  ├─ Sidebar visible (260px)
    │  ├─ 4-column grids
    │  └─ Full tables
    │
    ├─ 768px - 1200px (Tablet)
    │  ├─ Sidebar visible
    │  ├─ 2-column grids
    │  └─ Scrollable tables
    │
    └─ < 768px (Mobile)
       ├─ Sidebar hidden
       ├─ 1-column grids
       ├─ Reduced padding
       └─ Horizontal scroll tables
```

---

## 🎯 Key Interaction Points

### 1. Sidebar Navigation
```
Click nav item
    ↓
react-router-dom navigates
    ↓
Active class applied
    ↓
New page renders in content area
```

### 2. Modal Interactions
```
Click "Add" button
    ↓
setShowModal(true)
    ↓
Modal overlay fades in
    ↓
Modal slides up
    ↓
User interacts with form
    ↓
Submit or Cancel
    ↓
setShowModal(false)
    ↓
Modal fades out
```

### 3. Search & Filter
```
User types in search
    ↓
onChange event fires
    ↓
setSearchTerm(value)
    ↓
useEffect triggers
    ↓
filterData() called
    ↓
Filtered results displayed
```

---

## 🎨 Animation Timeline

### Page Load
```
0ms:   Component mounts
100ms: Skeleton loaders appear
500ms: Data fetched
600ms: Skeletons fade out
700ms: Content fades in
800ms: Stats count up (1000ms duration)
1800ms: All animations complete
```

### Modal Open
```
0ms:   Modal state set to true
50ms:  Overlay fades in (200ms)
100ms: Modal slides up (300ms)
400ms: Animation complete
```

### Success Toast
```
0ms:   Toast created
50ms:  Slides in from right
250ms: Fully visible
3000ms: Starts fade out
3250ms: Removed from DOM
```

---

## 📚 File Dependencies

```
Dashboard.jsx
├─ imports PharmacyLayout
├─ imports StatCard
├─ imports LoaderSkeleton
├─ imports EmptyState
├─ imports useAuth
└─ imports apiClient

InventoryManagement.jsx
├─ imports PharmacyLayout
├─ imports InventoryModal
├─ imports ConfirmModal
├─ imports LoaderSkeleton
├─ imports EmptyState
├─ imports useAuth
└─ imports apiClient

(Similar pattern for other pages)
```

---

**This navigation flow ensures a smooth, intuitive user experience throughout the pharmacy module! 🎯**
