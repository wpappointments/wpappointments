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
					'is_available' => $is_available,
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
		$first_day_timestamp = $request->get_param( 'firstDay' );
		$last_day_timestamp  = $request->get_param( 'lastDay' );
		$timezone = wp_timezone_string();

		$first_day = new \DateTime();
		$first_day->setTimestamp( $first_day_timestamp );
		$first_day->setTimezone( new \DateTimeZone( $timezone ) );

		$last_day  = new \DateTime();
		$last_day->setTimestamp( $last_day_timestamp );
		$last_day->setTimezone( new \DateTimeZone( $timezone ) );

		$day_interval = new \DateInterval( 'P1D' );
		$day_range = new \DatePeriod( $first_day, $day_interval, $last_day, \DatePeriod::INCLUDE_END_DATE );

		// $length = (int) get_option( 'wpappointments_appointments_timePickerPrecision' );
		// $hour_interval = new \DateInterval( 'PT' . $length . 'M' );
		// $range = new \DatePeriod( $first_day, $hour_interval, $last_day );
	
		// $slots = array();

		// foreach ( $range as $slot ) {
		// 	$date_range = Date::create_date_range( $slot->format('Y-m-d H:i:s'), $slot->format('Y-m-d H:i:s') );
		// 	$available = Date::date_ranges_contain_another_date_range( $date_range, $schedule_periods );
		// 	array_push($slots, ((int) $slot->format('U')) * 1000);
		// }

		$availability = array();
		$i = 0;
		$j = 0;

		foreach ( $day_range as $day ) {
			if ($i > 0 && $i % 7 === 0) {
				$j++;
			}

			if (!isset($availability[$j])) {
				$availability[$j] = array();
			}

			array_push($availability[$j], (object) [
				'availability' => Availability::get_day_availability( $day, false, true ),
				'date' => $day->format('c'),
			]);

			$i++;
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => $availability,
			)
		);
	}
}
