<?php
/**
 * Debug utility functions
 *
 * @package WPAppointments
 * @since 0.0.1
 */

add_action(
	'init',
	function () {
		/** @disregard P1011 because this constant is defined through wp-env config */
		if ( defined( 'WPAPPOINTMENTS_DEBUG' ) && WPAPPOINTMENTS_DEBUG ) {
			register_post_type(
				'appointment',
				array(
					'label'    => 'Appointments',
					'public'   => true,
					'supports' => array( 'custom-fields' ),
				)
			);
			register_post_type(
				'wpa_schedule',
				array(
					'label'    => 'Schedules',
					'public'   => true,
					'supports' => array( 'custom-fields' ),
				)
			);
		}
	}
);
