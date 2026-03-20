<?php
/**
 * AvailabilityEngine - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Availability;

use WPAppointments\Availability\AvailabilityEngine;
use WPAppointments\Availability\AvailabilityLayerRegistry;
use WPAppointments\Bookable\BookableTypeRegistry;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;

uses( \TestTools\TestCase::class )->group( 'availability' );

beforeEach(
	function () {
		AvailabilityLayerRegistry::get_instance()->reset();
		BookableTypeRegistry::get_instance()->reset();
	}
);

/**
 * Helper: create a bookable entity with a variant and return variant ID.
 *
 * @param string $name Entity name.
 *
 * @return array{entity_id: int, variant_id: int}
 */
function create_entity_with_variant( $name = 'Test' ) {
	$entity  = new BookableEntity( array( 'name' => $name ) );
	$saved   = $entity->save();
	$variant = new BookableVariant(
		array(
			'parent_id'        => $saved->bookable->ID,
			'attribute_values' => array(),
		)
	);
	$v_saved = $variant->save();
	return array(
		'entity_id'  => $saved->bookable->ID,
		'variant_id' => $v_saved->variant->ID,
	);
}

/**
 * Helper: standard Mon-Fri 9-17 availability.
 *
 * @return array
 */
function weekday_schedule() {
	$weekly = array();
	$days   = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );

	foreach ( $days as $day ) {
		if ( in_array( $day, array( 'saturday', 'sunday' ), true ) ) {
			$weekly[ $day ] = array();
		} else {
			$weekly[ $day ] = array(
				array(
					'start' => '09:00',
					'end'   => '17:00',
				),
			);
		}
	}

	return array(
		'weekly'    => $weekly,
		'overrides' => array(),
	);
}

/**
 * Helper: every day 8-20 availability.
 *
 * @return array
 */
function wide_schedule() {
	$weekly = array();

	foreach ( AvailabilityEngine::WEEKDAYS as $day ) {
		$weekly[ $day ] = array(
			array(
				'start' => '08:00',
				'end'   => '20:00',
			),
		);
	}

	return array(
		'weekly'    => $weekly,
		'overrides' => array(),
	);
}

// --- Layer Registration Tests ---

test(
	'AvailabilityLayerRegistry - register a layer',
	function () {
		$result = AvailabilityLayerRegistry::get_instance()->register(
			'test_layer',
			10,
			array(
				'type'     => 'base',
				'callback' => function () {
					return null;
				},
			)
		);

		expect( $result )->toBeTrue();
		expect( AvailabilityLayerRegistry::get_instance()->has( 'test_layer' ) )->toBeTrue();
	}
);

test(
	'AvailabilityLayerRegistry - register duplicate returns error',
	function () {
		AvailabilityLayerRegistry::get_instance()->register(
			'test_layer',
			10,
			array(
				'type'     => 'base',
				'callback' => function () {
					return null;
				},
			)
		);

		$result = AvailabilityLayerRegistry::get_instance()->register(
			'test_layer',
			20,
			array(
				'type'     => 'base',
				'callback' => function () {
					return null;
				},
			)
		);

		expect( $result )->toBeWPError( 'availability_layer_exists' );
	}
);

test(
	'AvailabilityLayerRegistry - invalid type returns error',
	function () {
		$result = AvailabilityLayerRegistry::get_instance()->register(
			'bad_layer',
			10,
			array(
				'type'     => 'invalid',
				'callback' => function () {
					return null;
				},
			)
		);

		expect( $result )->toBeWPError( 'availability_layer_invalid_type' );
	}
);

test(
	'AvailabilityLayerRegistry - missing callback returns error',
	function () {
		$result = AvailabilityLayerRegistry::get_instance()->register(
			'bad_layer',
			10,
			array(
				'type' => 'base',
			)
		);

		expect( $result )->toBeWPError( 'availability_layer_invalid_callback' );
	}
);

test(
	'AvailabilityLayerRegistry - get_all returns layers sorted by priority',
	function () {
		$noop = function () {
			return null;
		};

		AvailabilityLayerRegistry::get_instance()->register(
			'c',
			30,
			array(
				'type'     => 'narrowing',
				'callback' => $noop,
			)
		);
		AvailabilityLayerRegistry::get_instance()->register(
			'a',
			0,
			array(
				'type'     => 'base',
				'callback' => $noop,
			)
		);
		AvailabilityLayerRegistry::get_instance()->register(
			'b',
			10,
			array(
				'type'     => 'base',
				'callback' => $noop,
			)
		);

		$layers = AvailabilityLayerRegistry::get_instance()->get_all();
		$slugs  = array_keys( $layers );

		expect( $slugs )->toBe( array( 'a', 'b', 'c' ) );
	}
);

