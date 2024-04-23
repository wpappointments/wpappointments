<?php
/**
 * Test the customer API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api;

uses( \TestTools\RestTestCase::class );

test(
  'GET wpappointments/v1/customer - status 200',
  function() {
    // Log in as admin.
    wp_set_current_user( 1 );

    // Create 5 customers.
    $this->factory()->user->create_many( 5, [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );

    // Make request.
    $results = $this->do_rest_get_request( 'customer' );

    // Check response.
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertEquals( 200, $status );
    $this->assertIsArray( $data );
    $this->assertEquals( "success", $data['type'] );
    $this->assertCount( 5, $data['data']->customers );
  }
);

test(
  'GET wpappointments/v1/customer - status 401 unauthorized',
  function() {
    // Try without setting the current user (logged out).

    // Make request.
    $results = $this->do_rest_get_request( 'customer' );

    // Check response.
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 401, $status );
    $this->assertEquals( "rest_forbidden", $data['code'] );
  }
);

test(
  'GET wpappointments/v1/customer - status 403 forbidden',
  function() {
    // Log in as a customer role.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );
    wp_set_current_user( $user_id );
      
    // Make request.
    $results = $this->do_rest_get_request( 'customer' );

    // Check response.
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 403, $status );
    $this->assertEquals( "rest_forbidden", $data['code'] );
  }
);

test(
  'POST wpappointments/v1/customer - status 200',
  function() {
    // Log in as admin.
    wp_set_current_user( 1 );

    // Make request.
    $results = $this->do_rest_post_request( 'customer', [
      'name' => 'John Doe',
      'email' => 'john@example.com',
      'phone' => '12345'
    ] );

    // Check response.
    $status = $results->get_status();
    $data = $results->get_data();
    $response = $data['data'];

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertEquals( 200, $status );
    $this->assertIsArray( $data );
    $this->assertEquals( "success", $data['type'] );
    $this->assertEquals( "Customer created successfully", $response->message );
    $this->assertEquals( "John Doe", $response->customer['name'] );
    $this->assertEquals( "john@example.com", $response->customer['email'] );
    $this->assertEquals( "12345", $response->customer['phone'] );
  }
);

test(
  'POST wpappointments/v1/customer - status 401 unauthorized',
  function() {
    // Try without setting the current user (logged out).

    // Make request.
    $results = $this->do_rest_post_request( 'customer', [
      'name' => 'John Doe',
      'email' => 'john@example.com',
      'phone' => '12345'
    ] );

    // Check response.
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 401, $status );
    $this->assertEquals( "rest_forbidden", $data['code'] );
  }
);

test(
  'POST wpappointments/v1/customer - status 403 forbidden',
  function() {
    // Log in as a customer role.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );
    wp_set_current_user( $user_id );
      
    // Make request.
    $results = $this->do_rest_post_request( 'customer', [
      'name' => 'John Doe',
      'email' => 'john@example.com',
      'phone' => '12345'
    ] );

    // Check response.
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 403, $status );
    $this->assertEquals( "rest_forbidden", $data['code'] );
  }
);

test(
  'POST wpappointments/v1/customer - status 422 invalid data',
  function() {
    // Log in as admin.
    wp_set_current_user( 1 );

    // Make request with invalid user data.
    $results = $this->do_rest_post_request( 'customer', [
      'name' => '',
      'email' => '',
      'phone' => '12345'
    ] );

    // Check response.
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertEquals( 422, $status );
    $this->assertIsArray( $data );
    $this->assertEquals( "error", $data['type'] );
    $this->assertEquals( "Cannot create a user with an empty login name.", $data['message'] );
  }
);

test(
  'DELETE wpappointments/v1/customer - status 200',
  function() {
    // Log in as admin.
    wp_set_current_user( 1 );

    // Create a customer.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );

    // Make request.
    $results = $this->do_rest_delete_request( 'customer/' . $user_id );

    // Check response.
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertEquals( 200, $status );
    $this->assertIsArray( $data );
    $this->assertEquals( "success", $data['type'] );
    $this->assertEquals( "Customer deleted successfully", $data['message'] );
  }
);

test(
  'DELETE wpappointments/v1/customer - status 401 unauthorized',
  function() {
    // Try without setting the current user (logged out).

    // Create a customer.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );

    // Make request.
    $results = $this->do_rest_delete_request( 'customer/' . $user_id );

    // Check response.
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 401, $status );
    $this->assertEquals( "rest_forbidden", $data['code'] );
  }
);

test(
  'DELETE wpappointments/v1/customer - status 403 forbidden',
  function() {
    // Log in as a customer role.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );
    wp_set_current_user( $user_id );
      
    // Create a customer.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );

    // Make request.
    $results = $this->do_rest_delete_request( 'customer/' . $user_id );

    // Check response.
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 403, $status );
    $this->assertEquals( "rest_forbidden", $data['code'] );
  }
);

test(
  'PATCH wpappointments/v1/customer - status 200',
  function() {
    // Log in as admin.
    wp_set_current_user( 1 );

    // Create a customer.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );

    // Make request.
    $results = $this->do_rest_patch_request( 'customer/' . $user_id , [
      'name' => 'John Doe',
      'email' => 'john@example.com',
      'phone' => '12345'
    ] );

    // Check response.
    $status = $results->get_status();
    $data = $results->get_data();
    $response = $data['data'];

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertEquals( 200, $status );
    $this->assertIsArray( $data );
    $this->assertEquals( "success", $data['type'] );
    $this->assertEquals( "Customer updated successfully", $response->message );
    $this->assertEquals( "John Doe", $response->customer['name'] );
    $this->assertEquals( "john@example.com", $response->customer['email'] );
    $this->assertEquals( "12345", $response->customer['phone'] );
  }
);

test(
  'PATCH wpappointments/v1/customer - status 401 unauthorized',
  function() {
    // Try without setting the current user (logged out).

    // Create a customer.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );

    // Make request.
    $results = $this->do_rest_post_request( 'customer/' . $user_id, [
      'name' => 'John Doe',
      'email' => 'john@example.com',
      'phone' => '12345'
    ] );

    // Check response.
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 401, $status );
    $this->assertEquals( "rest_forbidden", $data['code'] );
  }
);

test(
  'PATCH wpappointments/v1/customer - status 403 forbidden',
  function() {
    // Log in as a customer role.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );
    wp_set_current_user( $user_id );

    // Create a customer.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );
      
    // Make request.
    $results = $this->do_rest_post_request( 'customer/' . $user_id, [
      'name' => 'John Doe',
      'email' => 'john@example.com',
      'phone' => '12345'
    ] );

    // Check response.
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 403, $status );
    $this->assertEquals( "rest_forbidden", $data['code'] );
  }
);

test(
  'PATCH wpappointments/v1/customer - status 422 invalid data',
  function() {
    // Log in as admin.
    wp_set_current_user( 1 );

    // Create a customer.
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );

    // Make request with invalid user data.
    $results = $this->do_rest_post_request( 'customer/' . $user_id, [
      'name' => '',
      'email' => '',
      'phone' => '12345'
    ] );

    // Check response.
    $status = $results->get_status();
    $data = $results->get_data();

    // Assert response data.
    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertEquals( 422, $status );
    $this->assertIsArray( $data );
    $this->assertEquals( "error", $data['type'] );
    $this->assertEquals( "Cannot create a user with an empty login name.", $data['message'] );
  }
);