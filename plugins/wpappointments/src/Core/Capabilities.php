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
	 * Manage customers capability
	 *
	 * @var string
	 */
	const MANAGE_CUSTOMERS = 'wpa_manage_customers';

	/**
	 * Manage entities capability
	 *
	 * @var string
	 */
	const MANAGE_ENTITIES = 'wpa_manage_entities';

	/**
	 * Manage bookable entities capability
	 *
	 * @var string
	 */
	const MANAGE_BOOKABLES = 'wpa_manage_bookables';

	/**
	 * Get all capabilities
	 *
	 * Filterable via 'wpappointments_capabilities' to allow extensions to add
	 * or remove capabilities.
	 *
	 * @return array
	 */
	public static function all() {
		$capabilities = array(
			self::MANAGE_APPOINTMENTS,
			self::MANAGE_SETTINGS,
			self::MANAGE_SERVICES,
			self::MANAGE_CUSTOMERS,
			self::MANAGE_ENTITIES,
			self::MANAGE_BOOKABLES,
		);

		return apply_filters( 'wpappointments_capabilities', $capabilities );
	}
}
