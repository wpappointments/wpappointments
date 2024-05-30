<?php
/**
 * Service model - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Data\Model;

use stdClass;
use WP_Error;
use WP_Post;
use WPAppointments\Data\Model\Service;

uses( \TestTools\TestCase::class )->group( 'model' );

expect()->extend(
	'toBeServiceModel',
	function ( $data ) {
		$service = $this->value;

		expect( $service )->toBeInstanceOf( Service::class );
		expect( $service->service )->toBeInstanceOf( WP_Post::class );
		expect( $service->service_data )->toBeServiceData( $data );

		return $this;
	}
);

expect()->extend(
	'toBeServiceData',
	function ( $data ) {
		$service_data = $this->value;

		expect( $service_data )->toBeArray();
		expect( $service_data )->toHaveKeys( Service::FIELDS );

		expect( $service_data['name'] )->toBe( $data['name'] ?? 'Appointment' );
		expect( $service_data['duration'] )->toBe( $data['duration'] ?? 60 );
		expect( $service_data['active'] )->toBe( $data['active'] ?? true );
		expect( $service_data['attributes'] )->toBe( $data['attributes'] ?? array() );
		expect( $service_data['variants'] )->toBe( $data['variants'] ?? array() );
		expect( $service_data['category'] )->toBe( $data['category'] ?? '' );
		expect( $service_data['description'] )->toBe( $data['description'] ?? '' );
		expect( $service_data['image'] )->toBe( $data['image'] ?? '' );

		return $this;
	}
);

// Constructor tests.
test(
	'Service model - constructor',
	function () {
		// Manually create a service without modal class.
		$service_id = wp_insert_post(
			array(
				'post_title'   => 'Test service',
				'post_content' => 'Test service content',
				'post_status'  => 'publish',
				'post_type'    => 'wpa-service',
			)
		);

		// Create a new service model object.
		$service = new Service( $service_id );

		// Check the service object.
		expect( $service )->toBeInstanceOf( Service::class );
		expect( $service->service )->toBeInstanceOf( WP_Post::class );
	}
);

test(
	'Service model - constructor - error - service not found',
	function () {
		// Create a new service model object.
		$service = new Service( 1 );

		// Check the service object.
		expect( $service->service )->toBeInstanceOf( WP_Error::class );
		expect( $service->service->get_error_code() )->toBe( 'service_not_found' );
		expect( $service->service_data )->toBeArray();
		expect( $service->service_data )->toBeEmpty();
	}
);

test(
	'Service model - constructor with invalid service parameter',
	function () {
		// Create a new service model object.
		$service = new Service( null );

		// Check the service object.
		expect( $service->service )->toBeWPError( 'service_cannot_be_null' );
	}
);

test(
	'Service model - constructor with WP_Post object',
	function () {
		// Create a new service post object.
		$service_id   = $this->create_service();
		$service_post = get_post( $service_id );

		// Create a new service model object.
		$service = new Service( $service_post );

		// Check the service object.
		expect( $service->service )->toBe( $service_post );
		expect( $service->service_data )->toBeArray();
		expect( $service->service_data )->toBeEmpty();
	}
);

test(
	'Service model - constructor with service data array',
	function () {
		// Create a new service model object.
		$service = new Service(
			array(
				'name'     => 'Service name',
				'duration' => 60,
			)
		);

		// Check the service object.
		expect( $service->service )->toBeNull();
		expect( $service->service_data )->toBeArray();
		expect( $service->service_data['duration'] )->toBe( 60 );
	}
);

test(
	'Service model - constructor with invalid service data array',
	function () {
		// Create a new service model object.
		$service = new Service( new stdClass() );

		// Check the service object.
		expect( $service->service )->toBeWPError( 'service_invalid_type' );
	}
);

test(
	'Service model - constructor with invalid service data array - missing name',
	function () {
		// Create a new service model object.
		$service = new Service(
			array(
				'duration' => 60,
			)
		);

		// Check the service object.
		expect( $service->service )->toBeWPError( 'service_name_required' );
	}
);

test(
	'Service model - constructor with invalid service data array - missing duration',
	function () {
		// Create a new service model object.
		$service = new Service(
			array(
				'name' => 'Service name',
			)
		);

		// Check the service object.
		expect( $service->service )->toBeWPError( 'service_duration_required' );
	}
);

test(
	'Service model - constructor with missing service id',
	function () {
		// Create a new service model object.
		$service = new Service( 0 );

		// Check the service object.
		expect( $service->service )->toBeWPError( 'service_id_required' );
	}
);

// Save method tests.
test(
	'Service model - save method',
	function () {
		// Prepare action hook spy.
		$this->spy_hook( 'wpappointments_service_created' );

		$data = array(
			'name'     => 'Service name',
			'duration' => 60,
		);

		// Create a new service model object.
		$service = new Service( $data );
		$saved   = $service->save();

		// Check the service object.
		expect( $saved )->toBeServiceModel( $data );

		// Check the action fired.
		expect( $this->get_hook_executions_count( 'wpappointments_service_created' ) )->toBe( 1 );
	}
);

// Update method tests.
test(
	'Service model - update method',
	function () {
		// Prepare action hook spy.
		$this->spy_hook( 'wpappointments_service_updated' );

		$data = array(
			'name'     => 'Service name',
			'duration' => 60,
		);

		// Create a new service model object.
		$service = new Service( $data );

		// Save the service.
		$service_model = $service->save();

		// Create a new service model object.
		$service = new Service( $service_model->service );

		// Update the service.
		$updated = $service->update(
			array(
				'name'     => 'Updated service name',
				'duration' => 120,
			)
		);

		// Check the service object.
		expect( $updated )->toBeServiceModel(
			array(
				'name'     => 'Updated service name',
				'duration' => 120,
			)
		);

		// Check the action fired.
		expect( $this->get_hook_executions_count( 'wpappointments_service_updated' ) )->toBe( 1 );
	}
);

test(
	'Service model - update method - invalid service in constructor',
	function () {
		// Prepare action hook spy.
		$this->spy_hook( 'wpappointments_service_updated' );

		// Create a new service model object.
		$service = new Service( array() );

		// Update the service.
		$updated = $service->update(
			array(
				'name'     => 'Updated service name',
				'duration' => 120,
			)
		);

		// Check the service object.
		expect( $updated )->toBeWPError( 'service_name_required' );

		// Check the action did not fire.
		expect( $this->get_hook_executions_count( 'wpappointments_service_updated' ) )->toBe( false );
	}
);

test(
	'Service model - update method - constructor provided with service data instead of service object',
	function () {
		// Prepare action hook spy.
		$this->spy_hook( 'wpappointments_service_updated' );

		// Create a new service model object.
		$service = new Service(
			array(
				'name'     => 'Service name',
				'duration' => 60,
			)
		);

		// Update the service.
		$updated = $service->update(
			array(
				'name'     => 'Updated service name',
				'duration' => 120,
			)
		);

		// Check the service object.
		expect( $updated )->toBeWPError( 'service_object_expected' );

		// Check the action did not fire.
		expect( $this->get_hook_executions_count( 'wpappointments_service_updated' ) )->toBe( false );
	}
);

// Delete method tests.
test(
	'Service model - delete method',
	function () {
		// Prepare action hook spy.
		$this->spy_hook( 'wpappointments_service_deleted' );

		$data = array(
			'name'     => 'Service name',
			'duration' => 60,
		);

		// Create a new service model object.
		$service = new Service( $data );

		// Save the service.
		$service_model = $service->save();

		// Create a new service model object.
		$service = new Service( $service_model->service );

		// Delete the service.
		$deleted = $service->delete();

		// Check the service object.
		expect( $deleted )->toBe( $service_model->service->ID );

		// Check the action fired.
		expect( $this->get_hook_executions_count( 'wpappointments_service_deleted' ) )->toBe( 1 );
	}
);

test(
	'Service model - delete method - invalid service in constructor',
	function () {
		// Prepare action hook spy.
		$this->spy_hook( 'wpappointments_service_deleted' );

		// Create a new service model object.
		$service = new Service( array() );

		// Delete the service.
		$deleted = $service->delete();

		// Check the service object.
		expect( $deleted )->toBeWPError( 'service_name_required' );

		// Check the action did not fire.
		expect( $this->get_hook_executions_count( 'wpappointments_service_deleted' ) )->toBe( false );
	}
);

test(
	'Service model - delete method - constructor provided with service data instead of service object',
	function () {
		// Prepare action hook spy.
		$this->spy_hook( 'wpappointments_service_deleted' );

		// Create a new service model object.
		$service = new Service(
			array(
				'name'     => 'Service name',
				'duration' => 60,
			)
		);

		// Delete the service.
		$deleted = $service->delete();

		// Check the service object.
		expect( $deleted )->toBeWPError( 'service_object_expected' );

		// Check the action did not fire.
		expect( $this->get_hook_executions_count( 'wpappointments_service_deleted' ) )->toBe( false );
	}
);
