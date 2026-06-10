<?php
/**
 * Recurrence Expander Test
 *
 * @package WPAppointments
 */

namespace Tests\Recurrence;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAppointments\Recurrence\RecurrenceExpander;

uses( \TestTools\TestCase::class )->group( 'recurrence' );

test(
	'RecurrenceExpander::expand_in_range - weekly expands to four occurrences seven days apart',
	function () {
		$utc = new \DateTimeZone( 'UTC' );

		$master_start = ( new \DateTime( '2026-06-01 10:00:00', $utc ) )->getTimestamp();
		$master_end   = $master_start + 3600;

		$range_start = ( new \DateTime( '2026-06-01 00:00:00', $utc ) )->getTimestamp();
		$range_end   = ( new \DateTime( '2026-07-15 00:00:00', $utc ) )->getTimestamp();

		$occurrences = RecurrenceExpander::expand_in_range(
			'FREQ=WEEKLY;COUNT=4',
			$master_start,
			$master_end,
			$range_start,
			$range_end,
			array(),
			$utc
		);

		expect( $occurrences )->toHaveCount( 4 );

		// First occurrence equals the master start (DTSTART).
		expect( $occurrences[0]['start'] )->toBe( $master_start );

		// Each subsequent occurrence is exactly seven days after the previous.
		$count = count( $occurrences );
		for ( $i = 1; $i < $count; $i++ ) {
			expect( $occurrences[ $i ]['start'] - $occurrences[ $i - 1 ]['start'] )->toBe( 7 * DAY_IN_SECONDS );
		}

		// Duration is preserved on every occurrence.
		foreach ( $occurrences as $occurrence ) {
			expect( $occurrence['end'] - $occurrence['start'] )->toBe( 3600 );
		}
	}
);

test(
	'RecurrenceExpander::expand_in_range - EXDATE drops the matching occurrence',
	function () {
		$utc = new \DateTimeZone( 'UTC' );

		$master_start = ( new \DateTime( '2026-06-01 10:00:00', $utc ) )->getTimestamp();
		$master_end   = $master_start + 3600;

		$range_start = $master_start - DAY_IN_SECONDS;
		$range_end   = $master_start + 5 * 7 * DAY_IN_SECONDS;

		$full = RecurrenceExpander::expand_in_range(
			'FREQ=WEEKLY;COUNT=4',
			$master_start,
			$master_end,
			$range_start,
			$range_end,
			array(),
			$utc
		);

		$dropped = $full[1]['start'];

		$with_exception = RecurrenceExpander::expand_in_range(
			'FREQ=WEEKLY;COUNT=4',
			$master_start,
			$master_end,
			$range_start,
			$range_end,
			array( $dropped ),
			$utc
		);

		expect( $with_exception )->toHaveCount( 3 );
		expect( wp_list_pluck( $with_exception, 'start' ) )->not->toContain( $dropped );
	}
);

test(
	'RecurrenceExpander::expand_in_range - returns only occurrences overlapping the range',
	function () {
		$utc = new \DateTimeZone( 'UTC' );

		$master_start = ( new \DateTime( '2026-06-01 10:00:00', $utc ) )->getTimestamp();
		$master_end   = $master_start + 3600;

		// Window only the second and third weekly occurrences.
		$second = $master_start + 7 * DAY_IN_SECONDS;
		$third  = $master_start + 14 * DAY_IN_SECONDS;

		$occurrences = RecurrenceExpander::expand_in_range(
			'FREQ=WEEKLY;COUNT=8',
			$master_start,
			$master_end,
			$second - 60,
			$third + 3660,
			array(),
			$utc
		);

		expect( $occurrences )->toHaveCount( 2 );
		expect( $occurrences[0]['start'] )->toBe( $second );
		expect( $occurrences[1]['start'] )->toBe( $third );
	}
);

