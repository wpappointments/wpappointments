<?php
/**
 * Appointment model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Model;

/**
 * Appointment model class
 */
class AppointmentPost {
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

	/**
	 * Create appointment
	 *
	 * @param array $meta Appointment post meta.
	 *
	 * @return array
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
	 *
	 * @param int $id Appointment ID.
	 *
	 * @return int|\WP_Error
	 */
	public function delete( $id ) {
		$deleted = wp_delete_post( $id, true );

		if ( $deleted ) {
			return $deleted->ID;
		}

		return \WP_Error( 'error', __( 'Could not delete appointment', 'wpappointments' ) );
	}
}
