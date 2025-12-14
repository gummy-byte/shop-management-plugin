# Custom Management Dashboard - Technical Specification & UI Plan

## 1. Architecture & Tech Stack

### Tech Stack

- **Frontend:** React.js (leveraging `@wordpress/scripts` and `@wordpress/element` for native integration).
- **Backend:** PHP (Standard WordPress Plugin API).
- **State Management:** React Context or `wp.data` (if utilizing Gutenberg stores).
- **Styling:** SCSS/CSS Modules (or standard WP Admin styles for consistency where needed, though this is a custom dashboard).
- **Build Tools:** `wp-scripts` (Webpack wrapper standard in WP development).

### Full Screen Mode Implementation

To achieve a "Single Page Application" feel that replaces the standard WordPress Admin interface:

1.  **Custom Page Template Strategy:**
    - Hook into `admin_init` or `current_screen` to detect if the user is visiting the specific plugin page (`page=custom-management-dashboard`).
    - If detected, stop the standard WordPress admin rendering (do not call `include(ABSPATH . 'wp-admin/admin-header.php')`).
    - Instead, load a custom PHP view file that contains only a barebones HTML shell (API nonces, minimal CSS, and the React root `div`).
    - **Exit Button:** A fixed "Exit to WP Admin" button will be placed in the top-right corner of the React app to allow users to return to the standard dashboard.

### Routing

- **Library:** `react-router-dom` (HashRouter is often safer in WP admin to avoid conflict with WP permalinks, or BrowserRouter if the rewrite rules are handled strictly).
- **Mechanism:**
  - The browser URL will update (e.g., `#inventory`, `#orders`) without triggering a server reload.
  - The React app manages the view state.

## 2. Custom API Integration (The Bridge)

We will register a custom REST API namespace: `cmd/v1`.

### Endpoints

#### A. Cost Calculator Data (Inventory)

- **Endpoint:** `GET /cmd/v1/inventory`
- **Purpose:** Fetch products with standard WooCommerce data + custom cost fields.
- **Data Source:**
  - Standard Price: `_regular_price`, `_sale_price`
  - Cost Data: `wc_cog_cost` and `op_cost` (Product Meta)
- **Endpoint:** `POST /cmd/v1/inventory/update`
- **Purpose:** Handle updates. Supports both single-item updates and batch updates.
- **Endpoint:** `POST /cmd/v1/products`
- **Purpose:** Create new product.
- **Endpoint:** `GET /cmd/v1/products/(?P<id>\d+)`
- **Purpose:** Retrieve single product details for editing.
- **Endpoint:** `POST /cmd/v1/products/(?P<id>\d+)`
- **Purpose:** Update existing product.

#### B. Order Management

- **Endpoint:** `POST /cmd/v1/orders`
- **Purpose:** Create new order.
- **Endpoint:** `POST /cmd/v1/orders/(?P<id>\d+)`
- **Purpose:** Update existing order.
- **Endpoint:** `GET /cmd/v1/orders/export`
- **Purpose:** Generate and download export file (CSV/Excel) based on filters.

#### C. YITH Membership Lookup

- **Endpoint:** `GET /cmd/v1/members`
- **Purpose:** Fast lookup of active members.
- **Logic:** Query `wc_memberships` (or equivalent post type/table used by YITH) to get user details, plan name, and expiration date.
- **Permissions:** `manage_woocommerce`.

#### D. YITH PDF Invoices

- **Endpoint:** `GET /cmd/v1/orders/(?P<id>\d+)/invoice`
- **Purpose:** Retrieve the direct URL to the PDF invoice.
- **Logic:** Use `YWPI_Invoice_Document` (or YITH helper functions) to generate or retrieve the file path/URL for the specific order ID.

## 3. UI/UX Scope

### A. The "Command Center" (Home)

- **Layout:** Dashboard Grid (Cards).
- **Widgets:**
  1.  **Today’s Sales:** Aggregate `wc_order` data filtered by `date_created` = today (and filtered by POS source if meta exists).
  2.  **Active Members:** Count of users with active membership status.
  3.  **Low Stock Alerts:** List top 5 products with stock < threshold.

### B. Inventory Manager

- **Layout:** Data Table with "Add New" action.
- **Features:**
  - **Manage Products:** Create and Edit Product pages (Supports Simple and Variable products).
  - **Columns:** Image, Name, SKU, Stock (Editable), Price (Editable), Cost (`wc_cog_cost`) (Editable), Cost (`op_cost`) (Editable).
  - **Column Toggle:** User can hide/show specific columns.
  - **Quick Actions:**
    - "Save" button per row (Icon).
    - "Save All" floating action button for batch updates.
  - **Filtering:** Search by name/SKU, Category, Stock Status.
  - **Export:** CSV export based on current active filters.

### C. Order Auditor (Order Management)

- **Layout:** List View / Timeline.
- **Features:**
  - **Manage Orders:** Create and Edit Order pages (Add line items, calculate totals, assign customer).
  - **List View:**
    - **Filters:** Date Range, Customer Name, Order Status.
    - **Columns:** Order #, Date, Source (Web/POS/App), Customer, Status, Total, Profit (Calculated).
      - _Column Toggle:_ Enable hide/show columns.
  - **Actions:**
    - "Download Invoice" button (Triggers API call to YITH PDF).
    - "View Cost Breakdown" (Modal showing cost meta).
  - **Export:** CSV/Excel export of the filtered order list.

## 4. Deliverables Checklist

1.  **Plugin Folder:** `custom-management-dashboard/`
2.  **REST API Controller:** `includes/class-cmd-api-controller.php`
3.  **Permissions:** Capability check `manage_woocommerce` or `manage_options` enforced on all API routes and the dashboard page.
