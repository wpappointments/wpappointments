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
use WPAppointments\Utils\Schedule;
use WPAppointments\Model\Settings;

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

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/calendar-availability',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'calendar_availability' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/calendar-availability-v2',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'calendar_availability_v2' ),
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
		$availability = Availability::get_day_availability( $date, true );
		$month        = Availability::get_month_availability( $date );

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'availability' => (object) array(
						'today' => $availability,
						'month' => $month,
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
		$from     = $request->get_param( 'firstDay' );
		$to       = $request->get_param( 'lastDay' );
		$timezone = $request->get_param( 'timezone' );

		$slots = Availability::get_availability( $from, $to, $timezone, true );

		return self::response(
			array(
				'type' => 'success',
				'data' => (object) array(
					'availability' => $slots,
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
	public static function calendar_availability_v2( WP_REST_Request $request ) {
		$calendar = $request->get_param( 'calendar' );
		$timezone = $request->get_param( 'timezone' );
		$trim 	  = $request->get_param( 'trim' ) === 'true' ? true : false;
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
