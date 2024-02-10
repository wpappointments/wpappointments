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

	/**
	 * Check if a date or date range is available
	 *
	 * @param DatePeriod $range Date or date range to check if contained.
	 * @param DatePeriod $range_in Date or date range to check if contains.
	 *
	 * @return bool
	 */
	public static function date_range_contains_another_date_range( $range, $range_in ) {
		$range_start    = $range->getStartDate();
		$range_end      = $range->getEndDate();
		$range_in_start = $range_in->getStartDate();
		$range_in_end   = $range_in->getEndDate();
		return $range_start >= $range_in_start && $range_end <= $range_in_end;
	}

	/**
	 * Check if a date ranges contain another date range
	 *
	 * @param array      $ranges Date ranges.
	 * @param DatePeriod $range_in Date or date range to check if contains.
	 *
	 * @return bool
	 */
	public static function date_ranges_contain_another_date_range( $range, $ranges_in ) {
		$contains = false;

		foreach ( $ranges_in as $range_in ) {
			if ( self::date_range_contains_another_date_range( $range, $range_in ) ) {
				$contains = true;
				break;
			}
		}

		return $contains;
	}

	public static function create_day_slots() {
		$start_hour = 0;
		$end_hour   = 24;
		$slots      = array();
		$date       = new DateTime( 'today midnight' );
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
