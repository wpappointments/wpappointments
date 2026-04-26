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
	'Granular capability constants are defined',
	function () {
		expect( Capabilities::VIEW_APPOINTMENTS )->toBe( 'wpa_view_appointments' );
		expect( Capabilities::CREATE_APPOINTMENTS )->toBe( 'wpa_create_appointments' );
		expect( Capabilities::EDIT_APPOINTMENTS )->toBe( 'wpa_edit_appointments' );
		expect( Capabilities::DELETE_APPOINTMENTS )->toBe( 'wpa_delete_appointments' );

		expect( Capabilities::VIEW_BOOKABLES )->toBe( 'wpa_view_bookables' );
		expect( Capabilities::CREATE_BOOKABLES )->toBe( 'wpa_create_bookables' );
		expect( Capabilities::EDIT_BOOKABLES )->toBe( 'wpa_edit_bookables' );
		expect( Capabilities::DELETE_BOOKABLES )->toBe( 'wpa_delete_bookables' );

		expect( Capabilities::VIEW_CUSTOMERS )->toBe( 'wpa_view_customers' );
		expect( Capabilities::CREATE_CUSTOMERS )->toBe( 'wpa_create_customers' );
		expect( Capabilities::EDIT_CUSTOMERS )->toBe( 'wpa_edit_customers' );
		expect( Capabilities::DELETE_CUSTOMERS )->toBe( 'wpa_delete_customers' );

		expect( Capabilities::VIEW_SERVICES )->toBe( 'wpa_view_services' );
		expect( Capabilities::CREATE_SERVICES )->toBe( 'wpa_create_services' );
		expect( Capabilities::EDIT_SERVICES )->toBe( 'wpa_edit_services' );
		expect( Capabilities::DELETE_SERVICES )->toBe( 'wpa_delete_services' );

		expect( Capabilities::VIEW_SCHEDULES )->toBe( 'wpa_view_schedules' );
		expect( Capabilities::CREATE_SCHEDULES )->toBe( 'wpa_create_schedules' );
		expect( Capabilities::EDIT_SCHEDULES )->toBe( 'wpa_edit_schedules' );
		expect( Capabilities::DELETE_SCHEDULES )->toBe( 'wpa_delete_schedules' );

		expect( Capabilities::VIEW_SETTINGS )->toBe( 'wpa_view_settings' );
		expect( Capabilities::EDIT_SETTINGS )->toBe( 'wpa_edit_settings' );
	}
);

test(
	'Capabilities::all returns all default capabilities',
	function () {
		$caps = Capabilities::all();

		expect( $caps )->toBeArray();
		expect( $caps )->toHaveCount( 22 );
		expect( $caps )->toContain( Capabilities::VIEW_APPOINTMENTS );
		expect( $caps )->toContain( Capabilities::CREATE_APPOINTMENTS );
		expect( $caps )->toContain( Capabilities::EDIT_APPOINTMENTS );
		expect( $caps )->toContain( Capabilities::DELETE_APPOINTMENTS );
		expect( $caps )->toContain( Capabilities::VIEW_SETTINGS );
		expect( $caps )->toContain( Capabilities::EDIT_SETTINGS );
	}
);

test(
	'Capabilities::for_group returns correct caps per entity group',
	function () {
		$appointment_caps = Capabilities::for_group( 'appointments' );

		expect( $appointment_caps )->toHaveCount( 4 );
		expect( $appointment_caps )->toContain( Capabilities::VIEW_APPOINTMENTS );
		expect( $appointment_caps )->toContain( Capabilities::CREATE_APPOINTMENTS );
		expect( $appointment_caps )->toContain( Capabilities::EDIT_APPOINTMENTS );
		expect( $appointment_caps )->toContain( Capabilities::DELETE_APPOINTMENTS );

		$settings_caps = Capabilities::for_group( 'settings' );

		expect( $settings_caps )->toHaveCount( 2 );
		expect( $settings_caps )->toContain( Capabilities::VIEW_SETTINGS );
		expect( $settings_caps )->toContain( Capabilities::EDIT_SETTINGS );

		expect( Capabilities::for_group( 'nonexistent' ) )->toBeEmpty();
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
	'Administrator role has all capabilities assigned after activation',
	function () {
		$plugin = \WPAppointments\Plugin::get_instance();
		$plugin->on_plugin_activation();

		$role = get_role( 'administrator' );

		expect( $role )->not->toBeNull();

		foreach ( Capabilities::all() as $cap ) {
			expect( $role->has_cap( $cap ) )->toBeTrue();
		}
	}
);