// --- Intersection Tests ---

test(
	'AvailabilityEngine - intersect_ranges overlapping',
	function () {
		$a = array(
			array(
				'start' => '09:00',
				'end'   => '17:00',
			),
		);
		$b = array(
			array(
				'start' => '10:00',
				'end'   => '15:00',
			),
		);

		$result = AvailabilityEngine::intersect_ranges( $a, $b );

		expect( $result )->toHaveCount( 1 );
		expect( $result[0]['start'] )->toBe( '10:00' );
		expect( $result[0]['end'] )->toBe( '15:00' );
	}
);

test(
	'AvailabilityEngine - intersect_ranges no overlap',
	function () {
		$a = array(
			array(
				'start' => '09:00',
				'end'   => '12:00',
			),
		);
		$b = array(
			array(
				'start' => '13:00',
				'end'   => '17:00',
			),
		);

		$result = AvailabilityEngine::intersect_ranges( $a, $b );

		expect( $result )->toBeEmpty();
	}
);

test(
	'AvailabilityEngine - intersect_ranges fully contained',
	function () {
		$a = array(
			array(
				'start' => '08:00',
				'end'   => '20:00',
			),
		);
		$b = array(
			array(
				'start' => '10:00',
				'end'   => '14:00',
			),
		);

		$result = AvailabilityEngine::intersect_ranges( $a, $b );

		expect( $result )->toHaveCount( 1 );
		expect( $result[0]['start'] )->toBe( '10:00' );
		expect( $result[0]['end'] )->toBe( '14:00' );
	}
);

test(
	'AvailabilityEngine - intersect_ranges empty input',
	function () {
		$a = array(
			array(
				'start' => '09:00',
				'end'   => '17:00',
			),
		);

		expect( AvailabilityEngine::intersect_ranges( $a, array() ) )->toBeEmpty();
		expect( AvailabilityEngine::intersect_ranges( array(), $a ) )->toBeEmpty();
	}
);

test(
	'AvailabilityEngine - intersect_ranges multiple ranges',
	function () {
		$a = array(
			array(
				'start' => '09:00',
				'end'   => '12:00',
			),
			array(
				'start' => '14:00',
				'end'   => '18:00',
			),
		);
		$b = array(
			array(
				'start' => '10:00',
				'end'   => '16:00',
			),
		);

		$result = AvailabilityEngine::intersect_ranges( $a, $b );

		// 10-12 from first range × b, and 14-16 from second range × b.
		expect( $result )->toHaveCount( 2 );
		expect( $result[0] )->toBe(
			array(
				'start' => '10:00',
				'end'   => '12:00',
			)
		);
		expect( $result[1] )->toBe(
			array(
				'start' => '14:00',
				'end'   => '16:00',
			)
		);
	}
);

test(
	'AvailabilityEngine - intersect weekly schedules',
	function () {
		$a = weekday_schedule(); // Mon-Fri 9-17.
		$b = wide_schedule();    // Every day 8-20.

		$result = AvailabilityEngine::intersect( $a, $b );

		// Mon-Fri should be 9-17 (intersection of 9-17 and 8-20).
		expect( $result['weekly']['monday'] )->toBe(
			array(
				array(
					'start' => '09:00',
					'end'   => '17:00',
				),
			)
		);
		// Sat-Sun should be empty (intersection of empty and 8-20).
		expect( $result['weekly']['saturday'] )->toBeEmpty();
		expect( $result['weekly']['sunday'] )->toBeEmpty();
	}
);

// --- Base Layer Replacement Tests ---

test(
	'AvailabilityEngine - system defaults used as fallback',
	function () {
		$ids = create_entity_with_variant();

		$system_schedule = weekday_schedule();

		AvailabilityLayerRegistry::get_instance()->register(
			'system',
			0,
			array(
				'type'     => 'base',
				'callback' => function () use ( $system_schedule ) {
					return $system_schedule;
				},
			)
		);

		$result = AvailabilityEngine::get_effective_availability( $ids['variant_id'] );

		expect( $result['weekly']['monday'] )->toBe(
			array(
				array(
					'start' => '09:00',
					'end'   => '17:00',
				),
			)
		);
		expect( $result['weekly']['saturday'] )->toBeEmpty();
	}
);

