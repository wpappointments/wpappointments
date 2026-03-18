<?php
/**
 * BookableVariant model - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Data\Model;

use stdClass;
use WP_Error;
use WP_Post;
use WPAppointments\Bookable\BookableTypeRegistry;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;

uses( \TestTools\TestCase::class )->group( 'model' );

beforeEach(
	function () {
		BookableTypeRegistry::get_instance()->reset();
	}
);

/**
 * Helper to create a bookable entity and return its ID.
 *
 * @param array $args Bookable data overrides.
 *
 * @return int
 */
function create_test_bookable( $args = array() ) {
	$data     = wp_parse_args(
		$args,
		array(
			'name' => 'Test Bookable',
			'type' => 'service',
		)
	);
	$bookable = new BookableEntity( $data );
	$saved    = $bookable->save();
	return $saved->bookable->ID;
}

// Constructor tests.
test(
	'BookableVariant model - constructor with ID',
	function () {
		$entity_id  = create_test_bookable();
		$variant_id = $this->create_variant( array( 'post_parent' => $entity_id ) );

		$variant = new BookableVariant( $variant_id );

		expect( $variant )->toBeInstanceOf( BookableVariant::class );
		expect( $variant->variant )->toBeInstanceOf( WP_Post::class );
	}
);

test(
	'BookableVariant model - constructor with null',
	function () {
		$variant = new BookableVariant( null );

		expect( $variant->variant )->toBeWPError( 'variant_cannot_be_null' );
	}
);

test(
	'BookableVariant model - constructor with invalid type',
	function () {
		$variant = new BookableVariant( new stdClass() );

		expect( $variant->variant )->toBeWPError( 'variant_invalid_type' );
	}
);

test(
	'BookableVariant model - constructor with wrong post type',
	function () {
		$post_id = wp_insert_post(
			array(
				'post_title'  => 'Regular post',
				'post_status' => 'publish',
				'post_type'   => 'post',
			)
		);

		$variant = new BookableVariant( $post_id );

		expect( $variant->variant )->toBeWPError( 'variant_invalid_type' );
	}
);

test(
	'BookableVariant model - constructor with data array',
	function () {
		$variant = new BookableVariant(
			array(
				'parent_id'        => 1,
				'attribute_values' => array( 'Duration' => '30' ),
			)
		);

		expect( $variant->variant )->toBeNull();
		expect( $variant->variant_data )->toBeArray();
		expect( $variant->variant_data['parent_id'] )->toBe( 1 );
	}
);

// Save method tests.
test(
	'BookableVariant model - save method',
	function () {
		$this->spy_hook( 'wpappointments_variant_created' );

		$entity_id = create_test_bookable();

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array( 'Duration' => '30' ),
				'active'           => true,
			)
		);

		$saved = $variant->save();

		expect( $saved )->toBeInstanceOf( BookableVariant::class );
		expect( $saved->variant )->toBeInstanceOf( WP_Post::class );
		expect( $saved->variant->post_parent )->toBe( $entity_id );
		expect( $this->get_hook_executions_count( 'wpappointments_variant_created' ) )->toBe( 1 );
	}
);

test(
	'BookableVariant model - save generates title from parent and attributes',
	function () {
		$entity_id = create_test_bookable( array( 'name' => 'Massage' ) );

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array( 'Duration' => '60min' ),
			)
		);

		$saved = $variant->save();

		expect( $saved->variant->post_title )->toBe( 'Massage — 60min' );
	}
);

test(
	'BookableVariant model - save with empty attributes uses parent title',
	function () {
		$entity_id = create_test_bookable( array( 'name' => 'Simple Service' ) );

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array(),
			)
		);

		$saved = $variant->save();

		expect( $saved->variant->post_title )->toBe( 'Simple Service' );
	}
);

test(
	'BookableVariant model - save without parent returns error',
	function () {
		$variant = new BookableVariant(
			array(
				'parent_id'        => 0,
				'attribute_values' => array(),
			)
		);

		$saved = $variant->save();

		expect( $saved )->toBeWPError( 'variant_parent_required' );
	}
);

test(
	'BookableVariant model - save with invalid parent returns error',
	function () {
		$variant = new BookableVariant(
			array(
				'parent_id'        => 99999,
				'attribute_values' => array(),
			)
		);

		$saved = $variant->save();

		expect( $saved )->toBeWPError( 'variant_parent_invalid' );
	}
);

// Update method tests.
test(
	'BookableVariant model - update method',
	function () {
		$this->spy_hook( 'wpappointments_variant_updated' );

		$entity_id = create_test_bookable();

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array( 'Duration' => '30' ),
			)
		);

		$saved   = $variant->save();
		$model   = new BookableVariant( $saved->variant );
		$updated = $model->update( array( 'duration' => 45 ) );

		expect( $updated )->toBeInstanceOf( BookableVariant::class );
		expect( $this->get_hook_executions_count( 'wpappointments_variant_updated' ) )->toBe( 1 );
	}
);

