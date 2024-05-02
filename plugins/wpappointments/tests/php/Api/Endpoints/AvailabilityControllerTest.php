<?php
/**
 * Test the availability API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

use WPAppointments\Data\Model\Settings;

uses( \TestTools\RestTestCase::class );

expect()->extend(
	'toBeAvailabilityDay',
	function () {
		$day = $this->value;

		expect( $day )->toHaveKeys(
			array(
				'date',
				'day',
				'available',
				'totalAvailable',
				'totalSlots',
			)
		);

		expect( $day['date'] )->toBeString();
		expect( $day['day'] )->toBeArray();
		expect( $day['available'] )->toBeBool();
		expect( $day['totalAvailable'] )->toBeInt();
		expect( $day['totalSlots'] )->toBeInt();

		return $this;
	}
);

expect()->extend(
	'toBeAvailabilitySlot',
	function () {
		$slot = $this->value;

		expect( $slot )->toHaveKeys(
			array(
				'timestamp',
				'dateString',
				'available',
				'inSchedule',
			)
		);

		expect( $slot['timestamp'] )->toBeNumeric();
		expect( $slot['dateString'] )->toBeString();
		expect( $slot['available'] )->toBeBool();
		expect( $slot['inSchedule'] )->toBeBool();

		return $this;
	}
);

expect()->extend(
	'toBeAvailabilityMonthArray',
	function () {
		$month = $this->value;

		foreach ( $month as $day ) {
			expect( $day )->toBeAvailabilityDay();

			foreach ( $day['day'] as $slot ) {
				expect( $slot )->toBeAvailabilitySlot();
			}
		}

		return $this;
	}
);

expect()->extend(
	'toBeAvailabilityMonth',
	function () {
		$month = $this->value;

		expect( $month )->toBeArray();

		foreach ( $month as $week ) {
			foreach ( $week as $day ) {
				expect( $day )->toBeAvailabilityDay();

				foreach ( $day['day'] as $slot ) {
					expect( $slot )->toBeAvailabilitySlot();
				}
			}
		}

		return $this;
	}
);

beforeEach(
	function () {
		$schedule_post_id = wp_insert_post(
			array(
				'post_title'  => 'Default Schedule',
				'post_status' => 'publish',
				'post_type'   => 'wpa-schedule',
			)
		);

		update_option( 'wpappointments_default_scheduleId', $schedule_post_id );

		$settings = new Settings();
		$settings->update_setting( 'appointments', 'timePickerPrecision', 30 );
		$settings->update_setting( 'appointments', 'defaultLength', 30 );
		$settings->update_setting( 'general', 'timezoneSiteDefault', false );
		$settings->update_setting( 'general', 'timezone', 'Europe/London' );

		$make_slot = function ( $day, $start, $end, $enabled = false, $all_day = false ) {
			return array(
				'day'     => $day,
				'enabled' => $enabled,
				'allDay'  => $all_day,
				'slots'   => array(
					'list' => array(
						array(
							'start' => array(
								'hour'   => explode( ':', $start )[0],
								'minute' => explode( ':', $start )[1],
							),
							'end'   => array(
								'hour'   => explode( ':', $end )[0],
								'minute' => explode( ':', $end )[1],
							),
						),
					),
				),
			);
		};

		// GMT +0:00.
		$settings = array(
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
				$schedule = wp_json_encode( $settings[ $day ] );
				update_post_meta( $schedule_post_id, 'wpappointments_schedule_' . $day, $schedule );
			}
		}
	}
);

test(
	'GET wpappointments/v1/availability - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'availability',
			array(
				'currentMonth' => 1,
				'currentYear'  => 2024,
				'timezone'     => 'UTC',
			)
		);

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data['data'] )->toHaveKey( 'availability' );
		expect( $data['data']['availability'] )->toHaveKey( 'month' );
		expect( $data['data']['availability']['month'] )->toBeAvailabilityMonthArray();
	}
);

test(
	'GET wpappointments/v1/availability - status 422 - missing month',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'availability',
			array(
				'currentYear' => 2024,
				'timezone'    => 'UTC',
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'missing_month' );
	}
);

test(
	'GET wpappointments/v1/availability - status 422 - missing year',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'availability',
			array(
				'currentMonth' => 1,
				'timezone'     => 'UTC',
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'missing_year' );
	}
);

test(
	'GET wpappointments/v1/availability - status 422 - missing timezone',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'availability',
			array(
				'currentMonth' => 1,
				'currentYear'  => 2024,
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'missing_timezone' );
	}
);

test(
	'GET wpappointments/v1/availability - status 422 - non-numerical year',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'availability',
			array(
				'currentMonth' => 1,
				'currentYear'  => 'a word',
				'timezone'     => 'UTC',
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'year_not_numeric' );
	}
);

test(
	'GET wpappointments/v1/availability - status 422 - non-numerical month',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'availability',
			array(
				'currentMonth' => 'a word',
				'currentYear'  => 2024,
				'timezone'     => 'UTC',
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'invalid_month' );
	}
);

test(
	'GET wpappointments/v1/availability - status 422 - invalid month',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'availability',
			array(
				'currentMonth' => 13,
				'currentYear'  => 2024,
				'timezone'     => 'UTC',
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'invalid_month' );
	}
);

/**
 * Helper function to create a valid calendar input.
 *
 * @return string
 */
