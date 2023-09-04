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
class AppointmentPost extends Core\WPIntegrator implements Core\Hookable {
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
	 * Get all appointments
	 */
	public function get_all() {
		$posts = get_posts(
			array(
				'post_type'   => 'appointment',
				'post_status' => 'publish',
				'numberposts' => -1,
			)
		);

		$appointments = array();

		foreach ( $posts as $post ) {
			$appointments[] = array(
				'id'      => $post->ID,
				'title'   => $post->post_title,
				'date'    => get_post_meta( $post->ID, 'date', true ),
				'time'    => get_post_meta( $post->ID, 'time', true ),
				'actions' => (object) array(
					'delete' => (object) array(
						'name'   => 'DeleteAppointment',
						'method' => 'DELETE',
						'uri'    => rest_url( WPAPPOINTMENTS_API_NAMESPACE . '/appointment/' . $post->ID ),
					),
					'edit'   => array(
						'name'   => 'EditAppointment',
						'method' => 'PUT',
						'uri'    => rest_url( WPAPPOINTMENTS_API_NAMESPACE . '/appointment/' . $post->ID ),
					),
				),
			);
		}

		return $appointments;
	}

	/**
	 * Create appointment
	 */
	public function create( $meta = array() ) {
		$post_id = wp_insert_post(
			array(
				'post_type'    => 'appointment',
				'post_content' => '',
				'post_title'   => 'Appointment',
				'post_status'  => 'publish',
				'meta_input'   => $meta,
			)
		);

		return array(
			'id'      => $post_id,
			'title'   => 'Appointment',
			'date'    => $meta['date'],
			'time'    => $meta['time'],
			'actions' => (object) array(
				'delete' => (object) array(
					'name'        => 'DeleteAppointment',
					'label'       => 'Delete',
					'method'      => 'DELETE',
					'uri'         => rest_url( WPAPPOINTMENTS_API_NAMESPACE . '/appointment/' . $post_id ),
					'isDangerous' => true,
				),
				'edit'   => array(
					'name'        => 'EditAppointment',
					'label'       => 'Edit',
					'method'      => 'PUT',
					'uri'         => rest_url( WPAPPOINTMENTS_API_NAMESPACE . '/appointment/' . $post_id ),
					'isDangerous' => false,
				),
			),
		);
	}

	/**
	 * Delete appointment
	 */
	public function delete( $id ) {
		$deleted = wp_delete_post( $id, true );

		if ( $deleted ) {
			return $deleted->ID;
		}

		return \WP_Error( 'error', __( 'Could not delete appointment', 'wpappointments' ) );
	}
}
