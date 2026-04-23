<?php
/**
 * BookableQuery - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Data\Query;

use WPAppointments\Data\Query\BookableQuery;

uses( \TestTools\TestCase::class )->group( 'query' );

test(
	'BookableQuery - all returns empty when no bookables',
	function () {
		$result = BookableQuery::all();

		expect( $result['bookables'] )->toBeArray();
		expect( $result['bookables'] )->toBeEmpty();
		expect( $result['total_items'] )->toBe( 0 );
	}
);

test(
	'BookableQuery - all returns bookables',
	function () {
		$this->create_bookables( 3 );

		$result = BookableQuery::all();

		expect( $result['bookables'] )->toHaveCount( 3 );
		expect( $result['total_items'] )->toBe( 3 );
	}
);

test(
	'BookableQuery - all with pagination',
	function () {
		$this->create_bookables( 5 );

		$result = BookableQuery::all(
			array(
				'postsPerPage' => 2,
				'paged'        => 1,
			)
		);

		expect( $result['bookables'] )->toHaveCount( 2 );
		expect( $result['total_items'] )->toBe( 5 );
		expect( $result['total_pages'] )->toBe( 3 );
		expect( $result['posts_per_page'] )->toBe( 2 );
		expect( $result['current_page'] )->toBe( 1 );
	}
);

test(
	'BookableQuery - active returns only active bookables',
	function () {
		$this->create_bookables(
			2,
			array(
				'meta' => array( 'active' => true ),
			)
		);
		$this->create_bookable(
			array(
				'meta' => array( 'active' => false ),
			)
		);

		$result = BookableQuery::active();

		expect( $result['bookables'] )->toHaveCount( 2 );
		expect( $result['total_items'] )->toBe( 2 );
	}
);

test(
	'BookableQuery - by_type filters by type',
	function () {
		$this->create_bookables(
			2,
			array(
				'meta' => array( 'type' => 'service' ),
			)
		);
		$this->create_bookable(
			array(
				'meta' => array( 'type' => 'table' ),
			)
		);

		$services = BookableQuery::by_type( 'service' );
		$tables   = BookableQuery::by_type( 'table' );

		expect( $services['bookables'] )->toHaveCount( 2 );
		expect( $tables['bookables'] )->toHaveCount( 1 );
	}
);

test(
	'BookableQuery - by_type with empty type returns all',
	function () {
		$this->create_bookables( 3 );

		$result = BookableQuery::by_type( '' );

		expect( $result['bookables'] )->toHaveCount( 3 );
	}
);
