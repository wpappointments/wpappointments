<?php
/**
 * Frontend assets for public pages
 *
 * Provides the window.wpappointments configuration object needed by
 * the booking flow block view script. Does NOT load admin components.
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Client;

use WPAppointments\Core\PluginInfo;

defined( 'ABSPATH' ) || exit;

/**
 * Inject wpappointments config into the booking flow view script.
 *
 * Runs on wp_enqueue_scripts so the inline data is available when
 * the block's viewScript renders.
 */
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\inject_frontend_config' );

/**
 * Add inline config to the booking flow view script
 *
 * Only runs when the view script is actually enqueued (i.e. the
 * booking flow block is on the page).
 *
 * @return void
 */
function inject_frontend_config() {
	require_once PluginInfo::get_plugin_dir_path() . '/includes/utils/datetime.php';

	$view_handle = 'wpappointments-booking-flow-view-script';

	if ( ! wp_script_is( $view_handle, 'registered' ) && ! wp_script_is( $view_handle, 'enqueued' ) ) {
		return;
	}

	$config = array(
		'api'      => array(
			'root'      => esc_url_raw( rest_url() ),
			'namespace' => trailingslashit( PluginInfo::get_api_namespace() ),
			'url'       => esc_url_raw( trailingslashit( rest_url( PluginInfo::get_api_namespace() ) ) ),
		),
		'date'     => create_date_settings_array(),
		'settings' => array(
			'appointments' => array(
				'defaultLength' => get_option( 'wpappointments_appointments_defaultLength', 30 ),
			),
		),
		'entity'   => array(
			'coreEntityId' => absint( get_option( 'wpappointments_appointments_coreEntityId', 0 ) ),
		),
	);

	wp_add_inline_script(
		$view_handle,
		'var wpappointments = ' . wp_json_encode( $config ) . ';',
		'before'
	);
}
