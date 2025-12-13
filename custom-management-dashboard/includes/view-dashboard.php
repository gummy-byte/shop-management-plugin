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

    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; background: #f0f2f5; }
        #cmd-root { height: 100vh; display: flex; flex-direction: column; }
    </style>

	<?php
    // 1. Get the asset file for dependencies and versioning
    $asset_file = include( CMD_PATH . 'build/index.asset.php' );

    // 2. Register our script with WordPress so it handles dependencies (react, wp-element, etc.)
    // Note: We need to register it here because we are outside the standard 'admin_enqueue_scripts' hook flow
    // or we need to ensure the global WP scripts are available.

    // Enqueue our app
    wp_enqueue_script(
        'cmd-app',
        CMD_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // 3. Localize script for settings
    wp_localize_script(
        'cmd-app',
        'cmdSettings',
        array(
            'root' => esc_url_raw( rest_url() ),
            'nonce' => wp_create_nonce( 'wp_rest' ),
            'adminUrl' => admin_url()
        )
    );

    // 4. Print all enqueued scripts (including dependencies like wp-element)
    // This will output <script> tags for React, wp-data, etc.
    wp_print_scripts( 'cmd-app' );

    // Also print styles if needed (wp-components styles etc)
    wp_print_styles( 'wp-components' );
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
