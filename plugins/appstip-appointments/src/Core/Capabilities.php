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
 *
 * Defines granular CRUD capabilities for each entity type.
 * Each entity type has view, create, edit, and delete capabilities.
 */
class Capabilities {
	// Appointments.
	const VIEW_APPOINTMENTS   = 'wpa_view_appointments';
	const CREATE_APPOINTMENTS = 'wpa_create_appointments';
	const EDIT_APPOINTMENTS   = 'wpa_edit_appointments';
	const DELETE_APPOINTMENTS = 'wpa_delete_appointments';

	// Bookables (includes variants and types).
	const VIEW_BOOKABLES   = 'wpa_view_bookables';
	const CREATE_BOOKABLES = 'wpa_create_bookables';
	const EDIT_BOOKABLES   = 'wpa_edit_bookables';
	const DELETE_BOOKABLES = 'wpa_delete_bookables';

	// Customers.
	const VIEW_CUSTOMERS   = 'wpa_view_customers';
	const CREATE_CUSTOMERS = 'wpa_create_customers';
	const EDIT_CUSTOMERS   = 'wpa_edit_customers';
	const DELETE_CUSTOMERS = 'wpa_delete_customers';

	// Services (service categories).
	const VIEW_SERVICES   = 'wpa_view_services';
	const CREATE_SERVICES = 'wpa_create_services';
	const EDIT_SERVICES   = 'wpa_edit_services';
	const DELETE_SERVICES = 'wpa_delete_services';

	// Schedules.
	const VIEW_SCHEDULES   = 'wpa_view_schedules';
	const CREATE_SCHEDULES = 'wpa_create_schedules';
	const EDIT_SCHEDULES   = 'wpa_edit_schedules';
	const DELETE_SCHEDULES = 'wpa_delete_schedules';

	// Settings (view + edit only — no create/delete).
	const VIEW_SETTINGS = 'wpa_view_settings';
	const EDIT_SETTINGS = 'wpa_edit_settings';

	/**
	 * Get all capabilities
	 *
	 * Filterable via 'wpappointments_capabilities' to allow extensions to add
	 * or remove capabilities.
	 *
	 * @return array<string>
	 */
	public static function all(): array {
		$capabilities = array(
			self::VIEW_APPOINTMENTS,
			self::CREATE_APPOINTMENTS,
			self::EDIT_APPOINTMENTS,
			self::DELETE_APPOINTMENTS,

			self::VIEW_BOOKABLES,
			self::CREATE_BOOKABLES,
			self::EDIT_BOOKABLES,
			self::DELETE_BOOKABLES,

			self::VIEW_CUSTOMERS,
			self::CREATE_CUSTOMERS,
			self::EDIT_CUSTOMERS,
			self::DELETE_CUSTOMERS,

			self::VIEW_SERVICES,
			self::CREATE_SERVICES,
			self::EDIT_SERVICES,
			self::DELETE_SERVICES,

			self::VIEW_SCHEDULES,
			self::CREATE_SCHEDULES,
			self::EDIT_SCHEDULES,
			self::DELETE_SCHEDULES,

			self::VIEW_SETTINGS,
			self::EDIT_SETTINGS,
		);

		return apply_filters( 'wpappointments_capabilities', $capabilities );
	}

	/**
	 * Get all capabilities for a specific entity group
	 *
	 * @param string $group Entity group: 'appointments', 'bookables', 'customers',
	 *                      'services', 'schedules', 'settings'.
	 *
	 * @return array<string>
	 */
	public static function for_group( string $group ): array {
		$groups = array(
			'appointments' => array(
				self::VIEW_APPOINTMENTS,
				self::CREATE_APPOINTMENTS,
				self::EDIT_APPOINTMENTS,
				self::DELETE_APPOINTMENTS,
			),
			'bookables'    => array(
				self::VIEW_BOOKABLES,
				self::CREATE_BOOKABLES,
				self::EDIT_BOOKABLES,
				self::DELETE_BOOKABLES,
			),
			'customers'    => array(
				self::VIEW_CUSTOMERS,
				self::CREATE_CUSTOMERS,
				self::EDIT_CUSTOMERS,
				self::DELETE_CUSTOMERS,
			),
			'services'     => array(
				self::VIEW_SERVICES,
				self::CREATE_SERVICES,
				self::EDIT_SERVICES,
				self::DELETE_SERVICES,
			),
			'schedules'    => array(
				self::VIEW_SCHEDULES,
				self::CREATE_SCHEDULES,
				self::EDIT_SCHEDULES,
				self::DELETE_SCHEDULES,
			),
			'settings'     => array(
				self::VIEW_SETTINGS,
				self::EDIT_SETTINGS,
			),
		);

		return $groups[ $group ] ?? array();
	}
}
