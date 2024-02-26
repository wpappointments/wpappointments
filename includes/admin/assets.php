<?php
/**
 * All plugin admin assets
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin;

defined( 'ABSPATH' ) || exit;

add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\scripts' );

/**
 * Enqueue admin scripts and styles
 *
 * @return void
 */
function scripts() {
	$api = array(
		'api' => array(
			'root'      => esc_url_raw( rest_url() ),
			'namespace' => trailingslashit( WPAPPOINTMENTS_API_NAMESPACE ),
			'url'       => esc_url_raw( trailingslashit( rest_url( WPAPPOINTMENTS_API_NAMESPACE ) ) ),
		),
	);

	$date = array(
		'date' => array(
			'timezones'    => timezone_identifiers_list(),
			'siteTimezone' => wp_timezone_string(),
		),
	);

	wp_enqueue_style(
		'wpappointments-admin-css',
		WPAPPOINTMENTS_PLUGIN_DIR_URL . '/admin.css',
		array( 'wp-edit-blocks' ),
		WPAPPOINTMENTS_VERSION
	);

	wp_enqueue_style(
		'wpappointments-admin-css-modules',
		WPAPPOINTMENTS_PLUGIN_DIR_URL . '/build/admin.tsx.css',
		array( 'wp-edit-blocks' ),
		WPAPPOINTMENTS_VERSION
	);

	$admin_deps = require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . '/build/admin.tsx.asset.php';

	wp_enqueue_script(
		'wpappointments-admin-js',
		WPAPPOINTMENTS_PLUGIN_DIR_URL . 'build/admin.tsx.js',
		$admin_deps['dependencies'] + apply_filters( 'wpappointments_admin_js_dependencies', array() ),
		$admin_deps['version'],
		true
	);

	wp_localize_script(
		'wpappointments-admin-js',
		'wpappointments',
		array_merge( $api, $date )
	);

	$screen = get_current_screen();

	if ( ! str_contains( $screen->id, 'wpappointments' ) ) {
		if ( ! apply_filters( 'wpappointments_globals_api_enabled', false ) ) {
			return;
		}

		$globals_deps = require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . '/build/globals.tsx.asset.php';

		wp_enqueue_script(
			'wpappointments-globals-js',
			WPAPPOINTMENTS_PLUGIN_DIR_URL . 'build/globals.tsx.js',
			$globals_deps['dependencies'] + apply_filters( 'wpappointments_globals_js_dependencies', array() ),
			$globals_deps['version'],
			true
		);

		wp_localize_script(
			'wpappointments-globals-js',
			'wpappointments',
			$api
		);
	}
}
