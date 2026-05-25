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
