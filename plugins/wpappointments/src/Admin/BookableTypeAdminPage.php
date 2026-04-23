<?php
/**
 * Admin page registration for bookable type plugins
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Admin;

use WPAppointments\Core\Capabilities;

/**
 * Allows bookable type plugins to register admin pages under
 * the WP Appointments menu.
 *
 * Usage in a plugin:
 *   add_action( 'wpappointments_register_admin_pages', function() {
 *       BookableTypeAdminPage::register( [
 *           'type'       => 'court',
 *           'page_title' => 'Courts',
 *           'menu_title' => 'Courts',
 *           'capability' => 'wpa_manage_bookables',
 *           'position'   => 25,
 *       ] );
 *   } );
 */
class BookableTypeAdminPage {
	/**
	 * Registered admin pages
	 *
	 * @var array
	 */
	private static array $pages = array();

	/**
	 * Register a bookable type admin page
	 *
	 * @param array $config Page configuration.
	 *   - type:        string  Bookable type slug (e.g. "court").
	 *   - page_title:  string  Page title shown in browser tab.
	 *   - menu_title:  string  Menu item label.
	 *   - capability:  string  Required capability (default: wpa_manage_bookables).
	 *   - icon:        string  Dashicon or SVG (optional, submenu items don't show icons).
	 *   - position:    int     Menu position (optional).
	 *
	 * @return void
	 */
	public static function register( array $config ) {
		$defaults = array(
			'type'       => '',
			'page_title' => '',
			'menu_title' => '',
			'capability' => Capabilities::MANAGE_BOOKABLES,
			'position'   => null,
		);

		$config = wp_parse_args( $config, $defaults );

		if ( empty( $config['type'] ) || empty( $config['menu_title'] ) ) {
			return;
		}

		self::$pages[ $config['type'] ] = $config;
	}

	/**
	 * Hook into admin_menu to register all pages.
	 * Called by the core plugin on admin_menu action.
	 *
	 * @return void
	 */
	public static function register_menus() {
		/**
		 * Fires when bookable type plugins should register their admin pages.
		 *
		 * Plugins should call BookableTypeAdminPage::register() inside
		 * this action callback.
		 */
		do_action( 'wpappointments_register_admin_pages' );

		foreach ( self::$pages as $type => $config ) {
			$slug = 'wpappointments-' . sanitize_title( $type );

			add_submenu_page(
				'appointments-booking',
				! empty( $config['page_title'] ) ? $config['page_title'] : $config['menu_title'],
				$config['menu_title'],
				$config['capability'],
				$slug,
				function () use ( $type, $slug ) {
					self::render_page( $type, $slug );
				},
				$config['position']
			);
		}
	}

	/**
	 * Render the admin page container div.
	 *
	 * The addon plugin's JS takes over from here using createRoot()
	 * on the rendered container element.
	 *
	 * @param string $type Bookable type slug.
	 * @param string $slug Page slug.
	 *
	 * @return void
	 */
	private static function render_page( string $type, string $slug ) {
		printf(
			'<div id="wpappointments-admin" data-page="%s" data-bookable-type="%s"></div><div id="slideout-container"></div>',
			esc_attr( $slug ),
			esc_attr( $type )
		);
	}

	/**
	 * Get all registered pages
	 *
	 * @return array
	 */
	public static function get_pages(): array {
		return self::$pages;
	}

	/**
	 * Enqueue addon plugin scripts on their registered pages.
	 *
	 * Called on admin_enqueue_scripts. Fires an action that addon
	 * plugins can hook into to enqueue their own scripts.
	 *
	 * @return void
	 */
	public static function enqueue_addon_scripts() {
		$screen = get_current_screen();

		if ( ! $screen ) {
			return;
		}

		foreach ( self::$pages as $type => $config ) {
			$slug = 'wpappointments-' . sanitize_title( $type );

			if ( str_contains( $screen->id, $slug ) ) {
				/**
				 * Fires when a bookable type admin page is loaded.
				 *
				 * Addon plugins should enqueue their scripts here.
				 * The 'wpappointments-shared-js' script is already enqueued.
				 *
				 * @param string $type The bookable type slug.
				 * @param string $slug The page slug.
				 */
				do_action( 'wpappointments_enqueue_addon_scripts', $type, $slug );
				do_action( "wpappointments_enqueue_{$type}_scripts", $slug );
				break;
			}
		}
	}
}
