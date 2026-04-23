<?php
/**
 * Test Customer model
 *
 * @package WPAppointments
 */

namespace Tests\Data\Model;

use WP_User;
use WPAppointments\Data\Model\Customer;

uses( \TestTools\TestCase::class )->group( 'model' );

expect()->extend(
	'toBeCustomerModel',
	function () {
		$customer = $this->value;

		expect( $customer )->toBeInstanceOf( Customer::class );
		expect( $customer->get_user() )->toBeInstanceOf( WP_User::class );

		$user = $customer->normalize();

		expect( $user )->toHaveKeys( array( 'name', 'email', 'phone' ) );
		expect( $user['name'] )->toBeString();
		expect( $user['email'] )->toBeString();
		expect( $user['phone'] )->toBeString();

		return $this;
	}
);

// Constructor tests.
test(
	'Customer model - constructor',
	function () {
		// Moanually create a customer without modal class.
		$user_id = wp_insert_user(
			array(
				'user_login'   => 'john@example.com',
				'user_pass'    => wp_generate_password(),
				'user_email'   => 'john@example.com',
				'display_name' => 'John Doe',
				'role'         => 'wpa-customer',
			)
		);

		// Create a new customer model object from admin user.
		$customer = new Customer( $user_id );

		// Check the customer object.
		expect( $customer )->toBeInstanceOf( Customer::class );
		expect( $customer->get_user() )->toBeInstanceOf( WP_User::class );
		expect( $customer->get_user()->ID )->toBe( $user_id );
	}
);

test(
	'Customer model - constructor - error - user not customer',
	function () {
		// Create a new customer model object from admin user.
		$customer = new Customer( 1 );

		// Check the customer object.
		expect( $customer->get_user() )->toBeWPError( 'user_not_customer' );
	}
);

test(
	'Customer model - constructor - error - user ID required',
	function () {
		// Create a new customer model object.
		$customer = new Customer( null );

		// Check the customer object.
		expect( $customer->get_user() )->toBeWPError( 'user_id_required' );
	}
);

test(
	'Customer model - constructor - error - user not found',
	function () {
		// Create a new customer model object.
		$customer = new Customer( 9999999 );

		// Check the customer object.
		expect( $customer->get_user() )->toBeWPError( 'user_not_found' );
	}
);

// Save method tests.
test(
	'Customer model - save method',
	function () {
		// Create a new customer model object.
		$customer = new Customer(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		);

		// Save the customer.
		$saved_customer = $customer->save();

		// Check the customer object.
		expect( $saved_customer )->toBeCustomerModel();
	}
);

test(
	'Customer model - save method - error - data not array',
	function () {
		// Create a new user.
		$user = $this->factory()->user->create_and_get();

		// Create a new customer model object.
		$customer = new Customer( $user );

		// Save the customer.
		$saved_customer = $customer->save();

		// Check the customer object.
		expect( $saved_customer )->toBeWPError( 'create_user_requires_user_data_array' );
	}
);

