<?php
/**
 * Date utility class tests
 *
 * @package WPAppointments
 */

namespace Tests\Api;

uses( \TestTools\RestTestCase::class );

test(
  'GET wpappointments/v1/customer',
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