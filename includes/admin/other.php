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
