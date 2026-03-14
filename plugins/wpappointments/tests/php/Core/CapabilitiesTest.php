<?php
/**
 * Capabilities class test
 *
 * @package WPAppointments
 */

namespace Tests\Core;

use WPAppointments\Core\Capabilities;

uses( \TestTools\TestCase::class )->group( 'core' );

test(
	'Capabilities constants are defined',
	function () {
		expect( Capabilities::MANAGE_APPOINTMENTS )->toBe( 'wpa_manage_appointments' );
		expect( Capabilities::MANAGE_SETTINGS )->toBe( 'wpa_manage_settings' );
		expect( Capabilities::MANAGE_SERVICES )->toBe( 'wpa_manage_services' );
		expect( Capabilities::MANAGE_CUSTOMERS )->toBe( 'wpa_manage_customers' );
	}
);

test(
	'Capabilities::all returns all default capabilities',
	function () {
		$caps = Capabilities::all();

		expect( $caps )->toBeArray();
		expect( $caps )->toContain( Capabilities::MANAGE_APPOINTMENTS );
		expect( $caps )->toContain( Capabilities::MANAGE_SETTINGS );
		expect( $caps )->toContain( Capabilities::MANAGE_SERVICES );
		expect( $caps )->toContain( Capabilities::MANAGE_CUSTOMERS );
	}
);

test(
	'Capabilities::all is filterable via wpappointments_capabilities',
	function () {
		add_filter(
			'wpappointments_capabilities',
			function ( $caps ) {
				$caps[] = 'wpa_custom_capability';
				return $caps;
			}
		);

		$caps = Capabilities::all();

		expect( $caps )->toContain( 'wpa_custom_capability' );

		remove_all_filters( 'wpappointments_capabilities' );
	}
);

test(
	'Administrator role has all capabilities assigned',
	function () {
		$role = get_role( 'administrator' );

		expect( $role )->not->toBeNull();

		foreach ( Capabilities::all() as $cap ) {
			expect( $role->has_cap( $cap ) )->toBeTrue();
		}
	}
);
