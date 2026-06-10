<?php
/**
 * Appointment model -
 *
 * @package WPAppointments
 */

namespace Tests\Data\Model;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WP_Error;
use WP_Post;
use WPAppointments\Data\Model\Appointment;

uses( \TestTools\TestCase::class )->group( 'model' );

// Constructor tests.
test(
	'Appointment model - constructor',
	function () {
		// Manually create a appointment without modal class.
		$appointment_id = wp_insert_post(
			array(
				'post_title'   => 'Test appointment',
				'post_content' => 'Test appointment content',
				'post_status'  => 'publish',
				'post_type'    => 'wpa-appointment',
			)
		);

		// Create a new appointment model object.
		$appointment = new Appointment( $appointment_id );

		// Check the appointment object.
		expect( $appointment )->toBeInstanceOf( Appointment::class );
		expect( $appointment->appointment )->toBeInstanceOf( WP_Post::class );
	}
);

test(
	'Appointment model - constructor - error - appointment not found',
	function () {
		// Create a new appointment model object.
		$appointment = new Appointment( 1 );

		// Check the appointment object.
		expect( $appointment->appointment )->toBeInstanceOf( WP_Error::class );
		expect( $appointment->appointment->get_error_code() )->toBe( 'appointment_not_found' );
		expect( $appointment->appointment_data )->toBeArray();
		expect( $appointment->appointment_data )->toBeEmpty();
	}
);

test(
	'Appointment model - constructor with invalid appointment parameter',
	function () {
		// Create a new appointment model object.
		$appointment = new Appointment( null );

		// Check the appointment object.
		expect( $appointment->appointment )->toBeWPError( 'appointment_id_required' );
	}
);

test(
	'Appointment model - constructor with WP_Post object',
	function () {
		// Create a new appointment post object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		$appointment_post = $appointment->appointment;

		// Create a new appointment model object.
		$appointment = new Appointment( $appointment_post );

		// Check the appointment object.
		expect( $appointment->appointment )->toBe( $appointment_post );
		expect( $appointment->appointment_data )->toBeArray();
		expect( $appointment->appointment_data )->toBeEmpty();
	}
);

test(
	'Appointment model - constructor with appointment data array',
	function () {
		// Create a new appointment model object.
		$appointment = new Appointment(
			array(
				'status' => 'confirmed',
			)
		);

		// Check the appointment object.
		expect( $appointment->appointment )->toBeNull();
		expect( $appointment->appointment_data )->toBeArray();
		expect( $appointment->appointment_data )->toBe( array( 'status' => 'confirmed' ) );
	}
);

// Save method tests.
test(
	'Appointment model - save method',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_created',
			function () {
				update_option( 'wpappointments_appointment_created_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		$id       = $appointment->appointment->ID;
		$customer = $appointment->appointment_data['customer'];

		// Check the appointment object.
		expect( $appointment )->toBeInstanceOf( Appointment::class );
		expect( get_post( $id ) )->toBeInstanceOf( WP_Post::class );

		// Check the customer user.
		expect( $customer )->toBeArray();
		expect( $customer['email'] )->toBeString();
		expect( $customer['name'] )->toBeString();
		expect( $customer['phone'] )->toBeString();

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_created_hook_fired' ) )->toBe( 1 );
	}
);

test(
	'Appointment model - save method - with customer',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_created',
			function () {
				update_option( 'wpappointments_appointment_created_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'create_account' => true,
				'password'       => 'password123',
				'meta'           => array(
					'status' => 'confirmed',
				),
			)
		);

		$id       = $appointment->appointment->ID;
		$customer = $appointment->appointment_data['customer'];

		// Check the appointment object.
		expect( $appointment )->toBeInstanceOf( Appointment::class );
		expect( get_post( $id ) )->toBeInstanceOf( WP_Post::class );

		// Check the customer user.
		expect( $customer )->toBeArray();
		expect( $customer['email'] )->toBeString();
		expect( $customer['name'] )->toBeString();
		expect( $customer['phone'] )->toBeString();

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_created_hook_fired' ) )->toBe( 1 );
	}
);

