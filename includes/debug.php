<?php
/**
 * Debug utility functions
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