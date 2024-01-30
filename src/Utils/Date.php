<?php
/**
 * Date utility class
 *
 * @package WPAppointments
 */

namespace WPAppointments\Utils;

use DateTime;

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

	public static function create_day_slots() {
		$hours_in_day = 24;
		$start_hour   = 8;
		$end_hour     = 12;
		$slots        = array();
		$date         = new DateTime( 'today midnight' );
		$date->add( new \DateInterval( 'PT' . $start_hour . 'H' ) );

		for ( $i = $start_hour; $i < $end_hour * 2; $i++ ) {
			if ( $i > $start_hour ) {
				$date->add( new \DateInterval( 'PT30M' ) );
			}

			$available = true;

			if ( $i === $start_hour || $i === $end_hour * 2 - 1 ) {
				$available = false;
			}

			$slots[] = array(
				'start'     => clone $date,
				'available' => $available,
			);
		}

		return $slots;
	}
}