function make_valid_calendar_input() {
	return wp_json_encode(
		array(
			array(
				'2024-01-28T00:00:00+00:00',
				'2024-01-29T00:00:00+00:00',
				'2024-01-30T00:00:00+00:00',
				'2024-01-31T00:00:00+00:00',
				'2024-02-01T00:00:00+00:00',
				'2024-02-02T00:00:00+00:00',
				'2024-02-03T00:00:00+00:00',
			),
			array(
				'2024-02-04T00:00:00+00:00',
				'2024-02-05T00:00:00+00:00',
				'2024-02-06T00:00:00+00:00',
				'2024-02-07T00:00:00+00:00',
				'2024-02-08T00:00:00+00:00',
				'2024-02-09T00:00:00+00:00',
				'2024-02-10T00:00:00+00:00',
			),
			array(
				'2024-02-11T00:00:00+00:00',
				'2024-02-12T00:00:00+00:00',
				'2024-02-13T00:00:00+00:00',
				'2024-02-14T00:00:00+00:00',
				'2024-02-15T00:00:00+00:00',
				'2024-02-16T00:00:00+00:00',
				'2024-02-17T00:00:00+00:00',
			),
			array(
				'2024-02-18T00:00:00+00:00',
				'2024-02-19T00:00:00+00:00',
				'2024-02-20T00:00:00+00:00',
				'2024-02-21T00:00:00+00:00',
				'2024-02-22T00:00:00+00:00',
				'2024-02-23T00:00:00+00:00',
				'2024-02-24T00:00:00+00:00',
			),
			array(
				'2024-02-25T00:00:00+00:00',
				'2024-02-26T00:00:00+00:00',
				'2024-02-27T00:00:00+00:00',
				'2024-02-28T00:00:00+00:00',
				'2024-02-29T00:00:00+00:00',
				'2024-03-01T00:00:00+00:00',
				'2024-03-02T00:00:00+00:00',
			),
		)
	);
}

test(
	'GET wpappointments/v1/calendar-availability - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'calendar-availability',
			array(
				'calendar' => make_valid_calendar_input(),
				'timezone' => 'UTC',
				'trim'     => true,
			)
		);

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data['data'] )->toHaveKey( 'availability' );
		expect( $data['data']['availability'] )->toHaveLength( 5 );
		expect( $data['data']['availability'] )->toBeAvailabilityMonth();
	}
);

test(
	'GET wpappointments/v1/calendar-availability - status 422 - missing calendar',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'calendar-availability',
			array(
				'timezone' => 'UTC',
				'trim'     => true,
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'missing_calendar' );
	}
);

test(
	'GET wpappointments/v1/calendar-availability - status 422 - missing timezone',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'calendar-availability',
			array(
				'calendar' => make_valid_calendar_input(),
				'trim'     => true,
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'missing_timezone' );
	}
);

test(
	'GET wpappointments/v1/calendar-availability - status 422 - invalid calendar payload',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'calendar-availability',
			array(
				'calendar' => wp_json_encode(
					array(
						array(
							'2024-01-28T00:00:00+00:00',
							'2024-01-29T00:00:00+00:00',
							'2024-01-30T00:00:00+00:00',
							'2024-01-31T00:00:00+00:00',
							'2024-02-01T00:00:00+00:00',
							'2024-02-02T00:00:00+00:00',
							'2024-02-03T00:00:00+00:00',
						),
					)
				),
				'timezone' => 'UTC',
				'trim'     => true,
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'invalid_calendar' );
	}
);
