<?php
/**
 * Availability controller
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Utils\Availability;

/**
 * Availability endpoint class
 */
class AvailabilityController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/availability',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'availability' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/calendar-availability',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'calendar_availability' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Get month availability
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function availability( WP_REST_Request $request ) {
		$month    = $request->get_param( 'currentMonth' );
		$year     = $request->get_param( 'currentYear' );
		$timezone = $request->get_param( 'timezone' );

		$availability = Availability::get_month_days_availability(
			$month,
			$year,
			$timezone
		);

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'availability' => (object) array(
						'month' => $availability,
					),
				),
			)
		);
	}

	/**
	 * Get day slots for front end calendar
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function calendar_availability( WP_REST_Request $request ) {
		$calendar = $request->get_param( 'calendar' );
		$timezone = $request->get_param( 'timezone' );
		$trim     = $request->get_param( 'trim' ) === 'true' ? true : false;
		$calendar = json_decode( $calendar );

		$availability = Availability::get_month_calendar_availability( $calendar, $timezone, $trim );

		return self::response(
			array(
				'type' => 'success',
				'data' => (object) array(
					'availability' => $availability,
				),
			)
		);
	}
}
