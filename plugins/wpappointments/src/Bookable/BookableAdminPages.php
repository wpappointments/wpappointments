<?php
/**
 * Bookable admin pages registration
 *
 * Provides an API for plugins to register admin pages for their bookable
 * types. Each registered page appears as a submenu item under the WP
 * Appointments menu and renders a React root container.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Bookable;

use WPAppointments\Core\Singleton;

/**
 * BookableAdminPages class
 */
class BookableAdminPages extends Singleton {
	/**
	 * Registered admin pages
	 *
	 * @var array<string, array>
	 */
	private $pages = array();

	/**
	 * Register a bookable type admin page
	 *
	 * Adds a submenu page under the WP Appointments menu that renders
	 * a React root container for the plugin's UI.
	 *
	 * @param string $type_slug Bookable type slug (must match a registered bookable type).
	 * @param array  $config    Page configuration:
	 *                          - page_title (string) Page <title> tag
	 *                          - menu_title (string) Menu item text
	 *                          - capability (string) Required capability (default: 'wpa_manage_bookables')
	 *                          - menu_position (int|null) Position in submenu (default: null)
	 *                          - icon (string) Dashicons class or SVG (default: 'dashicons-calendar-alt').
	 *
	 * @return bool True on success.
	 */
	public function register( $type_slug, $config ) {
		$defaults = array(
			'page_title'    => ucfirst( $type_slug ),
			'menu_title'    => ucfirst( $type_slug ),
			'capability'    => 'wpa_manage_bookables',
			'menu_position' => null,
			'icon'          => 'dashicons-calendar-alt',
		);

		$config = wp_parse_args( $config, $defaults );

		$this->pages[ $type_slug ] = $config;

		return true;
	}

	/**
	 * Get all registered admin pages
	 *
	 * @return array
	 */
	public function get_all() {
		return $this->pages;
	}

	/**
	 * Register WordPress admin menus for all bookable type pages
	 *
	 * Should be called on the 'admin_menu' action, after the main
	 * WP Appointments menu is registered.
	 *
	 * @return void
	 */
	public function register_menus() {
		foreach ( $this->pages as $type_slug => $config ) {
			$menu_slug = 'wpappointments-bookable-' . $type_slug;

			add_submenu_page(
				'wpappointments',
				$config['page_title'],
				$config['menu_title'],
				$config['capability'],
				$menu_slug,
				function () use ( $type_slug ) {
					$this->render_page( $type_slug );
				},
				$config['menu_position']
			);
		}
	}

	/**
	 * Render a bookable type admin page
	 *
	 * Outputs a React root container with data attributes that the
	 * plugin's JS can use to mount its components.
	 *
	 * @param string $type_slug Bookable type slug.
	 *
	 * @return void
	 */
	private function render_page( $type_slug ) {
		printf(
			'<div id="wpappointments-admin" data-page="bookable-%s" data-bookable-type="%s"></div>',
			esc_attr( $type_slug ),
			esc_attr( $type_slug )
		);
	}

	/**
	 * Reset pages (primarily for testing)
	 *
	 * @return void
	 */
	public function reset() {
		$this->pages = array();
	}
}