// Delete method tests.
test(
	'BookableVariant model - delete method',
	function () {
		$this->spy_hook( 'wpappointments_variant_deleted' );

		$entity_id = create_test_bookable();

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array(),
			)
		);

		$saved   = $variant->save();
		$model   = new BookableVariant( $saved->variant );
		$deleted = $model->delete();

		expect( $deleted )->toBe( $saved->variant->ID );
		expect( $this->get_hook_executions_count( 'wpappointments_variant_deleted' ) )->toBe( 1 );
	}
);

// Field inheritance tests.
test(
	'BookableVariant model - get_effective_field inherits from parent',
	function () {
		$entity_id = create_test_bookable();
		update_post_meta( $entity_id, 'duration', 60 );
		update_post_meta( $entity_id, 'buffer_before', 15 );

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array(),
			)
		);

		$saved = $variant->save();
		$model = new BookableVariant( $saved->variant );

		// Should inherit from parent.
		expect( $model->get_effective_field( 'duration' ) )->toBe( '60' );
		expect( $model->get_effective_field( 'buffer_before' ) )->toBe( '15' );
	}
);

test(
	'BookableVariant model - set_override overrides parent value',
	function () {
		$entity_id = create_test_bookable();
		update_post_meta( $entity_id, 'duration', 60 );

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array(),
			)
		);

		$saved = $variant->save();
		$model = new BookableVariant( $saved->variant );

		// Set override.
		$model->set_override( 'duration', 90 );

		expect( $model->get_effective_field( 'duration' ) )->toBe( '90' );
		expect( $model->is_overridden( 'duration' ) )->toBeTrue();
	}
);

test(
	'BookableVariant model - unset_override reverts to parent value',
	function () {
		$entity_id = create_test_bookable();
		update_post_meta( $entity_id, 'duration', 60 );

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array(),
			)
		);

		$saved = $variant->save();
		$model = new BookableVariant( $saved->variant );

		$model->set_override( 'duration', 90 );
		expect( $model->get_effective_field( 'duration' ) )->toBe( '90' );

		$model->unset_override( 'duration' );
		expect( $model->get_effective_field( 'duration' ) )->toBe( '60' );
		expect( $model->is_overridden( 'duration' ) )->toBeFalse();
	}
);

// Normalize tests.
test(
	'BookableVariant model - normalize includes effective values',
	function () {
		$entity_id = create_test_bookable();
		update_post_meta( $entity_id, 'duration', 60 );
		update_post_meta( $entity_id, 'buffer_before', 15 );

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array( 'Duration' => '60min' ),
			)
		);

		$saved      = $variant->save();
		$model      = new BookableVariant( $saved->variant );
		$normalized = $model->normalize();

		expect( $normalized )->toHaveKeys(
			array( 'id', 'parentId', 'name', 'active', 'attributeValues', 'overrides', 'duration', 'bufferBefore' )
		);
		expect( $normalized['parentId'] )->toBe( $entity_id );
		expect( $normalized['duration'] )->toBe( 60 );
		expect( $normalized['bufferBefore'] )->toBe( 15 );
		expect( $normalized['attributeValues'] )->toBe( array( 'Duration' => '60min' ) );
	}
);

// Matrix generation tests.
test(
	'BookableVariant - generate_from_matrix with no attributes creates default variant',
	function () {
		$entity_id = create_test_bookable();

		$variants = BookableVariant::generate_from_matrix( $entity_id );

		expect( $variants )->toBeArray();
		expect( $variants )->toHaveCount( 1 );
		expect( $variants[0] )->toBeInstanceOf( BookableVariant::class );
	}
);

test(
	'BookableVariant - generate_from_matrix with one attribute',
	function () {
		$entity_id = create_test_bookable();
		update_post_meta(
			$entity_id,
			'attributes',
			array(
				array(
					'name'   => 'Duration',
					'values' => array( '30', '45', '60' ),
				),
			)
		);

		$variants = BookableVariant::generate_from_matrix( $entity_id );

		expect( $variants )->toHaveCount( 3 );
	}
);

test(
	'BookableVariant - generate_from_matrix with two attributes',
	function () {
		$entity_id = create_test_bookable();
		update_post_meta(
			$entity_id,
			'attributes',
			array(
				array(
					'name'   => 'Duration',
					'values' => array( '30', '60' ),
				),
				array(
					'name'   => 'Type',
					'values' => array( 'Swedish', 'Deep Tissue' ),
				),
			)
		);

		$variants = BookableVariant::generate_from_matrix( $entity_id );

		// 2 × 2 = 4.
		expect( $variants )->toHaveCount( 4 );
	}
);

