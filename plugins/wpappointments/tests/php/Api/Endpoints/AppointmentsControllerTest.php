<?php
/**
 * Test the appointments API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

uses( \TestTools\RestTestCase::class );

expect()->extend(
	'toBeAppointment',
	function () {
		$appointment = $this->value;

		expect( $appointment )->toBeArray();
		expect( $appointment )->toHaveKeys(
			array(
				'id',
				'service',
				'timestamp',
				'status',
				'duration',
				'customerId',
				'customer',
			)
		);

		expect( $appointment['id'] )->toBeInt();
		expect( $appointment['service'] )->toBeString();
		expect( $appointment['timestamp'] )->toBeInt();
		expect( $appointment['status'] )->toBeString();
		expect( $appointment['duration'] )->toBeInt();
		expect( $appointment['customerId'] )->toBeInt();
		expect( $appointment['customer'] )->toBeArray();

		expect( $appointment['customer'] )->toHaveKeys(
			array(
				'name',
				'email',
				'phone',
			)
		);

		expect( $appointment['customer']['name'] )->toBeString();
		expect( $appointment['customer']['email'] )->toBeString();
		expect( $appointment['customer']['phone'] )->toBeString();

		return $this;
	}
);

test(
	'GET wpappointments/v1/appointments - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create 5 appointments.
		$this->create_appointments(
			5,
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_get_request( 'appointments' );

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointments' );
		expect( $data['data']['appointments'] )->toHaveCount( 5 );
	}
);

test(
	'GET wpappointments/v1/appointments - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Make request.
		$results = $this->do_rest_get_request( 'appointments' );

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'GET wpappointments/v1/appointments - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Make request.
		$results = $this->do_rest_get_request( 'appointments' );

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'GET wpappointments/v1/appointments/upcoming - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create 5 appointments in the past.
		$this->create_appointments(
			5,
			array(
				'meta' => array(
					'timestamp' => time() - 3600,
				),
			)
		);

		// Create 10 appointments in the next 24 hours.
		$this->create_appointments(
			10,
			array(
				'meta' => array(
					'timestamp' => time() + 3600,
				),
			)
		);

		// Create 15 appointments in the future.
		$this->create_appointments(
			15,
			array(
				'meta' => array(
					'timestamp' => time() + 86400 * 2,
				),
			)
		);

		// Make request.
		$results = $this->do_rest_get_request( 'appointments/upcoming' );

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointments' );
		expect( $data['data']['appointments'] )->toHaveCount( 10 );
	}
);

test(
	'GET wpappointments/v1/appointments/upcoming - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Make request.
		$results = $this->do_rest_get_request( 'appointments' );

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'GET wpappointments/v1/appointments/upcoming - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Make request.
		$results = $this->do_rest_get_request( 'appointments/upcoming' );

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'POST wpappointments/v1/appointments - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_post_request(
			'appointments',
			array(
				'date'       => time() + 3600,
				'service'    => 'Service 1',
				'duration'   => 60,
				'customer'   => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
				'customerId' => 1,
				'status'     => 'confirmed',
			)
		);

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointment' );
		expect( $data['data']['appointment'] )->toBeAppointment();
	}
);

test(
	'POST wpappointments/v1/appointments - status 200 - with created customer',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_post_request(
			'appointments',
			array(
				'date'          => time() + 3600,
				'service'       => 'Service 1',
				'duration'      => 60,
				'customer'      => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
				'customerId'    => 1,
				'createAccount' => true,
				'password'      => 'password',
				'status'        => 'confirmed',
			)
		);

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointment' );
		expect( $data['data']['appointment'] )->toBeAppointment();
	}
);

test(
	'POST wpappointments/v1/appointments - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Make request.
		$results = $this->do_rest_post_request(
			'appointments',
			array(
				'date'       => time() + 3600,
				'service'    => 'Service 1',
				'duration'   => 60,
				'customer'   => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
				'customerId' => 1,
				'status'     => 'confirmed',
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'POST wpappointments/v1/appointments - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Make request.
		$results = $this->do_rest_post_request(
			'appointments',
			array(
				'date'       => time() + 3600,
				'service'    => 'Service 1',
				'duration'   => 60,
				'customer'   => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
				'customerId' => 1,
				'status'     => 'confirmed',
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'POST wpappointments/v1/public/appointments - status 200',
	function () {
		// Make request.
		$results = $this->do_rest_post_request(
			'public/appointments',
			array(
				'date'     => time() + 3600,
				'status'   => 'confirmed',
				'customer' => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
			)
		);

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointment' );
		expect( $data['data']['appointment'] )->toBeAppointment();
	}
);

test(
	'POST wpappointments/v1/public/appointments - status 200 - with created customer',
	function () {
		// Make request.
		$results = $this->do_rest_post_request(
			'public/appointments',
			array(
				'date'          => time() + 3600,
				'status'        => 'confirmed',
				'createAccount' => true,
				'password'      => 'password',
				'customer'      => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
			)
		);

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointment' );
		expect( $data['data']['appointment'] )->toBeAppointment();
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id} - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request(
			"appointments/{$appointment->appointment->ID}",
			array(
				'date'     => time() + 3600,
				'status'   => 'confirmed',
				'customer' => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
			)
		);

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointment' );
		expect( $data['data']['appointment'] )->toBeAppointment();
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id} - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request(
			"appointments/{$appointment->appointment->ID}",
			array(
				'date'     => time() + 3600,
				'status'   => 'confirmed',
				'customer' => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id} - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request(
			"appointments/{$appointment->appointment->ID}",
			array(
				'date'     => time() + 3600,
				'status'   => 'confirmed',
				'customer' => array(
					'name'  => 'John Doe',
					'email' => 'john@example.com',
					'phone' => '+1 (000) 000-0000',
				),
			)
		);

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id} - status 422 invalid post id',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_patch_request( 'appointments/999999999', array() );

		// Assert response data.
		expect( $results )->toBeError( 422, 'appointment_not_found' );
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id}/cancel - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request( "appointments/{$appointment->appointment->ID}/cancel" );

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointmentId' );
		expect( $data['data']['appointmentId'] )->toBeInt();
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id}/cancel - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request( "appointments/{$appointment->appointment->ID}/cancel" );

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id}/cancel - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request( "appointments/{$appointment->appointment->ID}/cancel" );

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id}/cancel - status 422 invalid post id',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_patch_request( 'appointments/999999999/cancel', array() );

		// Assert response data.
		expect( $results )->toBeError( 422, 'appointment_not_found' );
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id}/confirm - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request( "appointments/{$appointment->appointment->ID}/confirm" );

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointmentId' );
		expect( $data['data']['appointmentId'] )->toBeInt();
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id}/confirm - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request( "appointments/{$appointment->appointment->ID}/confirm" );

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id}/confirm - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_patch_request( "appointments/{$appointment->appointment->ID}/confirm" );

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/appointments/{id}/confirm - status 422 invalid post id',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_patch_request( 'appointments/999999999/confirm', array() );

		// Assert response data.
		expect( $results )->toBeError( 422, 'appointment_not_found' );
	}
);

test(
	'DELETE wpappointments/v1/appointments/{id} - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'cancelled',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_delete_request( "appointments/{$appointment->appointment->ID}" );

		// Check response.
		$data = $results->get_data();

		// Assert response data.
		expect( $results )->toBeSuccess();
		expect( $data )->toHaveKey( 'data' );
		expect( $data['data'] )->toHaveKey( 'appointmentId' );
		expect( $data['data']['appointmentId'] )->toBeInt();
	}
);

test(
	'DELETE wpappointments/v1/appointments/{id} - status 422 appointment not cancelled',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_delete_request( "appointments/{$appointment->appointment->ID}" );

		// Assert response data.
		expect( $results )->toBeError( 422, 'deleting_not_cancelled_appointment' );
	}
);

test(
	'DELETE wpappointments/v1/appointments/{id} - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_delete_request( "appointments/{$appointment->appointment->ID}" );

		// Assert response data.
		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'DELETE wpappointments/v1/appointments/{id} - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Create appointment.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Make request.
		$results = $this->do_rest_delete_request( "appointments/{$appointment->appointment->ID}" );

		// Assert response data.
		expect( $results )->toBeError( 403, 'rest_forbidden' );
	}
);

test(
	'DELETE wpappointments/v1/appointments/{id} - status 422 invalid post id',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_delete_request( 'appointments/999999999', array() );

		// Assert response data.
		expect( $results )->toBeError( 422, 'appointment_not_found' );
	}
);
