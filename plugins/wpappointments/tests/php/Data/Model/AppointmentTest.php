<?php
/**
 * Appointment model -
 *
 * @package WPAppointments
 */

namespace Tests\Data\Model;

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
