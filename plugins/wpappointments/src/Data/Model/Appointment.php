<?php
/**
 * Appointment model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Data\Model;

use WP_Post;

/**
 * Appointment model class
 */
class Appointment {
	/**
	 * Appointment title
	 *
	 * @var \WP_Post|null
	 */
	public $appointment = null;

	/**
	 * Default query part for appointments
	 *
	 * @var array
	 */
	public $appointment_data = array();

	/**
	 * Appointment model constructor
	 *
	 * @param WP_User|int|array $appointment Appointment post object or appointment ID or appointment data array.
	 */
	public function __construct( $appointment = null ) {
		if ( is_numeric( $appointment ) ) {
			$this->appointment = get_post( $appointment );
		} elseif ( $appointment instanceof WP_Post ) {
			$this->appointment = $appointment;
		} elseif ( is_array( $appointment ) ) {
			$this->appointment_data = $appointment;
		}
	}

	/**
	 * Create appointment
	 *
	 * @return object|\WP_Error
	 */
	public function save() {
		$create_account = $this->appointment_data['create_account'] ?? false;
		$password       = $this->appointment_data['password'] ?? null;
		$customer       = $this->appointment_data['customer'] ?? null;
		$title          = $this->appointment_data['title'] ?? null;
		$meta           = $this->appointment_data['meta'] ?? array();

		if ( $password ) {
			$customer['password'] = $password;
		}

		if ( null !== $customer ) {
			$meta['customer'] = $customer;

			if ( is_array( $customer ) && $create_account ) {
				$customer       = new Customer( $customer );
				$saved_customer = $customer->save();

				$meta['customer_id'] = $saved_customer->user->ID;
			}
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => 'wpa-appointment',
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => $meta,
			),
			true
		);

		$appointment = $this->prepare_appointment_entity( $post_id, $meta );

		do_action( 'wpappointments_appointment_created', $appointment );

