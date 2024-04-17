<?php
/**
 * Date utility class
 *
 * @package WPAppointments
 */

namespace TestsPHP;

use WPAppointments\Utils\Availability;

uses( \TestsWP\TestCase::class );

beforeEach(
	function () {
		$schedule_post_id = wp_insert_post(
			array(
				'post_title'  => 'Default Schedule',
				'post_status' => 'publish',
				'post_type'   => 'wpa_schedule',
			)
		);

		update_option( 'wpappointments_default_scheduleId', $schedule_post_id );

		$settings = new \WPAppointments\Model\Settings();
		$settings->update_setting( 'appointments', 'timePickerPrecision', 30 );
		$settings->update_setting( 'appointments', 'defaultLength', 30 );
		$settings->update_setting( 'general', 'timezoneSiteDefault', false );
		$settings->update_setting( 'general', 'timezone', 'Europe/London' );

		$make_slot        = function ( $day, $start, $end, $enabled = false, $all_day = false) {
			return (object) array(
				'day'     => $day,
				'enabled' => $enabled,
				'allDay'  => $all_day,
				'slots'   => (object) array(
					'list' => array(
						(object) array(
							'start' => (object) array(
								'hour'   => explode( ':', $start )[0],
								'minute' => explode( ':', $start )[1],
							),
							'end'   => (object) array(
								'hour'   => explode( ':', $end )[0],
								'minute' => explode( ':', $end )[1],
							),
						),
					),
				),
			);
		};

		// GMT +0:00
		$settings = (object) array(
			'monday'    => $make_slot( 'monday', '09:00', '17:00' ),
			'tuesday'   => $make_slot( 'tuesday', '09:00', '17:00' ),
			'wednesday' => $make_slot( 'wednesday', '09:00', '17:00' ),
			'thursday'  => $make_slot( 'thursday', '09:00', '17:00' ),
			'friday'    => $make_slot( 'friday', '09:00', '17:00', true ),
			'saturday'  => $make_slot( 'saturday', '09:00', '17:00' ),
			'sunday'    => $make_slot( 'sunday', '09:00', '17:00' ),
		);

		if ( $schedule_post_id ) {
			foreach ( array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ) as $day ) {
				$schedule = wp_json_encode( $settings->$day );
				update_post_meta( $schedule_post_id, 'wpappointments_schedule_' . $day, $schedule );
			}
		}
	}
);

test(
	'Should create availability array - one day period - using only GMT timezone',
	function () {
		$start_date = '2024-03-01T00:00:00.000Z';
		$end_date   = '2024-03-01T23:59:59.000Z';

		$result = Availability::get_availability( $start_date, $end_date, '+00:00', new \DateTime($start_date) );
		$result = $result['slots'];

		expect( $result )->toBeArray();
		expect( $result )->toHaveCount( 48 );
		expect( $result[0]['dateString'] )->toBe( '2024-03-01T00:00:00+00:00' );
		expect( $result[0]['available'] )->toBeFalse();
		expect( $result[17]['dateString'] )->toBe( '2024-03-01T08:30:00+00:00' );
		expect( $result[17]['available'] )->toBeFalse();
		expect( $result[18]['dateString'] )->toBe( '2024-03-01T09:00:00+00:00' );
		expect( $result[18]['available'] )->toBeTrue();
		expect( $result[33]['dateString'] )->toBe( '2024-03-01T16:30:00+00:00' );
		expect( $result[33]['available'] )->toBeTrue();
		expect( $result[34]['dateString'] )->toBe( '2024-03-01T17:00:00+00:00' );
		expect( $result[34]['available'] )->toBeFalse();
		expect( $result[47]['dateString'] )->toBe( '2024-03-01T23:30:00+00:00' );
		expect( $result[47]['available'] )->toBeFalse();

		$available = array_filter(
			$result,
			function ( $slot ) {
				return true === $slot['available'];
			}
		);

		expect( $available )->toHaveCount( 16 );
	}
);

