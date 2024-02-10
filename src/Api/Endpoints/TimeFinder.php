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
use WPAppointments\Utils\Availability;
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
		$month        = $request->get_param( 'currentMonth' );
		$year         = $request->get_param( 'currentYear' );
		$date         = new \DateTime( $year . '-' . $month . '-01' );
		$is_available = Availability::is_available( $date, 30 );
		$availability = Availability::get_day_availability( $date );
		$month        = Availability::get_month_availability( $date );

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'availability' => (object) array(
						'today' => $availability,
						'month' => $month,
					),
					'is_available' => $is_available,
				),
			)
		);
	}
}
