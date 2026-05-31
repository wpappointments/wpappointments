<?php
/**
 * Appointments Query Test
 *
 * @package WPAppointments
 */

namespace Tests\Data\Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAppointments\Data\Query\AppointmentsQuery;

uses( \TestTools\TestCase::class )->group( 'query' );

test(
	'AppointmentsQuery::all',
	function () {
		// Create some test appointments.
		$this->create_appointment();
		$this->create_appointment();

		$results = AppointmentsQuery::all( array() );

		expect( $results )->toBeArray();
		expect( $results['appointments'] )->toHaveCount( 2 );
		expect( $results['total_items'] )->toBe( 2 );
	}
);

test(
	'AppointmentsQuery::upcoming',
	function () {
		// Create an upcoming appointment.
		$this->create_appointment(
			array(
				'meta' => array(
					'timestamp' => time() + 3600,
					'status'    => 'confirmed',
				),
			)
		);

		// Create a past appointment.
		$this->create_appointment(
			array(
				'meta' => array(
					'timestamp' => time() - 3600,
					'status'    => 'confirmed',
				),
			)
		);

		$results = AppointmentsQuery::upcoming( array() );

		expect( $results )->toBeArray();
		expect( $results['appointments'] )->toHaveCount( 1 );
		expect( $results['total_items'] )->toBe( 1 );
	}
);

test(
	'AppointmentsQuery::get_date_range_appointments filters by entity_id',
	function () {
		$now   = time();
		$start = $now;
		$end   = $now + 7 * DAY_IN_SECONDS;

		// Appointment for entity 111.
		$this->create_appointment(
			array(
				'meta' => array(
					'timestamp' => $now + HOUR_IN_SECONDS,
					'status'    => 'confirmed',
					'duration'  => 30,
					'entity_id' => 111,
				),
			)
		);

		// Appointment for entity 222.
		$this->create_appointment(
			array(
				'meta' => array(
					'timestamp' => $now + 2 * HOUR_IN_SECONDS,
					'status'    => 'confirmed',
					'duration'  => 30,
					'entity_id' => 222,
				),
			)
		);

		// Legacy appointment — no entity_id meta.
		$this->create_appointment(
			array(
				'meta' => array(
					'timestamp' => $now + 3 * HOUR_IN_SECONDS,
					'status'    => 'confirmed',
					'duration'  => 30,
				),
			)
		);

		// No filter → all three.
		$all = AppointmentsQuery::get_date_range_appointments( $start, $end );
		expect( $all['appointments'] )->toHaveCount( 3 );

		// Filter by entity 111 → one matching + legacy (no entity_id).
		$only_111 = AppointmentsQuery::get_date_range_appointments( $start, $end, 111 );
		expect( $only_111['appointments'] )->toHaveCount( 2 );

		// Filter by entity 222 → other matching + legacy.
		$only_222 = AppointmentsQuery::get_date_range_appointments( $start, $end, 222 );
		expect( $only_222['appointments'] )->toHaveCount( 2 );

		// Filter by an entity with no appointments → just the legacy one.
		$only_999 = AppointmentsQuery::get_date_range_appointments( $start, $end, 999 );
		expect( $only_999['appointments'] )->toHaveCount( 1 );
	}
);

test(
	'AppointmentsQuery::get_date_range_appointments exposes end_timestamp (explicit + fallback)',
	function () {
		$start = 2000000000;

		$single = wp_insert_post(
			array(
				'post_type'   => 'wpa-appointment',
				'post_status' => 'publish',
				'post_title'  => 'single',
				'meta_input'  => array(
					'status'    => 'confirmed',
					'timestamp' => $start,
					'duration'  => 30,
				),
			)
		);

		$multi_start = $start + 100;
		$multi       = wp_insert_post(
			array(
				'post_type'   => 'wpa-appointment',
				'post_status' => 'publish',
				'post_title'  => 'multi',
				'meta_input'  => array(
					'status'        => 'confirmed',
					'timestamp'     => $multi_start,
					'duration'      => 30,
					'end_timestamp' => $multi_start + 3 * DAY_IN_SECONDS,
				),
			)
		);

		$results = AppointmentsQuery::get_date_range_appointments( $start - 10, $start + 200 );

		$by_id = array();
		foreach ( $results['appointments'] as $appointment ) {
			$by_id[ $appointment['id'] ] = $appointment;
		}

		// Single-day falls back to start + duration*60.
		expect( $by_id[ $single ]['endTimestamp'] )->toBe( $start + 30 * 60 );
		// Multi-day honours the stored end_timestamp.
		expect( $by_id[ $multi ]['endTimestamp'] )->toBe( $multi_start + 3 * DAY_IN_SECONDS );
		expect( $by_id[ $multi ]['allDay'] )->toBeFalse();
	}
);
