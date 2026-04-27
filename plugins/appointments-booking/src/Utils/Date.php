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
	 * Check if a date range is fully contained within another date range
	 *
	 * @param \DatePeriod $range    Date range to check.
	 * @param \DatePeriod $range_in Date range that should contain the first.
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
	 * Check if two date ranges have any overlap
	 *
	 * Two ranges overlap when: start1 < end2 AND start2 < end1.
	 *
	 * @param \DatePeriod $range_a First date range.
	 * @param \DatePeriod $range_b Second date range.
	 *
	 * @return bool
	 */
	public static function date_ranges_intersect( $range_a, $range_b ) {
		return $range_a->getStartDate() < $range_b->getEndDate()
		&& $range_b->getStartDate() < $range_a->getEndDate();
	}

	/**
	 * Check if a date range is fully contained within any of the provided date ranges
	 *
	 * @param \DatePeriod $range     Date range to check.
	 * @param array       $ranges_in Array of DatePeriod ranges.
	 *
	 * @return bool
	 */
	public static function date_range_overlaps_with_any_date_range( $range, $ranges_in ) {
		foreach ( $ranges_in as $range_in ) {
			if ( self::date_range_overlaps_another_date_range( $range, $range_in ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if a date range intersects with any of the provided date ranges
	 *
	 * @param \DatePeriod $range     Date range to check.
	 * @param array       $ranges_in Array of DatePeriod ranges.
	 *
	 * @return bool
	 */
	public static function date_range_intersects_any( $range, $ranges_in ) {
		foreach ( $ranges_in as $range_in ) {
			if ( self::date_ranges_intersect( $range, $range_in ) ) {
				return true;
			}
		}

		return false;
	}
}
