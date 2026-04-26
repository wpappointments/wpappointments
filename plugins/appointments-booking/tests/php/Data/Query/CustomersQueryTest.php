<?php
/**
 * Customers Query Test
 *
 * @package WPAppointments
 */

namespace Tests\Data\Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAppointments\Data\Query\CustomersQuery;

uses( \TestTools\TestCase::class )->group( 'query' );

test(
	'CustomersQuery::all',
	function () {
		// Create some test customers (users).
		add_role( 'wpa-customer', 'Customer' );
		$this->factory()->user->create( array( 'role' => 'wpa-customer' ) );
		$this->factory()->user->create( array( 'role' => 'wpa-customer' ) );

		$results = CustomersQuery::all();

		expect( $results )->toBeArray();
		expect( $results['customers'] )->toHaveCount( 2 );
		expect( $results['total_items'] )->toBe( 2 );
	}
);
