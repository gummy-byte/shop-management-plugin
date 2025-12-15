not# Pending Tasks

## 1. Inventory Management Extensions

- [ ] **Product Creation Page**
  - [ ] Create UI: `src/pages/ProductCreate.js`
  - [ ] Implement form for basic fields (Name, SKU, Prices, Stock)
  - [ ] Implement form for Attribute/Variations (if time permits, or start with Simple products)
  - [ ] Create API Endpoint: `POST /cmd/v1/products`
- [ ] **Product Edit Page**
  - [ ] Create UI: `src/pages/ProductEdit.js` (reusing Create form components)
  - [ ] Create API Endpoint: `GET /cmd/v1/products/{id}`
  - [ ] Create API Endpoint: `POST /cmd/v1/products/{id}`
- [ ] **Inventory List Enhancements**
  - [x] Implement Column Visibility Toggle (React state/component) ✅
  - [ ] Integrate "Stock Status" and "Category" filters into the API query logic
  - [x] Implement Export to CSV functionality with filters (Frontend + Backend) ✅

## 2. Order Management Extensions

- [ ] **Order Creation Page**
  - [ ] Create UI: `src/pages/OrderCreate.js`
  - [ ] Customer Search/Select Component (utilize existing member lookup or new endpoint)
  - [ ] Product Search/Add Line Item Component
  - [ ] Create API Endpoint: `POST /cmd/v1/orders`
- [ ] **Order Edit Page**
  - [ ] Create UI: `src/pages/OrderEdit.js`
  - [ ] Create API Endpoint: `POST /cmd/v1/orders/{id}`
- [ ] **Order Auditor Enhancements**
  - [ ] **Filtering:**
    - [ ] Add Date Range Picker
    - [ ] Add Customer Search Filter
    - [ ] Add Order Status Dropdown
  - [ ] **Columns:**
    - [ ] Add "Source" column (check meta `_created_via` or similar)
    - [ ] Implement Column Visibility Toggle
  - [ ] **Export:**
    - [ ] Create `GET /cmd/v1/orders/export` or handle on frontend with current data set

## 3. General UI/UX

- [ ] **Navigation Updates:** Add links to new Create pages in Sidebar or as Action Buttons in List views.
- [ ] **Mobile Responsiveness:** Ensure new forms work well on the Drawer/Mobile layout.