test(
	'Customer model - save method - error - illegal user login',
	function () {
		// Prepare illegal logins array.
		add_filter(
			'illegal_user_logins',
			function ( $logins ) {
				$logins[] = 'illegal@example.com';
				return $logins;
			}
		);

		// Create a new customer model object.
		$customer = new Customer(
			array(
				'name'  => 'Illegal User',
				'email' => 'illegal@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		);

		// Save the customer.
		$saved_customer = $customer->save();

		// Check the customer object.
		expect( $saved_customer )->toBeWPError( 'invalid_username' );
	}
);

// Update method tests.
test(
	'Customer model - update method',
	function () {
		// Save customer in database.
		$new_customer = ( new Customer(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		) )->save();

		// Create a new customer model object.
		$customer = new Customer( $new_customer->get_user() );

		// Update the customer.
		$updated_customer = $customer->update(
			array(
				'name' => 'Jane Doe',
			)
		);

		// Check the customer object.
		expect( $updated_customer )->toBeCustomerModel();
		expect( $updated_customer->get_user()->display_name )->toBe( 'Jane Doe' );
	}
);

test(
	'Customer model - update method - error - initialized with user data array',
	function () {
		// Create a new customer model object.
		$customer = new Customer(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		);

		// Save the customer.
		$saved_customer = $customer->update(
			array(
				'name' => 'Jane Doe',
			)
		);

		// Check the customer object.
		expect( $saved_customer )->toBeWPError( 'initialized_with_user_data_array' );
	}
);

test(
	'Customer model - update method - error - user not found',
	function () {
		// Create a new customer model object.
		$customer = new Customer( 9999999 );

		// Save the customer.
		$saved_customer = $customer->update(
			array(
				'name' => 'Jane Doe',
			)
		);

		// Check the customer object.
		expect( $saved_customer )->toBeWPError( 'user_not_found' );
	}
);

test(
	'Customer model - update method - error - edge case user removed after model creation',
	function () {
		// Save customer in database.
		$new_customer = ( new Customer(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		) )->save();

		// Create a new customer model object.
		$customer = new Customer( $new_customer->get_user() );

		// Remove the user.
		wp_delete_user( $new_customer->get_user()->ID );

		// Update the customer.
		$updated_customer = $customer->update(
			array(
				'name' => 'Jane Doe',
			)
		);

		// Check the customer object.
		expect( $updated_customer )->toBeWPError( 'invalid_user_id' );
	}
);

// Delete method tests.
test(
	'Customer model - delete method',
	function () {
		// Save customer in database.
		$new_customer = ( new Customer(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		) )->save();

		// Create a new customer model object.
		$customer = new Customer( $new_customer->get_user() );

		// Save the customer.
		$deleted = $customer->delete();

		// Check the customer object.
		expect( $deleted )->toBe( $new_customer->get_user()->ID );
		expect( get_user_by( 'id', $new_customer->get_user()->ID ) )->toBeFalse();
	}
);

test(
	'Customer model - delete method - error - user not found',
	function () {
		// Create a new customer model object.
		$customer = new Customer( 9999999 );

		// Save the customer.
		$deleted = $customer->delete();

		// Check the customer object.
		expect( $deleted )->toBeWPError( 'user_not_found' );
	}
);

test(
	'Customer model - delete method - error - edge case user removed after model creation',
	function () {
		// Save customer in database.
		$new_customer = ( new Customer(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		) )->save();

		// Create a new customer model object.
		$customer = new Customer( $new_customer->get_user() );

		// Remove the user.
		wp_delete_user( $new_customer->get_user()->ID );

		// Save the customer.
		$deleted = $customer->delete();

		// Check the customer object.
		expect( $deleted )->toBeWPError( 'cannot_delete_customer' );
	}
);

// Normalizer tests.
test(
	'Customer model - normalize method',
	function () {
		// Save customer in database.
		$new_customer = ( new Customer(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		) )->save();

		// Normalize the customer.
		$normalized_customer = $new_customer->normalize();

		// Check the customer object.
		expect( $normalized_customer )->toHaveKeys( array( 'name', 'email', 'phone' ) );
		expect( $normalized_customer['name'] )->toBe( 'John Doe' );
		expect( $normalized_customer['email'] )->toBe( 'john@example.com' );
		expect( $normalized_customer['phone'] )->toBe( '+1 (000) 123-4567' );
	}
);

test(
	'Customer model - normalize method - error - user not found',
	function () {
		// Create a new customer model object.
		$customer = new Customer( 9999999 );

		// Normalize the customer.
		$normalized_customer = $customer->normalize();

		// Check the customer object.
		expect( $normalized_customer )->toBeWPError( 'user_not_found' );
	}
);

test(
	'Customer model - normalize method - custom normalize function',
	function () {
		// Save customer in database.
		$new_customer = ( new Customer(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
				'phone' => '+1 (000) 123-4567',
			)
		) )->save();

		// Custom normalize function.
		$normalizer = function ( $user ) {
			$phone = get_user_meta( $user->ID, 'phone', true );

			return array(
				'id'            => $user->ID,
				'customName'    => $user->display_name,
				'customEmail'   => $user->user_email,
				'customPhone'   => $phone,
				'customCreated' => $user->user_registered,
				'customUpdated' => $user->user_registered,
			);
		};

		// Normalize the customer.
		$normalized_customer = $new_customer->normalize( $normalizer );

		// Check the customer object.
		expect( $normalized_customer )->toHaveKeys( array( 'customName', 'customEmail', 'customPhone' ) );
		expect( $normalized_customer['customName'] )->toBe( 'John Doe' );
		expect( $normalized_customer['customEmail'] )->toBe( 'john@example.com' );
		expect( $normalized_customer['customPhone'] )->toBe( '+1 (000) 123-4567' );
	}
);
