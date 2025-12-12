<?php
/**
 * Class CMD_API_Controller
 * Handles custom REST API endpoints for the dashboard.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CMD_API_Controller extends WP_REST_Controller {

	protected $namespace = 'cmd/v1';

	public function register_routes() {

		// 1. Dashboard Stats
		register_rest_route( $this->namespace, '/dashboard-stats', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_stats' ),
			'permission_callback' => array( $this, 'permissions_check' ),
		) );

		// 2. Inventory (Get)
		register_rest_route( $this->namespace, '/inventory', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_inventory' ),
			'permission_callback' => array( $this, 'permissions_check' ),
		) );

		// 3. Inventory (Update)
		register_rest_route( $this->namespace, '/inventory/update', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'update_inventory' ),
			'permission_callback' => array( $this, 'permissions_check' ),
		) );

		// 4. Members
		register_rest_route( $this->namespace, '/members', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_members' ),
			'permission_callback' => array( $this, 'permissions_check' ),
		) );

		// 5. Orders
		register_rest_route( $this->namespace, '/orders', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_orders' ),
			'permission_callback' => array( $this, 'permissions_check' ),
		) );

		// 6. Invoice PDF
		register_rest_route( $this->namespace, '/orders/(?P<id>\d+)/invoice', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_invoice_url' ),
			'permission_callback' => array( $this, 'permissions_check' ),
		) );
	}

	public function permissions_check() {
		return current_user_can( 'manage_woocommerce' ) || current_user_can( 'manage_options' );
	}

	/**
	 * GET /dashboard-stats
	 * Returns: Sales (Today), Active Members, Low Stock Count
	 */
	public function get_stats( $request ) {
		// Mock Data / Real Logic placeholders

		// 1. Sales Today
		// Real logic: Use wc_get_orders with date_created parameters
		$sales_today = 1250.50;
		$sales_count = 15;

		// 2. Active Members
		// Real logic: Count users with active membership capability or YITH table query
		$active_members = 45;

		// 3. Low Stock
		// Real logic: Query products where stock_status = 'low_stock' or quantity < threshold
		$low_stock_count = 3;

		return new WP_REST_Response( array(
			'sales_today' => $sales_today,
			'sales_count' => $sales_count,
			'active_members' => $active_members,
			'low_stock_count' => $low_stock_count
		), 200 );
	}

	/**
	 * GET /inventory
	 * Returns: List of products with Cost Data
	 */
	public function get_inventory( $request ) {
		$args = array(
			'status' => 'publish',
			'limit' => 50, // Pagination should be implemented in production
		);
		$products = wc_get_products( $args );
		$data = array();

		foreach ( $products as $product ) {
			$data[] = array(
				'id' => $product->get_id(),
				'name' => $product->get_name(),
				'sku' => $product->get_sku(),
				'price' => $product->get_regular_price(),
				'stock' => $product->get_stock_quantity(),
				// Custom Cost Fields
				'wc_cog_cost' => $product->get_meta( 'wc_cog_cost' ),
				'op_cost' => $product->get_meta( 'op_cost' ),
				'image' => wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' )
			);
		}

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * POST /inventory/update
	 * Supports single or batch updates.
	 * Body: { updates: [ { id: 1, stock: 5, price: 10, wc_cog_cost: 5 } ] }
	 */
	public function update_inventory( $request ) {
		$params = $request->get_json_params();
		$updates = isset( $params['updates'] ) ? $params['updates'] : array();
		$results = array();

		foreach ( $updates as $update ) {
			$product = wc_get_product( $update['id'] );
			if ( ! $product ) continue;

			if ( isset( $update['stock'] ) ) {
				$product->set_stock_quantity( $update['stock'] );
			}
			if ( isset( $update['price'] ) ) {
				$product->set_regular_price( $update['price'] );
			}
			if ( isset( $update['wc_cog_cost'] ) ) {
				$product->update_meta_data( 'wc_cog_cost', $update['wc_cog_cost'] );
			}
			if ( isset( $update['op_cost'] ) ) {
				$product->update_meta_data( 'op_cost', $update['op_cost'] );
			}

			$product->save();
			$results[] = $product->get_id();
		}

		return new WP_REST_Response( array( 'updated' => $results ), 200 );
	}

	/**
	 * GET /members
	 * Returns active YITH members.
	 */
	public function get_members( $request ) {
		// Mock logic for YITH Membership
		// In production: $members = YITH_WC_Memberships_Manager::get_members_by_plan( ... );

		$members = array(
			array( 'id' => 1, 'name' => 'John Doe', 'plan' => 'Gold', 'expires' => '2023-12-31' ),
			array( 'id' => 2, 'name' => 'Jane Smith', 'plan' => 'Silver', 'expires' => '2023-11-15' ),
		);

		return new WP_REST_Response( $members, 200 );
	}

	/**
	 * GET /orders
	 * Returns recent orders with calculated profit.
	 */
	public function get_orders( $request ) {
		$args = array(
			'limit' => 20,
			'orderby' => 'date',
			'order' => 'DESC',
		);
		$orders = wc_get_orders( $args );
		$data = array();

		foreach ( $orders as $order ) {
			// Calculate cost from items
			$total_cost = 0;
			foreach ( $order->get_items() as $item ) {
				$product = $item->get_product();
				if ( $product ) {
					$cost = (float) $product->get_meta( 'wc_cog_cost' );
					if ( ! $cost ) $cost = (float) $product->get_meta( 'op_cost' );
					$total_cost += $cost * $item->get_quantity();
				}
			}

			$total = (float) $order->get_total();
			$profit = $total - $total_cost;

			$data[] = array(
				'id' => $order->get_id(),
				'number' => $order->get_order_number(),
				'date' => $order->get_date_created()->date( 'Y-m-d H:i' ),
				'customer' => $order->get_formatted_billing_full_name(),
				'total' => $total,
				'profit' => $profit,
				'status' => $order->get_status()
			);
		}

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * GET /orders/{id}/invoice
	 * Returns PDF URL.
	 */
	public function get_invoice_url( $request ) {
		$order_id = $request['id'];

		// Logic for YITH WooCommerce PDF Invoice
		// Typically: yith_ywpi_get_invoice_url( $order_id );
		// Or constructing the URL manually if the helper doesn't exist in global scope

		// Mock URL
		$pdf_url = admin_url( 'admin-ajax.php?action=yith_ywpi_generate_invoice&order_id=' . $order_id );

		return new WP_REST_Response( array( 'url' => $pdf_url ), 200 );
	}

}