		return $appointment;
	}

	/**
	 * Update appointment
	 *
	 * @param array $data Appointment update data.
	 *
	 * @return array|\WP_Error
	 */
	public function update( $data ) {
		$id       = $this->appointment->ID ?? -1;
		$title    = $data['title'] ?? null;
		$meta     = $data['meta'] ?? array();
		$customer = $data['customer'] ?? null;

		if ( null !== $customer ) {
			$meta['customer'] = $customer;
		}

		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$current_appointment_meta = array(
			'status'      => get_post_meta( $valid_id, 'status', true ),
			'timestamp'   => get_post_meta( $valid_id, 'timestamp', true ),
			'duration'    => get_post_meta( $valid_id, 'duration', true ),
			'customer_id' => get_post_meta( $valid_id, 'customer_id', true ),
			'customer'    => get_post_meta( $valid_id, 'customer', true ),
		);
		$current_appointment      = $this->prepare_appointment_entity( $valid_id, $current_appointment_meta );

		$data = array(
			'ID'        => $valid_id,
			'post_type' => 'wpa-appointment',
		);

		if ( null !== $title ) {
			$data['post_title'] = $title;
		}

		$post_id = wp_update_post( $data, true );

		if ( is_wp_error( $post_id ) ) {
			do_action( 'wpappointments_appointment_update_error', $post_id );

			return $post_id;
		}

		foreach ( $meta as $key => $value ) {
			update_post_meta( $post_id, $key, $value );
		}

		$new_appointment = $this->prepare_appointment_entity( $post_id, $meta );

		if ( 'pending' === $new_appointment['status'] ) {
			do_action(
				'wpappointments_appointment_updated',
				$new_appointment,
				$current_appointment
			);
		} else {
			do_action(
				"wpappointments_appointment_{$new_appointment['status']}",
				$new_appointment,
				$current_appointment
			);
		}

		return $new_appointment;
	}

	/**
	 * Cancel appointment
	 *
	 * @return array|\WP_Error
	 */
	public function cancel() {
		$id = $this->appointment->ID ?? -1;

		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$meta = array(
			'status'      => get_post_meta( $valid_id, 'status', true ),
			'timestamp'   => get_post_meta( $valid_id, 'timestamp', true ),
			'duration'    => get_post_meta( $valid_id, 'duration', true ),
			'customer_id' => get_post_meta( $valid_id, 'customer_id', true ),
			'customer'    => get_post_meta( $valid_id, 'customer', true ),
		);

		$cancelled = update_post_meta( $valid_id, 'status', 'cancelled' );

		if ( ! $cancelled ) {
			return new \WP_Error( 'error', __( 'Appointment is already cancelled', 'wpappointments' ) );
		}

		do_action( 'wpappointments_appointment_cancelled', $this->prepare_appointment_entity( $valid_id, $meta ) );

		return $valid_id;
	}

	/**
	 * Confirm appointment
	 *
	 * @return int|\WP_Error
	 */
	public function confirm() {
		$id = $this->appointment->ID ?? -1;

		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$meta = array(
			'status'      => get_post_meta( $valid_id, 'status', true ),
			'timestamp'   => get_post_meta( $valid_id, 'timestamp', true ),
			'duration'    => get_post_meta( $valid_id, 'duration', true ),
			'customer_id' => get_post_meta( $valid_id, 'customer_id', true ),
			'customer'    => get_post_meta( $valid_id, 'customer', true ),
		);

		$confirmed = update_post_meta( $valid_id, 'status', 'confirmed' );

		if ( ! $confirmed ) {
			return new \WP_Error( 'error', __( 'Appointment is already confirmed', 'wpappointments' ) );
		}

		do_action( 'wpappointments_appointment_confirmed', $this->prepare_appointment_entity( $valid_id, $meta ) );

		return $valid_id;
	}

	/**
	 * Mark appointment as no show
	 *
	 * @param int $id Appointment ID.
	 *
	 * @return int|\WP_Error
	 */
	public function no_show( $id ) {
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$meta = array(
			'status'      => get_post_meta( $valid_id, 'status', true ),
			'timestamp'   => get_post_meta( $valid_id, 'timestamp', true ),
			'duration'    => get_post_meta( $valid_id, 'duration', true ),
			'customer_id' => get_post_meta( $valid_id, 'customer_id', true ),
			'customer'    => get_post_meta( $valid_id, 'customer', true ),
		);

		$no_show = update_post_meta( $valid_id, 'status', 'no_show' );

		if ( ! $no_show ) {
			return new \WP_Error( 'error', __( 'Appointment is already marked as no show', 'wpappointments' ) );
		}

		do_action( 'wpappointments_appointment_no_show', $this->prepare_appointment_entity( $valid_id, $meta ) );

		return $no_show;
	}

	/**
	 * Delete appointment
	 *
	 * @return int|\WP_Error
	 */
	public function delete() {
		$id = $this->appointment->ID ?? -1;

		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$status = get_post_meta( $id, 'status', true );

		if ( 'cancelled' !== $status ) {
			return new \WP_Error(
				'deleting_not_cancelled_appointment',
				__( 'Appointment must be cancelled before deleting', 'wpappointments' )
			);
		}

		$deleted = wp_delete_post( $id, true );

		if ( $deleted ) {
			return $deleted->ID;
		}

		return new \WP_Error(
			'deleting_appointment_unknown_error',
			__( 'Could not delete appointment', 'wpappointments' )
		);
	}

	/**
	 * Prepare appointment entity
	 *
	 * @param int   $post_id Post ID.
	 * @param array $meta Post meta.
	 *
	 * @return object
	 */
	protected function prepare_appointment_entity( $post_id, $meta ) {
		$length      = (int) get_option( 'wpappointments_appointments_defaultLength' );
		$timestamp   = $meta['timestamp'];
		$status      = $meta['status'];
		$duration    = $meta['duration'] ?? $length;
		$customer_id = $meta['customer_id'] ?? 0;
		$customer    = $meta['customer'] ?? null;

		if ( is_string( $customer ) ) {
			$customer = json_decode( $customer, true );
		}

		return array(
			'id'         => $post_id,
			'service'    => get_the_title( $post_id ),
			'timestamp'  => (int) $timestamp,
			'status'     => $status,
			'duration'   => (int) $duration,
			'customerId' => (int) $customer_id,
			'customer'   => $customer,
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
			return new \WP_Error( 'appointment_id_required', __( 'Appointment ID is required', 'wpappointments' ) );
		}

		if ( ! get_post( $post_id ) ) {
			return new \WP_Error( 'appointment_not_found', __( 'Appointment not found', 'wpappointments' ) );
		}

		return $post_id;
	}
}
