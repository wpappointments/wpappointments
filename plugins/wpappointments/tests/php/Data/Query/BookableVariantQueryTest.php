<?php
/**
 * BookableVariantQuery - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Data\Query;

use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Query\BookableVariantQuery;

uses( \TestTools\TestCase::class )->group( 'query' );

/**
 * Helper to create a bookable entity.
 *
 * @param string $name Entity name.
 *
 * @return int
 */
function create_entity_for_query( $name = 'Test Bookable' ) {
	$bookable = new BookableEntity( array( 'name' => $name ) );
	$saved    = $bookable->save();
	return $saved->bookable->ID;
}

test(
	'BookableVariantQuery - by_entity returns empty when no variants',
	function () {
		$entity_id = create_entity_for_query();

		$result = BookableVariantQuery::by_entity( $entity_id );

		expect( $result['variants'] )->toBeEmpty();
		expect( $result['total_items'] )->toBe( 0 );
	}
);

test(
	'BookableVariantQuery - by_entity returns variants',
	function () {
		$entity_id = create_entity_for_query();

		$this->create_variant( array( 'post_parent' => $entity_id ) );
		$this->create_variant( array( 'post_parent' => $entity_id ) );
		$this->create_variant( array( 'post_parent' => $entity_id ) );

		$result = BookableVariantQuery::by_entity( $entity_id );

		expect( $result['variants'] )->toHaveCount( 3 );
		expect( $result['total_items'] )->toBe( 3 );
	}
);

test(
	'BookableVariantQuery - by_entity does not return other entity variants',
	function () {
		$entity_a = create_entity_for_query( 'Entity A' );
		$entity_b = create_entity_for_query( 'Entity B' );

		$this->create_variant( array( 'post_parent' => $entity_a ) );
		$this->create_variant( array( 'post_parent' => $entity_a ) );
		$this->create_variant( array( 'post_parent' => $entity_b ) );

		$result_a = BookableVariantQuery::by_entity( $entity_a );
		$result_b = BookableVariantQuery::by_entity( $entity_b );

		expect( $result_a['variants'] )->toHaveCount( 2 );
		expect( $result_b['variants'] )->toHaveCount( 1 );
	}
);

test(
	'BookableVariantQuery - active returns only active variants',
	function () {
		$entity_id = create_entity_for_query();

		$this->create_variant(
			array(
				'post_parent' => $entity_id,
				'meta'        => array( 'active' => true ),
			)
		);
		$this->create_variant(
			array(
				'post_parent' => $entity_id,
				'meta'        => array( 'active' => true ),
			)
		);
		$this->create_variant(
			array(
				'post_parent' => $entity_id,
				'meta'        => array( 'active' => false ),
			)
		);

		$result = BookableVariantQuery::active( $entity_id );

		expect( $result['variants'] )->toHaveCount( 2 );
	}
);

test(
	'BookableVariantQuery - by_attributes finds matching variant',
	function () {
		$entity_id = create_entity_for_query();

		$this->create_variant(
			array(
				'post_parent' => $entity_id,
				'meta'        => array( 'attribute_values' => array( 'Duration' => '30' ) ),
			)
		);
		$target_id = $this->create_variant(
			array(
				'post_parent' => $entity_id,
				'meta'        => array( 'attribute_values' => array( 'Duration' => '60' ) ),
			)
		);

		$found = BookableVariantQuery::by_attributes(
			$entity_id,
			array( 'Duration' => '60' )
		);

		expect( $found )->not->toBeNull();
		expect( $found->ID )->toBe( $target_id );
	}
);

test(
	'BookableVariantQuery - by_attributes returns null when not found',
	function () {
		$entity_id = create_entity_for_query();

		$this->create_variant(
			array(
				'post_parent' => $entity_id,
				'meta'        => array( 'attribute_values' => array( 'Duration' => '30' ) ),
			)
		);

		$found = BookableVariantQuery::by_attributes(
			$entity_id,
			array( 'Duration' => '999' )
		);

		expect( $found )->toBeNull();
	}
);
