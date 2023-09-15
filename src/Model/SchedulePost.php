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
class SchedulePost extends Core\WPIntegrator implements Core\Hookable {
	/**
	 * Register appointment post type
	 *
	 * @action init
	 *
	 * @return void
	 */
	public function register_post_type() {
		register_post_type(
			'schedule',
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

	/**
	 * Get all appointments
	 *
	 * @return array
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
						'name'        => 'DeleteAppointment',
						'label'       => 'Delete',
						'method'      => 'DELETE',
						'uri'         => rest_url( WPAPPOINTMENTS_API_NAMESPACE . '/appointment/' . $post->ID ),
						'isDangerous' => true,
					),
					'edit'   => array(
						'name'        => 'EditAppointment',
						'label'       => 'Edit',
						'method'      => 'PUT',
						'uri'         => rest_url( WPAPPOINTMENTS_API_NAMESPACE . '/appointment/' . $post->ID ),
						'isDangerous' => false,
					),
				),
			);
		}

		return $appointments;
	}
}
