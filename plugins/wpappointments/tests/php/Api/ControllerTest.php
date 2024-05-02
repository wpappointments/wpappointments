<?php
/**
 * Test the settings API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api;

uses( \TestTools\TestCase::class );

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