test(
	'Appointment model - save method - with customer - error - customer login exists',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_created',
			function () {
				$counter = get_option( 'wpappointments_appointment_created_hook_fired', 0 );
				update_option( 'wpappointments_appointment_created_hook_fired', $counter + 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'create_account' => true,
				'password'       => 'password123',
				'customer'       => array(
					'email' => 'john@example.com',
					'name'  => 'John Doe',
					'phone' => '12345',
				),
				'meta'           => array(
					'status' => 'confirmed',
				),
			)
		);

		$id       = $appointment->appointment->ID;
		$customer = $appointment->appointment_data['customer'];

		// Check the appointment object.
		expect( $appointment )->toBeInstanceOf( Appointment::class );
		expect( get_post( $id ) )->toBeInstanceOf( WP_Post::class );

		// Check the customer user.
		expect( $customer )->toBeArray();
		expect( $customer['email'] )->toBeString();
		expect( $customer['name'] )->toBeString();
		expect( $customer['phone'] )->toBeString();

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_created_hook_fired' ) )->toBe( 1 );

		// Create a new appointment model object with the same customer email.
		$appointment = $this->create_appointment(
			array(
				'create_account' => true,
				'password'       => 'password123',
				'customer'       => array(
					'email' => 'john@example.com',
					'name'  => 'John Doe',
					'phone' => '12345',
				),
				'meta'           => array(
					'status' => 'confirmed',
				),
			)
		);

		// Expect the appointment to be saved normally.
		expect( $appointment )->toBeInstanceOf( Appointment::class );
		expect( get_post( $id ) )->toBeInstanceOf( WP_Post::class );

		// Check the customer user.
		expect( $customer )->toBeArray();
		expect( $customer['email'] )->toBeString();
		expect( $customer['name'] )->toBeString();
		expect( $customer['phone'] )->toBeString();

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_created_hook_fired' ) )->toBe( 2 );
	}
);

// Update method tests.
test(
	'Appointment model - update method - confirmed -> pending',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_updated',
			function () {
				update_option( 'wpappointments_appointment_updated_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Update the appointment.
		$updated = $appointment->update(
			array(
				'title' => 'New title',
				'meta'  => array(
					'status' => 'pending',
				),
			)
		);

		$id = $updated->appointment->ID;

		// Check the appointment object.
		expect( $updated )->toBeInstanceOf( Appointment::class );
		expect( get_post( $id ) )->toBeInstanceOf( WP_Post::class );
		expect( get_post( $id )->post_title )->toBe( 'New title' );
		expect( get_post_meta( $id, 'status', true ) )->toBe( 'pending' );

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_updated_hook_fired' ) )->toBe( 1 );
	}
);

test(
	'Appointment model - update method - pending -> confirmed',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_confirmed',
			function () {
				update_option( 'wpappointments_appointment_confirmed_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Update the appointment.
		$updated = $appointment->update(
			array(
				'title' => 'New title',
				'meta'  => array(
					'status' => 'confirmed',
				),
			)
		);

		$id = $updated->appointment->ID;

		// Check the appointment object.
		expect( $updated )->toBeInstanceOf( Appointment::class );
		expect( get_post( $id ) )->toBeInstanceOf( WP_Post::class );
		expect( get_post( $id )->post_title )->toBe( 'New title' );
		expect( get_post_meta( $id, 'status', true ) )->toBe( 'confirmed' );

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_confirmed_hook_fired' ) )->toBe( 1 );
	}
);

test(
	'Appointment model - update method - with customer - pending -> confirmed',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_confirmed',
			function () {
				update_option( 'wpappointments_appointment_confirmed_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Update the appointment.
		$updated = $appointment->update(
			array(
				'title'    => 'New title',
				'customer' => array(
					'email' => 'updated@example.com',
					'name'  => 'Updated User',
					'phone' => '+1 (000) 123-4567',
				),
				'meta'     => array(
					'status' => 'confirmed',
				),
			)
		);

		$id       = $updated->appointment->ID;
		$customer = $updated->appointment_data['customer'];

		// Check the appointment object.
		expect( $updated )->toBeInstanceOf( Appointment::class );
		expect( get_post( $id ) )->toBeInstanceOf( WP_Post::class );
		expect( get_post( $id )->post_title )->toBe( 'New title' );
		expect( get_post_meta( $id, 'status', true ) )->toBe( 'confirmed' );

		// Check the customer user.
		expect( $customer )->toBeArray();
		expect( $customer['email'] )->toBe( 'updated@example.com' );
		expect( $customer['name'] )->toBe( 'Updated User' );
		expect( $customer['phone'] )->toBe( '+1 (000) 123-4567' );

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_confirmed_hook_fired' ) )->toBe( 1 );
	}
);

test(
	'Appointment model - update method - error - invalid appointment id',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_updated',
			function () {
				update_option( 'wpappointments_appointment_updated_hook_fired', 1 );
			}
		);

		// Create a new appointment model object with invalid id.
		$appointment = new Appointment( 999999 );

		// Update the appointment.
		$updated = $appointment->update(
			array(
				'title' => 'New title',
			)
		);

		// Check the appointment object.
		expect( $updated )->toBeWPError( 'appointment_not_found' );

		// Check the action did not fire.
		expect( get_option( 'wpappointments_appointment_updated_hook_fired' ) )->toBeFalse();
	}
);

// Cancel method tests.
test(
	'Appointment model - cancel method',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_cancelled',
			function () {
				update_option( 'wpappointments_appointment_cancelled_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Save the appointment.
		$cancelled = $appointment->cancel();

		// Check the appointment object.
		expect( $cancelled )->toBeInt( $appointment->appointment->ID );
		expect( get_post( $cancelled ) )->toBeInstanceOf( WP_Post::class );
		expect( get_post_meta( $cancelled, 'status', true ) )->toBe( 'cancelled' );

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_cancelled_hook_fired' ) )->toBe( 1 );
	}
);

test(
	'Appointment model - cancel method - error - already cancelled',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_cancelled',
			function () {
				update_option( 'wpappointments_appointment_cancelled_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'cancelled',
				),
			)
		);

		// Save the appointment.
		$cancelled = $appointment->cancel();

		// Check the appointment object.
		expect( $cancelled )->toBeWPError( 'appointment_already_cancelled' );

		// Check the action did not fire.
		expect( get_option( 'wpappointments_appointment_cancelled_hook_fired' ) )->toBeFalse();
	}
);

