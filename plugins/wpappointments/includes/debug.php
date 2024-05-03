<?php
/**
 * Debug utility functions
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

add_action(
	'init',
	function () {
		// @phpcs:ignore
		/** @disregard P1011 because this constant is defined through wp-env config */
		if ( defined( 'WPAPPOINTMENTS_DEBUG' ) && WPAPPOINTMENTS_DEBUG ) {
			register_post_type(
				'wpa-appointment',
				array(
					'label'    => 'Appointments',
					'public'   => true,
					'supports' => array( 'title', 'custom-fields' ),
				)
			);
			register_post_type(
				'wpa-schedule',
				array(
					'label'    => 'Schedules',
					'public'   => true,
					'supports' => array( 'title', 'custom-fields' ),
				)
			);
			register_post_type(
				'wpa-service',
				array(
					'label'    => 'Services',
					'public'   => true,
					'supports' => array( 'title', 'custom-fields' ),
				)
			);
		}
	}
);