test(
	'AvailabilityEngine - location base layer replaces system defaults',
	function () {
		$ids = create_entity_with_variant();

		$system_schedule   = weekday_schedule(); // Mon-Fri 9-17.
		$location_schedule = wide_schedule();     // Every day 8-20.

		AvailabilityLayerRegistry::get_instance()->register(
			'system',
			0,
			array(
				'type'     => 'base',
				'callback' => function () use ( $system_schedule ) {
					return $system_schedule;
				},
			)
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'location',
			10,
			array(
				'type'     => 'base',
				'callback' => function () use ( $location_schedule ) {
					return $location_schedule;
				},
			)
		);

		$result = AvailabilityEngine::get_effective_availability( $ids['variant_id'] );

		// Location replaced system: Saturday should now have hours.
		expect( $result['weekly']['saturday'] )->toBe(
			array(
				array(
					'start' => '08:00',
					'end'   => '20:00',
				),
			)
		);
		// Monday uses location's wider hours.
		expect( $result['weekly']['monday'] )->toBe(
			array(
				array(
					'start' => '08:00',
					'end'   => '20:00',
				),
			)
		);
	}
);

test(
	'AvailabilityEngine - base layer with no data falls back to system',
	function () {
		$ids = create_entity_with_variant();

		$system_schedule = weekday_schedule();

		AvailabilityLayerRegistry::get_instance()->register(
			'system',
			0,
			array(
				'type'     => 'base',
				'callback' => function () use ( $system_schedule ) {
					return $system_schedule;
				},
			)
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'location',
			10,
			array(
				'type'     => 'base',
				'callback' => function () {
					return null; // No data — pass through.
				},
			)
		);

		$result = AvailabilityEngine::get_effective_availability( $ids['variant_id'] );

		// System defaults used because location returned null.
		expect( $result['weekly']['monday'] )->toBe(
			array(
				array(
					'start' => '09:00',
					'end'   => '17:00',
				),
			)
		);
		expect( $result['weekly']['saturday'] )->toBeEmpty();
	}
);

// --- Narrowing Layer Tests ---

test(
	'AvailabilityEngine - entity narrows base availability',
	function () {
		$ids = create_entity_with_variant();

		$system_schedule = weekday_schedule(); // Mon-Fri 9-17.
		$entity_schedule = array(
			'weekly'    => array(
				'monday'    => array(
					array(
						'start' => '10:00',
						'end'   => '14:00',
					),
				),
				'tuesday'   => array(
					array(
						'start' => '10:00',
						'end'   => '14:00',
					),
				),
				'wednesday' => array(
					array(
						'start' => '10:00',
						'end'   => '14:00',
					),
				),
				'thursday'  => array(
					array(
						'start' => '10:00',
						'end'   => '14:00',
					),
				),
				'friday'    => array(
					array(
						'start' => '10:00',
						'end'   => '14:00',
					),
				),
				'saturday'  => array(
					array(
						'start' => '10:00',
						'end'   => '14:00',
					),
				),
				'sunday'    => array(
					array(
						'start' => '10:00',
						'end'   => '14:00',
					),
				),
			),
			'overrides' => array(),
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'system',
			0,
			array(
				'type'     => 'base',
				'callback' => function () use ( $system_schedule ) {
					return $system_schedule;
				},
			)
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'entity',
			20,
			array(
				'type'     => 'narrowing',
				'callback' => function () use ( $entity_schedule ) {
					return $entity_schedule;
				},
			)
		);

		$result = AvailabilityEngine::get_effective_availability( $ids['variant_id'] );

		// Monday: intersection of 9-17 and 10-14 = 10-14.
		expect( $result['weekly']['monday'] )->toBe(
			array(
				array(
					'start' => '10:00',
					'end'   => '14:00',
				),
			)
		);
		// Saturday: intersection of empty and 10-14 = empty.
		expect( $result['weekly']['saturday'] )->toBeEmpty();
	}
);

