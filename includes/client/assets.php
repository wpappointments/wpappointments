<?php
/**
 * All plugin client assets
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Client;

defined( 'ABSPATH' ) || exit;

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
	$client_deps = require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . '/build/index.tsx.asset.php';

	wp_enqueue_script(
		'wpappointments-client-js',
		WPAPPOINTMENTS_PLUGIN_DIR_URL . '/build/index.tsx.js',
		$client_deps['dependencies'] + apply_filters( 'wpappointments_client_js_dependencies', array() ),
		$client_deps['version'],
		true
	);

	wp_localize_script(
		'wpappointments-client-js',
		'wpappointments',
		array(
			'api' => array(
				'root'      => esc_url_raw( rest_url() ),
				'namespace' => trailingslashit( WPAPPOINTMENTS_API_NAMESPACE ),
				'url'       => esc_url_raw( trailingslashit( rest_url( WPAPPOINTMENTS_API_NAMESPACE ) ) ),
			),
		)
	);
}
