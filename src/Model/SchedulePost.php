<?php
/**
 * Schedule model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Model;

/**
 * Appointment model class
 */
class SchedulePost {
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
