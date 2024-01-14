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
	 * Default query part for appointments
	 *
	 * @var array
	 */
	private $default_query_part = array(
		'post_type'   => 'appointment',
		'post_status' => 'publish',
		'orderby'     => 'meta_value',
		'meta_key'    => 'datetime',
		'order'       => 'ASC',
	);

	/**
	 * Get all appointments
	 *
	 * @param array $query Query params.
	 *
	 * @return object
	 */
	public function get_all( $query ) {
		$default_query = array_merge(
			$this->default_query_part,
			array(
				'posts_per_page' => -1,
				'meta_query'     => array(
					array(
						'key'     => 'status',
						'value'   => 'active',
						'compare' => '=',
					),
				),
			)
		);

		$query = new \WP_Query(
			array_merge(
				$default_query,
				(array) $query
			)
		);

		$appointments = array();

		foreach ( $query->posts as $post ) {
			$meta           = get_post_meta( $post->ID );
			$appointments[] = $this->prepare_appointment_entity(
				$post->ID,
				array(
					'status'   => $meta['status'][0],
					'datetime' => $meta['datetime'][0],
				)
			);
		}

		return (object) array(
			'appointments' => $appointments,
			'post_count'   => $query->post_count,
			'found_posts'  => $query->found_posts,
		);
	}

	/**
	 * Get upcoming appointments
	 *
	 * @param array $query Query params.
	 *
	 * @return object
	 */
	public function get_upcoming( $query ) {
		$default_query = array_merge(
			$this->default_query_part,
			array(
				'posts_per_page' => 10,
				'meta_query'     => array(
					'relation' => 'AND',
					array(
						'key'     => 'datetime',
						'value'   => time(),
						'compare' => '>=',
					),
					array(
						'key'     => 'datetime',
						'value'   => time() + 60 * 60 * 24 * 14,
						'compare' => '<=',
					),
					array(
						'key'     => 'status',
						'value'   => 'active',
						'compare' => '=',
					),
				),
			),
		);

		$query = new \WP_Query(
			array_merge(
				$default_query,
				(array) $query
			)
		);

		$appointments = array();

		foreach ( $query->posts as $post ) {
			$meta           = get_post_meta( $post->ID );
			$appointments[] = $this->prepare_appointment_entity(
				$post->ID,
				array(
					'status'   => $meta['status'][0],
					'datetime' => $meta['datetime'][0],
				)
			);
		}

		return (object) array(
			'appointments' => $appointments,
			'post_count'   => $query->post_count,
			'found_posts'  => $query->found_posts,
		);
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
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		return $this->prepare_appointment_entity( $post_id, $meta );
	}

	/**
	 * Update appointment
	 *
	 * @param int    $id   Appointment ID.
	 * @param string $title Appointment title.
	 * @param array  $meta Appointment post meta.
	 *
	 * @return array|\WP_Error
	 */
	public function update( $id, $title = null, $meta = array() ) {
		$data = array(
			'ID'        => $id,
			'post_type' => 'appointment',
		);

		if ( null !== $title ) {
			$data['post_title'] = $title;
		}

		$post_id = wp_update_post( $data, true );

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		foreach ( $meta as $key => $value ) {
			update_post_meta( $post_id, $key, $value );
		}

		return $this->prepare_appointment_entity( $post_id, $meta );
	}

	/**
	 * Cancel appointment
	 *
	 * @param int $id   Appointment ID.
	 *
	 * @return array
	 */
	public function cancel( $id ) {
		$cancelled = update_post_meta( $id, 'status', 'cancelled' );

		if ( ! $cancelled ) {
			return new \WP_Error( 'error', __( 'Appointment is already cancelled', 'wpappointments' ) );
		}

		return $cancelled;
	}

	/**
	 * Delete appointment
	 *
	 * @param int $id Appointment ID.
	 *
	 * @return int|\WP_Error
	 */
	public function delete( $id ) {
		$status = get_post_meta( $id, 'status', true );

		if ( 'cancelled' !== $status ) {
			return new \WP_Error( 'error', __( 'Appointment must be cancelled before deleting', 'wpappointments' ) );
		}

		$deleted = wp_delete_post( $id, true );

		if ( $deleted ) {
			return $deleted->ID;
		}

		return new \WP_Error( 'error', __( 'Could not delete appointment', 'wpappointments' ) );
	}

	/**
	 * Prepare appointment entity
	 *
	 * @param int   $post_id Post ID.
	 * @param array $meta Post meta.
	 *
	 * @return array
	 */
	protected function prepare_appointment_entity( $post_id, $meta ) {
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
}
