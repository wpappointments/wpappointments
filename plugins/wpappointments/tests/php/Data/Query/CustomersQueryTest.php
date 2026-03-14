<?php
/**
 * Customers Query Test
 *
 * @package WPAppointments
 */

namespace Tests\Data\Query;

use WPAppointments\Data\Query\CustomersQuery;

uses( \TestTools\TestCase::class )->group( 'query' );

test(
	'CustomersQuery::all',
	function () {
		// Create some test customers (users).
		$this->factory()->user->create( array( 'role' => 'subscriber' ) );
		$this->factory()->user->create( array( 'role' => 'subscriber' ) );

		$results = CustomersQuery::all();

		expect( $results )->toBeArray();
		expect( $results['customers'] )->toHaveCount( 2 );
		expect( $results['total_items'] )->toBe( 2 );
	}
);
