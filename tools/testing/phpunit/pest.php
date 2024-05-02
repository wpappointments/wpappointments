<?php
/**
 * Pest configuration file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace TestTools;

use WP_REST_Response;

/**
 * --------------------------------------------------------------------------
 * Test Case
 * --------------------------------------------------------------------------
 *
 * The closure you provide to your test functions is always bound to a specific PHPUnit test
 * case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
 * need to change it using the "uses()" function to bind a different classes or traits.
 *
 * for example
 * uses(Tests\TestCase::class)->in('Feature');
 */
/**
 * --------------------------------------------------------------------------
 * Expectations
 * --------------------------------------------------------------------------
 *
 * When you're writing tests, you often need to check that values meet certain conditions. The
 * "expect()" function gives you access to a set of "expectations" methods that you can use
 * to assert different things. Of course, you may extend the Expectation API at any time.
 */
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

expect()->extend(
	'toBeCustomer',
	function () {
		$customer = $this->value;

		expect( $customer )->toHaveKeys( array( 'name', 'email', 'phone' ) );
		expect( $customer['name'] )->toBeString();
		expect( $customer['email'] )->toBeString();
		expect( $customer['phone'] )->toBeString();

		return $this;
	}
);

/**
 * --------------------------------------------------------------------------
 * Functions
 * --------------------------------------------------------------------------
 *
 * While Pest is very powerful out-of-the-box, you may have some testing code specific to your
 * project that you don't want to repeat in every file. Here you can also expose helpers as
 * global functions to help you to reduce the number of lines of code in your test files.
 */
function something() {
	// ..
}
