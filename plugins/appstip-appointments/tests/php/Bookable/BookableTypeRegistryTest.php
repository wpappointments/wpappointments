<?php
/**
 * BookableTypeRegistry - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Bookable;

use WPAppointments\Bookable\AbstractBookableTypeHandler;
use WPAppointments\Bookable\BookableTypeRegistry;
use Tests\Bookable\Stubs\StubServiceHandler;
use Tests\Bookable\Stubs\StubTableHandler;
use Tests\Bookable\Stubs\InvalidHandler;

uses( \TestTools\TestCase::class )->group( 'bookable' );

beforeEach(
	function () {
		BookableTypeRegistry::get_instance()->reset();
	}
);

// Registration tests.
test(
	'BookableTypeRegistry - register a bookable type',
	function () {
		$this->spy_hook( 'wpappointments_bookable_type_registered' );

		$result = BookableTypeRegistry::get_instance()->register(
			'service',
			StubServiceHandler::class
		);

		expect( $result )->toBeInstanceOf( AbstractBookableTypeHandler::class );
		expect( $result->get_slug() )->toBe( 'service' );
		expect( $result->get_label() )->toBe( 'Service' );
		expect( $this->get_hook_executions_count( 'wpappointments_bookable_type_registered' ) )->toBe( 1 );
	}
);

test(
	'BookableTypeRegistry - register duplicate type returns error',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );
		$result = BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );

		expect( $result )->toBeWPError( 'bookable_type_exists' );
	}
);

test(
	'BookableTypeRegistry - register with non-existent class returns error',
	function () {
		$result = BookableTypeRegistry::get_instance()->register(
			'service',
			'NonExistentHandlerClass'
		);

		expect( $result )->toBeWPError( 'bookable_type_handler_not_found' );
	}
);

test(
	'BookableTypeRegistry - register with invalid handler returns error',
	function () {
		$result = BookableTypeRegistry::get_instance()->register(
			'invalid',
			InvalidHandler::class
		);

		expect( $result )->toBeWPError( 'bookable_type_handler_invalid' );
	}
);

// Get type tests.
test(
	'BookableTypeRegistry - get registered type',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );

		$handler = BookableTypeRegistry::get_instance()->get( 'service' );

		expect( $handler )->toBeInstanceOf( StubServiceHandler::class );
		expect( $handler->get_slug() )->toBe( 'service' );
	}
);

test(
	'BookableTypeRegistry - get unregistered type returns null',
	function () {
		$handler = BookableTypeRegistry::get_instance()->get( 'nonexistent' );

		expect( $handler )->toBeNull();
	}
);

// Get all types tests.
test(
	'BookableTypeRegistry - get all registered types',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );
		BookableTypeRegistry::get_instance()->register( 'table', StubTableHandler::class );

		$types = BookableTypeRegistry::get_instance()->get_all();

		expect( $types )->toHaveCount( 2 );
		expect( $types )->toHaveKeys( array( 'service', 'table' ) );
	}
);

test(
	'BookableTypeRegistry - get all when empty',
	function () {
		$types = BookableTypeRegistry::get_instance()->get_all();

		expect( $types )->toBeEmpty();
	}
);

// Has type tests.
test(
	'BookableTypeRegistry - has returns true for registered type',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );

		expect( BookableTypeRegistry::get_instance()->has( 'service' ) )->toBeTrue();
	}
);

test(
	'BookableTypeRegistry - has returns false for unregistered type',
	function () {
		expect( BookableTypeRegistry::get_instance()->has( 'nonexistent' ) )->toBeFalse();
	}
);

// Unregister tests.
test(
	'BookableTypeRegistry - unregister a type',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );

		$result = BookableTypeRegistry::get_instance()->unregister( 'service' );

		expect( $result )->toBeTrue();
		expect( BookableTypeRegistry::get_instance()->has( 'service' ) )->toBeFalse();
	}
);

test(
	'BookableTypeRegistry - unregister nonexistent type returns false',
	function () {
		$result = BookableTypeRegistry::get_instance()->unregister( 'nonexistent' );

		expect( $result )->toBeFalse();
	}
);

// Field system tests.
test(
	'BookableTypeRegistry - handler get_fields returns type-specific fields',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );
		$handler = BookableTypeRegistry::get_instance()->get( 'service' );

		$fields = $handler->get_fields();

		expect( $fields )->toHaveKeys( array( 'duration', 'price', 'category' ) );
		expect( $fields['duration']['default'] )->toBe( 60 );
		expect( $fields['price']['default'] )->toBe( 0 );
	}
);

test(
	'BookableTypeRegistry - handler get_variant_overridable_fields',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );
		$handler = BookableTypeRegistry::get_instance()->get( 'service' );

		$overridable = $handler->get_variant_overridable_fields();

		expect( $overridable )->toBe( array( 'duration', 'price' ) );
		expect( $overridable )->not->toContain( 'category' );
	}
);

test(
	'BookableTypeRegistry - default get_variant_overridable_fields returns all fields',
	function () {
		BookableTypeRegistry::get_instance()->register( 'table', StubTableHandler::class );
		$handler = BookableTypeRegistry::get_instance()->get( 'table' );

		$overridable = $handler->get_variant_overridable_fields();

		expect( $overridable )->toBe( array( 'seats', 'section' ) );
	}
);

// Field schema tests.
test(
	'BookableTypeRegistry - handler get_fields includes full schema properties',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );
		$handler = BookableTypeRegistry::get_instance()->get( 'service' );

		$fields = $handler->get_fields();

		// Duration has type, label, required, and validation.
		expect( $fields['duration']['type'] )->toBe( 'number' );
		expect( $fields['duration']['label'] )->toBe( 'Duration (min)' );
		expect( $fields['duration']['required'] )->toBeTrue();
		expect( $fields['duration']['validation'] )->toBe( array( 'min' => 1 ) );

		// Category has options for select type.
		expect( $fields['category']['type'] )->toBe( 'select' );
		expect( $fields['category']['options'] )->toHaveCount( 2 );
		expect( $fields['category']['options'][0]['value'] )->toBe( 'massage' );
	}
);

// Validation tests.
test(
	'BookableTypeRegistry - handler validate passes valid data',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );
		$handler = BookableTypeRegistry::get_instance()->get( 'service' );

		$result = $handler->validate( array( 'duration' => 60 ) );

		expect( $result )->toBeArray();
		expect( $result['duration'] )->toBe( 60 );
	}
);

test(
	'BookableTypeRegistry - handler validate rejects invalid data',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );
		$handler = BookableTypeRegistry::get_instance()->get( 'service' );

		$result = $handler->validate( array( 'duration' => -10 ) );

		expect( $result )->toBeWPError( 'invalid_duration' );
	}
);

// Normalization tests.
test(
	'BookableTypeRegistry - handler normalize adds type-specific fields',
	function () {
		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );
		$handler = BookableTypeRegistry::get_instance()->get( 'service' );

		$base = array(
			'id'   => 1,
			'name' => 'Test',
			'type' => 'service',
		);

		$meta = array(
			'duration' => 60,
			'price'    => 25.00,
			'category' => 'haircut',
		);

		$normalized = $handler->normalize( $base, $meta );

		expect( $normalized )->toHaveKeys( array( 'id', 'name', 'type', 'duration', 'price', 'category' ) );
		expect( $normalized['duration'] )->toBe( 60 );
		expect( $normalized['price'] )->toBe( 25.00 );
		expect( $normalized['category'] )->toBe( 'haircut' );
	}
);
