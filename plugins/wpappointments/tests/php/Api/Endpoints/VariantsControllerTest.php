<?php
/**
 * Test the variants API endpoints
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

use WPAppointments\Bookable\BookableTypeRegistry;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;

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

/**
 * Helper to create a bookable entity.
 *
 * @param string $name Entity name.
 *
 * @return int Entity ID.
 */
function create_bookable_for_variants( $name = 'Test Bookable' ) {
	$entity = new BookableEntity( array( 'name' => $name ) );
	$saved  = $entity->save();
	return $saved->bookable->ID;
}

// GET /bookables/{id}/variants.
test(
	'GET wpappointments/v1/bookables/{id}/variants - status 200',
	function () {
		wp_set_current_user( 1 );

		$entity_id = create_bookable_for_variants();
		$this->create_variant( array( 'post_parent' => $entity_id ) );
		$this->create_variant( array( 'post_parent' => $entity_id ) );

		$results = $this->do_rest_get_request( "bookables/{$entity_id}/variants" );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		// 2 manually created + 1 default variant from entity save.
		expect( $data['data']['variants'] )->toHaveCount( 3 );
	}
);

test(
	'GET wpappointments/v1/bookables/{id}/variants - status 401 unauthorized',
	function () {
		$results = $this->do_rest_get_request( 'bookables/1/variants' );

		expect( $results )->toBeError( 401, 'rest_forbidden' );
	}
);

// POST /bookables/{id}/variants.
test(
	'POST wpappointments/v1/bookables/{id}/variants - status 200',
	function () {
		wp_set_current_user( 1 );

		$entity_id = create_bookable_for_variants();

		$results = $this->do_rest_post_request(
			"bookables/{$entity_id}/variants",
			array(
				'attribute_values' => array( 'Duration' => '60' ),
			)
		);
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['variant']['parentId'] )->toBe( $entity_id );
		expect( $data['data']['variant']['attributeValues'] )->toBe( array( 'Duration' => '60' ) );
	}
);

// POST /bookables/{id}/variants/generate.
test(
	'POST wpappointments/v1/bookables/{id}/variants/generate - status 200',
	function () {
		wp_set_current_user( 1 );

		$entity_id = create_bookable_for_variants();
		update_post_meta(
			$entity_id,
			'attributes',
			array(
				array(
					'name'   => 'Duration',
					'values' => array( '30', '60' ),
				),
			)
		);

		$results = $this->do_rest_post_request( "bookables/{$entity_id}/variants/generate" );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['variants'] )->toHaveCount( 2 );
	}
);

// GET /bookables/{id}/variants/{variant_id}.
test(
	'GET wpappointments/v1/bookables/{id}/variants/{variant_id} - status 200',
	function () {
		wp_set_current_user( 1 );

		$entity_id  = create_bookable_for_variants();
		$variant_id = $this->create_variant( array( 'post_parent' => $entity_id ) );

		$results = $this->do_rest_get_request( "bookables/{$entity_id}/variants/{$variant_id}" );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['variant']['id'] )->toBe( $variant_id );
	}
);

// POST /bookables/{id}/variants/{variant_id} (update).
test(
	'POST wpappointments/v1/bookables/{id}/variants/{variant_id} - status 200',
	function () {
		wp_set_current_user( 1 );

		$entity_id  = create_bookable_for_variants();
		$variant_id = $this->create_variant( array( 'post_parent' => $entity_id ) );

		$results = $this->do_rest_post_request(
			"bookables/{$entity_id}/variants/{$variant_id}",
			array( 'duration' => 90 )
		);
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['variant']['id'] )->toBe( $variant_id );
	}
);

// DELETE /bookables/{id}/variants/{variant_id}.
test(
	'DELETE wpappointments/v1/bookables/{id}/variants/{variant_id} - status 200',
	function () {
		wp_set_current_user( 1 );

		$entity_id  = create_bookable_for_variants();
		$variant_id = $this->create_variant( array( 'post_parent' => $entity_id ) );

		$results = $this->do_rest_delete_request( "bookables/{$entity_id}/variants/{$variant_id}" );
		$data    = $results->get_data();

		expect( $results )->toBeSuccess();
		expect( $data['data']['id'] )->toBe( $variant_id );
	}
);
