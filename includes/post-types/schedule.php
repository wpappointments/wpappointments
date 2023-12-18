<?php
/**
 * Schedule post type
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\PostTypes\Schedule;

// exit if accessed directly.
defined( 'ABSPATH' ) || exit;

add_action( 'init', __NAMESPACE__ . '\\register' );

/**
 * Register schedule post type
 *
 * @return void
 */
function register() {
	register_post_type(
		'wpappointments-schedule',
		array(
			'labels'                => array(
				'name' => __( 'Schedules', 'wpappointments' ),
			),
			'public'                => false,
			'show_ui'               => true,
			'show_in_menu'          => true,
			'capability_type'       => 'post',
			'hierarchical'          => false,
			'rewrite'               => false,
			'query_var'             => false,
			'supports'              => array( 'title', 'author', 'thumbnail', 'excerpt', 'comments', 'custom-fields' ),
			'show_in_rest'          => true,
			'rest_base'             => 'schedules',
			'rest_controller_class' => 'WP_REST_Posts_Controller',
		)
	);
}
