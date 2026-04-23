<?php
/**
 * Plugin roles
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin;

defined( 'ABSPATH' ) || exit;

/**
 * Create plugin roles
 *
 * @return void
 */
function create_plugin_roles() {
	add_role(
		'wpa-customer',
		__( 'Customer (appointments)', 'wpappointments' ),
		array_merge(
			get_role( 'subscriber' )->capabilities,
			array(
				'read_appointments'                      => true,
				'read_availability'                      => true,
				'create_appointments_in_available_slots' => true,
			)
		)
	);
}
