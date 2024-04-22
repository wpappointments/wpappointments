<?php
/**
 * All plugin admin assets
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin;

use WPAppointments\Core\PluginInfo;

defined( 'ABSPATH' ) || exit;

add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\scripts' );

/**
 * Enqueue admin scripts and styles
 *
 * @return void
 */
function scripts() {
	require_once PluginInfo::get_plugin_dir_path() . '/includes/utils/datetime.php';

	$api = array(
		'api' => array(
			'root'      => esc_url_raw( rest_url() ),
			'namespace' => trailingslashit( PluginInfo::get_api_namespace() ),
			'url'       => esc_url_raw( trailingslashit( rest_url( PluginInfo::get_api_namespace() ) ) ),
		),
	);

	$date = array(
		'date' => create_date_settings_array(),
	);

	wp_enqueue_style(
		'wpappointments-admin-css',
		PluginInfo::get_plugin_dir_url() . '/admin.css',
		array( 'wp-edit-blocks' ),
		PluginInfo::get_version()
	);

	wp_enqueue_style(
		'wpappointments-admin-css-modules',
		PluginInfo::get_plugin_dir_url() . '/build/admin.tsx.css',
		array( 'wp-edit-blocks' ),
		PluginInfo::get_version()
	);

	$admin_deps = require_once PluginInfo::get_plugin_dir_path() . '/build/admin.tsx.asset.php';

	wp_enqueue_script(
		'wpappointments-admin-js',
		PluginInfo::get_plugin_dir_url() . 'build/admin.tsx.js',
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

		$globals_deps = require_once PluginInfo::get_plugin_dir_path() . '/build/globals.tsx.asset.php';

		wp_enqueue_script(
			'wpappointments-globals-js',
			PluginInfo::get_plugin_dir_url() . 'build/globals.tsx.js',
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
