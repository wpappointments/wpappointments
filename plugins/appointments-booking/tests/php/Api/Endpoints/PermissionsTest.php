<?php
/**
 * Test permission checks across all REST endpoints
 *
 * Verifies that protected endpoints return 403 for users without
 * the required capability, and 200/success for authorized users.
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAppointments\Core\Capabilities;

uses( \TestTools\RestTestCase::class )->group( 'api', 'permissions' );

// -- Helpers -----------------------------------------------------------------

/**
 * Create a subscriber user (no custom capabilities).
 *
 * @return int User ID.
 */
function create_subscriber(): int {
	return wp_insert_user(
		array(
			'user_login' => 'subscriber_' . wp_generate_password( 6, false ),
			'user_pass'  => 'password',
			'role'       => 'subscriber',
		)
	);
}

// -- Appointments endpoints --------------------------------------------------

test(
	'Appointments: GET returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_get_request( 'appointments' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Appointments: GET returns 200 for admin',
	function () {
		wp_set_current_user( 1 );

		$result = $this->do_rest_get_request( 'appointments' );

		expect( $result )->toBeSuccess();
	}
);

test(
	'Appointments: POST returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_post_request(
			'appointments',
			array(
				'timestamp' => time() + 86400,
				'duration'  => 30,
			)
		);

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Appointments: DELETE returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_delete_request( 'appointments/1' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Appointments: PATCH returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_patch_request( 'appointments/1', array( 'status' => 'confirmed' ) );

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Appointments: cancel returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_patch_request( 'appointments/1/cancel' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Appointments: confirm returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_patch_request( 'appointments/1/confirm' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

// -- Settings endpoints ------------------------------------------------------

test(
	'Settings: GET returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_get_request( 'settings' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Settings: GET returns 200 for admin',
	function () {
		wp_set_current_user( 1 );

		$result = $this->do_rest_get_request( 'settings' );

		expect( $result )->toBeSuccess();
	}
);

test(
	'Settings: PATCH returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_patch_request(
			'settings/general',
			array( 'firstName' => 'Hacker' )
		);

		expect( $result->get_status() )->toBe( 403 );
	}
);

// -- Customers endpoints -----------------------------------------------------

test(
	'Customers: GET returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_get_request( 'customers' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Customers: GET returns 200 for admin',
	function () {
		wp_set_current_user( 1 );

		$result = $this->do_rest_get_request( 'customers' );

		expect( $result )->toBeSuccess();
	}
);

test(
	'Customers: POST returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_post_request(
			'customers',
			array(
				'name'  => 'Test',
				'email' => 'test@example.com',
			)
		);

		expect( $result->get_status() )->toBe( 403 );
	}
);

// -- Bookables endpoints -----------------------------------------------------

test(
	'Bookables: GET returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_get_request( 'bookables' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Bookables: GET returns 200 for admin',
	function () {
		wp_set_current_user( 1 );

		$result = $this->do_rest_get_request( 'bookables' );

		expect( $result )->toBeSuccess();
	}
);

test(
	'Bookables: POST returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_post_request(
			'bookables',
			array(
				'name' => 'Test Service',
				'type' => 'service',
			)
		);

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Bookables: DELETE returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_delete_request( 'bookables/1' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

// -- Variants endpoints ------------------------------------------------------

test(
	'Variants: GET returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_get_request( 'bookables/1/variants' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

test(
	'Variants: POST returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_post_request(
			'bookables/1/variants',
			array( 'name' => 'Test Variant' )
		);

		expect( $result->get_status() )->toBe( 403 );
	}
);

// -- Bookable Types endpoint -------------------------------------------------

test(
	'Bookable Types: GET returns 403 for subscriber',
	function () {
		wp_set_current_user( create_subscriber() );

		$result = $this->do_rest_get_request( 'bookable-types' );

		expect( $result->get_status() )->toBe( 403 );
	}
);

// -- Public endpoints (should work without auth) -----------------------------

test(
	'Public booking: POST appointments/book is public',
	function () {
		wp_set_current_user( 0 );

		$result = $this->do_rest_post_request(
			'appointments/book',
			array(
				'timestamp' => time() + 86400,
				'duration'  => 30,
			)
		);

		// Should not be 403 (may be 400 due to missing data, but not 403).
		expect( $result->get_status() )->not->toBe( 403 );
	}
);

test(
	'Public availability endpoint is accessible without auth',
	function () {
		wp_set_current_user( 0 );

		$result = $this->do_rest_get_request( 'availability' );

		expect( $result->get_status() )->not->toBe( 403 );
	}
);

// -- Granular capability: user with one cap but not another ------------------

test(
	'User with MANAGE_APPOINTMENTS cannot access settings',
	function () {
		$user_id = create_subscriber();
		$user    = get_user_by( 'id', $user_id );
		$user->add_cap( Capabilities::MANAGE_APPOINTMENTS );

		wp_set_current_user( $user_id );

		$appointments = $this->do_rest_get_request( 'appointments' );
		expect( $appointments )->toBeSuccess();

		$settings = $this->do_rest_get_request( 'settings' );
		expect( $settings->get_status() )->toBe( 403 );
	}
);

test(
	'User with MANAGE_SETTINGS cannot access appointments',
	function () {
		$user_id = create_subscriber();
		$user    = get_user_by( 'id', $user_id );
		$user->add_cap( Capabilities::MANAGE_SETTINGS );

		wp_set_current_user( $user_id );

		$settings = $this->do_rest_get_request( 'settings' );
		expect( $settings )->toBeSuccess();

		$appointments = $this->do_rest_get_request( 'appointments' );
		expect( $appointments->get_status() )->toBe( 403 );
	}
);

test(
	'User with MANAGE_CUSTOMERS cannot access bookables',
	function () {
		$user_id = create_subscriber();
		$user    = get_user_by( 'id', $user_id );
		$user->add_cap( Capabilities::MANAGE_CUSTOMERS );

		wp_set_current_user( $user_id );

		$customers = $this->do_rest_get_request( 'customers' );
		expect( $customers )->toBeSuccess();

		$bookables = $this->do_rest_get_request( 'bookables' );
		expect( $bookables->get_status() )->toBe( 403 );
	}
);

// -- Capabilities filter extension -------------------------------------------

test(
	'wpappointments_capabilities filter allows addon to add custom cap',
	function () {
		add_filter(
			'wpappointments_capabilities',
			function ( $caps ) {
				$caps[] = 'wpa_manage_custom_addon';
				return $caps;
			}
		);

		$caps = Capabilities::all();

		expect( $caps )->toContain( 'wpa_manage_custom_addon' );

		remove_all_filters( 'wpappointments_capabilities' );
	}
);
