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
		if ( defined( 'WPAPPOINTMENTS_DEBUG' ) ) {
			register_post_type(
				'appointment',
				array(
					'public'   => true,
					'supports' => array( 'custom-fields' ),
				)
			);
			register_post_type(
				'wpa_schedule',
				array(
					'public'   => true,
					'supports' => array( 'custom-fields' ),
				)
			);
		}
	}
);
