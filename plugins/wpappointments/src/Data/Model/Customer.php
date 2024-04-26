<?php
/**
 * Customer model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Data\Model;

use WP_User;

/**
 * Customer model class
 */
class Customer {
	/**
	 * User object
	 *
	 * @var \WP_User|array|null
	 */
	public $user = null;

	/**
	 * Customer model constructor
	 *
	 * @param WP_User|int|array $user User object or user ID or user data array.
	 */
	public function __construct( $user = null ) {
		if ( is_numeric( $user ) ) {
			$this->user = get_user_by( 'ID', $user );
		} elseif ( $user instanceof WP_User ) {
			$this->user = $user;
		} elseif ( is_array( $user ) ) {
			$this->user = $user;
		}
	}

	/**
	 * Save new customer user in database
	 *
	 * @param object $customer_data Customer data object.
	 * @param string $password Customer password in plain text.
	 *
	 * @return \WP_User|\WP_Error
	 */
	public function save() {
		$email    = sanitize_text_field( wp_unslash( $this->user['email'] ), true );
		$name     = sanitize_user( wp_unslash( $this->user['name'] ), true );
		$phone    = sanitize_text_field( $this->user['phone'], true );
		$password = $this->user['password'];

		$saved_user_id = wp_insert_user(
			array(
				'user_login'   => $email,
				'user_pass'    => $password ?? wp_generate_password(),
				'user_email'   => $email,
				'display_name' => $name,
				'role'         => 'wpa-customer',
			)
		);

		if ( is_wp_error( $saved_user_id ) ) {
			return $saved_user_id;
		}

		update_user_meta( $saved_user_id, 'phone', $phone );

		$this->user = get_user_by( 'id', $saved_user_id );

		return $this;
	}

	/**
	 * Update customer
	 *
	 * @param int    $id       Customer ID.
	 * @param object $customer Customer data object.
	 *
	 * @return \WP_User|\WP_Error
	 */
	public function update( $customer ) {
		$id = $this->user->ID;

		$valid_id = $this->validate_user_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$user = get_user_by( 'ID', $id );

		if ( ! $user ) {
			return new \WP_Error( 'error', __( 'User not found', 'wpappointments' ) );
		}

		$email = sanitize_text_field( wp_unslash( $customer['email'] ), true );
		$name  = sanitize_user( wp_unslash( $customer['name'] ), true );
		$phone = sanitize_text_field( $customer['phone'], true );

		$update = wp_update_user(
			array(
				'ID'           => $id,
				'user_login'   => $email ? $email : $name,
				'user_email'   => $email,
				'display_name' => $name,
			)
		);

		if ( is_wp_error( $update ) ) {
			return $update;
		}

		update_user_meta( $id, 'phone', $phone );

		return get_user_by( 'id', $id );
	}

	/**
	 * Delete customer
	 *
	 * @return bool|\WP_Error
	 */
	public function delete() {
		$id = $this->user->ID;

		$valid_id = $this->validate_user_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$deleted = wp_delete_user( $id );

		if ( $deleted ) {
			return true;
		}

		return new \WP_Error( 'error', __( 'Could not delete appointment', 'wpappointments' ) );
	}

	/**
	 * Normalize user object
	 *
	 * @param callable $normalizer Normalizer function.
	 *
	 * @return mixed
	 */
	public function normalize( $normalizer ) {
		return call_user_func( $normalizer, $this->user );
	}

	/**
	 * Validate user ID
	 *
	 * @param int $user_id User ID.
	 *
	 * @return int|\WP_Error
	 */
	protected function validate_user_id( $user_id ) {
		if ( ! $user_id ) {
			return new \WP_Error( 'error', __( 'User ID is required', 'wpappointments' ) );
		}

		if ( ! get_user_by( 'ID', $user_id ) ) {
			return new \WP_Error( 'error', __( 'User not found', 'wpappointments' ) );
		}

		return $user_id;
	}
}
