<?php
/**
 * Date utility class
 *
 * @package WPAppointments
 */

namespace WPAppointments\Utils;

use WPAppointments\Model\Settings;

use DateTime;
use DatePeriod;
use DateInterval;

/**
 * Date utility class
 */
class Availability {
	/**
	 * Check if a date or date range is available
	 *
	 * @param DateTime|DatePeriod $date_time_or_range Date or date range.
	 * @param int                 $duration Duration in minutes. Ignored if $date_time_or_range is a DatePeriod.
	 *
	 * @return bool
	 */
	public static function is_available( $date_time_or_range, $duration ) {
		$date_range = $date_time_or_range;

		if ( $date_time_or_range instanceof DateTime ) {
			$start_date = clone $date_time_or_range;
			$end_date   = clone $date_time_or_range;
			$end_date->add( new DateInterval( 'PT' . $duration . 'M' ) );
			$date_range = new DatePeriod( $start_date, new DateInterval( 'PT' . $duration . 'M' ), $end_date );
		}

		$mocked_schedules = array(
			array(
				'start' => '2024-02-08 09:00:00',
				'end'   => '2024-02-08 17:00:00',
			),
			array(
				'start' => '2024-02-08 18:00:00',
				'end'   => '2024-02-08 20:00:00',
			),
		);

		$mocked_schedule_periods = array_map(
			function ( $schedule ) {
				return new DatePeriod(
					new DateTime( $schedule['start'] ),
					new DateInterval( 'PT30M' ),
					new DateTime( $schedule['end'] )
				);
			},
			$mocked_schedules
		);

		$is_available = false;

		foreach ( $mocked_schedule_periods as $mocked_schedule_period ) {
			$is_available = Date::date_range_contains_another_date_range( $date_range, $mocked_schedule_period );

			if ( $is_available ) {
				return true;
			}
		}

		return $is_available;
	}

	/**
	 * Return all day slots availability
	 *
	 * @param DateTime $date Date.
	 *
	 * @return (\DateTime|bool)[][] $slots
	 */
	public static function get_day_availability( $date ) {
		$settings = new Settings();
		$schedule = $settings->get_default_schedule( get_option( 'wpappointments_default_schedule_id' ) );
		$slots    = array();

		$date->setTime( 0, 0, 0 );

		$weekday          = strtolower( $date->format( 'l' ) );
		$schedule_slots   = $schedule->$weekday->slots->list;
		$schedule_enabled = $schedule->$weekday->enabled;

		$schedule_periods = array();

		if ( $schedule_enabled ) {
			foreach ( $schedule_slots as $schedule_slot ) {
				$schedule_periods[] = Schedule::convert_schedule_to_date_range( $schedule_slot, $date );
			}
		}

		for ( $i = 0; $i < 24 * 2; $i++ ) {
			if ( $i > 0 ) {
				$date->add( new \DateInterval( 'PT30M' ) );
			}

			$start_date = clone $date;
			$end_date   = clone $date;
			$end_date->add( new DateInterval( 'PT30M' ) );
			$date_range = new DatePeriod( $start_date, new DateInterval( 'PT30M' ), $end_date );

			$available = Date::date_ranges_contain_another_date_range( $date_range, $schedule_periods );

			$slots[] = array(
				'start'     => clone $date,
				'available' => $available,
				'schedule'  => $schedule,
			);
		}

		return $slots;
	}

	/**
	 * Return all month slots availability
	 *
	 * @param DateTime $date Date.
	 */
	public static function get_month_availability( $date ) {
		$month = (int) $date->format( 'm' );
		$year  = (int) $date->format( 'Y' );

		$days_in_month = (int) gmdate( 't', mktime( 0, 0, 0, $month, 1, $year ) );

		$slots = array();

		for ( $i = 1; $i <= $days_in_month; $i++ ) {
			$_date   = new DateTime( $year . '-' . $month . '-' . $i . ' midnight' );
			$slots[] = array(
				'date'  => $_date,
				'slots' => self::get_day_availability( $_date ),
			);
		}

		return $slots;
	}
}
