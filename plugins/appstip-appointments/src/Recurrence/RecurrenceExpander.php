<?php
/**
 * Recurrence expander
 *
 * Expands a master appointment's RRULE into concrete occurrences on read.
 * Core owns this so both recurring bookings and (future) schedule recurrence
 * can reuse the exact same expansion semantics.
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Recurrence;

use DateTime;
use DateTimeZone;
use RRule\RRule;

/**
 * Expand RRULE strings into occurrence timestamps.
 *
 * Timestamps are unix ints in UTC, matching the `timestamp` / `end_timestamp`
 * meta convention. Expansion is performed in a wall-clock timezone so that a
 * weekly/daily/monthly rule keeps the same local time across DST transitions;
 * the resulting occurrences are converted back to unix UTC ints.
 */
class RecurrenceExpander {
	/**
	 * Hard cap on occurrences returned from a single expansion.
	 *
	 * A safety net against pathological rules (e.g. a wide range crossed with a
	 * high-frequency RRULE). Expansion stops once this many occurrences are
	 * collected, bounding CPU/memory regardless of the rule or range.
	 *
	 * @var int
	 */
	const MAX_OCCURRENCES = 1000;

	/**
	 * Whether an appointment is recurring.
	 *
	 * @param string|null $rrule Stored RRULE string (may be empty/null).
	 *
	 * @return bool
	 */
	public static function is_recurring( $rrule ) {
		return is_string( $rrule ) && '' !== trim( $rrule );
	}

	/**
	 * Expand a master RRULE into occurrences overlapping a range.
	 *
	 * Each occurrence preserves the master's duration
	 * (occ_end = occ_start + (master_end - master_start)). Occurrences whose
	 * start matches an EXDATE timestamp are dropped.
	 *
	 * @param string             $rrule        RRULE string (without DTSTART).
	 * @param int                $master_start Master start, unix UTC.
	 * @param int                $master_end   Master end, unix UTC.
	 * @param int                $range_start  Range start, unix UTC (inclusive).
	 * @param int                $range_end    Range end, unix UTC (inclusive).
	 * @param int[]              $exceptions   EXDATE start timestamps to skip (unix UTC).
	 * @param \DateTimeZone|null $timezone     Wall-clock timezone for expansion. Defaults to UTC.
	 *
	 * @return array<int, array{start:int, end:int}> Occurrences as unix UTC start/end pairs.
	 */
	public static function expand_in_range( $rrule, $master_start, $master_end, $range_start, $range_end, $exceptions = array(), $timezone = null ) {
		if ( ! self::is_recurring( $rrule ) ) {
			return array();
		}

		$tz = $timezone instanceof DateTimeZone ? $timezone : new DateTimeZone( 'UTC' );

		$duration = (int) $master_end - (int) $master_start;

		// A negative duration is malformed (end before start); refuse to emit
		// inverted occurrences that would corrupt downstream conflict math.
		if ( $duration < 0 ) {
			return array();
		}

		// Keyed lookup so EXDATE matching is O(1) per occurrence.
		$exclusion = array_flip( array_map( 'intval', $exceptions ) );

		// DTSTART anchors the rule at the master's local wall-clock time so the
		// library keeps that time stable across DST.
		$dtstart = new DateTime( '@' . (int) $master_start );
		$dtstart->setTimezone( $tz );

		$rule = new RRule( (string) $rrule, $dtstart );

		// Expand a touch wider than the range: an occurrence can start before
		// the range yet still overlap it (long/multi-day appointments).
		$begin = new DateTime( '@' . ( (int) $range_start - $duration ) );
		$begin->setTimezone( $tz );
		$end = new DateTime( '@' . (int) $range_end );
		$end->setTimezone( $tz );

		$occurrences = array();

		foreach ( $rule->getOccurrencesBetween( $begin, $end ) as $occurrence ) {
			$occ_start = (int) $occurrence->getTimestamp();
			$occ_end   = $occ_start + $duration;

			if ( isset( $exclusion[ $occ_start ] ) ) {
				continue;
			}

			// Keep only occurrences that actually overlap the requested range.
			// An occurrence ending exactly at range_start does not overlap.
			if ( $occ_end <= (int) $range_start || $occ_start > (int) $range_end ) {
				continue;
			}

			$occurrences[] = array(
				'start' => $occ_start,
				'end'   => $occ_end,
			);

			if ( count( $occurrences ) >= self::MAX_OCCURRENCES ) {
				break;
			}
		}

		return $occurrences;
	}
}
