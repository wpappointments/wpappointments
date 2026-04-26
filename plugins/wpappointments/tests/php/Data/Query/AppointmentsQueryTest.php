<?php
/**
 * Appointments Query Test
 *
 * @package WPAppointments
 */

namespace Tests\Data\Query;

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
