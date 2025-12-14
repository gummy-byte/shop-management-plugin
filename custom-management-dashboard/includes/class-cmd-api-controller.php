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
		// 1. Sales This Month
		// Defaulting to "this month" to ensure data visibility during testing
		$args = array(
			// 'date_created' => date( 'Y-m-d' ) . '...', // Old "Today" logic
            'date_created' => date('Y-m-01') . '...', // From 1st of current month to now
			'status'       => array( 'wc-completed', 'wc-processing', 'wc-on-hold' ),
			'limit'        => -1,
		);
		$orders = wc_get_orders( $args );
		
		$sales_today = 0;
		$sales_count = count( $orders );
		
		foreach ( $orders as $order ) {
			$sales_today += $order->get_total();
		}

		// 2. Active Members (YITH Membership)
		$active_members = 0;
		if ( function_exists( 'yith_get_all_counts' ) ) {
            // Tentative: Check if helper exists, otherwise use standard post query
            // Using a direct count of 'wc_user_membership' posts with status 'active'
            $query_args = array(
                'post_type'   => 'wc_user_membership',
                'post_status' => 'wcm-active',
                'fields'      => 'ids',
                'posts_per_page' => -1
            );
            $query = new WP_Query( $query_args );
            $active_members = $query->found_posts;
		}

		// 3. Low Stock
        // Query products where (stock_status = 'lowstock') OR (manage_stock = 'yes' AND stock_quantity <= threshold)
        // Note: WC usually syncs _stock_status, but we can be extra checking.
        // For simplicity and speed in this prototype, we'll check _stock_status = 'lowstock' AND also products with low quantity manually if needed.
        // But the safest standard WC way is trusting _stock_status OR _stock <= 5 (default low stock threshold)
        
		$low_stock_query = new WP_Query( array(
            'post_type'      => 'product',
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'meta_query'     => array(
                'relation' => 'OR',
                array(
                    'key'     => '_stock_status',
                    'value'   => 'lowstock',
                    'compare' => '='
                ),
                array(
                    'relation' => 'AND',
                    array(
                        'key'     => '_manage_stock',
                        'value'   => 'yes',
                        'compare' => '='
                    ),
                    array(
                        'key'     => '_stock',
                        'value'   => 5, // Access global option 'woocommerce_notify_low_stock_amount' in production
                        'compare' => '<=',
                        'type'    => 'NUMERIC'
                    )
                )
            )
        ) );
		$low_stock_count = $low_stock_query->found_posts;

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
		$page     = (int) $request->get_param( 'page' );
		$per_page = (int) $request->get_param( 'per_page' );

		if ( ! $page ) {
			$page = 1;
		}
		if ( ! $per_page ) {
			$per_page = 10;
		}

		$args = array(
			'status'   => 'publish',
			'limit'    => $per_page,
			'page'     => $page,
			'paginate' => true,
		);

		$results  = wc_get_products( $args );
		$products = $results->products;
		$total    = $results->total;

		$data = array();

		foreach ( $products as $product ) {
			$data[] = array(
				'id'          => $product->get_id(),
				'name'        => $product->get_name(),
				'sku'         => $product->get_sku(),
				'price'       => $product->get_regular_price(),
				'stock'       => $product->get_stock_quantity(),
				// Custom Cost Fields
				'wc_cog_cost' => $product->get_meta( 'wc_cog_cost' ),
				'op_cost'     => $product->get_meta( 'op_cost' ),
				'image'       => wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' )
			);
		}

		return new WP_REST_Response( array(
			'items' => $data,
			'total' => $total,
		), 200 );
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
        $members = array();
        
        $args = array(
            'post_type'      => 'wc_user_membership',
            'post_status'    => array( 'wcm-active' ),
            'posts_per_page' => 50, // Limit for now
        );

        $memberships = get_posts( $args );

        foreach ( $memberships as $post ) {
            $membership = wc_memberships_get_user_membership( $post->ID );
            if ( $membership ) {
                $user = $membership->get_user();
                $plan = $membership->get_plan();
                
                $members[] = array(
                    'id'      => $membership->get_id(),
                    'user_id' => $user ? $user->ID : 0,
                    'name'    => $user ? $user->display_name : 'Unknown',
                    'plan'    => $plan ? $plan->get_name() : 'Unknown Plan',
                    'expires' => $membership->get_end_date() ? $membership->get_end_date( 'Y-m-d' ) : 'Never',
                );
            }
        }

		return new WP_REST_Response( $members, 200 );
	}

	/**
	 * GET /orders
	 * Returns recent orders with calculated profit.
	 */
	public function get_orders( $request ) {
		$page     = (int) $request->get_param( 'page' );
		$per_page = (int) $request->get_param( 'per_page' );

		if ( ! $page ) {
			$page = 1;
		}
		if ( ! $per_page ) {
			$per_page = 10;
		}

		$args = array(
			'limit'    => $per_page,
			'page'     => $page,
			'orderby'  => 'date',
			'order'    => 'DESC',
			'paginate' => true,
		);
		
		$results = wc_get_orders( $args );
		$orders  = $results->orders;
		$total   = $results->total;

		$data = array();

		foreach ( $orders as $order ) {
			// Calculate cost from items
			$total_cost = 0;
			foreach ( $order->get_items() as $item ) {
				$product = $item->get_product();
				if ( $product ) {
					$cost = (float) $product->get_meta( 'wc_cog_cost' );
					if ( ! $cost ) {
						$cost = (float) $product->get_meta( 'op_cost' );
					}
					$total_cost += $cost * $item->get_quantity();
				}
			}

			$total_order = (float) $order->get_total();
			$profit      = $total_order - $total_cost;

			$data[] = array(
				'id'       => $order->get_id(),
				'number'   => $order->get_order_number(),
				'date'     => $order->get_date_created()->date( 'Y-m-d H:i' ),
				'customer' => $order->get_formatted_billing_full_name(),
				'total'    => $total_order,
				'profit'   => $profit,
				'status'   => $order->get_status()
			);
		}

		return new WP_REST_Response( array(
			'items' => $data,
			'total' => $total,
		), 200 );
	}

	/**
	 * GET /orders/{id}/invoice
	 * Returns PDF URL.
	 */
	public function get_invoice_url( $request ) {
		$order_id = $request['id'];
        $pdf_url = '';

		// YITH WooCommerce PDF Invoice
        if ( function_exists( 'yith_ywpi_get_invoice_url' ) ) {
             $pdf_url = yith_ywpi_get_invoice_url( $order_id );
        } elseif ( function_exists( 'YITH_YWPI_Invoice' ) ) {
             // Fallback class based approach if function helper is missing
             $invoice = YITH_YWPI_Invoice()->get_invoice_by_order_id( $order_id );
             if ( $invoice ) {
                 $pdf_url = $invoice->get_url();
             }
        }

        // If plugin not active or failed, return empty or default
        if ( empty( $pdf_url ) ) {
             // Fallback to admin-ajax just in case, but warn
             $pdf_url = '#'; 
        }

		return new WP_REST_Response( array( 'url' => $pdf_url ), 200 );
	}

}
