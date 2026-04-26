<?php
/**
 * Test the bookables API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

use WPAppointments\Bookable\BookableTypeRegistry;
use WPAppointments\Data\Model\BookableEntity;

uses( \TestTools\RestTestCase::class )->group( 'api' );

beforeEach(
	function () {
		BookableTypeRegistry::get_instance()->reset();

		// Ensure the admin has all bookable capabilities.
		$role = get_role( 'administrator' );
		if ( $role ) {
			foreach ( \WPAppointments\Core\Capabilities::for_group( 'bookables' ) as $cap ) {
				$role->add_cap( $cap );
			}
		}
	}
);

// GET /bookables.
test(
	'GET wpappointments/v1/bookables - status 200',
	function () {
		wp_set_current_user( 1 );

		$this->create_bookables( 3 );

		$results = $this->do_rest_get_request( 'bookables' );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['bookables'] )->toHaveCount( 3 );
	}
);

test(
	'GET wpappointments/v1/bookables - status 401 unauthorized',
	function () {
		$results = $this->do_rest_get_request( 'bookables' );

		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

test(
	'GET wpappointments/v1/bookables - filter by type',
	function () {
		wp_set_current_user( 1 );

		$this->create_bookables(
			2,
			array( 'meta' => array( 'type' => 'service' ) )
		);
		$this->create_bookable(
			array( 'meta' => array( 'type' => 'table' ) )
		);

		$results = $this->do_rest_get_request(
			'bookables',
			array( 'type' => 'service' )
		);
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['bookables'] )->toHaveCount( 2 );
	}
);

// POST /bookables.
test(
	'POST wpappointments/v1/bookables - status 200',
	function () {
		wp_set_current_user( 1 );

		$results = $this->do_rest_post_request(
			'bookables',
			array(
				'name' => 'Test Bookable',
				'type' => 'service',
			)
		);
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['bookable']['name'] )->toBe( 'Test Bookable' );
		expect( $data['data']['bookable']['type'] )->toBe( 'service' );
	}
);

test(
	'POST wpappointments/v1/bookables - status 422 missing name',
	function () {
		wp_set_current_user( 1 );

		$results = $this->do_rest_post_request(
			'bookables',
			array( 'type' => 'service' )
		);

		expect( $results )->toBeError( 422, 'bookable_name_required' );
	}
);

test(
	'POST wpappointments/v1/bookables - status 401 unauthorized',
	function () {
		$results = $this->do_rest_post_request(
			'bookables',
			array(
				'name' => 'Test',
				'type' => 'service',
			)
		);

		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

// GET /bookables/{id}.
test(
	'GET wpappointments/v1/bookables/{id} - status 200',
	function () {
		wp_set_current_user( 1 );

		$bookable = new BookableEntity(
			array(
				'name' => 'Test Bookable',
				'type' => 'service',
			)
		);
		$saved    = $bookable->save();

		$results = $this->do_rest_get_request( 'bookables/' . $saved->bookable->ID );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['bookable']['name'] )->toBe( 'Test Bookable' );
	}
);

test(
	'GET wpappointments/v1/bookables/{id} - status 422 not found',
	function () {
		wp_set_current_user( 1 );

		$results = $this->do_rest_get_request( 'bookables/99999' );

		expect( $results )->toBeError( 422, 'bookable_not_found' );
	}
);

// POST /bookables/{id} (update).
test(
	'POST wpappointments/v1/bookables/{id} - status 200',
	function () {
		wp_set_current_user( 1 );

		$bookable = new BookableEntity(
			array(
				'name' => 'Original',
				'type' => 'service',
			)
		);
		$saved    = $bookable->save();

		$results = $this->do_rest_post_request(
			'bookables/' . $saved->bookable->ID,
			array( 'name' => 'Updated' )
		);
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['bookable']['name'] )->toBe( 'Updated' );
	}
);

// DELETE /bookables/{id}.
test(
	'DELETE wpappointments/v1/bookables/{id} - status 200',
	function () {
		wp_set_current_user( 1 );

		$bookable = new BookableEntity(
			array(
				'name' => 'To Delete',
				'type' => 'service',
			)
		);
		$saved    = $bookable->save();

		$results = $this->do_rest_delete_request( 'bookables/' . $saved->bookable->ID );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['id'] )->toBe( $saved->bookable->ID );
	}
);

test(
	'DELETE wpappointments/v1/bookables/{id} - status 401 unauthorized',
	function () {
		$results = $this->do_rest_delete_request( 'bookables/1' );

		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);
