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
	 * @return Customer|\WP_Error
	 */
	public function save() {
		$email    = sanitize_text_field( wp_unslash( $this->user['email'] ), true );
		$name     = sanitize_user( wp_unslash( $this->user['name'] ), true );
		$phone    = sanitize_text_field( $this->user['phone'], true );
		$password = $this->user['password'] ?? wp_generate_password();

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
	 * @param object $customer Customer data object.
	 *
	 * @return Customer|\WP_Error
	 */
	public function update( $customer ) {
		$id = $this->validate_user_id( $this->user->ID );

		if ( is_wp_error( $id ) ) {
			return $id;
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

		return $this;
	}

	/**
	 * Delete customer
	 *
	 * @return bool|\WP_Error
	 */
	public function delete() {
		require_once ABSPATH . 'wp-admin/includes/user.php';

		$id = $this->validate_user_id( $this->user->ID );

		if ( is_wp_error( $id ) ) {
			return $id;
		}

		$deleted = wp_delete_user( $id );

		if ( ! $deleted ) {
			return new \WP_Error( 'cannot_delete_appointment', __( 'Could not delete appointment', 'wpappointments' ) );
		}

		return $id;
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

		return call_user_func( $normalizer, $this->user );
	}

	/**
	 * Default normalizer
	 *
	 * @param WP_User $user User object.
	 *
	 * @return array
	 */
	public static function default_normalizer( $user ) {
		$phone = get_user_meta( $user->ID, 'phone', true );

		return array(
			'id'      => $user->ID,
			'name'    => $user->display_name,
			'email'   => $user->user_email,
			'phone'   => $phone,
			'created' => $user->user_registered,
			'updated' => $user->user_registered,
		);
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
			return new \WP_Error( 'missing_user_id', __( 'User ID is required', 'wpappointments' ) );
		}

		if ( ! get_user_by( 'ID', $user_id ) ) {
			return new \WP_Error( 'user_not_found', __( 'User not found', 'wpappointments' ) );
		}

		return $user_id;
	}
}
