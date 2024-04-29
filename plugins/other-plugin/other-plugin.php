<?php
/**
 * Plugin Name: Other Plugin
 *
 * @package WPAppointments
 * @since 0.1.2
 */

namespace WPAppointments\OtherPlugin;

defined( 'ABSPATH' ) || exit;

// Define plugin constants.
define( 'OTHER_PLUGIN_FILE', __FILE__ );
define( 'OTHER_PLUGIN_DIR_PATH', plugin_dir_path( __FILE__ ) );
define( 'OTHER_PLUGIN_DIR_URL', plugin_dir_url( __FILE__ ) );

/**
 * Enqueue client scripts and styles
 */
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\scripts' );

/**
 * Enqueue admin scripts and styles
 *
 * @return void
 */
function scripts() {
	wp_enqueue_script(
		'other-plugin-client-js',
		OTHER_PLUGIN_DIR_URL . 'index.js',
		array(),
		'1.0.0',
		true
	);
}
