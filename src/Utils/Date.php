<?php

namespace WPAppointments\Utils;

class Date {
	public static function createDateRange( $start, $end ) {
		$startDate = new \DateTime( $start );
		$endDate   = new \DateTime( $end );
		$interval  = new \DateInterval( 'P1D' );
		$period    = new \DatePeriod( $startDate, $interval, $endDate );
		return $period;
	}
}
