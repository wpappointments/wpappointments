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
	 * Check if a date range overlaps another date range
	 *
	 * @param DatePeriod $range Date or date range to check if overlaps.
	 * @param DatePeriod $range_in Date or date range to check if overlaps.
	 *
	 * @return bool
	 */
	public static function date_range_overlaps_another_date_range( $range, $range_in ) {
		$range_start    = $range->getStartDate();
		$range_end      = $range->getEndDate();
		$range_in_start = $range_in->getStartDate();
		$range_in_end   = $range_in->getEndDate();
		return $range_start >= $range_in_start && $range_end <= $range_in_end;
	}

	/**
	 * Check if a date range overlaps with any date range from provided date ranges
	 *
	 * @param DatePeriod $range Date ranges.
	 * @param array      $ranges_in Date or date range to check if contains.
	 *
	 * @return bool
	 */
	public static function date_range_overlaps_with_any_date_range( $range, $ranges_in ) {
		$contains = false;

		foreach ( $ranges_in as $range_in ) {
			if ( self::date_range_overlaps_another_date_range( $range, $range_in ) ) {
				$contains = true;
				break;
			}
		}

		return $contains;
	}
}