test(
	'AvailabilityEngine - narrowing layer with no data passes through',
	function () {
		$ids = create_entity_with_variant();

		$system_schedule = weekday_schedule();

		AvailabilityLayerRegistry::get_instance()->register(
			'system',
			0,
			array(
				'type'     => 'base',
				'callback' => function () use ( $system_schedule ) {
					return $system_schedule;
				},
			)
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'entity',
			20,
			array(
				'type'     => 'narrowing',
				'callback' => function () {
					return null; // No entity schedule — pass through.
				},
			)
		);

		$result = AvailabilityEngine::get_effective_availability( $ids['variant_id'] );

		// Should still be system defaults.
		expect( $result['weekly']['monday'] )->toBe(
			array(
				array(
					'start' => '09:00',
					'end'   => '17:00',
				),
			)
		);
	}
);

test(
	'AvailabilityEngine - multiple narrowing layers stack',
	function () {
		$ids = create_entity_with_variant();

		$system   = weekday_schedule(); // Mon-Fri 9-17.
		$entity   = array(
			'weekly'    => array(
				'monday'    => array(
					array(
						'start' => '10:00',
						'end'   => '16:00',
					),
				),
				'tuesday'   => array(
					array(
						'start' => '10:00',
						'end'   => '16:00',
					),
				),
				'wednesday' => array(
					array(
						'start' => '10:00',
						'end'   => '16:00',
					),
				),
				'thursday'  => array(
					array(
						'start' => '10:00',
						'end'   => '16:00',
					),
				),
				'friday'    => array(
					array(
						'start' => '10:00',
						'end'   => '16:00',
					),
				),
				'saturday'  => array(),
				'sunday'    => array(),
			),
			'overrides' => array(),
		);
		$employee = array(
			'weekly'    => array(
				'monday'    => array(
					array(
						'start' => '11:00',
						'end'   => '15:00',
					),
				),
				'tuesday'   => array(
					array(
						'start' => '11:00',
						'end'   => '15:00',
					),
				),
				'wednesday' => array(
					array(
						'start' => '11:00',
						'end'   => '15:00',
					),
				),
				'thursday'  => array(
					array(
						'start' => '11:00',
						'end'   => '15:00',
					),
				),
				'friday'    => array(
					array(
						'start' => '11:00',
						'end'   => '15:00',
					),
				),
				'saturday'  => array(),
				'sunday'    => array(),
			),
			'overrides' => array(),
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'system',
			0,
			array(
				'type'     => 'base',
				'callback' => function () use ( $system ) {
					return $system;
				},
			)
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'entity',
			20,
			array(
				'type'     => 'narrowing',
				'callback' => function () use ( $entity ) {
					return $entity;
				},
			)
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'employee',
			30,
			array(
				'type'     => 'narrowing',
				'callback' => function () use ( $employee ) {
					return $employee;
				},
			)
		);

		$result = AvailabilityEngine::get_effective_availability( $ids['variant_id'] );

		// Monday: 9-17 ∩ 10-16 ∩ 11-15 = 11-15.
		expect( $result['weekly']['monday'] )->toBe(
			array(
				array(
					'start' => '11:00',
					'end'   => '15:00',
				),
			)
		);
	}
);

// --- Edge Cases ---

test(
	'AvailabilityEngine - no layers returns empty availability',
	function () {
		$ids = create_entity_with_variant();

		$result = AvailabilityEngine::get_effective_availability( $ids['variant_id'] );

		expect( AvailabilityEngine::is_empty_availability( $result ) )->toBeTrue();
	}
);

test(
	'AvailabilityEngine - invalid variant ID returns empty',
	function () {
		$result = AvailabilityEngine::get_effective_availability( 99999 );

		expect( AvailabilityEngine::is_empty_availability( $result ) )->toBeTrue();
	}
);

test(
	'AvailabilityEngine - get_for_date uses override when available',
	function () {
		$availability = array(
			'weekly'    => array(
				'monday'    => array(
					array(
						'start' => '09:00',
						'end'   => '17:00',
					),
				),
				'tuesday'   => array(),
				'wednesday' => array(),
				'thursday'  => array(),
				'friday'    => array(),
				'saturday'  => array(),
				'sunday'    => array(),
			),
			'overrides' => array(
				'2026-03-23' => array(
					array(
						'start' => '10:00',
						'end'   => '14:00',
					),
				), // A Monday.
			),
		);

		// This date is a Monday, but has an override.
		$for_date = AvailabilityEngine::get_for_date( $availability, '2026-03-23' );
		expect( $for_date )->toBe(
			array(
				array(
					'start' => '10:00',
					'end'   => '14:00',
				),
			)
		);

		// A different Monday without override uses weekly.
		$for_date2 = AvailabilityEngine::get_for_date( $availability, '2026-03-30' );
		expect( $for_date2 )->toBe(
			array(
				array(
					'start' => '09:00',
					'end'   => '17:00',
				),
			)
		);
	}
);

