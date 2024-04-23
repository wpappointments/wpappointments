<?php
/**
 * Date utility class tests
 *
 * @package WPAppointments
 */

namespace Tests\Api;

uses( \TestTools\RestTestCase::class );

test(
  'GET wpappointments/v1/customer - status 200',
  function() {
    wp_set_current_user( 1 );

    $this->factory()->user->create_many( 5, [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );

    $results = $this->do_rest_get_request( 'customer' );

    $this->assertInstanceOf( \WP_REST_Response::class, $results );

    $status = $results->get_status();

    $this->assertEquals( 200, $status );

    $data = $results->get_data();

    $this->assertIsArray( $data );
    $this->assertEquals( "success", $data['type'] );
    $this->assertCount( 5, $data['data']->customers );
  }
);

test(
  'GET wpappointments/v1/customer - status 401 unauthorized',
  function() {
    $user_id = $this->factory()->user->create( [
      'role' => 'wpa-customer',
      'meta_input' => [
        'phone' => '12345'
      ]
    ] );
    wp_set_current_user( $user_id );

    $results = $this->do_rest_get_request( 'customer' );
    $is_error = $results->is_error();
    $status = $results->get_status();
    $data = $results->get_data();

    $this->assertInstanceOf( \WP_REST_Response::class, $results );
    $this->assertTrue( $is_error );
    $this->assertEquals( 401, $status );
    $this->assertEquals( "rest_forbidden", $data['type'] );
  }
)->only();