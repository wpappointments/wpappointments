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
	/**
	 * Init plugin
	 *
	 * @action plugins_loaded
	 *
	 * @return void
	 */
	public function plugin_init( $required_php = "" ) {
		$php = "" === $required_php ? WPAPPOINTMENTS_REQUIRED_PHP : $required_php;

		if ( version_compare( phpversion(), $php, '<' ) ) {
			return false;
		}

		// General.
		Model\AppointmentPost::get_instance()->register_hooks();
		Model\SchedulePost::get_instance()->register_hooks();

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
