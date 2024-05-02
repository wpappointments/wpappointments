<?php
/**
 * Date utility class
 *
 * @package WPAppointments
 */

namespace WPAppointments\Utils;

use DateTime;
use DatePeriod;
use DateInterval;
use WP_Error;
use WPAppointments\Data\Model\Appointment;
use WPAppointments\Data\Model\Settings;

/**
 * Date utility class
 */
class Availability {
	/**
	 * Return all week slots availability
	 *
	 * @param string    $date_start Date in ISO 8601 format GMT timezone.
	 * @param string    $date_end Date in ISO 8601 format GMT timezone.
	 * @param string    $tz Timezone string.
	 * @param \DateTime $now Now in ISO 8601 format.
	 *
	 * @return array
	 */
	public static function get_availability( $date_start, $date_end, $tz = null, $now = new \DateTime() ) {
		$timezone = empty( $tz ) ? wp_timezone_string() : $tz;
		$now->setTimezone( new \DateTimeZone( $timezone ) );

		$range_start = new \DateTime( $date_start );
		$range_start->setTimezone( new \DateTimeZone( $timezone ) );

		$range_end = new \DateTime( $date_end );
		$range_end->setTimezone( new \DateTimeZone( $timezone ) );

		$length   = (int) get_option( 'wpappointments_appointments_timePickerPrecision' );
		$interval = new \DateInterval( 'PT' . $length . 'M' );
		$range    = new \DatePeriod( $range_start, $interval, $range_end );

		$settings                 = new Settings();
		$default_schedule_post_id = get_option( 'wpappointments_default_scheduleId' );
		$schedule                 = $settings->get_default_schedule( $default_schedule_post_id );

		$appointments       = new Appointment();
		$range_appointments = $appointments->get_date_range_appointments(
			(int) $range_start->getTimestamp(),
			(int) $range_end->getTimestamp()
		);
		$range_appointments = $range_appointments['appointments'];

		$range_appointments_periods = array();

		if ( count( $range_appointments ) > 0 ) {
			foreach ( $range_appointments as $appointment ) {
				$start_date = new DateTime();
				$start_date->setTimestamp( $appointment['timestamp'] );
				$end_date = new DateTime();
				$end_date->setTimestamp( $appointment['timestamp'] + $appointment['duration'] * 60 );
				$range_appointments_periods[] = new DatePeriod(
					$start_date,
					new DateInterval( 'PT' . $appointment['duration'] . 'M' ),
					$end_date
				);
			}
		}

		$slots = array();

		$appointment_length          = (int) get_option( 'wpappointments_appointments_defaultLength' );
		$appointment_length_interval = new \DateInterval( 'PT' . $appointment_length . 'M' );

		foreach ( $range as $slot ) {
			$start = clone $slot;
			$start->setTimezone( new \DateTimeZone( $timezone ) );
			$end = clone $slot;
			$end->add( new \DateInterval( 'PT' . $appointment_length . 'M' ) );
			$end->setTimezone( new \DateTimeZone( $timezone ) );

			$date_range = new \DatePeriod( $start, $appointment_length_interval, $end );

			$weekday          = strtolower( $start->format( 'l' ) );
			$schedule_slots   = $schedule[ $weekday ]['slots']['list'];
			$schedule_enabled = $schedule[ $weekday ]['enabled'];
			$schedule_all_day = $schedule[ $weekday ]['allDay'];

			$schedule_periods = array();

			if ( $schedule_all_day ) {
				$schedule_periods[] = new \DatePeriod(
					$start,
					$interval,
					$end
				);
			} elseif ( $schedule_enabled ) {
				foreach ( $schedule_slots as $schedule_slot ) {
					$schedule_periods[] = Schedule::convert_schedule_to_date_range( $schedule_slot, $start );
				}
			}

			$available = Date::date_range_overlaps_with_any_date_range( $date_range, $schedule_periods );
			$booked    = Date::date_range_overlaps_with_any_date_range( $date_range, $range_appointments_periods );
			$is_past   = $slot < $now;

			array_push(
				$slots,
				array(
					'timestamp'  => (int) $slot->format( 'U' ) * 1000,
					'dateString' => $slot->format( 'c' ),
					'available'  => $available && ! $is_past && ! $booked,
					'inSchedule' => $available,
				)
			);
		}

		$trimmed_slots = array();

		$found_first_available = false;

		foreach ( $slots as $slot ) {
			if ( $slot['inSchedule'] ) {
				$found_first_available = true;
			}

			if ( $found_first_available ) {
				$trimmed_slots[] = $slot;
			}
		}

		$trimmed_slots_reverse = array_reverse( $trimmed_slots );
		$trimmed_slots_2       = array();

		$found_first_available = false;

		foreach ( $trimmed_slots_reverse as $slot ) {
			if ( $slot['inSchedule'] ) {
				$found_first_available = true;
			}

			if ( $found_first_available ) {
				$trimmed_slots_2[] = $slot;
			}
		}

		$trimmed_slots = array_reverse( $trimmed_slots_2 );

		return array(
			'slots'        => $slots,
			'trimmedSlots' => $trimmed_slots,
		);
	}

