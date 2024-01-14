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
	public function get_all( $query ) {
		$query = new \WP_Query(
			array_merge(
				array(
					'post_type'      => 'appointment',
					'post_status'    => 'publish',
					'posts_per_page' => -1,
					'orderby'        => 'meta_value',
					'meta_key'       => 'datetime',
					'order'          => 'ASC',
					'meta_query'     => array(
						array(
							'key'     => 'status',
							'value'   => 'active',
							'compare' => '=',
						),
					),
				),
				(array) $query
			)
		);

		$appointments = array();
		$length       = (int) get_option( 'wpappointments_appointments_defaultLength' );

		foreach ( $query->posts as $post ) {
			$status    = get_post_meta( $post->ID, 'status', true );
			$timestamp = get_post_meta( $post->ID, 'datetime', true );
			$parsed    = $this->parse_datetime( $timestamp );
			$date      = $parsed['date'];
			$time      = $parsed['time'];

			$appointments[] = array(
				'id'         => $post->ID,
				'title'      => $post->post_title,
				'date'       => $date,
				'time'       => $time,
				'timeFromTo' => $time . ' - ' . wp_date( 'H:i', $timestamp + 60 * $length ),
				'timestamp'  => $timestamp,
				'status'     => $status,
				'actions'    => (object) array(
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
	 * Get upcoming appointments
	 *
	 * @param array $query Query params.
	 *
	 * @return array
	 */
	public function get_upcoming( $query ) {
		$query = new \WP_Query(
			array_merge(
				array(
					'post_type'      => 'appointment',
					'post_status'    => 'publish',
					'posts_per_page' => 10,
					'orderby'        => 'meta_value',
					'meta_key'       => 'datetime',
					'order'          => 'ASC',
					'meta_query'     => array(
						'relation' => 'AND',
						array(
							'key'     => 'datetime',
							'value'   => time(),
							'compare' => '>=',
						),
						array(
							'key'     => 'datetime',
							'value'   => time() + 60 * 60 * 24 * 7,
							'compare' => '<=',
						),
						array(
							'key'     => 'status',
							'value'   => 'active',
							'compare' => '=',
						),
					),
				),
				(array) $query
			)
		);

		$appointments = array();
		$length       = (int) get_option( 'wpappointments_appointments_defaultLength' );

		foreach ( $query->posts as $post ) {
			$status    = get_post_meta( $post->ID, 'status', true );
			$timestamp = get_post_meta( $post->ID, 'datetime', true );
			$parsed    = $this->parse_datetime( $timestamp );
			$date      = $parsed['date'];
			$time      = $parsed['time'];

			$appointments[] = array(
				'id'         => $post->ID,
				'title'      => $post->post_title,
				'date'       => $date,
				'time'       => $time,
				'timeFromTo' => $time . ' - ' . wp_date( 'H:i', $timestamp + 60 * $length ),
				'timestamp'  => $timestamp,
				'parsed'     => $parsed,
				'status'     => $status,
				'actions'    => (object) array(
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
	 * @param string $title Appointment title.
	 * @param array  $meta Appointment post meta.
	 *
	 * @return array
	 */
	public function create( $title = 'Appointment', $meta = array() ) {
		$post_id = wp_insert_post(
			array(
				'post_type'   => 'appointment',
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => $meta,
			)
		);

		$length    = (int) get_option( 'wpappointments_appointments_defaultLength' );
		$timestamp = $meta['datetime'];
		$parsed    = $this->parse_datetime( $timestamp );
		$date      = $parsed['date'];
		$time      = $parsed['time'];

		return array(
			'id'         => $post_id,
			'title'      => $title,
			'date'       => $date,
			'time'       => $time,
			'timeFromTo' => $time . ' - ' . wp_date( 'H:i', $timestamp + 60 * $length ),
			'timestamp'  => $timestamp,
			'status'     => 'active',
			'actions'    => (object) array(
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
	 * Update appointment
	 *
	 * @param int    $id   Appointment ID.
	 * @param string $title Appointment title.
	 * @param array  $meta Appointment post meta.
	 *
	 * @return array
	 */
	public function update( $id, $title, $meta = array() ) {
		$post_id = wp_update_post(
			array(
				'ID'          => $id,
				'post_type'   => 'appointment',
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => $meta,
			)
		);

		$length    = (int) get_option( 'wpappointments_appointments_defaultLength' );
		$timestamp = $meta['datetime'];
		$status    = $meta['status'];
		$parsed    = $this->parse_datetime( $timestamp );
		$date      = $parsed['date'];
		$time      = $parsed['time'];

		return array(
			'id'         => $post_id,
			'title'      => get_the_title( $post_id ),
			'date'       => $date,
			'time'       => $time,
			'timeFromTo' => $time . ' - ' . wp_date( 'H:i', $timestamp + 60 * $length ),
			'timestamp'  => $timestamp,
			'status'     => $status,
			'actions'    => (object) array(
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
	 * Cancel appointment
	 *
	 * @param int $id   Appointment ID.
	 *
	 * @return array
	 */
	public function cancel( $id ) {
		return update_post_meta( $id, 'status', 'cancelled' );
	}

	/**
	 * Parse datetime
	 *
	 * @param int $timestamp Timestamp.
	 *
	 * @return array
	 */
	protected function parse_datetime( $timestamp ) {
		$is_today    = gmdate( 'Ymd' ) === gmdate( 'Ymd', $timestamp );
		$is_tomorrow = gmdate( 'Ymd', strtotime( 'tomorrow' ) ) === gmdate( 'Ymd', $timestamp );

		$time = wp_date( 'H:i', $timestamp );
		$date = wp_date( 'D, F jS, Y', $timestamp );

		if ( $is_today ) {
			$date = __( 'Today', 'wpappointments' );
		} elseif ( $is_tomorrow ) {
			$date = __( 'Tomorrow', 'wpappointments' );
		}

		return array(
			'date' => $date,
			'time' => $time,
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

		return new \WP_Error( 'error', __( 'Could not delete appointment', 'wpappointments' ) );
	}
}
