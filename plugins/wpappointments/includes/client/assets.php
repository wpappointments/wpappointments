<?php
/**
 * All plugin client assets
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Client;

use WPAppointments\Core\PluginInfo;

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
	$client_deps = require_once PluginInfo::get_plugin_dir_path() . '/build/index.tsx.asset.php';
	require_once PluginInfo::get_plugin_dir_path() . '/includes/utils/datetime.php';

	wp_enqueue_script(
		'wpappointments-client-js',
		PluginInfo::get_plugin_dir_url() . '/build/index.tsx.js',
		$client_deps['dependencies'] + apply_filters( 'wpappointments_client_js_dependencies', array() ),
		$client_deps['version'],
		true
	);

	wp_localize_script(
		'wpappointments-client-js',
		'wpappointments',
		array(
			'api'  => array(
				'root'      => esc_url_raw( rest_url() ),
				'namespace' => trailingslashit( PluginInfo::get_api_namespace() ),
				'url'       => esc_url_raw( trailingslashit( rest_url( PluginInfo::get_api_namespace() ) ) ),
			),
			'date' => create_date_settings_array(),
			'settings' => array(
				'appointments' => array(
					'defaultLength' => get_option( 'wpappointments_appointments_defaultLength', 30 ),
				),
			),
		)
	);
}
