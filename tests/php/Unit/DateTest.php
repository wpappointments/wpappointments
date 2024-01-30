<?php

namespace TestsPHP;

use WPAppointments\Utils\Date;

uses( \TestsPHP\TestCase::class );

test(
	'Date::createDateRange',
	function () {
		$startDate = '2020-01-01';
		$endDate   = '2020-01-03';
		$expected  = array(
			new \DateTime( '2020-01-01' ),
			new \DateTime( '2020-01-02' ),
			new \DateTime( '2020-01-03' ),
		);

		$period          = Date::createDateRange( $startDate, $endDate );
		$recurrences     = $period->getRecurrences();
		$periodStartDate = $period->getStartDate();
		$periodEndDate   = $period->getEndDate();

		expect( $recurrences )->toBe( null );
		expect( $periodStartDate )->toEqual( $expected[0] );
		expect( $periodEndDate )->toEqual( $expected[2] );
	}
);
