# Testing & Next Steps Guide

This document outlines how to test the **Custom Management Dashboard** plugin scaffold and describes the roadmap for finalizing the integration.

## 1. Installation & Setup

### Prerequisites
*   A WordPress installation (Local or Staging).
*   **Node.js** and **npm** installed on your machine (to build the React assets).

### Step-by-Step Setup
1.  **Deploy the Plugin:**
    *   Place the `custom-management-dashboard` folder into your WordPress `wp-content/plugins/` directory.
2.  **Build the Frontend:**
    *   Open your terminal/command prompt.
    *   Navigate to the plugin directory:
        ```bash
        cd wp-content/plugins/custom-management-dashboard
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Build the React application:
        ```bash
        npm run build
        ```
        *(This compiles `src/` into `build/index.js` and creates `build/index.asset.php`).*
3.  **Activate the Plugin:**
    *   Go to your WordPress Admin -> **Plugins**.
    *   Activate **Custom Management Dashboard**.

## 2. Testing Flow

### A. Accessing the Dashboard
1.  Log in as an **Administrator** or **Shop Manager** (Capability: `manage_woocommerce`).
2.  Look for the new menu item **"Management Portal"** in the sidebar.
3.  **Click it.**
    *   **Expected Behavior:** The standard WordPress Admin interface (sidebar, admin bar) should disappear. The page should load a white/gray full-screen interface with "Command Center" visible.

### B. Verifying Views

#### 1. Command Center (Home)
*   You should see cards for "Today's Sales", "Active Members", and "Low Stock".
*   *Note: Currently, these display mock data or partial real data depending on your DB state. Verify that the numbers render.*

#### 2. Inventory Manager
*   Click **"Inventory"** in the top navigation.
*   **Expected Behavior:** A table of your WooCommerce products should load.
*   **Test:**
    *   Modify a "Stock" or "Cost" value in an input field.
    *   Click the **"Save"** button next to the row.
    *   Verify the alert "Product saved!".
    *   *Technical Check:* If you have access to the database or standard Product Edit screen, verify the changes (e.g., `wc_cog_cost` meta) persisted.

#### 3. Order Auditor
*   Click **"Order Auditor"** in the top navigation.
*   **Expected Behavior:** A list of recent orders should appear.
*   **Test:**
    *   Check the "Profit" column (It is calculated as `Total - Cost`).
    *   Click **"Download Invoice"**.
    *   *Note: This will attempt to open a mocked URL in this prototype. In production, this will open the real PDF.*

### C. Exiting
*   Click the red **"Exit to WP Admin"** button in the top right.
*   **Expected Behavior:** You should be returned to the standard WordPress Dashboard.

## 3. Next Steps (Development Roadmap)

Now that the architecture (React + Full Screen + API) is working, the following steps are required to make it production-ready:

### 1. Real 3rd Party Integration
The current `includes/class-cmd-api-controller.php` contains placeholders for the specific 3rd party plugin logic.
*   **YITH Membership:** Replace the mock array in `get_members()` with a real query to the YITH database tables (usually `wp_yith_wcmbs_memberships` or via their helper class `YITH_WC_Memberships_Manager`).
*   **YITH PDF Invoices:** Replace the mock URL in `get_invoice_url()` with the actual generation function `yith_ywpi_get_invoice_url( $order_id )`.
*   **Cost Calculation:** Ensure the meta keys `wc_cog_cost` and `op_cost` match exactly what your custom cost plugin uses.

### 2. UI/UX Refinement
*   **Styling:** Move CSS from inline React styles to a dedicated SCSS file (imported in `index.js`) for better maintainability.
*   **Loading States:** Add better visual skeletons or spinners while data is fetching.
*   **Error Handling:** Add "Toast" notifications (e.g., using `react-toastify`) instead of browser `alert()` for save confirmations.

### 3. Security Hardening
*   Ensure Nonce verification is strictly enforced on all write operations (already implemented in `api.js` but good to double-check).
*   Add server-side validation for input data (e.g., ensure `stock` is a valid integer).
