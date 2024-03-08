<?php
/**
 * Customer model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Model;

/**
 * Customer model class
 */
class Customer {
	/**
	 * Create new customer
	 *
	 * @param object $customer Customer data object.
	 * @param string $password Customer password in plain text.
	 *
	 * @return int|\WP_Error
	 */
	public function create( $customer, $password = null ) {
		$email = sanitize_text_field( wp_unslash( $customer->email ), true );
		$name  = sanitize_user( wp_unslash( $customer->name ), true );

		$user_id = wp_insert_user(
			array(
				'user_login'   => $email ?: $name,
				'user_pass'    => $password ?? wp_generate_password(),
				'user_email'   => $email,
				'display_name' => $name,
				'role'         => 'wpa-customer',
			)
		);

		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}

		update_user_meta( $user_id, 'phone', sanitize_text_field( $customer->phone ) );

		return $user_id;
	}
}
