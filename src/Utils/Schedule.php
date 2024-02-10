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
		$start = clone $date;
		$start->setTime( (int) $schedule->start->hour, (int) $schedule->start->minute );

		$end = clone $date;
		$end->setTime( (int) $schedule->end->hour, (int) $schedule->end->minute );

		$interval = new DateInterval( 'PT30M' );
		$period   = new DatePeriod( $start, $interval, $end );

		return $period;
	}
}