test(
	'Appointment model - cancel method - error - invalid appointment id',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_cancelled',
			function () {
				update_option( 'wpappointments_appointment_cancelled_hook_fired', 1 );
			}
		);

		// Create a new appointment model object with invalid id.
		$appointment = new Appointment( 999999 );

		// Update the appointment.
		$updated = $appointment->cancel();

		// Check the appointment object.
		expect( $updated )->toBeWPError( 'appointment_not_found' );

		// Check the action did not fire.
		expect( get_option( 'wpappointments_appointment_cancelled_hook_fired' ) )->toBeFalse();
	}
);

// Confirm method tests.
test(
	'Appointment model - confirm method',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_confirmed',
			function () {
				update_option( 'wpappointments_appointment_confirmed_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'pending',
				),
			)
		);

		// Save the appointment.
		$confirmed = $appointment->confirm();

		// Check the appointment object.
		expect( $confirmed )->toBeInt( $appointment->appointment->ID );
		expect( get_post( $confirmed ) )->toBeInstanceOf( WP_Post::class );
		expect( get_post_meta( $confirmed, 'status', true ) )->toBe( 'confirmed' );

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_confirmed_hook_fired' ) )->toBe( 1 );
	}
);

test(
	'Appointment model - confirm method - error - already confirmed',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_confirmed',
			function () {
				update_option( 'wpappointments_appointment_confirmed_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Save the appointment.
		$confirmed = $appointment->confirm();

		// Check the appointment object.
		expect( $confirmed )->toBeWPError( 'appointment_already_confirmed' );

		// Check the action did not fire.
		expect( get_option( 'wpappointments_appointment_confirmed_hook_fired' ) )->toBeFalse();
	}
);

test(
	'Appointment model - confirm method - error - invalid appointment id',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_confirmed',
			function () {
				update_option( 'wpappointments_appointment_confirmed_hook_fired', 1 );
			}
		);

		// Create a new appointment model object with invalid id.
		$appointment = new Appointment( 999999 );

		// Update the appointment.
		$updated = $appointment->confirm();

		// Check the appointment object.
		expect( $updated )->toBeWPError( 'appointment_not_found' );

		// Check the action did not fire.
		expect( get_option( 'wpappointments_appointment_confirmed_hook_fired' ) )->toBeFalse();
	}
);

