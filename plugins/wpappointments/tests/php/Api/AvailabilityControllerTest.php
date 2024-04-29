<?php
/**
 * Test the availability API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api;

use WP_REST_Response;
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
		$status = $results->get_status();
		$data   = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $status )->toBe( 200 );
		expect( $data )->toBeArray();
		expect( $data['type'] )->toBe( 'success' );
		expect( $data['data'] )->toHaveKey( 'availability' );
		expect( $data['data']['availability'] )->toHaveKey( 'month' );
		expect( $data['data']['availability']['month'] )->toBeAvailabilityMonthArray();
	}
);

test(
	'GET wpappointments/v1/calendar-availability - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request(
			'calendar-availability',
			array(
				'currentMonth' => 1,
				'currentYear'  => 2024,
				'timezone'     => 'UTC',
			)
		);

		// Check response.
		$status = $results->get_status();
		$data   = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $status )->toBe( 200 );
		expect( $data )->toBeArray();
		expect( $data['type'] )->toBe( 'success' );
		expect( $data['data'] )->toHaveKey( 'availability' );
		expect( $data['data']['availability'] )->toHaveKey( 'month' );
		expect( $data['data']['availability']['month'] )->toBeAvailabilityMonthArray();
	}
);
