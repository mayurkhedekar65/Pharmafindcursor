# PharmaFind - UI Design Master Plan

This document serves as a comprehensive guide for designing the user interface (UI) of **PharmaFind**, a dual-sided healthcare platform. It outlines the master architecture, design aesthetic, and all required views for both the end-customers and the pharmacy owners. 

Please use this plan to generate high-fidelity UI mockups and prototypes.

---

## 1. Project Overview
**PharmaFind** is a healthcare technology platform designed to bridge the gap between consumers and local pharmacies. 
- **For Customers**: It acts as an intuitive, fast application to search for nearby pharmacies, check real-time medicine availability, order health products, and manage prescriptions. 
- **For Pharmacies**: It operates as a modern B2B SaaS platform (Pharmacy Module) allowing pharmacy owners to manage their Point Of Sale (POS), track inventory, fulfill online orders, manage consumer credit, and view advanced health-business analytics.

---

## 2. Design Aesthetic & Theme

### General Vibe
- **Premium, Modern, & Trustworthy:** The design must evoke cleanliness, reliability, and health.
- **Glassmorphism & Soft Layers:** Use subtle backdrop blurs, soft drop shadows (`0 8px 32px rgba(0,0,0,0.05)`), and modern elevations.
- **Friendly Geometry:** Cards and containers should feature rounded corners (`border-radius: 20px`), while interactive search pills should be highly rounded (`border-radius: 25px` or `30px`).

### Color Palette
- **Primary Brand Color (Medical Blue):** `#49a5f2` - Used for primary accents, hero bands, and highlights.
- **Deep Navy/Dark Blue:** `#1e3a8a` - Used for heavy text, headers, and strong contrast.
- **Secondary/Action Tones:**
  - Success/Validations: `#27ae60` (Teal/Green)
  - Warnings/Credit: `#ffb703` (Warm Amber/Yellow)
  - Destructive/Alerts: `#ff6b6b` / `#e74c3c` (Soft Red)
- **Neutrals:**
  - Backgrounds: `#f7fbff` (Extremely light cool-blue-white)
  - Surface/Cards: `#ffffff` (Pure White)
  - Text Secondary: `#4b5563` (Soft Slate Gray)

### Typography
- Clean, modern, sans-serif font (e.g., *Inter, Roboto, or Poppins*).
- Large, bold headings with highly readable, slightly softer body text.

---

## 3. Required UI Views

### Part A: Customer-Facing Application
These interfaces should prioritize ease of search, approachability, and fast checkouts.

1. **Global Header & Navigation:**
   - Clean white navbar with logo on the far left.
   - Text Links: `Medicine`, `Pharmacies Nearby`, `Healthcare`, `Doctors`, `PLUS`, `Offers`.
   - Right Actions: `Hello, Log in` (pill button), `Offers` (gift icon), `Cart` (with notification badge).

2. **Homepage Hero Search:**
   - Large blue rounded hero container (`#49a5f2`). 
   - Headline: *"PharmaFind - Your Trusted Partner in Healthcare"*
   - Search Component: A single white pill split gracefully into two inputs: 
     - Left side: "📍 Select Location"
     - Right side: "💊 Medicine name e.g. Ecosprin"
     - Connected "Search" button in soft red/coral (`#ff6b6b`).

3. **Homepage Sections:**
   - **Our Services:** Row of white pill-shaped buttons with emojis (`💊 Order Medicines`, `🧪 Book Lab Tests`, `👨‍⚕️ Consult Doctors`, `🛒 Health Products`).
   - **Featured Categories:** White squared-off cards with rounded corners for common categories (OTC Medicines, Baby Care, etc.).
   - **Request Medicine Subfooter:** A bright blue call-to-action banner. Form input + yellow button (`#ffb703`) to request unavailable items.

4. **Search Results Page:**
   - Left Sidebar: Filters for Distance, Open Now, Price, Brands.
   - Main Grid: Pharmacy location cards showing distance, availability badges (In Stock/Out of Stock), and pricing.

5. **Cart & Checkout:**
   - Clean summary card with product thumbs. Location delivery drop-down. 
   - Trust badges, price breakdown, and secure checkout button.

---

### Part B: Pharmacy Owner SaaS Dashboard (B2B)
These interfaces should prioritize data density, financial control, and at-a-glance awareness without clutter. 

1. **Pharmacy Global Layout:**
   - Left Sidebar Navigation: Dashboard, POS, Stock, Orders, Credit, Vault, Sync, Profile.
   - Top Bar: Pharmacy Name, Current Date, Profile Avatar.

2. **Dashboard Overview:**
   - 4 Animated Stat Cards: Total Sales Today, Monthly Revenue, Pending Credit, Low Stock Count.
   - Visual charts: Revenue line chart (toggle 7/30 days).
   - "Recent Orders" small table and "Low Stock Alert" widget.

3. **Inventory Management (Stock):**
   - Data grid/table of current medicines, batches, and expiries.
   - Filters: "All", "Low Stock", "Expiring Soon".
   - Badges: Color-coded stock status.
   - Overlay Modal: Clean, multi-step form to "Add/Edit Medicine".

4. **Orders Management (POS/Fulfillment):**
   - List of incoming digital orders.
   - Status indicators: `Pending`, `Processing`, `Ready for Pickup`, `Delivered`.
   - Payment status markers (Paid vs Unpaid).

5. **Credit Management:**
   - Ledger style table showing customer names, phone numbers, and outstanding balance.
   - "Settle Credit" pop-up modal to log partial or full payments with a checkmark success animation.

6. **Analytics Page:**
   - High-fidelity charts: Bar chart for top-selling medicines.
   - Profit and Revenue visualizer. 

---

## 4. UI/UX Interaction Guidelines
When generating prototypes, keep the following interactions in mind:
- **Empty States:** When a table is empty (e.g., no orders today), present a beautiful illustration with a soft fallback message rather than a blank table.
- **Loading Skeletons:** Use shimmer animations matching the contours of the content (cards, table rows) rather than traditional spinning wheels for a perceived faster load time.
- **Hover Micro-interactions:** Buttons and cards should slightly elevate (`transform: translateY(-2px)`) and increase shadow spread dynamically when hovered.
- **Toasts/Notifications:** Successes like "Order updated" or "Inventory added" should slide in smoothly from the top right corner.