test(
	'Should create availability array - one day period - +0100 timezone',
	function () {
		$start_date = '2024-02-29T23:00:00.000Z';
		$end_date   = '2024-03-01T22:59:59.000Z';
		$timezone   = 'Europe/Warsaw';

		$result = Availability::get_availability( $start_date, $end_date, $timezone, new \DateTime($start_date) );
		$result = $result['slots'];

		expect( $result )->toBeArray();
		expect( $result )->toHaveCount( 48 );

		expect( $result[0]['dateString'] )->toBe( '2024-03-01T00:00:00+01:00' );
		expect( $result[0]['available'] )->toBeFalse();
		expect( $result[19]['dateString'] )->toBe( '2024-03-01T09:30:00+01:00' );
		expect( $result[19]['available'] )->toBeFalse();
	
		expect( $result[20]['dateString'] )->toBe( '2024-03-01T10:00:00+01:00' );
		expect( $result[20]['available'] )->toBeTrue();
		expect( $result[35]['dateString'] )->toBe( '2024-03-01T17:30:00+01:00' );
		expect( $result[35]['available'] )->toBeTrue();

		expect( $result[36]['dateString'] )->toBe( '2024-03-01T18:00:00+01:00' );
		expect( $result[36]['available'] )->toBeFalse();
		expect( $result[47]['dateString'] )->toBe( '2024-03-01T23:30:00+01:00' );
		expect( $result[47]['available'] )->toBeFalse();

		$available = array_filter(
			$result,
			function ( $slot ) {
				return true === $slot['available'];
			}
		);

		expect( $available )->toHaveCount( 16 );
	}
);

test(
	'Should create availability array - one day period - -0800 timezone',
	function () {
		$start_date = '2024-03-01T08:00:00.000Z'; // GMT
		$end_date   = '2024-03-02T07:59:59.000Z'; // GMT
		$timezone   = 'America/Los_Angeles';

		$result = Availability::get_availability( $start_date, $end_date, $timezone, new \DateTime($start_date) );
		$result = $result['slots'];

		expect( $result )->toBeArray();
		expect( $result )->toHaveCount( 48 );

		expect( $result[0]['dateString'] )->toBe( '2024-03-01T00:00:00-08:00' );
		expect( $result[0]['available'] )->toBeFalse();
		expect( $result[1]['dateString'] )->toBe( '2024-03-01T00:30:00-08:00' );
		expect( $result[1]['available'] )->toBeFalse();

		expect( $result[2]['dateString'] )->toBe( '2024-03-01T01:00:00-08:00' );
		expect( $result[2]['available'] )->toBeTrue();
		expect( $result[17]['dateString'] )->toBe( '2024-03-01T08:30:00-08:00' );
		expect( $result[17]['available'] )->toBeTrue();

		expect( $result[18]['dateString'] )->toBe( '2024-03-01T09:00:00-08:00' );
		expect( $result[18]['available'] )->toBeFalse();
		expect( $result[47]['dateString'] )->toBe( '2024-03-01T23:30:00-08:00' );
		expect( $result[47]['available'] )->toBeFalse();

		$available = array_filter(
			$result,
			function ( $slot ) {
				return true === $slot['available'];
			}
		);

		expect( $available )->toHaveCount( 16 );
	}
);

test(
	'Should create availability array - one hour period - GMT timezone',
	function () {
		$start_date = '2024-03-01T09:00:00.000Z';
		$end_date   = '2024-03-01T09:59:59.000Z';

		$result = Availability::get_availability( $start_date, $end_date, '+00:00', new \DateTime($start_date) );
		$result = $result['slots'];

		expect( $result )->toBeArray();
		expect( $result )->toHaveCount( 2 );
		expect( $result[0]['dateString'] )->toBe( '2024-03-01T09:00:00+00:00' );
		expect( $result[0]['available'] )->toBeTrue();
		expect( $result[1]['dateString'] )->toBe( '2024-03-01T09:30:00+00:00' );
		expect( $result[1]['available'] )->toBeTrue();
	}
);

test(
	'Should create availability array - trimmed - one day period - current time 16:00 - GMT timezone',
	function () {
		$start_date = '2024-03-01T00:00:00.000Z';
		$end_date   = '2024-03-01T23:59:59.000Z';

		$result = Availability::get_availability( $start_date, $end_date, '+00:00', new \DateTime( '2024-03-01T16:00:00.000Z' ) );
		$result = $result['slots'];

		$available = array_filter(
			$result,
			function ( $slot ) {
				return true === $slot['available'];
			}
		);

		expect( $available )->toHaveCount( 2 );
	}
);

test(
	'Should create availability array - trimmed - one day period - current time 16:00 - +01:00 timezone',
	function () {
		$start_date = '2024-03-01T00:00:00.000Z';
		$end_date   = '2024-03-01T23:59:59.000Z';

		$result = Availability::get_availability( $start_date, $end_date, '+01:00', new \DateTime( '2024-03-01T16:00:00.000Z' ) );
		$result = $result['slots'];

		$available = array_filter(
			$result,
			function ( $slot ) {
				return true === $slot['available'];
			}
		);

		expect( $available )->toHaveCount( 2 );
	}
);

