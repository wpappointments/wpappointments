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
