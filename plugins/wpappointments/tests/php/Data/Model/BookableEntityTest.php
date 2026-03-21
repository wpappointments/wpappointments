<?php
/**
 * BookableEntity model - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Data\Model;

use stdClass;
use WP_Error;
use WP_Post;
use WPAppointments\Data\Model\BookableEntity;

uses( \TestTools\TestCase::class )->group( 'model' );

beforeEach(
	function () {
		\WPAppointments\Bookable\BookableTypeRegistry::get_instance()->reset();
	}
);

// Constructor tests.
test(
	'BookableEntity model - constructor with ID',
	function () {
		$bookable_id = $this->create_bookable(
			array(
				'post_title' => 'Test bookable',
			)
		);

		$bookable = new BookableEntity( $bookable_id );

		expect( $bookable )->toBeInstanceOf( BookableEntity::class );
		expect( $bookable->bookable )->toBeInstanceOf( WP_Post::class );
	}
);

test(
	'BookableEntity model - constructor - error - not found',
	function () {
		$bookable = new BookableEntity( 99999 );

		expect( $bookable->bookable )->toBeWPError( 'bookable_not_found' );
		expect( $bookable->bookable_data )->toBeArray();
		expect( $bookable->bookable_data )->toBeEmpty();
	}
);

test(
	'BookableEntity model - constructor with null',
	function () {
		$bookable = new BookableEntity( null );

		expect( $bookable->bookable )->toBeWPError( 'bookable_cannot_be_null' );
	}
);

test(
	'BookableEntity model - constructor with WP_Post object',
	function () {
		$bookable_id   = $this->create_bookable();
		$bookable_post = get_post( $bookable_id );

		$bookable = new BookableEntity( $bookable_post );

		expect( $bookable->bookable )->toBe( $bookable_post );
		expect( $bookable->bookable_data )->toBeArray();
		expect( $bookable->bookable_data )->toBeEmpty();
	}
);

test(
	'BookableEntity model - constructor with data array',
	function () {
		$bookable = new BookableEntity(
			array(
				'name' => 'Test bookable',
				'type' => 'service',
			)
		);

		expect( $bookable->bookable )->toBeNull();
		expect( $bookable->bookable_data )->toBeArray();
		expect( $bookable->bookable_data['name'] )->toBe( 'Test bookable' );
		expect( $bookable->bookable_data['type'] )->toBe( 'service' );
	}
);

test(
	'BookableEntity model - constructor with invalid type',
	function () {
		$bookable = new BookableEntity( new stdClass() );

		expect( $bookable->bookable )->toBeWPError( 'bookable_invalid_type' );
	}
);

test(
	'BookableEntity model - constructor with missing name',
	function () {
		$bookable = new BookableEntity(
			array(
				'type' => 'service',
			)
		);

		expect( $bookable->bookable )->toBeWPError( 'bookable_name_required' );
	}
);

test(
	'BookableEntity model - constructor with missing ID',
	function () {
		$bookable = new BookableEntity( 0 );

		expect( $bookable->bookable )->toBeWPError( 'bookable_id_required' );
	}
);

test(
	'BookableEntity model - constructor with wrong post type',
	function () {
		$post_id = wp_insert_post(
			array(
				'post_title'  => 'Regular post',
				'post_status' => 'publish',
				'post_type'   => 'post',
			)
		);

		$bookable = new BookableEntity( $post_id );

		expect( $bookable->bookable )->toBeWPError( 'bookable_invalid_type' );
	}
);

// Save method tests.
test(
	'BookableEntity model - save method',
	function () {
		$this->spy_hook( 'wpappointments_bookable_created' );

		$data = array(
			'name' => 'Test bookable',
			'type' => 'service',
		);

		$bookable = new BookableEntity( $data );
		$saved    = $bookable->save();

		expect( $saved )->toBeInstanceOf( BookableEntity::class );
		expect( $saved->bookable )->toBeInstanceOf( WP_Post::class );
		expect( $saved->bookable_data )->toBeArray();
		expect( $saved->bookable_data )->toHaveKeys( BookableEntity::FIELDS );
		expect( $saved->bookable_data['name'] )->toBe( 'Test bookable' );
		expect( $saved->bookable_data['type'] )->toBe( 'service' );
		expect( $this->get_hook_executions_count( 'wpappointments_bookable_created' ) )->toBe( 1 );
	}
);

test(
	'BookableEntity model - save with all fields',
	function () {
		$data = array(
			'name'          => 'Full bookable',
			'type'          => 'room',
			'active'        => true,
			'description'   => 'A test room',
			'image'         => 'https://example.com/image.jpg',
			'schedule_id'   => 5,
			'buffer_before' => 15,
			'buffer_after'  => 10,
			'min_lead_time' => 60,
			'max_lead_time' => 1440,
			'duration'      => 30,
			'attributes'    => array(),
		);

		$bookable = new BookableEntity( $data );
		$saved    = $bookable->save();

		expect( $saved )->toBeInstanceOf( BookableEntity::class );

		$normalized = $saved->normalize();

		expect( $normalized['name'] )->toBe( 'Full bookable' );
		expect( $normalized['type'] )->toBe( 'room' );
		expect( $normalized['active'] )->toBeTrue();
		expect( $normalized['description'] )->toBe( 'A test room' );
		expect( $normalized['image'] )->toBe( 'https://example.com/image.jpg' );
		expect( $normalized['scheduleId'] )->toBe( 5 );
		expect( $normalized['bufferBefore'] )->toBe( 15 );
		expect( $normalized['bufferAfter'] )->toBe( 10 );
		expect( $normalized['minLeadTime'] )->toBe( 60 );
		expect( $normalized['maxLeadTime'] )->toBe( 1440 );
		expect( $normalized['duration'] )->toBe( 30 );
		expect( $normalized['attributes'] )->toBe( array() );
	}
);

// Update method tests.
test(
	'BookableEntity model - update method',
	function () {
		$this->spy_hook( 'wpappointments_bookable_updated' );

		$data = array(
			'name' => 'Original name',
			'type' => 'service',
		);

		$bookable = new BookableEntity( $data );
		$saved    = $bookable->save();

		$model   = new BookableEntity( $saved->bookable );
		$updated = $model->update(
			array(
				'name'          => 'Updated name',
				'buffer_before' => 30,
			)
		);

		expect( $updated )->toBeInstanceOf( BookableEntity::class );

		$normalized = $updated->normalize();
		expect( $normalized['name'] )->toBe( 'Updated name' );
		expect( $normalized['bufferBefore'] )->toBe( 30 );

		expect( $this->get_hook_executions_count( 'wpappointments_bookable_updated' ) )->toBe( 1 );
	}
);

test(
	'BookableEntity model - update method - invalid bookable in constructor',
	function () {
		$this->spy_hook( 'wpappointments_bookable_updated' );

		$bookable = new BookableEntity( array() );

		$updated = $bookable->update(
			array(
				'name' => 'Updated name',
			)
		);

		expect( $updated )->toBeWPError( 'bookable_name_required' );
		expect( $this->get_hook_executions_count( 'wpappointments_bookable_updated' ) )->toBe( false );
	}
);

test(
	'BookableEntity model - update method - constructor with data array instead of object',
	function () {
		$this->spy_hook( 'wpappointments_bookable_updated' );

		$bookable = new BookableEntity(
			array(
				'name' => 'Test bookable',
			)
		);

		$updated = $bookable->update(
			array(
				'name' => 'Updated name',
			)
		);

		expect( $updated )->toBeWPError( 'bookable_object_expected' );
		expect( $this->get_hook_executions_count( 'wpappointments_bookable_updated' ) )->toBe( false );
	}
);

// Delete method tests.
test(
	'BookableEntity model - delete method',
	function () {
		$this->spy_hook( 'wpappointments_bookable_deleted' );

		$data = array(
			'name' => 'To be deleted',
			'type' => 'service',
		);

		$bookable = new BookableEntity( $data );
		$saved    = $bookable->save();

		$model   = new BookableEntity( $saved->bookable );
		$deleted = $model->delete();

		expect( $deleted )->toBe( $saved->bookable->ID );
		expect( $this->get_hook_executions_count( 'wpappointments_bookable_deleted' ) )->toBe( 1 );
	}
);

test(
	'BookableEntity model - delete method - invalid bookable in constructor',
	function () {
		$this->spy_hook( 'wpappointments_bookable_deleted' );

		$bookable = new BookableEntity( array() );
		$deleted  = $bookable->delete();

		expect( $deleted )->toBeWPError( 'bookable_name_required' );
		expect( $this->get_hook_executions_count( 'wpappointments_bookable_deleted' ) )->toBe( false );
	}
);

test(
	'BookableEntity model - delete method - constructor with data instead of object',
	function () {
		$this->spy_hook( 'wpappointments_bookable_deleted' );

		$bookable = new BookableEntity(
			array(
				'name' => 'Test bookable',
			)
		);

		$deleted = $bookable->delete();

		expect( $deleted )->toBeWPError( 'bookable_object_expected' );
		expect( $this->get_hook_executions_count( 'wpappointments_bookable_deleted' ) )->toBe( false );
	}
);

// Normalize method tests.
test(
	'BookableEntity model - normalize returns camelCase keys',
	function () {
		$data = array(
			'name'          => 'Test bookable',
			'type'          => 'service',
			'buffer_before' => 15,
			'buffer_after'  => 10,
			'min_lead_time' => 60,
			'max_lead_time' => 1440,
		);

		$bookable = new BookableEntity( $data );
		$saved    = $bookable->save();

		$normalized = $saved->normalize();

		expect( $normalized )->toHaveKeys(
			array(
				'id',
				'name',
				'active',
				'description',
				'type',
				'image',
				'scheduleId',
				'bufferBefore',
				'bufferAfter',
				'minLeadTime',
				'maxLeadTime',
				'duration',
				'attributes',
				'meta',
			)
		);

		expect( $normalized['bufferBefore'] )->toBe( 15 );
		expect( $normalized['bufferAfter'] )->toBe( 10 );
		expect( $normalized['minLeadTime'] )->toBe( 60 );
		expect( $normalized['maxLeadTime'] )->toBe( 1440 );
	}
);

test(
	'BookableEntity model - normalize with custom normalizer',
	function () {
		$data = array(
			'name' => 'Test bookable',
		);

		$bookable = new BookableEntity( $data );
		$saved    = $bookable->save();

		$normalized = $saved->normalize(
			function ( $model ) {
				return array(
					'custom' => true,
					'name'   => $model->bookable->post_title,
				);
			}
		);

		expect( $normalized['custom'] )->toBeTrue();
		expect( $normalized['name'] )->toBe( 'Test bookable' );
	}
);
