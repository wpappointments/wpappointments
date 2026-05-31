<?php
/**
 * Test the bookable availability API endpoints
 *
 * Focuses on the resource-context passthrough (employeeId/locationId) that Pro
 * narrowing layers consume. The request params must reach the availability
 * layer callbacks as `employee_id` / `location_id` context keys.
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAppointments\Availability\AvailabilityLayerRegistry;
use WPAppointments\Bookable\BookableTypeRegistry;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;

uses( \TestTools\RestTestCase::class )->group( 'api' );

beforeEach(
	function () {
		AvailabilityLayerRegistry::get_instance()->reset();
		BookableTypeRegistry::get_instance()->reset();
	}
);

/**
 * Helper: create a bookable entity with a variant and return the variant ID.
 *
 * @return int Variant post ID.
 */
function create_availability_variant() {
	$entity  = new BookableEntity( array( 'name' => 'Ctx Test' ) );
	$saved   = $entity->save();
	$variant = new BookableVariant(
		array(
			'parent_id'        => $saved->bookable->ID,
			'attribute_values' => array(),
		)
	);
	$v_saved = $variant->save();
	return $v_saved->variant->ID;
}

test(
	'GET bookable-availability - forwards employeeId/locationId to layer context',
	function () {
		$variant_id = create_availability_variant();

		$captured = new \stdClass();

		AvailabilityLayerRegistry::get_instance()->register(
			'test_capture',
			99,
			array(
				'type'     => 'narrowing',
				'callback' => function ( $context ) use ( $captured ) {
					$captured->context = $context;
					return null; // pass-through, do not narrow.
				},
			)
		);

		$this->do_rest_get_request(
			'bookable-availability/' . $variant_id,
			array(
				'employeeId' => 5,
				'locationId' => 7,
			)
		);

		expect( $captured->context['employee_id'] )->toBe( 5 );
		expect( $captured->context['location_id'] )->toBe( 7 );
	}
);

test(
	'GET bookable-availability - missing selectors default to 0',
	function () {
		$variant_id = create_availability_variant();

		$captured = new \stdClass();

		AvailabilityLayerRegistry::get_instance()->register(
			'test_capture',
			99,
			array(
				'type'     => 'narrowing',
				'callback' => function ( $context ) use ( $captured ) {
					$captured->context = $context;
					return null;
				},
			)
		);

		$this->do_rest_get_request( 'bookable-availability/' . $variant_id );

		expect( $captured->context['employee_id'] )->toBe( 0 );
		expect( $captured->context['location_id'] )->toBe( 0 );
	}
);

test(
	'wpappointments_availability_context filter can inject extra context keys',
	function () {
		$variant_id = create_availability_variant();

		$captured = new \stdClass();

		AvailabilityLayerRegistry::get_instance()->register(
			'test_capture',
			99,
			array(
				'type'     => 'narrowing',
				'callback' => function ( $context ) use ( $captured ) {
					$captured->context = $context;
					return null;
				},
			)
		);

		$filter = function ( $context ) {
			$context['custom_key'] = 'abc';
			return $context;
		};
		add_filter( 'wpappointments_availability_context', $filter );

		$this->do_rest_get_request( 'bookable-availability/' . $variant_id );

		remove_filter( 'wpappointments_availability_context', $filter );

		expect( $captured->context['custom_key'] )->toBe( 'abc' );
	}
);
