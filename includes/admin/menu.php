<?php
/**
 * Admin menu
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin;

defined( 'ABSPATH' ) || exit;

add_action( 'admin_menu', __NAMESPACE__ . '\\menu' );

/**
 * Add main plugin admin menu
 *
 * @return void
 */
function menu() {
	$icon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTExODg4NjBlLWQ4YjQtNDVjYi1hMWNjLTYzZTkxNzNhYmVjMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTYgMTYiPjxnIGlkPSJ1dWlkLTRmZjQ2YjljLTMxMjItNDBjMC05OWNkLTIxMDVkMTZiZDRjMCI+PHBhdGggZD0ibTgsMEMzLjU5LDAsMCwzLjU5LDAsOHMzLjU5LDgsOCw4LDgtMy41OSw4LThTMTIuNDEsMCw4LDBabTAsMTIuNDVjLTIuNDYsMC00LjQ2LTItNC40Ni00LjQ1czItNC40Niw0LjQ2LTQuNDYsNC40NiwyLDQuNDYsNC40Ni0yLDQuNDUtNC40Niw0LjQ1WiIgZmlsbD0iIzE3NGFmZiIvPjxyZWN0IHg9IjYuMzQiIHk9IjYuMDgiIHdpZHRoPSI0LjQ2IiBoZWlnaHQ9IjIuODMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yLjc5IDguMjYpIHJvdGF0ZSgtNDUpIiBmaWxsPSIjMTc0YWZmIi8+PC9nPjwvc3ZnPg==';

	add_menu_page(
		__( 'WP Appointments', 'wpappointments' ),
		__( 'Appointments', 'wpappointments' ),
		'activate_plugins',
		'wpappointments',
		__NAMESPACE__ . '\\admin_page',
		$icon,
		'58.5'
	);

	add_submenu_page(
		'wpappointments',
		__( 'Calendar', 'wpappointments' ),
		__( 'Calendar', 'wpappointments' ),
		'activate_plugins',
		'wpappointments-calendar',
		__NAMESPACE__ . '\\calendar_page'
	);

	add_submenu_page(
		'wpappointments',
		__( 'Settings', 'wpappointments' ),
		__( 'Settings', 'wpappointments' ),
		'activate_plugins',
		'wpappointments-settings',
		__NAMESPACE__ . '\\settings_page'
	);

	add_submenu_page(
		'noexistingpageslug',
		__( 'Wizard', 'wpappointments' ),
		__( 'Wizard', 'wpappointments' ),
		'activate_plugins',
		'wpappointments-wizard',
		__NAMESPACE__ . '\\wizard_page'
	);
}

/**
 * Create dashboard admin page
 *
 * @return void
 */
function admin_page() {
	echo '<div id="wpappointments-admin" data-page="dashboard"></div>';
}

/**
 * Create calendar admin page
 *
 * @return void
 */
function calendar_page() {
	echo '<div id="wpappointments-admin" data-page="calendar"></div>';
}

/**
 * Create settings admin page
 *
 * @return void
 */
function settings_page() {
	echo '<div id="wpappointments-admin" data-page="settings"></div>';
}

/**
 * Create wizard page
 * 
 * @return void
 */
function wizard_page() {
	echo '<div id="wpappointments-admin" data-page="wizard"></div>';
}