// Delete method tests.
test(
	'Appointment model - delete method',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_deleted',
			function () {
				update_option( 'wpappointments_appointment_deleted_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'cancelled',
				),
			)
		);

		// Save the appointment.
		$deleted = $appointment->delete();

		// Check the appointment object.
		expect( $deleted )->toBeInt( $appointment->appointment->ID );
		expect( get_post( $deleted ) )->toBeNull();
		expect( get_post_meta( $deleted, 'status', true ) )->toBeEmpty();

		// Check the action fired.
		expect( get_option( 'wpappointments_appointment_deleted_hook_fired' ) )->toBe( 1 );
	}
);

test(
	'Appointment model - delete method - error - not cancelled',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_deleted',
			function () {
				update_option( 'wpappointments_appointment_deleted_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Save the appointment.
		$deleted = $appointment->delete();

		// Check the appointment object.
		expect( $deleted )->toBeWPError( 'deleting_not_cancelled_appointment' );

		// Check the action did not fire.
		expect( get_option( 'wpappointments_appointment_deleted_hook_fired' ) )->toBeFalse();
	}
);

test(
	'Appointment model - delete method - error - cant delete appointment',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_deleted',
			function () {
				update_option( 'wpappointments_appointment_deleted_hook_fired', 1 );
			}
		);

		// Create a new appointment model object.
		$appointment = $this->create_appointment(
			array(
				'meta' => array(
					'status' => 'confirmed',
				),
			)
		);

		// Delete appointment post manually.
		wp_delete_post( $appointment->appointment->ID, true );

		// Save the appointment.
		$deleted = $appointment->delete();

		// Check the appointment object.
		expect( $deleted )->toBeWPError( 'appointment_not_found' );

		// Check the action did not fire.
		expect( get_option( 'wpappointments_appointment_deleted_hook_fired' ) )->toBeFalse();
	}
);

test(
	'Appointment model - delete method - error - invalid appointment id',
	function () {
		// Prepare action hook spy.
		add_action(
			'wpappointments_appointment_deleted',
			function () {
				update_option( 'wpappointments_appointment_deleted_hook_fired', 1 );
			}
		);

		// Create a new appointment model object with invalid id.
		$appointment = new Appointment( 999999 );

		// Update the appointment.
		$updated = $appointment->delete();

		// Check the appointment object.
		expect( $updated )->toBeWPError( 'appointment_not_found' );

		// Check the action did not fire.
		expect( get_option( 'wpappointments_appointment_deleted_hook_fired' ) )->toBeFalse();
	}
);

// End timestamp / all-day normalization (CORE-A multi-day support).
test(
	'Appointment model - default_normalizer falls back end_timestamp to start + duration',
	function () {
		$id = wp_insert_post(
			array(
				'post_title'  => 'Single day',
				'post_status' => 'publish',
				'post_type'   => 'wpa-appointment',
				'meta_input'  => array(
					'timestamp' => 1000000,
					'duration'  => 60,
					'status'    => 'confirmed',
				),
			)
		);

		$normalized = ( new Appointment( $id ) )->normalize();

		expect( $normalized['end_timestamp'] )->toBe( 1000000 + 60 * 60 );
		expect( $normalized['all_day'] )->toBeFalse();
	}
);

test(
	'Appointment model - default_normalizer honours explicit end_timestamp and all_day',
	function () {
		$id = wp_insert_post(
			array(
				'post_title'  => 'Multi day',
				'post_status' => 'publish',
				'post_type'   => 'wpa-appointment',
				'meta_input'  => array(
					'timestamp'     => 1000000,
					'duration'      => 60,
					'status'        => 'confirmed',
					'end_timestamp' => 1300000,
					'all_day'       => 1,
				),
			)
		);

		$normalized = ( new Appointment( $id ) )->normalize();

		expect( $normalized['end_timestamp'] )->toBe( 1300000 );
		expect( $normalized['all_day'] )->toBeTrue();
	}
);

test(
	'Appointment model - default_normalizer exposes recurrence fields',
	function () {
		$id = wp_insert_post(
			array(
				'post_title'  => 'Recurring',
				'post_status' => 'publish',
				'post_type'   => 'wpa-appointment',
				'meta_input'  => array(
					'timestamp'             => 1000000,
					'duration'              => 60,
					'status'                => 'confirmed',
					'rrule'                 => 'FREQ=WEEKLY;COUNT=4',
					'recurrence_exceptions' => array( 1000000 ),
				),
			)
		);

		$normalized = ( new Appointment( $id ) )->normalize();

		expect( $normalized['rrule'] )->toBe( 'FREQ=WEEKLY;COUNT=4' );
		expect( $normalized['recurrence_exceptions'] )->toBe( array( 1000000 ) );
		expect( $normalized['recurrence_parent'] )->toBe( 0 );
	}
);

