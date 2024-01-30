<?php
/**
 * Time finder controller
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Utils\Date;

/**
 * TimeFinder endpoint
 */
class TimeFinder extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/availability',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'availability' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Get day slots
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function availability( WP_REST_Request $request ) {
		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'availability' => Date::create_day_slots(),
				),
			)
		);
	}
}
