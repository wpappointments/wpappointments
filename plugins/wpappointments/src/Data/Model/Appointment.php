<?php
/**
 * Appointment model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Data\Model;

use WP_Error;
use WP_Post;

/**
 * Appointment model class
 */
class Appointment {
	/**
	 * Appointment title
	 *
	 * @var \WP_Post|\WP_Error
	 */
	public $appointment;

	/**
	 * Appointment data array
	 *
	 * @var array
	 */
	public $appointment_data = array();

	/**
	 * Appointment model constructor
	 *
	 * @param WP_User|int|array $appointment Appointment post object or appointment ID or appointment data array.
	 */
	public function __construct( $appointment ) {
		if ( $appointment instanceof WP_Post ) {
			$this->appointment = $appointment;
		} elseif ( is_array( $appointment ) ) {
			$this->appointment_data = $appointment;
		} else {
			$valid_id = $this->validate_post_id( $appointment );

			if ( is_wp_error( $valid_id ) ) {
				$this->appointment = $valid_id;
			} else {
				$this->appointment = get_post( $valid_id );
			}
		}
	}

	/**
	 * Create appointment
	 *
	 * @return Appointment|\WP_Error
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
			$meta['customer'] = maybe_serialize( $customer );

			if ( is_array( $customer ) && $create_account ) {
				$customer       = new Customer( $customer );
				$saved_customer = $customer->save();

				if ( is_wp_error( $saved_customer ) ) {
					$code = $saved_customer->get_error_code();

					if ( 'existing_user_login' === $code ) {
						$user                = get_user_by( 'login', $customer->get_user()['email'] );
						$meta['customer_id'] = $user->ID;
					}
				} else {
					$meta['customer_id'] = $saved_customer->get_user()->ID;
				}
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

		$this->appointment = get_post( $post_id );
		$appointment       = $this->normalize();

		do_action( 'wpappointments_appointment_created', $appointment );

		return $this;
	}

	/**
	 * Update appointment
	 *
	 * @param array $data Appointment update data.
	 *
	 * @return Appointment|\WP_Error
	 */
	public function update( $data ) {
		if ( is_wp_error( $this->appointment ) ) {
			return $this->appointment;
		}

		$id       = $this->appointment->ID;
		$title    = $data['title'] ?? null;
		$meta     = $data['meta'] ?? array();
		$customer = $data['customer'] ?? null;

		if ( null !== $customer ) {
			$meta['customer'] = $customer;
		}

		$current_appointment = $this->normalize();

		$data = array(
			'ID'        => $id,
			'post_type' => 'wpa-appointment',
		);

		if ( null !== $title ) {
			$data['post_title'] = $title;
		}

		wp_update_post( $data, true );

		foreach ( $meta as $key => $value ) {
			update_post_meta( $id, $key, $value );
		}

		$this->appointment      = get_post( $id );
		$this->appointment_data = $meta;

		$new_appointment = $this->normalize();

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

		return $this;
	}

	/**
	 * Cancel appointment
	 *
	 * @return array|\WP_Error
	 */
	public function cancel() {
		if ( is_wp_error( $this->appointment ) ) {
			return $this->appointment;
		}

		$id = $this->appointment->ID;

		$cancelled = update_post_meta( $id, 'status', 'cancelled' );

		if ( ! $cancelled ) {
			return new \WP_Error(
				'appointment_already_cancelled',
				__( 'Appointment is already cancelled', 'wpappointments' )
			);
		}

		do_action( 'wpappointments_appointment_cancelled', $this->normalize() );

		return $id;
	}

	/**
	 * Confirm appointment
	 *
	 * @return int|\WP_Error
	 */
	public function confirm() {
		if ( is_wp_error( $this->appointment ) ) {
			return $this->appointment;
		}

		$id = $this->appointment->ID;

		$confirmed = update_post_meta( $id, 'status', 'confirmed' );

		if ( ! $confirmed ) {
			return new \WP_Error(
				'appointment_already_confirmed',
				__( 'Appointment is already confirmed', 'wpappointments' )
			);
		}

		do_action( 'wpappointments_appointment_confirmed', $this->normalize() );

		return $id;
	}

	/**
	 * Delete appointment
	 *
	 * @return int|\WP_Error
	 */
	public function delete() {
		if ( is_wp_error( $this->appointment ) ) {
			return $this->appointment;
		}

		$id = $this->appointment->ID;

		$status = get_post_meta( $id, 'status', true );

		if ( ! $status ) {
			return new \WP_Error(
				'appointment_not_found',
				__( 'Appointment not found', 'wpappointments' )
			);
		}

		if ( 'cancelled' !== $status ) {
			return new \WP_Error(
				'deleting_not_cancelled_appointment',
				__( 'Appointment must be cancelled before deleting', 'wpappointments' )
			);
		}

		$deleted = wp_delete_post( $id, true );

		do_action( 'wpappointments_appointment_deleted', $this->normalize() );

		return $deleted->ID;
	}

	/**
	 * Normalize user object
	 *
	 * @param callable|null $normalizer Normalizer function.
	 *
	 * @return mixed
	 */
	public function normalize( $normalizer = null ) {
		if ( ! $normalizer ) {
			$normalizer = array( __CLASS__, 'default_normalizer' );
		}

		return call_user_func( $normalizer, $this->appointment );
	}

	/**
	 * Default normalizer
	 *
	 * @param WP_Post $appointment Appointment post object.
	 *
	 * @return array
	 */
	public static function default_normalizer( $appointment ) {
		$length = (int) get_option( 'wpappointments_appointments_defaultLength' );

		$timestamp   = get_post_meta( $appointment->ID, 'timestamp', true );
		$status      = get_post_meta( $appointment->ID, 'status', true );
		$duration    = get_post_meta( $appointment->ID, 'duration', true ) ?? $length;
		$customer_id = get_post_meta( $appointment->ID, 'customer_id', true ) ?? 0;
		$customer    = get_post_meta( $appointment->ID, 'customer', true ) ?? null;

		return array(
			'id'          => $appointment->ID,
			'service'     => $appointment->post_title,
			'status'      => $status,
			'timestamp'   => (int) $timestamp,
			'duration'    => (int) $duration,
			'customer_id' => (int) $customer_id,
			'customer'    => maybe_unserialize( $customer ),
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
