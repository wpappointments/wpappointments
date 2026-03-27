<?php
/**
 * Holiday date resolver
 *
 * Resolves holiday rules (fixed, easter, orthodox_easter, lookup) to Y-m-d dates.
 *
 * @package WPAppointments
 * @since 0.6.0
 */

namespace WPAppointments\Holidays;

/**
 * Holiday resolver class
 */
class HolidayResolver {
	/**
	 * Compute the date of a single holiday for a given year
	 *
	 * @param array $holiday Holiday definition with type, and type-specific fields.
	 * @param int   $year    Year to compute for.
	 *
	 * @return string|null Y-m-d date string or null if unresolvable.
	 */
	public static function compute_date( array $holiday, int $year ): ?string {
		$type = $holiday['type'] ?? '';

		switch ( $type ) {
			case 'fixed':
				return self::compute_fixed( $holiday, $year );

			case 'easter':
				$easter = self::western_easter( $year );

				if ( null === $easter ) {
					return null;
				}

				$offset = (int) ( $holiday['offset'] ?? 0 );
				$date   = new \DateTime( $easter );
				$date->modify( sprintf( '%+d days', $offset ) );

				return $date->format( 'Y-m-d' );

			case 'orthodox_easter':
				$easter = self::orthodox_easter( $year );

				if ( null === $easter ) {
					return null;
				}

				$offset = (int) ( $holiday['offset'] ?? 0 );
				$date   = new \DateTime( $easter );
				$date->modify( sprintf( '%+d days', $offset ) );

				return $date->format( 'Y-m-d' );

			case 'nthWeekday':
				return self::compute_nth_weekday( $holiday, $year );

			case 'lookup':
				$dates = $holiday['dates'] ?? array();

				return $dates[ (string) $year ] ?? null;

			default:
				return null;
		}
	}

	/**
	 * Compute dates for multiple holidays in a given year
	 *
	 * @param array $holidays Array of holiday definitions.
	 * @param int   $year     Year to compute for.
	 *
	 * @return array Associative array of key => Y-m-d.
	 */
	public static function compute_dates( array $holidays, int $year ): array {
		$results = array();

		foreach ( $holidays as $holiday ) {
			if ( ! is_array( $holiday ) ) {
				continue;
			}

			$key  = $holiday['ref'] ?? '';
			$date = self::compute_date( $holiday, $year );

			if ( null !== $date && '' !== $key ) {
				$results[ $key ] = $date;
			}
		}

		return $results;
	}

	/**
	 * Compute Western Easter date for a given year
	 *
	 * Uses the Anonymous Gregorian algorithm (pure math, no ext dependency).
	 * Falls back to easter_days() if available.
	 *
	 * @param int $year Year to compute for.
	 *
	 * @return string|null Y-m-d date string or null on failure.
	 */
	public static function western_easter( int $year ): ?string {
		// Anonymous Gregorian algorithm — no calendar extension needed.
		$a     = $year % 19;
		$b     = intdiv( $year, 100 );
		$c     = $year % 100;
		$d     = intdiv( $b, 4 );
		$e     = $b % 4;
		$f     = intdiv( $b + 8, 25 );
		$g     = intdiv( $b - $f + 1, 3 );
		$h     = ( 19 * $a + $b - $d - $g + 15 ) % 30;
		$i     = intdiv( $c, 4 );
		$k     = $c % 4;
		$l     = ( 32 + 2 * $e + 2 * $i - $h - $k ) % 7;
		$m     = intdiv( $a + 11 * $h + 22 * $l, 451 );
		$month = intdiv( $h + $l - 7 * $m + 114, 31 );
		$day   = ( ( $h + $l - 7 * $m + 114 ) % 31 ) + 1;

		return sprintf( '%04d-%02d-%02d', $year, $month, $day );
	}

	/**
	 * Compute Orthodox Easter date for a given year
	 *
	 * Uses the Julian calendar algorithm, then converts to Gregorian.
	 *
	 * @param int $year Year to compute for.
	 *
	 * @return string|null Y-m-d date string or null on failure.
	 */
	public static function orthodox_easter( int $year ): ?string {
		// Julian calendar Easter computation (Meeus algorithm).
		$a = $year % 4;
		$b = $year % 7;
		$c = $year % 19;
		$d = ( 19 * $c + 15 ) % 30;
		$e = ( 2 * $a + 4 * $b - $d + 34 ) % 7;

		$month = (int) floor( ( $d + $e + 114 ) / 31 );
		$day   = ( ( $d + $e + 114 ) % 31 ) + 1;

		$gregorian_offset = intdiv( $year, 100 ) - intdiv( $year, 400 ) - 2;
		$date             = new \DateTimeImmutable(
			sprintf( '%04d-%02d-%02d', $year, $month, $day ),
			new \DateTimeZone( 'UTC' )
		);
		$date             = $date->modify( sprintf( '+%d days', $gregorian_offset ) );

		if ( false === $date ) {
			return null;
		}

		return $date->format( 'Y-m-d' );
	}

	/**
	 * Compute a fixed-date holiday
	 *
	 * @param array $holiday Holiday definition with month and day.
	 * @param int   $year    Year to compute for.
	 *
	 * @return string|null Y-m-d date string or null if invalid.
	 */
	private static function compute_fixed( array $holiday, int $year ): ?string {
		$month = (int) ( $holiday['month'] ?? 0 );
		$day   = (int) ( $holiday['day'] ?? 0 );

		if ( $month < 1 || $month > 12 || $day < 1 || $day > 31 ) {
			return null;
		}

		if ( ! checkdate( $month, $day, $year ) ) {
			return null;
		}

		return sprintf( '%04d-%02d-%02d', $year, $month, $day );
	}

	/**
	 * Compute an nth-weekday-of-month holiday
	 *
	 * Handles rules like "3rd Monday of January" or "last Monday of May".
	 *
	 * @param array $holiday Holiday definition with month, weekday (0=Sun..6=Sat), nth (1-5 or -1 for last).
	 * @param int   $year    Year to compute for.
	 *
	 * @return string|null Y-m-d date string or null if invalid.
	 */
	private static function compute_nth_weekday( array $holiday, int $year ): ?string {
		$month   = (int) ( $holiday['month'] ?? 0 );
		$weekday = (int) ( $holiday['weekday'] ?? 0 );
		$nth     = (int) ( $holiday['nth'] ?? 0 );

		if ( $month < 1 || $month > 12 || $weekday < 0 || $weekday > 6 || 0 === $nth ) {
			return null;
		}

		if ( -1 === $nth ) {
			// Last occurrence: start from last day of month and walk back.
			$last_day = (int) gmdate( 't', mktime( 0, 0, 0, $month, 1, $year ) );
			$date     = new \DateTime( sprintf( '%04d-%02d-%02d', $year, $month, $last_day ) );

			while ( (int) $date->format( 'w' ) !== $weekday ) {
				$date->modify( '-1 day' );
			}

			return $date->format( 'Y-m-d' );
		}

		// Nth occurrence: start from first day of month and find the nth match.
		$date  = new \DateTime( sprintf( '%04d-%02d-01', $year, $month ) );
		$count = 0;

		while ( (int) $date->format( 'n' ) === $month ) {
			if ( (int) $date->format( 'w' ) === $weekday ) {
				++$count;

				if ( $count === $nth ) {
					return $date->format( 'Y-m-d' );
				}
			}

			$date->modify( '+1 day' );
		}

		return null;
	}
}
