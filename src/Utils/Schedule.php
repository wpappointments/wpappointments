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
		$timezone = wp_timezone_string();
		$start = clone $date;
		$start->setTime( (int) $schedule->start->hour, (int) $schedule->start->minute );
		$start->setTimezone( new \DateTimeZone( $timezone ) );

		$end = clone $date;
		$end->setTime( (int) $schedule->end->hour, (int) $schedule->end->minute );
		$end->setTimezone( new \DateTimeZone( $timezone ) );

		$interval = new DateInterval( 'PT30M' );
		$period   = new DatePeriod( $start, $interval, $end );

		return $period;
	}
}