test(
	'Should create availability array - with appointment in - one day period - using only GMT timezone',
	function () {
		// Create 60 minutes long appointment at 9:00 on March 1st 2024.
		$appointment = new \WPAppointments\Model\AppointmentPost();
		$_appointment = $appointment->create(
			'Noop',
			array(
				'timestamp'   => 1709283600, // March 1st 2024, 9:00 GMT.
				'duration'    => 60,
				'customer'    => '{"name":"Noop","email":"noop@noop.com","phone":"+1 (000) 000-0000"}',
				'customer_id' => 0,
				'status'      => 'confirmed',
			)
		);

		// Get availability for March 1st 2024.
		$start_date = '2024-03-01T00:00:00.000Z';
		$end_date   = '2024-03-01T23:59:59.000Z';

		$result = Availability::get_availability( $start_date, $end_date, '+00:00', new \DateTime($start_date) );
		$result = $result['slots'];

		// Expect 48 slots (30 min precision).
		expect( $result )->toBeArray();
		expect( $result )->toHaveCount( 48 );

		// First slot should be unavailable.
		expect( $result[0]['dateString'] )->toBe( '2024-03-01T00:00:00+00:00' );
		expect( $result[0]['available'] )->toBeFalse();
		expect( $result[17]['dateString'] )->toBe( '2024-03-01T08:30:00+00:00' );
		expect( $result[17]['available'] )->toBeFalse();

		// 9 am slot should be unavailable (already booked).
		expect( $result[18]['dateString'] )->toBe( '2024-03-01T09:00:00+00:00' );
		expect( $result[18]['available'] )->toBeFalse();

		// 9:30 am slot should be still unavailable (already booked, appointment is 60 min).
		expect( $result[19]['dateString'] )->toBe( '2024-03-01T09:30:00+00:00' );
		expect( $result[19]['available'] )->toBeFalse();

		// Finally, 10:00 am slot should be available.
		expect( $result[20]['dateString'] )->toBe( '2024-03-01T10:00:00+00:00' );
		expect( $result[20]['available'] )->toBeTrue();

		// The rest of the schedule should be as normal.
		expect( $result[33]['dateString'] )->toBe( '2024-03-01T16:30:00+00:00' );
		expect( $result[33]['available'] )->toBeTrue();
		expect( $result[34]['dateString'] )->toBe( '2024-03-01T17:00:00+00:00' );
		expect( $result[34]['available'] )->toBeFalse();
		expect( $result[47]['dateString'] )->toBe( '2024-03-01T23:30:00+00:00' );
		expect( $result[47]['available'] )->toBeFalse();

		$available = array_filter(
			$result,
			function ( $slot ) {
				return true === $slot['available'];
			}
		);

		// Expect 14 available slots.
		// 9:00 am to 5:00 pm is 16 slots, minus 2 booked slots.
		expect( $available )->toHaveCount( 14 );
	}
);

test(
	'should create availability array - one day period - using only GMT timezone - 60 minutes default length - 30 minutes precision',
	function() {
		$settings = new \WPAppointments\Model\Settings();
		$settings->update_setting( 'appointments', 'timePickerPrecision', 30 );
		$settings->update_setting( 'appointments', 'defaultLength', 60 );

		$start_date = '2024-03-01T00:00:00.000Z';
		$end_date   = '2024-03-01T23:59:59.000Z';

		$result = Availability::get_availability( $start_date, $end_date, '+00:00', new \DateTime($start_date) );
		$result = $result['slots'];

		// Expect 48 slots (30 min precision).
		expect( $result )->toBeArray();
		expect( $result )->toHaveCount( 48 );

		// First 18 slot should be unavailable.
		expect( $result[0]['dateString'] )->toBe( '2024-03-01T00:00:00+00:00' );
		expect( $result[0]['available'] )->toBeFalse();
		expect( $result[17]['dateString'] )->toBe( '2024-03-01T08:30:00+00:00' );
		expect( $result[17]['available'] )->toBeFalse();

		// 9:00 am slot should be available.
		expect( $result[18]['dateString'] )->toBe( '2024-03-01T09:00:00+00:00' );
		expect( $result[18]['available'] )->toBeTrue();

		// 4:00 pm slot should be available.
		expect( $result[32]['dateString'] )->toBe( '2024-03-01T16:00:00+00:00' );
		expect( $result[32]['available'] )->toBeTrue();
		
		// 4:30 pm slot should be unavailable.
		expect( $result[33]['dateString'] )->toBe( '2024-03-01T16:30:00+00:00' );
		expect( $result[33]['available'] )->toBeFalse();

		// last slot should be unavailable.
		expect( $result[47]['dateString'] )->toBe( '2024-03-01T23:30:00+00:00' );
		expect( $result[47]['available'] )->toBeFalse();

		$available = array_filter(
			$result,
			function ( $slot ) {
				return true === $slot['available'];
			}
		);

		// Expect 15 available slots.
		// 9:00 am to 4:00 pm included.
		expect( $available )->toHaveCount( 15 );
	}
);
