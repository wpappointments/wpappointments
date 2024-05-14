<?php
/**
 * Service model - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Data\Model;

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
		expect( $service_data )->toHaveKeys(
			array(
				'id',
				'title',
				'duration',
			)
		);

		expect( $service_data['id'] )->toBeInt();
		expect( $service_data['title'] )->toBe( $data['title'] );
		expect( $service_data['duration'] )->toBe( $data['duration'] );

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
)->only();

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
)->only();

test(
	'Service model - constructor with invalid service parameter',
	function () {
		// Create a new service model object.
		$service = new Service( null );

		// Check the service object.
		expect( $service->service )->toBeWPError( 'service_id_required' );
	}
)->only();

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
)->only();

test(
	'Service model - constructor with service data array',
	function () {
		// Create a new service model object.
		$service = new Service(
			array(
				'duration' => 60,
			)
		);

		// Check the service object.
		expect( $service->service )->toBeNull();
		expect( $service->service_data )->toBeArray();
		expect( $service->service_data )->toBe( array( 'duration' => 60 ) );
	}
)->only();

// Save method tests.
test(
	'Service model - save method',
	function () {
		// Prepare action hook spy.
		$this->spy_hook( 'wpappointments_service_created' );

		$data = array(
			'title'    => 'Service name',
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
)->only();