test(
	'BookableVariant - generate_from_matrix preserves existing variants',
	function () {
		$entity_id = create_test_bookable();
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

		// Generate initial variants.
		$first_run = BookableVariant::generate_from_matrix( $entity_id );
		expect( $first_run )->toHaveCount( 2 );

		$first_ids = array_map(
			function ( $v ) {
				return $v->variant->ID;
			},
			$first_run
		);

		// Generate again — should preserve existing.
		$second_run = BookableVariant::generate_from_matrix( $entity_id );
		expect( $second_run )->toHaveCount( 2 );

		$second_ids = array_map(
			function ( $v ) {
				return $v->variant->ID;
			},
			$second_run
		);

		expect( $second_ids )->toBe( $first_ids );
	}
);

test(
	'BookableVariant - generate_from_matrix deactivates removed combinations',
	function () {
		$entity_id = create_test_bookable();
		update_post_meta(
			$entity_id,
			'attributes',
			array(
				array(
					'name'   => 'Duration',
					'values' => array( '30', '60', '90' ),
				),
			)
		);

		BookableVariant::generate_from_matrix( $entity_id );

		// Remove '90' from attributes.
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

		$variants = BookableVariant::generate_from_matrix( $entity_id );

		// Should have 2 active variants.
		expect( $variants )->toHaveCount( 2 );
	}
);

test(
	'BookableVariant - generate_from_matrix with invalid entity returns error',
	function () {
		$result = BookableVariant::generate_from_matrix( 99999 );

		expect( $result )->toBeWPError( 'variant_entity_invalid' );
	}
);

// Default variant / simple bookable tests.
test(
	'BookableVariant - ensure_default_variant creates one variant',
	function () {
		$entity_id = create_test_bookable();

		$variants = BookableVariant::ensure_default_variant( $entity_id );

		expect( $variants )->toHaveCount( 1 );
		expect( $variants[0]->variant->post_parent )->toBe( $entity_id );
	}
);

test(
	'BookableVariant - ensure_default_variant is idempotent',
	function () {
		$entity_id = create_test_bookable();

		$first  = BookableVariant::ensure_default_variant( $entity_id );
		$second = BookableVariant::ensure_default_variant( $entity_id );

		expect( $first[0]->variant->ID )->toBe( $second[0]->variant->ID );
	}
);

test(
	'BookableVariant - sync_default_variant updates single variant fields',
	function () {
		$entity_id = create_test_bookable();
		BookableVariant::ensure_default_variant( $entity_id );

		$result = BookableVariant::sync_default_variant(
			$entity_id,
			array(
				'duration'      => 90,
				'buffer_before' => 10,
			)
		);

		expect( $result )->toBeInstanceOf( BookableVariant::class );

		$normalized = $result->normalize();
		expect( $normalized['duration'] )->toBe( 90 );
		expect( $normalized['bufferBefore'] )->toBe( 10 );
	}
);

test(
	'BookableVariant - sync_default_variant skips overridden fields',
	function () {
		$entity_id = create_test_bookable();
		$variants  = BookableVariant::ensure_default_variant( $entity_id );
		$variant   = $variants[0];

		// Override duration on the variant.
		$variant->set_override( 'duration', 120 );

		// Sync from parent — duration should NOT be overwritten.
		$result = BookableVariant::sync_default_variant(
			$entity_id,
			array(
				'duration'      => 90,
				'buffer_before' => 10,
			)
		);

		$model = new BookableVariant( $result->variant );

		expect( $model->get_effective_field( 'duration' ) )->toBe( '120' );
	}
);

test(
	'BookableVariant - sync_default_variant returns null for multi-variant entity',
	function () {
		$entity_id = create_test_bookable();

		// Create two variants manually.
		$this->create_variant( array( 'post_parent' => $entity_id ) );
		$this->create_variant( array( 'post_parent' => $entity_id ) );

		$result = BookableVariant::sync_default_variant(
			$entity_id,
			array( 'duration' => 90 )
		);

		expect( $result )->toBeNull();
	}
);

// Cascade delete tests.
test(
	'BookableVariant - delete_all_for_entity removes all variants',
	function () {
		$entity_id = create_test_bookable();

		$this->create_variant( array( 'post_parent' => $entity_id ) );
		$this->create_variant( array( 'post_parent' => $entity_id ) );
		$this->create_variant( array( 'post_parent' => $entity_id ) );

		$count = BookableVariant::delete_all_for_entity( $entity_id );

		expect( $count )->toBe( 3 );

		$remaining = get_children(
			array(
				'post_parent' => $entity_id,
				'post_type'   => 'wpa-bookable-variant',
				'numberposts' => -1,
			)
		);

		expect( $remaining )->toBeEmpty();
	}
);

test(
	'BookableEntity - delete cascades to variants',
	function () {
		$entity_id = create_test_bookable();

		$this->create_variant( array( 'post_parent' => $entity_id ) );
		$this->create_variant( array( 'post_parent' => $entity_id ) );

		$entity = new BookableEntity( get_post( $entity_id ) );
		$entity->delete();

		$remaining = get_children(
			array(
				'post_parent' => $entity_id,
				'post_type'   => 'wpa-bookable-variant',
				'numberposts' => -1,
			)
		);

		expect( $remaining )->toBeEmpty();
	}
);
