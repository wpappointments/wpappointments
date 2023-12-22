<?php
/**
 * Admin other functions
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin;

// exit if accessed directly.
defined( 'ABSPATH' ) || exit;

add_action( 'admin_body_class', __NAMESPACE__ . '\\body_class', 1000 );

/**
 * Add custom body classes to all WP appoinemnts admin pages
 *
 * @param string $classes Body classes.
 *
 * @return string
 */
function body_class( $classes ) {
	$screen = get_current_screen();

	if ( str_contains( $screen->id, 'wpappointments' ) ) {
		$classes .= ' wpappointments-admin';
	}

	return $classes;
}

add_action( 'admin_footer', __NAMESPACE__ . '\\render_globals_component' );

/**
 * Render the globals component
 *
 * @return void
 */
function render_globals_component() {
	if ( ! apply_filters( 'wpappointments_globals_api_enabled', false ) ) {
		return;
	}

	if ( str_contains( get_current_screen()->id, 'wpappointments' ) ) {
		return;
	}

	echo '<div id="wpappointments-globals"></div>';
}