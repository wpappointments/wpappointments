<?php
/**
 * Capabilities class file
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Core;

/**
 * Capabilities class
 */
class Capabilities {
	/**
	 * Manage appointments capability
	 *
	 * @var string
	 */
	const MANAGE_APPOINTMENTS = 'wpa_manage_appointments';

	/**
	 * Manage settings capability
	 *
	 * @var string
	 */
	const MANAGE_SETTINGS = 'wpa_manage_settings';

	/**
	 * Manage services capability
	 *
	 * @var string
	 */
	const MANAGE_SERVICES = 'wpa_manage_services';

	/**
	 * Get all capabilities
	 *
	 * @return array
	 */
	public static function all() {
		return array(
			self::MANAGE_APPOINTMENTS,
			self::MANAGE_SETTINGS,
			self::MANAGE_SERVICES,
		);
	}
}
