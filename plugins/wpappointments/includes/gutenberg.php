<?php
/**
 * Gutenberg integration for WP Appointments
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

use WPAppointments\Core\PluginInfo;

// exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Register blocks
 *
 * @return void
 */
add_action( 'init', __NAMESPACE__ . '\\blocks' );

/**
 * Register blocks
 *
 * @return void
 */
function blocks() {
	register_block_type( PluginInfo::get_plugin_dir_path() . 'assets/gutenberg/blocks/booking-flow/src' );
}

/**
 * Localize data needed by the booking flow block editor script.
 *
 * @return void
 */
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\block_editor_data' );

/**
 * Localize data needed by the booking flow block editor script.
 *
 * @return void
 */
function block_editor_data() {
	if ( ! wp_script_is( 'wpappointments-booking-flow-editor-script', 'enqueued' ) ) {
		return;
	}

	require_once PluginInfo::get_plugin_dir_path() . '/includes/utils/datetime.php';

	$localize_data = wp_json_encode(
		array(
			'api'      => array(
				'root'      => esc_url_raw( rest_url() ),
				'namespace' => trailingslashit( PluginInfo::get_api_namespace() ),
				'url'       => esc_url_raw( trailingslashit( rest_url( PluginInfo::get_api_namespace() ) ) ),
			),
			'date'     => \WPAppointments\Utils\DateTime\create_date_settings_array(),
			'settings' => array(
				'appointments' => array(
					'defaultLength' => get_option( 'wpappointments_appointments_defaultLength', 30 ),
				),
			),
			'entity'   => array(
				'coreEntityId' => absint( get_option( 'wpappointments_appointments_coreEntityId', 0 ) ),
			),
		)
	);

	wp_add_inline_script(
		'wpappointments-booking-flow-editor-script',
		'window.wpappointments = Object.assign(window.wpappointments || {}, ' . $localize_data . ');',
		'before'
	);
}

/**
 * Register block category
 *
 * @param array $categories Block categories.
 *
 * @return array
 */
add_filter( 'block_categories_all', __NAMESPACE__ . '\\register_category' );

/**
 * Register block category
 *
 * @param array $categories Block categories.
 *
 * @return array
 */
function register_category( $categories ) {
	return array_merge(
		array(
			array(
				'slug'  => 'wpappointments',
				'title' => __( 'WP Appointments', 'appointments-booking' ),
			),
		),
		$categories
	);
}
