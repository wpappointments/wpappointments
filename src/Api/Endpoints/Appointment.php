<?php
/**
 * Example controller (appointment endpoint)
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;

/**
 * Appointment endpoint
 */
class Appointment extends Controller {
	/**
	 * Override controller init method and register the route
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/appointment',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_appointment' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Create appointment post
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create_appointment( WP_REST_Request $request ) {
		$appointment = new \WPAppointments\Model\Appointment();
		$appointment->create( $request->get_params() );

		if ( $appointment->get_error() ) {
			return self::error( $appointment->get_error_message() );
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message' => __( 'Appointment created successfully', 'wpappointments' ),
				),
			)
		);
	}
}
