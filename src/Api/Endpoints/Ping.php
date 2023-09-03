<?php
/**
 * Example controller (ping endpoint)
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;

/**
 * Ping endpoint
 */
class Ping extends Controller {
	/**
	 * Override controller init method and register the route
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/ping',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'success_message' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/ping-error',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'error_message' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Get ping message
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function success_message( WP_REST_Request $request ) {
		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message' => 'Pong from WP Appointments! time: ' . time(),
				),
			)
		);
	}

	/**
	 * Raise an error when pinging
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function error_message( WP_REST_Request $request ) {
		return self::error( 'Ping errored (on purpose) - just showcasing error response.' );
	}
}
