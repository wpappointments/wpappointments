<?php
/**
 * Test the settings API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

use WPAppointments\Data\Model\Settings;

uses( \TestTools\RestTestCase::class );

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
		$settings->update_setting( 'appointments', 'defaultStatus', 'Confirmed' );

		$settings->update_setting( 'general', 'firstName', 'John' );
		$settings->update_setting( 'general', 'lastName', 'Doe' );
		$settings->update_setting( 'general', 'email', 'john@example.com' );
		$settings->update_setting( 'general', 'phoneNumber', '1234567890' );
		$settings->update_setting( 'general', 'companyName', 'Example Company' );
		$settings->update_setting( 'general', 'startOfWeek', 'monday' );
		$settings->update_setting( 'general', 'clockType', '24' );

		$settings->update_setting( 'general', 'timeFormat', '12' );
		$settings->update_setting( 'general', 'dateFormat', 'm/d/Y' );

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
	'GET wpappointments/v1/settings - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request( 'settings' );

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'settings' );
		expect( $data['data']['settings'] )->toBeArray();
		expect( $data['data']['settings'] )->toHaveLength( 3 );
		expect( $data['data']['settings'] )->toHaveKey( 'general' );
		expect( $data['data']['settings'] )->toHaveKey( 'appointments' );
		expect( $data['data']['settings'] )->toHaveKey( 'schedule' );
	}
);

test(
	'GET wpappointments/v1/settings - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Make request.
		$results = $this->do_rest_get_request( 'settings' );

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'GET wpappointments/v1/settings - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Make request.
		$results = $this->do_rest_get_request( 'settings' );

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'GET wpappointments/v1/settings/{category} - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_get_request( 'settings/general' );

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'settings' );
		expect( $data['data']['settings'] )->toBeArray();

		// Make request.
		$results = $this->do_rest_get_request( 'settings/appointments' );

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'settings' );
		expect( $data['data']['settings'] )->toBeArray();

		// Make request.
		$results = $this->do_rest_get_request( 'settings/schedule' );

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'settings' );
		expect( $data['data']['settings'] )->toBeArray();
	}
);

test(
	'GET wpappointments/v1/settings/{category} - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Make request.
		$results = $this->do_rest_get_request( 'settings/general' );

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'GET wpappointments/v1/settings/{category} - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Make request.
		$results = $this->do_rest_get_request( 'settings/general' );

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/settings/{category} - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_patch_request(
			'settings/general',
			array(
				'firstName'           => 'John',
				'lastName'            => 'Doe',
				'email'               => 'john@example.com',
				'phoneNumber'         => '1234567890',
				'companyName'         => 'Example Company',
				'startOfWeek'         => 'monday',
				'clockType'           => '24',
				'timezoneSiteDefault' => false,
				'timezone'            => 'Europe/London',
				'dateFormat'          => 'm/d/Y',
				'timeFormat'          => '12',
			)
		);

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'settings' );
		expect( $data['data']['settings'] )->toBeArray();
	}
);

test(
	'PATCH wpappointments/v1/settings/{category} - status 422 - invalid category',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_patch_request(
			'settings/nonexistent-category',
			array()
		);

		// Assert response data.
		expect( $results )->toBeError( 422, 'invalid_category' );
	}
);
