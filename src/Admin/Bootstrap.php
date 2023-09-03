<?php
/**
 * Bootstrap admin class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin;

use WPAppointments\Core;

/**
 * Bootstrap the plugin admin functionality
 */
class Bootstrap extends Core\WPIntegrator implements Core\Hookable {
	/**
	 * Bootstrap admin hooks
	 *
	 * @action admin_init
	 *
	 * @return void
	 */
	public function admin_init() {
		Assets::get_instance()->register_hooks();
	}

	/**
	 * Add main plugin admin menu
	 *
	 * @action admin_menu
	 *
	 * @return void
	 */
	public function admin_menu() {
		$icon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTExODg4NjBlLWQ4YjQtNDVjYi1hMWNjLTYzZTkxNzNhYmVjMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTYgMTYiPjxnIGlkPSJ1dWlkLTRmZjQ2YjljLTMxMjItNDBjMC05OWNkLTIxMDVkMTZiZDRjMCI+PHBhdGggZD0ibTgsMEMzLjU5LDAsMCwzLjU5LDAsOHMzLjU5LDgsOCw4LDgtMy41OSw4LThTMTIuNDEsMCw4LDBabTAsMTIuNDVjLTIuNDYsMC00LjQ2LTItNC40Ni00LjQ1czItNC40Niw0LjQ2LTQuNDYsNC40NiwyLDQuNDYsNC40Ni0yLDQuNDUtNC40Niw0LjQ1WiIgZmlsbD0iIzE3NGFmZiIvPjxyZWN0IHg9IjYuMzQiIHk9IjYuMDgiIHdpZHRoPSI0LjQ2IiBoZWlnaHQ9IjIuODMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yLjc5IDguMjYpIHJvdGF0ZSgtNDUpIiBmaWxsPSIjMTc0YWZmIi8+PC9nPjwvc3ZnPg==';

		add_menu_page(
			__( 'WP Appointments', 'wpappointments' ),
			__( 'Appointments', 'wpappointments' ),
			'activate_plugins',
			'wpappointments',
			array( $this, 'admin_page' ),
			$icon,
			'58.5'
		);

		add_submenu_page(
			'wpappointments',
			__( 'Calendar', 'wpappointments' ),
			__( 'Calendar', 'wpappointments' ),
			'activate_plugins',
			'wpappointments-calendar',
			array( $this, 'calendar_page' )
		);

		add_submenu_page(
			'wpappointments',
			__( 'Schedules', 'wpappointments' ),
			__( 'Schedules', 'wpappointments' ),
			'activate_plugins',
			'wpappointments-schedules',
			array( $this, 'schedules_page' )
		);

		add_submenu_page(
			'wpappointments',
			__( 'Settings', 'wpappointments' ),
			__( 'Settings', 'wpappointments' ),
			'activate_plugins',
			'wpappointments-settings',
			array( $this, 'settings_page' )
		);
	}

	/**
	 * Create dashboard admin page
	 *
	 * @return void
	 */
	public function admin_page() {
		echo '<div id="wpappointments-admin" data-page="dashboard"></div>';
	}

	/**
	 * Create calendar admin page
	 *
	 * @return void
	 */
	public function calendar_page() {
		echo '<div id="wpappointments-admin" data-page="calendar"></div>';
	}

	/**
	 * Create schedules admin page
	 *
	 * @return void
	 */
	public function schedules_page() {
		echo '<div id="wpappointments-admin" data-page="schedules"></div>';
	}

	/**
	 * Create settings admin page
	 *
	 * @return void
	 */
	public function settings_page() {
		echo '<div id="wpappointments-admin" data-page="settings"></div>';
	}

	/**
	 * Add class to body in admin area
	 *
	 * @filter admin_body_class 1000
	 *
	 * @param string $classes Admin body classes.
	 *
	 * @return string
	 */
	public function admin_body_class( $classes ) {
		$screen = get_current_screen();

		if ( str_contains( $screen->id, 'wpappointments' ) ) {
			$classes .= ' wpappointments-admin';
		}

		return $classes;
	}
}
