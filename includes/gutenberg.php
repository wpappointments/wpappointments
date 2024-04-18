<?php
/**
 * Gutenberg integration for WP Appointments
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

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
	register_block_type( WPAPPOINTMENTS_PLUGIN_DIR_PATH . 'assets/gutenberg/blocks/booking-flow/src' );
}

/**
 * Register block category
 *
 * @param array $categories Block categories.
 *
 * @return array
 */
if ( version_compare( get_bloginfo( 'version' ), '5.8', '>=' ) ) {
	add_filter( 'block_categories_all', __NAMESPACE__ . '\\register_category' );
} else {
	add_filter( 'block_categories', __NAMESPACE__ . '\\register_category' );
}

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
				'title' => __( 'WP Appointments', 'wpappointments' ),
			),
		),
		$categories
	);
}