	/**
	 * Get month days availability
	 *
	 * @param string $current_month Current month.
	 * @param string $current_year Current year.
	 * @param string $timezone Timezone string.
	 *
	 * @return object[]|\WP_Error $days
	 */
	public static function get_month_days_availability( $current_month, $current_year, $timezone ) {
		if ( ! $current_month ) {
			return new WP_Error( 'missing_month', __( 'Month is required', 'wpappointments' ) );
		}

		if ( ! $current_year ) {
			return new WP_Error( 'missing_year', __( 'Year is required', 'wpappointments' ) );
		}

		if ( ! $timezone ) {
			return new WP_Error( 'missing_timezone', __( 'Timezone is required', 'wpappointments' ) );
		}

		if ( ! is_numeric( $current_year ) ) {
			return new WP_Error( 'year_not_numeric', __( 'Year must be numeric', 'wpappointments' ) );
		}

		$is_month_numeric = is_numeric( $current_month );
		$is_month_valid   = (int) $current_month >= 1 && (int) $current_month <= 12;

		if ( ! $is_month_numeric || ! $is_month_valid ) {
			return new WP_Error( 'invalid_month', 'Month and year must be numeric and be between 1 and 12' );
		}

		$first_day = new DateTime( $current_year . '-' . $current_month . '-01' );
		$first_day->setTimezone( new \DateTimeZone( $timezone ) );

		$last_day = new DateTime( $current_year . '-' . $current_month . '-' . $first_day->format( 't' ) );
		$last_day->setTimezone( new \DateTimeZone( $timezone ) );

		$first_day->setTime( 0, 0, 0 );
		$last_day->setTime( 23, 59, 59 );

		$days = array();

		$interval = new \DateInterval( 'P1D' );
		$range    = new \DatePeriod( $first_day, $interval, $last_day );

		foreach ( $range as $day ) {
			$day_start = clone $day;
			$day_start->setTime( 0, 0, 0 );

			$day_end = clone $day;
			$day_end->setTime( 23, 59, 59 );

			$day_availability = self::get_availability(
				$day_start->format( 'c' ),
				$day_end->format( 'c' ),
				$timezone
			);

			$slots = $day_availability['slots'] ?? array();

			$available_slots = array_filter(
				$slots,
				function ( $slot ) {
					return true === $slot['available'];
				}
			);

			$days[] = array(
				'date'           => $day->format( 'c' ),
				'day'            => $slots,
				'available'      => count( $available_slots ) > 0,
				'totalAvailable' => count( $available_slots ),
				'totalSlots'     => count( $slots ),
			);
		}

		return $days;
	}

	/**
	 * Build month availability calendar
	 *
	 * @param string[][] $calendar Calendar array.
	 * @param string     $timezone Timezone string.
	 * @param bool       $trim Whether should trim timeslots outside of working hours from left and right of the day time slots.
	 *
	 *     Calendar array shape is a two dimensional array of date strings grouped by week. For example:
	 *
	 *      [
	 *       [
	 *          '2024-01-29T00:00:00+00:00',
	 *          '2024-01-30T00:00:00+00:00',
	 *          '2024-01-31T00:00:00+00:00',
	 *          '2024-02-01T00:00:00+00:00',
	 *                  ...
	 *       ],
	 *       [
	 *          '2024-02-05T00:00:00+00:00',
	 *          '2024-02-06T00:00:00+00:00',
	 *          '2024-02-07T00:00:00+00:00',
	 *          ...
	 *       ],
	 *       ...
	 *     ].
	 *
	 * @return object[][]|\WP_Error $calendar
	 */
	public static function get_month_calendar_availability( $calendar, $timezone, $trim = false ) {
		if ( ! $calendar ) {
			return new WP_Error( 'missing_calendar', __( 'Calendar is required', 'wpappointments' ) );
		}

		if ( ! $timezone ) {
			return new WP_Error( 'missing_timezone', __( 'Timezone is required', 'wpappointments' ) );
		}

		if ( ! self::is_calendar_valid( $calendar ) ) {
			return new WP_Error( 'invalid_calendar', 'Invalid calendar shape. It needs to be an array of length 5 or 6. Each array of exact length 7' );
		}

		$availability = array();

		foreach ( $calendar as $week ) {
			$week_availability = array();

			foreach ( $week as $day ) {
				$day_date = new DateTime( $day );
				$day_date->setTimezone( new \DateTimeZone( $timezone ) );

				$day_start = clone $day_date;
				$day_start->setTime( 0, 0, 0 );

				$day_end = clone $day_date;
				$day_end->setTime( 23, 59, 59 );

				$day_availability = self::get_availability(
					$day_start->format( 'c' ),
					$day_end->format( 'c' ),
					$timezone
				);

				$slots         = $day_availability['slots'] ?? array();
				$trimmed_slots = $day_availability['trimmedSlots'];

				$slots = $trim ? $trimmed_slots : $slots;

				$available_slots = $slots ? array_filter(
					$slots,
					function ( $slot ) {
						return true === $slot['available'];
					}
				) : array();

				$week_availability[] = array(
					'date'           => $day_date->format( 'c' ),
					'day'            => $slots,
					'available'      => count( $available_slots ) > 0,
					'totalAvailable' => count( $available_slots ),
					'totalSlots'     => count( $slots ),
				);
			}

			$availability[] = $week_availability;
		}

		return $availability;
	}

	/**
	 * Check if calendar is valid
	 *
	 * @param string[][] $calendar Calendar array.
	 *
	 * @return bool
	 */
	private static function is_calendar_valid( $calendar ) {
		if ( ! is_array( $calendar ) ) {
			return false;
		}

		if ( count( $calendar ) !== 5 && count( $calendar ) !== 6 ) {
			return false;
		}

		foreach ( $calendar as $week ) {
			if ( ! is_array( $week ) ) {
				return false;
			}

			if ( count( $week ) !== 7 ) {
				return false;
			}

			foreach ( $week as $day ) {
				if ( ! is_string( $day ) ) {
					return false;
				}
			}
		}

		return true;
	}
}
