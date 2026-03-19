<?php
/**
 * Test the bookable types API endpoint
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

use WPAppointments\Bookable\BookableTypeRegistry;
use Tests\Bookable\Stubs\StubServiceHandler;

uses( \TestTools\RestTestCase::class )->group( 'api' );

beforeEach(
	function () {
		BookableTypeRegistry::get_instance()->reset();

		$role = get_role( 'administrator' );
		if ( $role ) {
			$role->add_cap( 'wpa_manage_bookables' );
		}
	}
);

test(
	'GET wpappointments/v1/bookable-types - status 200 with registered types',
	function () {
		wp_set_current_user( 1 );

		BookableTypeRegistry::get_instance()->register( 'service', StubServiceHandler::class );

		$results = $this->do_rest_get_request( 'bookable-types' );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['types'] )->toHaveCount( 1 );
		expect( $data['data']['types'][0]['slug'] )->toBe( 'service' );
		expect( $data['data']['types'][0]['label'] )->toBe( 'Service' );
		expect( $data['data']['types'][0]['variantOverridable'] )->toBe( array( 'duration', 'price' ) );

		// Fields are serialized as a sequential array with name embedded.
		$fields = $data['data']['types'][0]['fields'];
		expect( $fields )->toHaveCount( 3 );

		// Duration field — number with validation.
		expect( $fields[0]['name'] )->toBe( 'duration' );
		expect( $fields[0]['type'] )->toBe( 'number' );
		expect( $fields[0]['label'] )->toBe( 'Duration (min)' );
		expect( $fields[0]['default'] )->toBe( 60 );
		expect( $fields[0]['required'] )->toBeTrue();
		expect( $fields[0]['validation'] )->toBe( array( 'min' => 1 ) );

		// Price field — number without validation.
		expect( $fields[1]['name'] )->toBe( 'price' );
		expect( $fields[1]['type'] )->toBe( 'number' );
		expect( $fields[1]['default'] )->toBe( 0 );
		expect( $fields[1]['required'] )->toBeFalse();

		// Category field — select with options.
		expect( $fields[2]['name'] )->toBe( 'category' );
		expect( $fields[2]['type'] )->toBe( 'select' );
		expect( $fields[2]['options'] )->toHaveCount( 2 );
		expect( $fields[2]['options'][0]['value'] )->toBe( 'massage' );
	}
);

test(
	'GET wpappointments/v1/bookable-types - status 200 empty when no types registered',
	function () {
		wp_set_current_user( 1 );

		$results = $this->do_rest_get_request( 'bookable-types' );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['types'] )->toBeEmpty();
	}
);

test(
	'GET wpappointments/v1/bookable-types - status 401 unauthorized',
	function () {
		$results = $this->do_rest_get_request( 'bookable-types' );

		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);
