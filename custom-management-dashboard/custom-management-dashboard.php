<?php
/**
 * Plugin Name: Custom Management Dashboard
 * Description: A modern SPA dashboard for store management, replacing the standard WP Admin interface.
 * Version: 1.0.0
 * Author: Syamim
 * Author URI: https://syamim.design 
 * */

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
		// Init Hooks
		add_action( 'init', array( $this, 'register_rewrite_rule' ) );
		add_filter( 'query_vars', array( $this, 'register_query_var' ) );
		add_filter( 'template_include', array( $this, 'load_app_template' ) );

		// Admin Menu (Keep as shortcut)
		add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
		
		// API
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );

		// Auto-flush rules if not set (Self-healing for dev)
		if ( ! get_option( 'cmd_rules_flushed' ) ) {
			add_action( 'init', function() {
				$this->register_rewrite_rule();
				flush_rewrite_rules();
				update_option( 'cmd_rules_flushed', 1 );
			}, 20 );
		}
	}

	/**
	 * 1. Register the URL: /management-portal
	 */
	public function register_rewrite_rule() {
		add_rewrite_rule( '^management-portal/?$', 'index.php?cmd_view=1', 'top' );
	}

	/**
	 * 2. Register the variable to track our page
	 */
	public function register_query_var( $vars ) {
		$vars[] = 'cmd_view';
		return $vars;
	}

	/**
	 * 3. Load the App when URL is visited
	 */
	public function load_app_template( $template ) {
		if ( get_query_var( 'cmd_view' ) ) {
			// Auth Check
			if ( ! is_user_logged_in() ) {
				wp_safe_redirect( wp_login_url( home_url( '/management-portal' ) ) );
				exit;
			}
			if ( ! current_user_can( 'manage_woocommerce' ) ) {
				wp_die( 'You differ from the chosen one. (Insufficient Permissions)' );
			}

			// Load App
			require_once CMD_PATH . 'includes/view-dashboard.php';
			exit;
		}
		return $template;
	}

	/**
	 * Add specific menu item to sidebar
	 */
	public function register_menu_page() {
		add_menu_page(
			__( 'Management Portal', 'custom-management-dashboard' ),
			__( 'Management Portal', 'custom-management-dashboard' ),
			'manage_woocommerce',
			'custom-management-dashboard-launcher',
			array( $this, 'render_launcher_page' ), // Redirect page
			'dashicons-chart-area',
			2
		);
	}

	/**
	 * Redirect admin clicks to the frontend app
	 */
	public function render_launcher_page() {
		?>
		<div class="wrap">
			<h1>Launching Portal...</h1>
			<p>If you are not redirected, <a href="<?php echo home_url('/management-portal'); ?>">click here</a>.</p>
			<script>window.location.href = "<?php echo home_url('/management-portal'); ?>";</script>
		</div>
		<?php
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