test(
	'AvailabilityEngine - get_for_date with closure override',
	function () {
		$availability = array(
			'weekly'    => array(
				'monday'    => array(
					array(
						'start' => '09:00',
						'end'   => '17:00',
					),
				),
				'tuesday'   => array(),
				'wednesday' => array(),
				'thursday'  => array(),
				'friday'    => array(),
				'saturday'  => array(),
				'sunday'    => array(),
			),
			'overrides' => array(
				'2026-03-23' => array(), // Closed this Monday.
			),
		);

		$for_date = AvailabilityEngine::get_for_date( $availability, '2026-03-23' );
		expect( $for_date )->toBeEmpty();
	}
);

test(
	'AvailabilityEngine - intersect with date overrides',
	function () {
		$a = array(
			'weekly'    => array(
				'monday'    => array(
					array(
						'start' => '09:00',
						'end'   => '17:00',
					),
				),
				'tuesday'   => array(
					array(
						'start' => '09:00',
						'end'   => '17:00',
					),
				),
				'wednesday' => array(),
				'thursday'  => array(),
				'friday'    => array(),
				'saturday'  => array(),
				'sunday'    => array(),
			),
			'overrides' => array(
				'2026-03-23' => array(
					array(
						'start' => '09:00',
						'end'   => '12:00',
					),
				), // Monday, restricted.
			),
		);

		$b = array(
			'weekly'    => array(
				'monday'    => array(
					array(
						'start' => '10:00',
						'end'   => '16:00',
					),
				),
				'tuesday'   => array(
					array(
						'start' => '10:00',
						'end'   => '16:00',
					),
				),
				'wednesday' => array(),
				'thursday'  => array(),
				'friday'    => array(),
				'saturday'  => array(),
				'sunday'    => array(),
			),
			'overrides' => array(),
		);

		$result = AvailabilityEngine::intersect( $a, $b );

		// The override date gets the override value from $a intersected with $b's weekly for Monday.
		// $a override: 9-12, $b weekly monday: 10-16 → intersection = 10-12.
		expect( $result['overrides']['2026-03-23'] )->toBe(
			array(
				array(
					'start' => '10:00',
					'end'   => '12:00',
				),
			)
		);
	}
);

// --- Time conversion helpers ---

test(
	'AvailabilityEngine - time_to_minutes',
	function () {
		expect( AvailabilityEngine::time_to_minutes( '00:00' ) )->toBe( 0 );
		expect( AvailabilityEngine::time_to_minutes( '09:30' ) )->toBe( 570 );
		expect( AvailabilityEngine::time_to_minutes( '17:00' ) )->toBe( 1020 );
		expect( AvailabilityEngine::time_to_minutes( '23:59' ) )->toBe( 1439 );
	}
);

test(
	'AvailabilityEngine - minutes_to_time',
	function () {
		expect( AvailabilityEngine::minutes_to_time( 0 ) )->toBe( '00:00' );
		expect( AvailabilityEngine::minutes_to_time( 570 ) )->toBe( '09:30' );
		expect( AvailabilityEngine::minutes_to_time( 1020 ) )->toBe( '17:00' );
		expect( AvailabilityEngine::minutes_to_time( 1439 ) )->toBe( '23:59' );
	}
);

// --- Filter tests ---

test(
	'AvailabilityEngine - wpa_effective_availability filter applied',
	function () {
		$ids = create_entity_with_variant();

		AvailabilityLayerRegistry::get_instance()->register(
			'system',
			0,
			array(
				'type'     => 'base',
				'callback' => function () {
					return weekday_schedule();
				},
			)
		);

		$callback = function ( $availability ) {
			// Add a custom key to prove the filter was applied.
			$availability['filtered'] = true;
			return $availability;
		};

		add_filter( 'wpa_effective_availability', $callback, 10 );

		$result = AvailabilityEngine::get_effective_availability( $ids['variant_id'] );

		expect( $result['filtered'] )->toBeTrue();

		remove_filter( 'wpa_effective_availability', $callback, 10 );
	}
);
