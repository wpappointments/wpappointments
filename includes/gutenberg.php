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
