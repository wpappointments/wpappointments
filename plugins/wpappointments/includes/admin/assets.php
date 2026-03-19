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

	// Register shared components script for addon plugins.
	$shared_asset = PluginInfo::get_plugin_dir_path() . '/build/index.tsx.asset.php';

	if ( file_exists( $shared_asset ) ) {
		$shared_deps = require $shared_asset;

		wp_register_script(
			'wpappointments-shared-js',
			PluginInfo::get_plugin_dir_url() . 'build/index.tsx.js',
			array_merge( $shared_deps['dependencies'], array( 'wpappointments-admin-js' ) ),
			$shared_deps['version'],
			true
		);
	}

	// Register data package script for addon plugins.
	$data_asset = PluginInfo::get_plugin_dir_path() . '/build/data.ts.asset.php';

	if ( file_exists( $data_asset ) ) {
		$data_deps = require $data_asset;

		wp_register_script(
			'wpappointments-data-js',
			PluginInfo::get_plugin_dir_url() . 'build/data.ts.js',
			array_merge( $data_deps['dependencies'], array( 'wpappointments-admin-js' ) ),
			$data_deps['version'],
			true
		);
	}

	$screen = get_current_screen();

	if ( str_contains( $screen->id, 'wpappointments' ) ) {
		wp_enqueue_media();

		if ( wp_script_is( 'wpappointments-shared-js', 'registered' ) ) {
			wp_enqueue_script( 'wpappointments-shared-js' );
		}

		if ( wp_script_is( 'wpappointments-data-js', 'registered' ) ) {
			wp_enqueue_script( 'wpappointments-data-js' );
		}
	}

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