test(
	'Appointment model - default_normalizer recurrence fields default empty when absent',
	function () {
		$id = wp_insert_post(
			array(
				'post_title'  => 'Plain',
				'post_status' => 'publish',
				'post_type'   => 'wpa-appointment',
				'meta_input'  => array(
					'timestamp' => 1000000,
					'duration'  => 60,
					'status'    => 'confirmed',
				),
			)
		);

		$normalized = ( new Appointment( $id ) )->normalize();

		expect( $normalized['rrule'] )->toBe( '' );
		expect( $normalized['recurrence_exceptions'] )->toBe( array() );
		expect( $normalized['recurrence_parent'] )->toBe( 0 );
	}
);

test(
	'Appointment model - detach_occurrence creates a detached child and EXDATEs the master',
	function () {
		$master_start = 1000000;
		$duration     = 60;

		$master_id = wp_insert_post(
			array(
				'post_title'  => 'Weekly standup',
				'post_status' => 'publish',
				'post_type'   => 'wpa-appointment',
				'meta_input'  => array(
					'timestamp'   => $master_start,
					'duration'    => $duration,
					'status'      => 'confirmed',
					'customer_id' => 7,
					'rrule'       => 'FREQ=WEEKLY;COUNT=4',
				),
			)
		);

		// Detach the second occurrence (one week after the master start).
		$occurrence_ts = $master_start + 7 * DAY_IN_SECONDS;

		$child = ( new Appointment( $master_id ) )->detach_occurrence( $occurrence_ts );

		expect( $child )->toBeInstanceOf( Appointment::class );

		$child_data = $child->normalize();

		// Child is a plain, non-recurring appointment linked back to the master.
		expect( $child_data['rrule'] )->toBe( '' );
		expect( $child_data['recurrence_parent'] )->toBe( $master_id );
		expect( $child_data['timestamp'] )->toBe( $occurrence_ts );
		expect( $child_data['end_timestamp'] )->toBe( $occurrence_ts + $duration * 60 );
		expect( (int) $child->appointment->post_parent )->toBe( $master_id );

		// Inherited meta carries over.
		expect( $child_data['customer_id'] )->toBe( 7 );

		// Master now EXDATEs the detached occurrence.
		$master_after = ( new Appointment( $master_id ) )->normalize();
		expect( $master_after['recurrence_exceptions'] )->toContain( $occurrence_ts );
	}
);

test(
	'Appointment model - detach_occurrence is idempotent - a second detach of the same occurrence errors',
	function () {
		$master_start = 1000000;

		$master_id = wp_insert_post(
			array(
				'post_title'  => 'Weekly standup',
				'post_status' => 'publish',
				'post_type'   => 'wpa-appointment',
				'meta_input'  => array(
					'timestamp'   => $master_start,
					'duration'    => 60,
					'status'      => 'confirmed',
					'customer_id' => 7,
					'rrule'       => 'FREQ=WEEKLY;COUNT=4',
				),
			)
		);

		$occurrence_ts = $master_start + 7 * DAY_IN_SECONDS;

		$first = ( new Appointment( $master_id ) )->detach_occurrence( $occurrence_ts );
		expect( $first )->toBeInstanceOf( Appointment::class );

		// Detaching the same occurrence again must not create a second child.
		$second = ( new Appointment( $master_id ) )->detach_occurrence( $occurrence_ts );
		expect( $second )->toBeWPError( 'occurrence_already_detached' );

		$children = get_children(
			array(
				'post_parent' => $master_id,
				'post_type'   => 'wpa-appointment',
				'post_status' => 'publish',
			)
		);
		expect( count( $children ) )->toBe( 1 );
	}
);

test(
	'Appointment model - detach_occurrence on a non-recurring appointment errors',
	function () {
		$id = wp_insert_post(
			array(
				'post_title'  => 'One off',
				'post_status' => 'publish',
				'post_type'   => 'wpa-appointment',
				'meta_input'  => array(
					'timestamp' => 1000000,
					'duration'  => 60,
					'status'    => 'confirmed',
				),
			)
		);

		$result = ( new Appointment( $id ) )->detach_occurrence( 1000000 );

		expect( $result )->toBeWPError( 'appointment_not_recurring' );
	}
);
