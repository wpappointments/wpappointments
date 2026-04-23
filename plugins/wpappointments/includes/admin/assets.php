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
		'date' => wpappointments_create_date_settings_array(),
	);

	$screen = get_current_screen();

	if ( ! $screen ) {
		return;
	}

	if ( str_contains( $screen->id, 'appointments-booking' ) ) {
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
			array_merge( $admin_deps['dependencies'], apply_filters( 'wpappointments_admin_js_dependencies', array() ) ),
			$admin_deps['version'],
			true
		);

		// Use wp_add_inline_script instead of wp_localize_script to avoid
		// overwriting window.wpappointments (which external plugins may have
		// already written to, e.g., _pendingBookableTypes).
		$localize_data = wp_json_encode( array_merge( $api, $date ) );
		wp_add_inline_script(
			'wpappointments-admin-js',
			'window.wpappointments = Object.assign(window.wpappointments || {}, ' . $localize_data . ');',
			'before'
		);

		wp_set_script_translations(
			'wpappointments-admin-js',
			'appointments-booking',
			PluginInfo::get_plugin_dir_path() . '/languages'
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

		wp_enqueue_media();

		if ( wp_script_is( 'wpappointments-shared-js', 'registered' ) ) {
			wp_enqueue_script( 'wpappointments-shared-js' );
		}
	}

	if ( ! str_contains( $screen->id, 'appointments-booking' ) ) {
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

		$globals_data = wp_json_encode( $api );
		wp_add_inline_script(
			'wpappointments-globals-js',
			'window.wpappointments = Object.assign(window.wpappointments || {}, ' . $globals_data . ');',
			'before'
		);
	}
}
