<?php
/**
 * Appointment post type
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\PostTypes\Appoitment;

// exit if accessed directly.
defined( 'ABSPATH' ) || exit;

add_action( 'init', __NAMESPACE__ . '\\register' );

/**
 * Register appointment post type
 *
 * @return void
 */
function register() {
	register_post_type(
		'appointment',
		array(
			'labels'                => array(
				'name'               => __( 'Appointments', 'wpappointments' ),
				'singular_name'      => __( 'Appointment', 'wpappointments' ),
				'add_new'            => __( 'Add New', 'wpappointments' ),
				'add_new_item'       => __( 'Add New Appointment', 'wpappointments' ),
				'edit_item'          => __( 'Edit Appointment', 'wpappointments' ),
				'new_item'           => __( 'New Appointment', 'wpappointments' ),
				'view_item'          => __( 'View Appointment', 'wpappointments' ),
				'search_items'       => __( 'Search Appointments', 'wpappointments' ),
				'not_found'          => __( 'No Appointments found', 'wpappointments' ),
				'not_found_in_trash' => __( 'No Appointments found in trash', 'wpappointments' ),
				'parent_item_colon'  => __( 'Parent Appointment', 'wpappointments' ),
				'menu_name'          => __( 'Appointments', 'wpappointments' ),
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
			'rest_base'             => 'appointments',
			'rest_controller_class' => 'WP_REST_Posts_Controller',
		)
	);
}
