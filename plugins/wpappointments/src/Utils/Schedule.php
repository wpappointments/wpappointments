<?php
/**
 * Schedule utility class
 *
 * @package WPAppointments
 */

namespace WPAppointments\Utils;

use DateTime;
use DatePeriod;
use DateInterval;
use WPAppointments\Data\Model\Settings;

/**
 * Schedule utility class
 */
class Schedule {
	/**
	 * Create date range
	 *
	 * @param object   $schedule Schedule.
	 * @param DateTime $date Date day of the date range.
	 *
	 * @return DatePeriod
	 */
	public static function convert_schedule_to_date_range( $schedule, $date ) {
		$settings             = new Settings();
		$use_default_timezone = $settings->get_setting( 'general', 'timezoneSiteDefault' );
		$custom_timezone      = $settings->get_setting( 'general', 'timezone' );
		$timezone             = $use_default_timezone ? wp_timezone_string() : $custom_timezone;

		$start = clone $date;
		$start->setTimezone( new \DateTimeZone( $timezone ) );
		$start->setTime( (int) $schedule->start->hour, (int) $schedule->start->minute );

		$end = clone $date;
		$end->setTimezone( new \DateTimeZone( $timezone ) );
		$end->setTime( (int) $schedule->end->hour, (int) $schedule->end->minute );

		$interval = new DateInterval( 'PT30M' );
		$period   = new DatePeriod( $start, $interval, $end );

		return $period;
	}
}
