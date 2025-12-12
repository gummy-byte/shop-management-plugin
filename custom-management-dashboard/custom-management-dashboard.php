<?php
/**
 * Plugin Name: Custom Management Dashboard
 * Description: A modern SPA dashboard for store management, replacing the standard WP Admin interface.
 * Version: 1.0.0
 * Author: Jules
 * Text Domain: custom-management-dashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CMD_VERSION', '1.0.0' );
define( 'CMD_PATH', plugin_dir_path( __FILE__ ) );
define( 'CMD_URL', plugin_dir_url( __FILE__ ) );

/**
 * Main Plugin Class
 */
class Custom_Management_Dashboard {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
		add_action( 'admin_init', array( $this, 'render_fullscreen_dashboard' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Register the menu item.
	 */
	public function register_menu_page() {
		add_menu_page(
			__( 'Management Portal', 'custom-management-dashboard' ),
			__( 'Management Portal', 'custom-management-dashboard' ),
			'manage_woocommerce', // Capability required
			'custom-management-dashboard', // Menu slug
			array( $this, 'render_placeholder' ), // Callback (won't be used if fullscreen logic works)
			'dashicons-chart-area',
			2
		);
	}

	/**
	 * Intercept the admin load to render the custom Full Screen app.
	 */
	public function render_fullscreen_dashboard() {
		// Check if we are on our specific page
		if ( isset( $_GET['page'] ) && 'custom-management-dashboard' === $_GET['page'] ) {

			// Security Check
			if ( ! current_user_can( 'manage_woocommerce' ) ) {
				wp_die( __( 'You do not have sufficient permissions to access this page.', 'custom-management-dashboard' ) );
			}

			// Load the custom template
			require_once CMD_PATH . 'includes/view-dashboard.php';
			exit; // Stop standard WP Admin rendering
		}
	}

	/**
	 * Placeholder for the menu registration.
	 */
	public function render_placeholder() {
		echo '<div id="cmd-root"></div>';
	}

	/**
	 * Register REST API Routes.
	 */
	public function register_rest_routes() {
		require_once CMD_PATH . 'includes/class-cmd-api-controller.php';
		$controller = new CMD_API_Controller();
		$controller->register_routes();
	}
}

new Custom_Management_Dashboard();
