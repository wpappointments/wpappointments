<?php
/**
 * Admin other functions
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin;

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

		if ( 'admin_page_wpappointments-wizard' === $screen->id ) {
			$classes .= ' wpappointments-admin-wizard';
		}
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

/**
 * Redirect to wizard after plugin activation
 *
 * @return void
 */
function redirect_to_wizard() {
	$wizard_completed = get_option( 'wpappointments_wizard_completed' );
	if ( ! $wizard_completed ) {
		wp_safe_redirect( admin_url( 'admin.php?page=wpappointments-wizard' ) );
		exit;
	} else {
		wp_safe_redirect( admin_url( 'admin.php?page=wpappointments' ) );
		exit;
	}
}

add_action( 'activated_plugin', __NAMESPACE__ . '\\redirect_to_wizard' );

/**
 * Mark the wizard as complete
 *
 * @return void
 */
function mark_wizard_complete() {
	update_option( 'wpappointments_wizard_completed', true );
	wp_safe_redirect( admin_url( 'admin.php?page=wpappointments' ) );
	exit;
}

add_action( 'admin_post_wpappointments_wizard_complete', __NAMESPACE__ . '\\mark_wizard_complete' );
