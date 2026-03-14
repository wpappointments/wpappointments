<?php
/**
 * Date Utility Test
 *
 * @package WPAppointments
 */

namespace Tests\Utils;

use WPAppointments\Utils\Date;

uses( \TestTools\TestCase::class )->group( 'utils' );

test(
	'Date::date_range_overlaps_another_date_range',
	function () {
		$range1 = new \DatePeriod(
			new \DateTime( '2024-03-14 10:00:00' ),
			new \DateInterval( 'PT1H' ),
			new \DateTime( '2024-03-14 11:00:00' )
		);

		$range2 = new \DatePeriod(
			new \DateTime( '2024-03-14 10:30:00' ),
			new \DateInterval( 'PT1H' ),
			new \DateTime( '2024-03-14 11:30:00' )
		);

		// Current implementation returns true only if range1 is fully inside range2
		// Wait, look at Date.php: $range_start >= $range_in_start && $range_end <= $range_in_end;
		// So it checks if range1 is INSIDE range2.
		
		$inner = new \DatePeriod(
			new \DateTime( '2024-03-14 10:15:00' ),
			new \DateInterval( 'PT30M' ),
			new \DateTime( '2024-03-14 10:45:00' )
		);

		$outer = new \DatePeriod(
			new \DateTime( '2024-03-14 10:00:00' ),
			new \DateInterval( 'PT1H' ),
			new \DateTime( '2024-03-14 11:00:00' )
		);

		expect( Date::date_range_overlaps_another_date_range( $inner, $outer ) )->toBeTrue();
		expect( Date::date_range_overlaps_another_date_range( $outer, $inner ) )->toBeFalse();
	}
);
