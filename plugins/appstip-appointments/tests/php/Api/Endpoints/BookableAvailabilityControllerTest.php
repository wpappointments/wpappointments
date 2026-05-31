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

test(
	'calendar-slots passes context to the wpappointments_busy_periods filter',
	function () {
		$variant_id = create_availability_variant();
		$entity_id  = get_post( $variant_id )->post_parent;

		$captured = new \stdClass();

		$filter = function ( $periods, $context ) use ( $captured ) {
			$captured->context = $context;
			return $periods;
		};
		add_filter( 'wpappointments_busy_periods', $filter, 10, 2 );

		$this->do_rest_get_request(
			"bookables/{$entity_id}/calendar-slots",
			array(
				'calendar'   => wp_json_encode( array( array( '2026-06-01' ) ) ),
				'timezone'   => 'UTC',
				'employeeId' => 5,
			)
		);

		remove_filter( 'wpappointments_busy_periods', $filter, 10 );

		expect( $captured->context['employee_id'] )->toBe( 5 );
	}
);

test(
	'wpappointments_busy_periods filter can block an otherwise-open slot',
	function () {
		$variant_id = create_availability_variant();
		$entity_id  = get_post( $variant_id )->post_parent;

		// Block the whole of 2026-06-01 via an injected busy period.
		$filter = function ( $periods ) {
			$start     = new \DateTime( '2026-06-01 00:00:00', new \DateTimeZone( 'UTC' ) );
			$end       = new \DateTime( '2026-06-02 00:00:00', new \DateTimeZone( 'UTC' ) );
			$periods[] = new \DatePeriod( $start, new \DateInterval( 'PT1440M' ), $end );
			return $periods;
		};
		add_filter( 'wpappointments_busy_periods', $filter );

		$response = $this->do_rest_get_request(
			"bookables/{$entity_id}/calendar-slots",
			array(
				'calendar' => wp_json_encode( array( array( '2026-06-01' ) ) ),
				'timezone' => 'UTC',
			)
		);

		remove_filter( 'wpappointments_busy_periods', $filter );

		$data  = $response->get_data();
		$slots = $data['data']['availability'][0][0]['day'];

		// Every slot that day overlaps the injected busy period -> not available.
		$available = array_filter(
			$slots,
			function ( $s ) {
				return true === $s['available'];
			}
		);
		expect( $available )->toBeEmpty();
	}
);
