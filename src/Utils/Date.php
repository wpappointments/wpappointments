<?php
/**
 * Date utility class
 *
 * @package WPAppointments
 */

namespace WPAppointments\Utils;

/**
 * Date utility class
 */
class Date {
	/**
	 * Create date range
	 *
	 * @param string $start Start date.
	 * @param string $end End date.
	 *
	 * @return DatePeriod
	 */
	public static function create_date_range( $start, $end ) {
		$start_date = new \DateTime( $start );
		$end_date   = new \DateTime( $end );
		$interval   = new \DateInterval( 'P1D' );
		$period     = new \DatePeriod( $start_date, $interval, $end_date );
		return $period;
	}
}
