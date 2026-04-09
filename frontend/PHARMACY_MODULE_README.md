# 🏥 PharmaFind - Pharmacy Module Documentation

## 📋 Overview

The PharmaFind Pharmacy Module is a complete, production-ready frontend solution for pharmacy management built with React.js and Vite. It follows a premium medical SaaS design system with glassmorphism effects, soft shadows, and professional styling.

---

## 🎨 Design System

### Color Palette
- **Primary**: `#00a896` / `#0288d1` (Medical Teal / Blue)
- **Success**: `#27ae60` (Green)
- **Warning**: `#f39c12` (Amber)
- **Alert**: `#e74c3c` (Red)

### Design Principles
- **Glassmorphism** with soft shadows
- **Border Radius**: 20px for cards, 25px for search inputs
- **Box Shadow**: `0 8px 32px rgba(0,0,0,0.05)`
- **Smooth transitions** on all interactive elements
- **Professional spacing** and clean whitespace

---

## 📁 Project Structure

```
/src
├── /pages/pharmacy/
│   ├── Dashboard.jsx              # Business overview with stats
│   ├── InventoryManagement.jsx    # Medicine inventory CRUD
│   ├── OrdersManagement.jsx       # Order tracking & payments
│   ├── CreditManagement.jsx       # Customer credit tracking
│   └── Analytics.jsx              # Revenue & performance analytics
│
├── /components/pharmacy/
│   ├── StatCard.jsx               # Animated stat cards
│   ├── InventoryModal.jsx         # Add/Edit medicine modal
│   ├── ConfirmModal.jsx           # Confirmation dialogs
│   ├── EmptyState.jsx             # Empty state component
│   └── LoaderSkeleton.jsx         # Loading skeletons
│
├── /layout/
│   └── PharmacyLayout.jsx         # Main layout with sidebar
│
└── pharmacy.css                    # Complete styling system
```

---

## 🚀 Features

### 1. Dashboard (`/pharmacy/home`)
- **Stats Cards** with count-up animations
  - Total Sales Today
  - Monthly Revenue
  - Pending Credit Amount
  - Low Stock Count
- **Revenue Chart** (7/30 day toggle)
- **Recent Orders** table
- **Low Stock Alerts** preview

### 2. Inventory Management (`/pharmacy/inventory`)
- **Search** by name, category, or batch number
- **Filters**: All / Low Stock / Expiring Soon
- **Add Medicine** with comprehensive form
- **Edit Medicine** inline
- **Delete** with confirmation
- **Auto Status Badges**: In Stock / Low Stock / Expiring Soon
- **Inventory Value** calculation

### 3. Orders Management (`/pharmacy/orders`)
- **Order Listing** with customer details
- **Payment Status** tracking (Paid/Pending)
- **Date Range** filters
- **Mark as Paid** functionality
- **Revenue Summaries** (Total/Paid/Pending)
- **Success Toast** animations

### 4. Credit Management (`/pharmacy/credits`)
- **Customer Credit** tracking
- **Search** by name or phone
- **Settle Credit** modal with payment entry
- **Credit History** tracking
- **Outstanding Balance** summaries
- **Payment Confirmation** animations

### 5. Analytics (`/pharmacy/analytics`)
- **Revenue Chart** with animated bars
- **Profit Chart** visualization
- **Top Selling Medicines** with performance bars
- **Monthly Comparison** stats
- **Growth Metrics** (Revenue/Profit/Orders)
- **Time Range Toggle** (7/30/90 days)

---

## 🔐 Authentication & Routing

All pharmacy pages are protected with `ProtectedRoute` requiring pharmacy authentication:

```jsx
<ProtectedRoute requirePharmacy>
  <Dashboard />
</ProtectedRoute>
```

### Routes
- `/pharmacy/home` - Dashboard
- `/pharmacy/inventory` - Inventory Management
- `/pharmacy/orders` - Orders Management
- `/pharmacy/credits` - Credit Management
- `/pharmacy/analytics` - Analytics

---

## 🎯 Component Usage

### StatCard
```jsx
<StatCard
  title="Sales Today"
  value={15420}
  icon="💰"
  type="primary"
  trend={12.5}
  trendLabel="vs yesterday"
/>
```

### InventoryModal
```jsx
<InventoryModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={handleSubmit}
  editData={editItem} // Optional for edit mode
/>
```

### ConfirmModal
```jsx
<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Medicine"
  message="Are you sure?"
  confirmText="Delete"
  type="danger"
/>
```

### EmptyState
```jsx
<EmptyState
  icon="📦"
  title="No Items"
  description="No items to display"
  action={<button>Add Item</button>}
/>
```

### LoaderSkeleton
```jsx
<LoaderSkeleton count={3} type="card" />
<LoaderSkeleton count={5} type="table" />
```

---

## 🎨 CSS Classes

### Buttons
- `.primary-button` - Primary action button
- `.secondary-button` - Secondary action button
- `.small-button` - Small action button
- `.danger-button` - Destructive action button

