<?php
/**
 * Notifications event registry — test suite
 *
 * @package WPAppointments
 */

namespace Tests\Notifications;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAppointments\Notifications\Notifications;

uses( \TestTools\TestCase::class )->group( 'notifications' );

beforeEach(
	function () {
		// Force a rebuild of the lazy event cache so each test sees its own filter state.
		$reflection  = new \ReflectionClass( Notifications::class );
		$events_prop = $reflection->getProperty( 'events' );
		$events_prop->setAccessible( true );
		$events_prop->setValue( null, null );
	}
);

test(
	'Notifications - core events are present by default',
	function () {
		$events = Notifications::get_events();

		expect( $events )->toHaveKeys( array( 'created', 'updated', 'confirmed', 'cancelled' ) );
		expect( $events['created'] )->toHaveKeys(
			array( 'title', 'description', 'adminSubject', 'customerSubject', 'adminBody', 'customerBody' )
		);
	}
);

test(
	'Notifications - wpappointments_notification_events filter can add an event',
	function () {
		$callback = function ( $events ) {
			$events['employee_assigned'] = array(
				'title'           => 'Employee assigned',
				'description'     => 'Sent when an appointment is assigned to an employee.',
				'adminSubject'    => 'New booking',
				'customerSubject' => 'Booking confirmed',
				'adminBody'       => 'Body',
				'customerBody'    => 'Body',
			);
			return $events;
		};

		add_filter( 'wpappointments_notification_events', $callback );

		$events = Notifications::get_events();

		expect( $events )->toHaveKey( 'employee_assigned' );
		expect( $events['employee_assigned']['title'] )->toBe( 'Employee assigned' );

		remove_filter( 'wpappointments_notification_events', $callback );
	}
);

test(
	'Notifications - wpappointments_notification_events filter can override an existing event',
	function () {
		$callback = function ( $events ) {
			$events['created']['adminSubject'] = 'Custom subject';
			return $events;
		};

		add_filter( 'wpappointments_notification_events', $callback );

		$events = Notifications::get_events();

		expect( $events['created']['adminSubject'] )->toBe( 'Custom subject' );

		remove_filter( 'wpappointments_notification_events', $callback );
	}
);

test(
	'Notifications - filter returning a non-array falls back to core defaults',
	function () {
		$callback = function () {
			return 'not an array';
		};

		add_filter( 'wpappointments_notification_events', $callback );

		// _doing_it_wrong is expected; tell WP_UnitTestCase to capture it.
		$this->setExpectedIncorrectUsage( 'apply_filters( wpappointments_notification_events )' );
		$events = Notifications::get_events();

		expect( $events )->toHaveKeys( array( 'created', 'updated', 'confirmed', 'cancelled' ) );

		remove_filter( 'wpappointments_notification_events', $callback );
	}
);

test(
	'Notifications - filter returning a non-array entry drops that entry',
	function () {
		$callback = function ( $events ) {
			$events['bogus'] = 'string instead of array';
			return $events;
		};

		add_filter( 'wpappointments_notification_events', $callback );

		$this->setExpectedIncorrectUsage( 'apply_filters( wpappointments_notification_events )' );
		$events = Notifications::get_events();

		expect( $events )->not->toHaveKey( 'bogus' );
		expect( $events )->toHaveKey( 'created' );

		remove_filter( 'wpappointments_notification_events', $callback );
	}
);

test(
	'Notifications - filter entry missing required keys is dropped',
	function () {
		$callback = function ( $events ) {
			$events['partial'] = array(
				'title'       => 'Partial',
				'description' => 'Missing the body fields.',
				// adminSubject, customerSubject, adminBody, customerBody all missing.
			);
			return $events;
		};

		add_filter( 'wpappointments_notification_events', $callback );

		$this->setExpectedIncorrectUsage( 'apply_filters( wpappointments_notification_events )' );
		$events = Notifications::get_events();

		expect( $events )->not->toHaveKey( 'partial' );
		expect( $events )->toHaveKey( 'created' );

		remove_filter( 'wpappointments_notification_events', $callback );
	}
);
