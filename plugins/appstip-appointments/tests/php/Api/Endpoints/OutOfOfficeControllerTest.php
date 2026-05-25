<?php
/**
 * Out-of-office controller — focused tests for the
 * wpappointments_ooo_allowed_user_ids filter (the seam Pro Employees
 * uses to authorise managers editing employee OOO).
 *
 * @package WPAppointments
 */

namespace Tests\Api\Endpoints;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAppointments\Api\Endpoints\OutOfOfficeController;

uses( \TestTools\TestCase::class )->group( 'api' );

/**
 * Invoke the private static verify_entry_owner via Reflection.
 *
 * @param int $entry_id Entry ID.
 * @return true|\WP_Error
 */
function invoke_verify_entry_owner( $entry_id ) {
	$method = ( new \ReflectionClass( OutOfOfficeController::class ) )->getMethod( 'verify_entry_owner' );
	$method->setAccessible( true );
	return $method->invoke( null, $entry_id );
}

beforeEach(
	function () {
		$this->owner_id    = self::factory()->user->create( array( 'role' => 'editor' ) );
		$this->stranger_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		$this->entry_id    = self::factory()->post->create( array( 'post_type' => 'wpa-ooo' ) );
		update_post_meta( $this->entry_id, 'user_id', $this->owner_id );
	}
);

test(
	'verify_entry_owner — owner is allowed by default',
	function () {
		wp_set_current_user( $this->owner_id );

		expect( invoke_verify_entry_owner( $this->entry_id ) )->toBeTrue();
	}
);

test(
	'verify_entry_owner — non-owner is denied by default',
	function () {
		wp_set_current_user( $this->stranger_id );

		$result = invoke_verify_entry_owner( $this->entry_id );

		expect( $result )->toBeWPError( 'ooo_forbidden' );
	}
);

test(
	'verify_entry_owner — wpappointments_ooo_allowed_user_ids filter can authorise extra users',
	function () {
		wp_set_current_user( $this->stranger_id );

		$callback = function ( $allowed, $entry_id, $current_id ) {
			expect( $entry_id )->toBe( $this->entry_id );
			expect( $current_id )->toBe( $this->stranger_id );
			$allowed[] = $this->stranger_id;
			return $allowed;
		};

		add_filter( 'wpappointments_ooo_allowed_user_ids', $callback, 10, 3 );

		$result = invoke_verify_entry_owner( $this->entry_id );

		expect( $result )->toBeTrue();

		remove_filter( 'wpappointments_ooo_allowed_user_ids', $callback, 10 );
	}
);

test(
	'verify_entry_owner — filter receives the owner ID in the default allowed list',
	function () {
		wp_set_current_user( $this->stranger_id );

		$received_allowed = null;

		$callback = function ( $allowed ) use ( &$received_allowed ) {
			$received_allowed = $allowed;
			return $allowed;
		};

		add_filter( 'wpappointments_ooo_allowed_user_ids', $callback );

		invoke_verify_entry_owner( $this->entry_id );

		expect( $received_allowed )->toBe( array( $this->owner_id ) );

		remove_filter( 'wpappointments_ooo_allowed_user_ids', $callback );
	}
);
