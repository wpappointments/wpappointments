<?php
/**
 * Main plugin class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

/**
 * Main plugin class.
 * Handle all plugin initialization, activation and deactivation.
 */
class Plugin extends Core\WPIntegrator implements Core\Hookable {
	const REQUIRED_PHP = '7.1';

	/**
	 * Init plugin
	 *
	 * @action plugins_loaded
	 *
	 * @return void
	 */
	public function plugin_init() {
		if ( version_compare( phpversion(), self::REQUIRED_PHP, '<' ) ) {
			return;
		}

		// General.
		Model\Appointment::get_instance()->register_hooks();

		// Admin.
		Admin\Bootstrap::get_instance()->register_hooks();

		// API.
		Api\Api::get_instance()->register_hooks();
	}

	/**
	 * Fires on plugin activation
	 *
	 * @return void
	 */
	public function on_plugin_activation() {}

	/**
	 * Fires on plugin deactivation
	 *
	 * @return void
	 */
	public function on_plugin_deactivation() {}
}
