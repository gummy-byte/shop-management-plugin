<?php
/**
 * View: Full Screen Dashboard Container
 *
 * This file is loaded directly by the plugin, bypassing the standard WP Admin interface.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php esc_html_e( 'Management Portal', 'custom-management-dashboard' ); ?></title>

	<?php
	// Enqueue standard WP scripts required for API interaction
	do_action( 'admin_enqueue_scripts' );
	do_action( 'admin_print_scripts' );
	do_action( 'admin_print_styles' );

	// Manually enqueue our React build
	// Note: In a real environment, we would use wp_enqueue_script properly hooked,
	// but since we exited the admin flow, we print them here or rely on the queue printed above if registered.

	// Let's register and print our script specifically here to ensure it loads
	$asset_file = include( CMD_PATH . 'build/index.asset.php' );
	?>
    <script>
        var cmdSettings = {
            root: '<?php echo esc_url_raw( rest_url() ); ?>',
            nonce: '<?php echo wp_create_nonce( 'wp_rest' ); ?>',
            adminUrl: '<?php echo admin_url(); ?>' // For the Exit button
        };
    </script>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; background: #f0f2f5; }
        #cmd-root { height: 100vh; display: flex; flex-direction: column; }
    </style>

    <!-- Load React App Script -->
    <script src="<?php echo CMD_URL . 'build/index.js'; ?>" defer></script>
    <?php
    // In a production setup with @wordpress/scripts, we usually need to enqueue dependencies (wp-element, wp-i18n, etc).
    // Since we are bypassing wp_head(), we would manually print script tags for dependencies here if 'admin_print_scripts' didn't catch them.
    // For this prototype architecture, we assume 'admin_print_scripts' handles core WP libs.
    ?>
</head>
<body>
	<div id="cmd-root">
        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            Loading Management Portal...
        </div>
    </div>
</body>
</html>
