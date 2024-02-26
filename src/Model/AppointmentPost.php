<?php
/**
 * Appointment model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Model;

use DateTime;

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
		'meta_key'    => 'timestamp',
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
				'meta_query'     => array(),
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
					'status'      => $meta['status'][0],
					'timestamp'   => $meta['timestamp'][0],
					'customer_id' => $meta['customer_id'][0],
					'customer'    => $meta['customer'][0],
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
		$date_query = array(
			array(
				'key'     => 'timestamp',
				'value'   => time(),
				'compare' => '>=',
			),
			array(
				'key'     => 'timestamp',
				'value'   => time() + 60 * 60 * 24 * 7,
				'compare' => '<=',
			),
		);

		if ( isset( $query['period'] ) ) {
			$period = $query['period'];

			if ( 'month' === $period ) {
				$date_query[1]['value'] = time() + 60 * 60 * 24 * 30;
			}

			if ( 'year' === $period ) {
				$date_query[1]['value'] = time() + 60 * 60 * 24 * 365;
			}

			if ( 'all' === $period ) {
				unset( $date_query[1] );
			}
		}

		$status = 'confirmed';

		if ( isset( $query['status'] ) ) {
			$status = $query['status'];
		}

		$status_query = '' === $status ? array() : array(
			'key'     => 'status',
			'value'   => $status,
			'compare' => '=',
		);

		$default_query = array_merge(
			$this->default_query_part,
			array(
				'posts_per_page' => 10,
				'meta_query'     => array_merge(
					array(
						'relation' => 'AND',
						$status_query,
					),
					$date_query
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
					'status'      => $meta['status'][0],
					'timestamp'   => $meta['timestamp'][0],
					'customer_id' => $meta['customer_id'][0],
					'customer'    => $meta['customer'][0],
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
	 * Get day appointments
	 *
	 * @param \DateTimeImmutable $date Date.
	 *
	 * @return object
	 */
	public function get_day_appointments( $date ) {
		$day_start = $date;
		$day_start->setTime( 0, 0, 0 );
		$day_start = (int) $day_start->getTimestamp();

		$day_end = $date;
		$day_end->setTime( 23, 59, 59 );
		$day_end = (int) $day_end->getTimestamp();

		return $this->get_date_range_appointments( $day_start, $day_end );
	}

	/**
	 * Get date range appointments
	 * 
	 * @param \DateTimeImmutable $start_date Start date.
	 * @param \DateTimeImmutable $end_date   End date.
	 * 
	 * @return object
	 */
	public function get_date_range_appointments( $start_date, $end_date ) {
		$query = new \WP_Query(
			array_merge(
				$this->default_query_part,
				array(
					'posts_per_page' => -1,
					'meta_query'     => array(
						'relation' => 'AND',
						array(
							'key'     => 'timestamp',
							'value'   => $start_date,
							'compare' => '>=',
						),
						array(
							'key'     => 'timestamp',
							'value'   => $end_date,
							'compare' => '<=',
						),
					),
				)
			)
		);

		$appointments = array();

		foreach ( $query->posts as $post ) {
			$meta           = get_post_meta( $post->ID );
			$appointments[] = $this->prepare_appointment_entity(
				$post->ID,
				array(
					'status'    => $meta['status'][0],
					'timestamp' => $meta['timestamp'][0],
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
	 * @param object|int|null $customer Customer to assign to appointment or customer object to create customer.
	 *
	 * @return array|\WP_Error
	 */
	public function create( $title = 'Appointment', $meta = array(), $customer = null ) {
		if ( null !== $customer ) {
			$customer_id = $customer;

			if ( is_object( $customer ) ) {
				$customer_id = ( new Customer() )->create( $customer );
			}

			$meta['customer_id'] = $customer_id;
		}

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
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$data = array(
			'ID'        => $valid_id,
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
	 * @return array|\WP_Error
	 */
	public function cancel( $id ) {
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$cancelled = update_post_meta( $valid_id, 'status', 'cancelled' );

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
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

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
		$length      = (int) get_option( 'wpappointments_appointments_defaultLength' );
		$timestamp   = $meta['timestamp'];
		$status      = $meta['status'];
		$duration    = $meta['duration'] ?? $length;
		$customer_id = $meta['customer_id'];

		$customer = $meta['customer'];

		if ( is_string( $customer ) ) {
			$customer = json_decode( $customer );
		}

		return (object) array(
			'id'         => $post_id,
			'service'    => get_the_title( $post_id ),
			'timestamp'  => (int) $timestamp,
			'status'     => $status,
			'duration'   => (int) $duration,
			'customerId' => (int) $customer_id,
			'customer'   => $customer,
			'actions'    => (object) array(
				'delete' => (object) array(
					'name'        => 'DeleteAppointment',
					'label'       => 'Delete',
					'method'      => 'DELETE',
					'uri'         => rest_url( WPAPPOINTMENTS_API_NAMESPACE . '/appointment/' . $post_id ),
					'isDangerous' => true,
				),
				'edit'   => (object) array(
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
	 * Parse timestamp
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
	 * Validate post ID
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return int|\WP_Error
	 */
	protected function validate_post_id( $post_id ) {
		if ( ! $post_id ) {
			return new \WP_Error( 'error', __( 'Appointment ID is required', 'wpappointments' ) );
		}

		if ( ! get_post( $post_id ) ) {
			return new \WP_Error( 'error', __( 'Appointment not found', 'wpappointments' ) );
		}

		return $post_id;
	}
}
