<?php
/**
 * Debug utility functions
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

use WPAppointments\Core\PluginInfo;

add_action(
	'init',
	function () {
		// @phpcs:ignore
		/** @disregard P1011 because this constant is defined through wp-env config */
		if ( defined( 'WPAPPOINTMENTS_DEBUG' ) && WPAPPOINTMENTS_DEBUG ) {
			register_post_type(
				PluginInfo::POST_TYPES['appointment'],
				array(
					'label'    => 'Appointments',
					'public'   => true,
					'supports' => array( 'title', 'custom-fields' ),
				)
			);
			register_post_type(
				PluginInfo::POST_TYPES['schedule'],
				array(
					'label'    => 'Schedules',
					'public'   => true,
					'supports' => array( 'title', 'custom-fields' ),
				)
			);
			register_post_type(
				PluginInfo::POST_TYPES['service'],
				array(
					'label'    => 'Services',
					'public'   => true,
					'supports' => array( 'title', 'custom-fields' ),
				)
			);
		}
	}
);
