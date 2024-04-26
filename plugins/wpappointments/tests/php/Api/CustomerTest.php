<?php
/**
 * Test the customer API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api;

use WP_REST_Response;

uses( \TestTools\RestTestCase::class );

test(
	'GET wpappointments/v1/customers - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create 5 customers.
		$this->create_empty_customers( 5 );

		// Make request.
		$results = $this->do_rest_get_request( 'customers' );

		// Check response.
		$status = $results->get_status();
		$data   = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $status )->toBe( 200 );
		expect( $data )->toBeArray();
		expect( $data['type'] )->toBe( 'success' );
		expect( $data['data']['customers'] )->toHaveCount( 5 );
	}
);

test(
	'GET wpappointments/v1/customers - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Make request.
		$results = $this->do_rest_get_request( 'customers' );

		// Check response.
		$is_error = $results->is_error();
		$status   = $results->get_status();
		$data     = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $is_error )->toBeTrue();
		expect( $status )->toBe( 401 );
		expect( $data['code'] )->toBe( 'rest_forbidden' );
	}
);

test(
	'GET wpappointments/v1/customers - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Make request.
		$results = $this->do_rest_get_request( 'customers' );

		// Check response.
		$is_error = $results->is_error();
		$status   = $results->get_status();
		$data     = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $is_error )->toBeTrue();
		expect( $status )->toBe( 403 );
		expect( $data['code'] )->toBe( 'rest_forbidden' );
	}
);

test(
	'POST wpappointments/v1/customers - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request.
		$results = $this->do_rest_post_request(
			'customers',
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '12345',
			)
		);

		// Check response.
		$status   = $results->get_status();
		$data     = $results->get_data();
		$response = $data['data'];

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $status )->toBe( 200 );
		expect( $data )->toBeArray();
		expect( $data['type'] )->toBe( 'success' );
		expect( $response->message )->toBe( 'Customer created successfully' );
		expect( $response->customer['name'] )->toBe( 'John Doe' );
		expect( $response->customer['email'] )->toBe( 'john@example.com' );
		expect( $response->customer['phone'] )->toBe( '12345' );
	}
);

test(
	'POST wpappointments/v1/customers - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Make request.
		$results = $this->do_rest_post_request(
			'customers',
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '12345',
			)
		);

		// Check response.
		$is_error = $results->is_error();
		$status   = $results->get_status();
		$data     = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $is_error )->toBeTrue();
		expect( $status )->toBe( 401 );
		expect( $data['code'] )->toBe( 'rest_forbidden' );
	}
);

test(
	'POST wpappointments/v1/customers - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Make request.
		$results = $this->do_rest_post_request(
			'customers',
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '12345',
			)
		);

		// Check response.
		$is_error = $results->is_error();
		$status   = $results->get_status();
		$data     = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $is_error )->toBeTrue();
		expect( $status )->toBe( 403 );
		expect( $data['code'] )->toBe( 'rest_forbidden' );
	}
);

test(
	'POST wpappointments/v1/customers - status 422 invalid data',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Make request with invalid user data.
		$results = $this->do_rest_post_request(
			'customers',
			array(
				'name'  => '',
				'email' => '',
				'phone' => '12345',
			)
		);

		// Check response.
		$status = $results->get_status();
		$data   = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $status )->toBe( 422 );
		expect( $data )->toBeArray();
		expect( $data['type'] )->toBe( 'error' );
		expect( $data['message'] )->toBe( 'Cannot create a user with an empty login name.' );
	}
);

test(
	'DELETE wpappointments/v1/customers - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create a customer.
		$user_id = $this->create_default_customer();

		// Make request.
		$results = $this->do_rest_delete_request( 'customers/' . $user_id );

		// Check response.
		$status = $results->get_status();
		$data   = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $status )->toBe( 200 );
		expect( $data )->toBeArray();
		expect( $data['type'] )->toBe( 'success' );
		expect( $data['message'] )->toBe( 'Customer deleted successfully' );
	}
);

test(
	'DELETE wpappointments/v1/customers - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Create a customer.
		$user_id = $this->create_default_customer();

		// Make request.
		$results = $this->do_rest_delete_request( 'customers/' . $user_id );

		// Check response.
		$is_error = $results->is_error();
		$status   = $results->get_status();
		$data     = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $is_error )->toBeTrue();
		expect( $status )->toBe( 401 );
		expect( $data['code'] )->toBe( 'rest_forbidden' );
	}
);

test(
	'DELETE wpappointments/v1/customers - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Create a customer.
		$user_id = $this->create_default_customer();

		// Make request.
		$results = $this->do_rest_delete_request( 'customers/' . $user_id );

		// Check response.
		$is_error = $results->is_error();
		$status   = $results->get_status();
		$data     = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $is_error )->toBeTrue();
		expect( $status )->toBe( 403 );
		expect( $data['code'] )->toBe( 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/customers - status 200',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create a customer.
		$user_id = $this->create_default_customer();

		// Make request.
		$results = $this->do_rest_patch_request(
			'customers/' . $user_id,
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '12345',
			)
		);

		// Check response.
		$status   = $results->get_status();
		$data     = $results->get_data();
		$response = $data['data'];

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $status )->toBe( 200 );
		expect( $data )->toBeArray();
		expect( $data['type'] )->toBe( 'success' );
		expect( $response->message )->toBe( 'Customer updated successfully' );
		expect( $response->customer )->toBeTestCustomer();
	}
);

test(
	'PATCH wpappointments/v1/customers - status 401 unauthorized',
	function () {
		// Try without setting the current user (logged out).

		// Create a customer.
		$user_id = $this->create_default_customer();

		// Make request.
		$results = $this->do_rest_post_request(
			'customers/' . $user_id,
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '12345',
			)
		);

		// Check response.
		$is_error = $results->is_error();
		$status   = $results->get_status();
		$data     = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $is_error )->toBeTrue();
		expect( $status )->toBe( 401 );
		expect( $data['code'] )->toBe( 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/customers - status 403 forbidden',
	function () {
		// Log in as a customer role.
		wp_set_current_user( $this->create_empty_customer() );

		// Create a customer.
		$user_id = $this->create_default_customer();

		// Make request.
		$results = $this->do_rest_post_request(
			'customers/' . $user_id,
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '12345',
			)
		);

		// Check response.
		$is_error = $results->is_error();
		$status   = $results->get_status();
		$data     = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $is_error )->toBeTrue();
		expect( $status )->toBe( 403 );
		expect( $data['code'] )->toBe( 'rest_forbidden' );
	}
);

test(
	'PATCH wpappointments/v1/customers - status 422 invalid data',
	function () {
		// Log in as admin.
		wp_set_current_user( 1 );

		// Create a customer.
		$user_id = $this->create_default_customer();

		// Make request with invalid user data.
		$results = $this->do_rest_post_request(
			'customers/' . $user_id,
			array(
				'name'  => '',
				'email' => '',
				'phone' => '12345',
			)
		);

		// Check response.
		$status = $results->get_status();
		$data   = $results->get_data();

		// Assert response data.
		expect( $results )->toBeInstanceOf( WP_REST_Response::class );
		expect( $status )->toBe( 422 );
		expect( $data )->toBeArray();
		expect( $data['type'] )->toBe( 'error' );
		expect( $data['message'] )->toBe( 'Cannot create a user with an empty login name.' );
	}
);
