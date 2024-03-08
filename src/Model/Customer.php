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
		$email          = sanitize_text_field( wp_unslash( $customer->email ) );
		$name           = sanitize_user( wp_unslash( $customer->name ), true );
		$create_account = sanitize_text_field( wp_unslash( $customer->create_account ) );
		$user_id        = null;

		if ( $create_account ) {
			$user_id = wp_insert_user(
				array(
					'user_login'   => $email ?: $name,
					'user_pass'    => $password ?? wp_generate_password(),
					'user_email'   => $email,
					'display_name' => $name,
					'role'         => 'wpa-customer',
				)
			);
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => 'wpa_customer',
				'post_status' => 'publish',
				'post_title'  => $email ?: $name,
			)
		);

		if ( is_wp_error( $post_id ) || $post_id === 0 ) {
			return new \WP_Error( 'wpa_customer_cpt_create_error', __( 'There was a problem with saving the customer.', 'wpappointments' ) );
		}

		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}

		update_user_meta( $user_id, 'phone', sanitize_text_field( $customer->phone ) );

		if ( $post_id && $user_id ) {
			update_post_meta( $post_id, 'user_id', $user_id );
		}

		return $user_id;
	}
}
