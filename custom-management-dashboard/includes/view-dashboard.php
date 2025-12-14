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
    $js_file  = CMD_PATH . 'build/index.js';
    $css_file = CMD_PATH . 'build/index.css';
    $version  = file_exists( $js_file ) ? filemtime( $js_file ) : '1.0.0';

    // Enqueue our app script - bundled with React & Antd
    wp_enqueue_script(
        'cmd-app',
        CMD_URL . 'build/index.js',
        array(), // No external dependencies (Bundled)
        $version,
        true
    );

    // Enqueue our app styles
    if ( file_exists( $css_file ) ) {
        wp_enqueue_style(
            'cmd-app-style',
            CMD_URL . 'build/index.css',
            array(),
            $version
        );
    }

    // 3. Localize script for settings
    wp_localize_script(
        'cmd-app',
        'cmdSettings',
        array(
            'root' => esc_url_raw( rest_url() ),
            'nonce' => wp_create_nonce( 'wp_rest' ),
            'adminUrl' => admin_url(),
            'siteLogo' => get_site_icon_url( 32 ) // fallback to site icon or custom logic if needed
        )
    );

    // 4. Print all enqueued scripts and styles
    wp_print_scripts( 'cmd-app' );
    if ( file_exists( $css_file ) ) {
        wp_print_styles( 'cmd-app-style' );
    }
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
