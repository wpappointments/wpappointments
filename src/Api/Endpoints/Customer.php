<?php
/**
 * Customer controller
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;

/**
 * Customer endpoint
 */
class Customer extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/customer',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_customers' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/customer',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_customer' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Get all WP Appointment customers
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_all_customers( WP_REST_Request $request ) {
		$users_query = new \WP_User_Query(
			array(
				'role' => 'wpa-customer',
			)
		);

		$users = array();

		foreach ( $users_query->get_results() as $user ) {
			$users[] = array(
				'id'         => $user->ID,
				'name'       => $user->display_name,
				'email'      => $user->user_email,
				'phone'      => get_user_meta( $user->ID, 'phone', true ),
				'created_at' => $user->user_registered,
				'updated_at' => $user->user_modified,
			);
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => (object) array(
					'customers' => $users,
				),
			)
		);
	}

	/**
	 * Create a new WP Appointment customer
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create_customer( WP_REST_Request $request ) {
		$name  = $request->get_param( 'name' );
		$email = $request->get_param( 'email' );
		$phone = $request->get_param( 'phone' );

		$user_id = wp_insert_user(
			array(
				'user_login'   => $email,
				'user_pass'    => wp_generate_password(),
				'user_email'   => $email,
				'display_name' => $name,
				'role'         => 'wpa-customer',
			)
		);

		if ( is_wp_error( $user_id ) ) {
			return self::response(
				array(
					'type' => 'error',
					'data' => (object) array(
						'message' => $user_id->get_error_message(),
					),
				)
			);
		}

		update_user_meta( $user_id, 'phone', $phone );

		return self::response(
			array(
				'type' => 'success',
				'data' => (object) array(
					'message'  => __( 'Customer created successfully', 'wpappointments' ),
					'customer' => array(
						'id'    => $user_id,
						'name'  => $name,
						'email' => $email,
						'phone' => $phone,
					),
				),
			)
		);
	}
}