test(
	'RecurrenceExpander::expand_in_range - preserves local wall-clock time across a DST transition',
	function () {
		$tz = new \DateTimeZone( 'Europe/Warsaw' );

		// Monday before the 2026-03-29 spring-forward transition.
		$master_start = ( new \DateTime( '2026-03-23 10:00:00', $tz ) )->getTimestamp();
		$master_end   = $master_start + 3600;

		$range_start = ( new \DateTime( '2026-03-20 00:00:00', $tz ) )->getTimestamp();
		$range_end   = ( new \DateTime( '2026-04-10 00:00:00', $tz ) )->getTimestamp();

		$occurrences = RecurrenceExpander::expand_in_range(
			'FREQ=WEEKLY;COUNT=3',
			$master_start,
			$master_end,
			$range_start,
			$range_end,
			array(),
			$tz
		);

		expect( $occurrences )->toHaveCount( 3 );

		foreach ( $occurrences as $occurrence ) {
			$local = ( new \DateTime( '@' . $occurrence['start'] ) )->setTimezone( $tz );
			expect( $local->format( 'H:i' ) )->toBe( '10:00' );
		}

		// The unix gap across the spring-forward week is one hour shorter,
		// proving expansion is timezone-aware rather than naive 7*86400.
		expect( $occurrences[1]['start'] - $occurrences[0]['start'] )->toBe( 7 * DAY_IN_SECONDS - HOUR_IN_SECONDS );
	}
);

test(
	'RecurrenceExpander::is_recurring - detects presence of an rrule',
	function () {
		expect( RecurrenceExpander::is_recurring( 'FREQ=WEEKLY' ) )->toBeTrue();
		expect( RecurrenceExpander::is_recurring( '' ) )->toBeFalse();
		expect( RecurrenceExpander::is_recurring( '   ' ) )->toBeFalse();
		expect( RecurrenceExpander::is_recurring( null ) )->toBeFalse();
	}
);

test(
	'RecurrenceExpander::expand_in_range - an occurrence ending exactly at range_start does not overlap',
	function () {
		$utc = new \DateTimeZone( 'UTC' );

		$master_start = ( new \DateTime( '2026-06-01 10:00:00', $utc ) )->getTimestamp();
		$master_end   = $master_start + 3600;

		// Range begins exactly when the first occurrence ends: zero overlap, so
		// the first occurrence must be excluded and only the rest returned.
		$occurrences = RecurrenceExpander::expand_in_range(
			'FREQ=WEEKLY;COUNT=4',
			$master_start,
			$master_end,
			$master_end,
			$master_start + 5 * 7 * DAY_IN_SECONDS,
			array(),
			$utc
		);

		expect( $occurrences )->toHaveCount( 3 );
		expect( wp_list_pluck( $occurrences, 'start' ) )->not->toContain( $master_start );
	}
);

test(
	'RecurrenceExpander::expand_in_range - a negative duration master yields no occurrences',
	function () {
		$utc = new \DateTimeZone( 'UTC' );

		$master_start = ( new \DateTime( '2026-06-01 10:00:00', $utc ) )->getTimestamp();

		$occurrences = RecurrenceExpander::expand_in_range(
			'FREQ=DAILY;COUNT=3',
			$master_start,
			$master_start - 100,
			$master_start,
			$master_start + 30 * DAY_IN_SECONDS,
			array(),
			$utc
		);

		expect( $occurrences )->toBe( array() );
	}
);

test(
	'RecurrenceExpander::expand_in_range - caps runaway expansion at MAX_OCCURRENCES',
	function () {
		$utc = new \DateTimeZone( 'UTC' );

		$master_start = ( new \DateTime( '2026-06-01 10:00:00', $utc ) )->getTimestamp();
		$master_end   = $master_start + 3600;

		// Unbounded daily rule over a multi-decade range would expand to ~18k
		// occurrences; the hard cap must keep it bounded.
		$occurrences = RecurrenceExpander::expand_in_range(
			'FREQ=DAILY',
			$master_start,
			$master_end,
			$master_start,
			$master_start + 5000 * DAY_IN_SECONDS,
			array(),
			$utc
		);

		expect( $occurrences )->toHaveCount( RecurrenceExpander::MAX_OCCURRENCES );
	}
);
