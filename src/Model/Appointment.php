<?php
/**
 * Appointment model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Model;

use WPAppointments\Core;

/**
 * Appointment model class
 */
class Appointment extends Core\WPIntegrator implements Core\Hookable {
	/**
	 * Register appointment post type
	 *
	 * @action init
	 *
	 * @return void
	 */
	public function register_post_type() {
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

	/**
	 * Create appointment
	 */
	public function create( $meta = array() ) {
		$post_id = wp_insert_post(
			array(
				'post_type'   => 'appointment',
				'post_title'  => 'Appointment',
				'post_status' => 'publish',
				'meta_input'  => $meta,
			)
		);

		return $post_id;
	}
}
