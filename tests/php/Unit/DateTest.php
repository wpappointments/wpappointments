<?php
/**
 * Date utility class
 *
 * @package WPAppointments
 */

namespace TestsPHP;

use WPAppointments\Utils\Date;

uses( \TestsPHP\TestCase::class );

test(
	'Date::createDateRange',
	function () {
		$start_date = '2020-01-01';
		$end_date   = '2020-01-03';
		$expected   = array(
			new \DateTime( '2020-01-01' ),
			new \DateTime( '2020-01-02' ),
			new \DateTime( '2020-01-03' ),
		);

		$period            = Date::create_date_range( $start_date, $end_date );
		$recurrences       = $period->getRecurrences();
		$period_start_date = $period->getStartDate();
		$period_end_date   = $period->getEndDate();

		expect( $recurrences )->toBe( null );
		expect( $period_start_date )->toEqual( $expected[0] );
		expect( $period_end_date )->toEqual( $expected[2] );
	}
);
