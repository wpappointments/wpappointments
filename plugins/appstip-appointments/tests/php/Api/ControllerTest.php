<?php
/**
 * Test the settings API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api;

use WP_REST_Response;

uses( \TestTools\TestCase::class )->group( 'api' );

expect()->extend(
	'toBeError',
	function ( $status, $code ) {
		$response = $this->value;

		expect( $response )->toBeInstanceOf( WP_REST_Response::class );
		expect( $response->get_status() )->toBe( $status );

		$data = $response->get_data();

		expect( $data )->toBeArray();
		expect( $data['code'] )->toBe( $code );

		expect( $data['data'] )->toBeArray();
		expect( $data['data']['status'] )->toBe( $status );

		return $this;
	}
);

expect()->extend(
	'toBeSuccess',
	function () {
		$response = $this->value;

		expect( $response )->toBeInstanceOf( WP_REST_Response::class );

		$data = $response->get_data();

		expect( $data )->toBeArray();
		expect( $data['status'] )->toBe( 'success' );

		return $this;
	}
);

test(
	'Test invalid Controller class without init method',
	function () {
		// Create a mock class that extends the Controller class.
		$mock = new class() extends \WPAppointments\Api\Controller {
			// No init method.
		};

		// Call the init method.
		$error = $mock::init();

		// Check the error response.
		expect( $error )->toBeInstanceOf( \WP_Error::class );
		expect( $error->get_error_code() )->toBe( 'invalid_method' );
		expect( $error->get_error_message() )->toBe( "Method 'WPAppointments\Api\Controller::init' not implemented. Must be overridden in subclass." );
		expect( $error->get_error_data()['status'] )->toBe( 405 );
	}
);
