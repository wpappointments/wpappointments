<?php
/**
 * Bookable type registration functions - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Bookable;

use WPAppointments\Bookable\AbstractBookableTypeHandler;
use WPAppointments\Bookable\BookableTypeRegistry;
use Tests\Bookable\Stubs\StubServiceHandler;

use function WPAppointments\Bookable\get_bookable_type;
use function WPAppointments\Bookable\get_registered_bookable_types;
use function WPAppointments\Bookable\register_bookable_type;

uses( \TestTools\TestCase::class )->group( 'bookable' );

beforeEach(
	function () {
		BookableTypeRegistry::get_instance()->reset();
	}
);

test(
	'register_bookable_type function registers a type',
	function () {
		$result = register_bookable_type( 'service', StubServiceHandler::class );

		expect( $result )->toBeInstanceOf( AbstractBookableTypeHandler::class );
	}
);

test(
	'get_bookable_type function returns handler',
	function () {
		register_bookable_type( 'service', StubServiceHandler::class );

		$handler = get_bookable_type( 'service' );

		expect( $handler )->toBeInstanceOf( StubServiceHandler::class );
	}
);

test(
	'get_bookable_type function returns null for unregistered',
	function () {
		$handler = get_bookable_type( 'nonexistent' );

		expect( $handler )->toBeNull();
	}
);

test(
	'get_registered_bookable_types returns all types',
	function () {
		register_bookable_type( 'service', StubServiceHandler::class );

		$types = get_registered_bookable_types();

		expect( $types )->toHaveCount( 1 );
		expect( $types )->toHaveKey( 'service' );
	}
);