### Badges
- `.pf-badge.success` - Green success badge
- `.pf-badge.warning` - Amber warning badge
- `.pf-badge.alert` - Red alert badge
- `.pf-badge.info` - Blue info badge

### Layout
- `.pf-grid-2` - 2-column grid
- `.pf-grid-3` - 3-column grid
- `.pf-grid-4` - 4-column grid
- `.pf-flex-between` - Flex with space-between

### Tables
- `.pf-table-container` - Table wrapper
- `.pf-table` - Styled table

### Forms
- `.pf-form-input` - Text input
- `.pf-form-select` - Select dropdown
- `.pf-form-textarea` - Textarea
- `.pf-search-input` - Search input with icon

---

## 🔄 State Management

All pages use React hooks for state management:
- `useState` - Local component state
- `useEffect` - Data fetching and side effects
- `useAuth` - Authentication context

### Example Pattern
```jsx
const [loading, setLoading] = useState(true)
const [data, setData] = useState([])
const [error, setError] = useState(null)

useEffect(() => {
  fetchData()
}, [dependency])

const fetchData = async () => {
  try {
    setLoading(true)
    const result = await apiClient.getData()
    setData(result)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

---

## 🎭 Animations

### Count-Up Animation
Stats cards automatically animate numbers on load.

### Success Toast
```javascript
const successMsg = document.createElement('div')
successMsg.textContent = '✅ Success!'
successMsg.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, var(--pharmacy-success), #27ae60);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 10000;
`
document.body.appendChild(successMsg)
setTimeout(() => successMsg.remove(), 3000)
```

### Modal Animations
- Fade-in overlay: `@keyframes fadeIn`
- Slide-up modal: `@keyframes slideUp`

### Skeleton Loading
- Shimmer effect: `@keyframes skeleton-loading`

---

## 🔌 API Integration

### Current Implementation
All pages use mock data for demonstration. Replace with actual API calls:

```javascript
// Mock (Current)
const mockData = [...]
setData(mockData)

// Production (Replace with)
const response = await apiClient.getInventory(pharmacyId)
setData(response.data)
```

### API Client Methods
Located in `/src/services/apiClient.js`:
- `getPharmacyStats(pharmacyId)`
- `getPharmacyStock(pharmacyId)`
- `addMedicineToPharmacy(pharmacyId, data)`
- `updateStockQuantity(pharmacyId, stockId, quantity)`
- `removeMedicineFromPharmacy(pharmacyId, stockId)`
- `getCreditCustomers(pharmacyId)`

---

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 1200px (4-column grid)
- **Tablet**: 768px - 1200px (2-column grid)
- **Mobile**: < 768px (1-column grid, hidden sidebar)

### Mobile Optimizations
- Sidebar transforms off-screen
- Tables scroll horizontally
- Reduced padding on content areas
- Single-column layouts

---

## ✅ Best Practices

### Code Quality
- ✅ No inline styles (use CSS classes)
- ✅ Reusable components
- ✅ Proper error handling
- ✅ Loading states
- ✅ Empty states
- ✅ Consistent naming conventions

### UX Principles
- ✅ Instant visual feedback
- ✅ Clear error messages
- ✅ Confirmation for destructive actions
- ✅ Loading skeletons
- ✅ Success animations
- ✅ Accessible forms

### Performance
- ✅ Lazy loading where applicable
- ✅ Optimized re-renders
- ✅ Debounced search inputs
- ✅ Minimal dependencies

---

## 🚀 Getting Started

### 1. Navigate to pharmacy module
```bash
# Login as pharmacy user
# Navigate to /pharmacy/home
```

### 2. Explore features
- View dashboard statistics
- Manage inventory
- Track orders
- Monitor credit customers
- Analyze performance

### 3. Customize
- Update API endpoints in `apiClient.js`
- Modify color scheme in `pharmacy.css`
- Adjust layouts in component files

---

## 🎯 Future Enhancements

### Potential Features
- [ ] Real-time notifications
- [ ] Bulk inventory upload (CSV)
- [ ] Advanced filtering options
- [ ] Export reports (PDF/Excel)
- [ ] Multi-pharmacy support
- [ ] Role-based permissions
- [ ] Mobile app version
- [ ] Barcode scanning integration

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Routes not working
- **Solution**: Ensure `ProtectedRoute` is imported and user is authenticated as pharmacy

**Issue**: Styles not loading
- **Solution**: Verify `pharmacy.css` is imported in `App.jsx`

**Issue**: Modal not closing
- **Solution**: Check `onClick` event propagation in modal overlay

**Issue**: API calls failing
- **Solution**: Verify backend is running and API endpoints are correct

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review component source code
3. Check browser console for errors
4. Verify authentication state

---

## 📄 License

Part of the PharmaFind project.

---

**Built with ❤️ using React.js, Vite, and modern web technologies**
