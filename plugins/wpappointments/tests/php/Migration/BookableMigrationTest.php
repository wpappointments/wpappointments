<?php
/**
 * BookableMigration - test suite
 *
 * @package WPAppointments
 */

namespace Tests\Migration;

use WPAppointments\Bookable\BookableTypeRegistry;
use WPAppointments\Core\PluginInfo;
use WPAppointments\Migration\BookableMigration;

uses( \TestTools\TestCase::class )->group( 'migration' );

beforeEach(
	function () {
		BookableTypeRegistry::get_instance()->reset();
		BookableMigration::reset();
	}
);

/**
 * Helper to create a legacy entity post.
 *
 * @param array $args Post args.
 *
 * @return int Post ID.
 */
function create_legacy_entity( $args = array() ) {
	$meta = wp_parse_args(
		$args['meta'] ?? array(),
		array(
			'active'        => true,
			'type'          => 'room',
			'description'   => '',
			'image'         => '',
			'buffer_before' => 0,
			'buffer_after'  => 0,
		)
	);

	return wp_insert_post(
		array(
			'post_type'   => 'wpa-entity',
			'post_status' => 'publish',
			'post_title'  => $args['title'] ?? 'Test Entity',
			'meta_input'  => $meta,
		)
	);
}

/**
 * Helper to create a legacy service post.
 *
 * @param array $args Post args.
 *
 * @return int Post ID.
 */
function create_legacy_service( $args = array() ) {
	$meta = wp_parse_args(
		$args['meta'] ?? array(),
		array(
			'active'   => true,
			'duration' => 60,
			'price'    => 0,
			'category' => '',
		)
	);

	return wp_insert_post(
		array(
			'post_type'   => 'wpa-service',
			'post_status' => 'publish',
			'post_title'  => $args['title'] ?? 'Test Service',
			'meta_input'  => $meta,
		)
	);
}

// Migration tests.
test(
	'BookableMigration - migrates entities to bookable entities',
	function () {
		create_legacy_entity(
			array(
				'title' => 'Room A',
				'meta'  => array(
					'type'          => 'room',
					'buffer_before' => 15,
				),
			)
		);

		$log = BookableMigration::run();

		expect( $log['entities']['migrated'] )->toBe( 1 );
		expect( $log['entities']['errors'] )->toBeEmpty();

		// Verify bookable was created.
		$bookables = get_posts(
			array(
				'post_type'      => PluginInfo::POST_TYPES['bookable'],
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		expect( $bookables )->toHaveCount( 1 );
		expect( $bookables[0]->post_title )->toBe( 'Room A' );
	}
);

test(
	'BookableMigration - migrates services to bookable entities with variants',
	function () {
		create_legacy_service(
			array(
				'title' => 'Haircut',
				'meta'  => array(
					'duration' => 45,
					'price'    => 25,
					'category' => 'hair',
				),
			)
		);

		$log = BookableMigration::run();

		expect( $log['services']['migrated'] )->toBe( 1 );
		expect( $log['services']['errors'] )->toBeEmpty();

		// Verify bookable was created with type 'service'.
		$bookables = get_posts(
			array(
				'post_type'      => PluginInfo::POST_TYPES['bookable'],
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		expect( $bookables )->toHaveCount( 1 );
		expect( get_post_meta( $bookables[0]->ID, 'type', true ) )->toBe( 'service' );

		// Verify variant was created.
		$variants = get_posts(
			array(
				'post_type'      => PluginInfo::POST_TYPES['bookable-variant'],
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		expect( $variants )->toHaveCount( 1 );
		expect( $variants[0]->post_parent )->toBe( $bookables[0]->ID );
		expect( get_post_meta( $variants[0]->ID, 'price', true ) )->toBe( '25' );
	}
);

test(
	'BookableMigration - migrates appointment references',
	function () {
		$service_id = create_legacy_service(
			array(
				'title' => 'Consultation',
				'meta'  => array( 'duration' => 30 ),
			)
		);

		// Create an appointment referencing the service by name.
		$appt_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['appointment'],
				'post_status' => 'publish',
				'post_title'  => 'Test Appointment',
				'meta_input'  => array(
					'service' => 'Consultation',
				),
			)
		);

		$log = BookableMigration::run();

		expect( $log['appointments']['updated'] )->toBe( 1 );

		// Verify appointment now has variant_id.
		$variant_id = get_post_meta( $appt_id, 'variant_id', true );
		expect( $variant_id )->not->toBeEmpty();
	}
);

test(
	'BookableMigration - handles unmatched appointment references gracefully',
	function () {
		$appt_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['appointment'],
				'post_status' => 'publish',
				'post_title'  => 'Orphan Appointment',
				'meta_input'  => array(
					'service' => 'Deleted Service',
				),
			)
		);

		$log = BookableMigration::run();

		expect( $log['appointments']['errors'] )->toHaveCount( 1 );
		expect( $log['appointments']['errors'][0]['service_name'] )->toBe( 'Deleted Service' );
	}
);

test(
	'BookableMigration - idempotent (safe to run twice)',
	function () {
		create_legacy_service(
			array(
				'title' => 'Massage',
				'meta'  => array( 'duration' => 60 ),
			)
		);

		$log1 = BookableMigration::run();
		expect( $log1['services']['migrated'] )->toBe( 1 );

		// Reset version flag to allow re-run.
		BookableMigration::reset();

		$log2 = BookableMigration::run();
		expect( $log2['services']['skipped'] )->toBe( 1 );
		expect( $log2['services']['migrated'] )->toBe( 0 );

		// Should still have only 1 bookable.
		$bookables = get_posts(
			array(
				'post_type'      => PluginInfo::POST_TYPES['bookable'],
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		expect( $bookables )->toHaveCount( 1 );
	}
);

test(
	'BookableMigration - maybe_run skips when already migrated',
	function () {
		create_legacy_service(
			array(
				'title' => 'Test',
				'meta'  => array( 'duration' => 30 ),
			)
		);

		$ran_first  = BookableMigration::maybe_run();
		$ran_second = BookableMigration::maybe_run();

		expect( $ran_first )->toBeTrue();
		expect( $ran_second )->toBeFalse();
	}
);

test(
	'BookableMigration - version flag tracks state',
	function () {
		expect( get_option( BookableMigration::VERSION_OPTION, '0' ) )->toBe( '0' );

		BookableMigration::run();

		expect( get_option( BookableMigration::VERSION_OPTION ) )->toBe( BookableMigration::CURRENT_VERSION );

		BookableMigration::reset();

		expect( get_option( BookableMigration::VERSION_OPTION, '0' ) )->toBe( '0' );
	}
);

test(
	'BookableMigration - log is stored and retrievable',
	function () {
		create_legacy_service(
			array(
				'title' => 'Test',
				'meta'  => array( 'duration' => 30 ),
			)
		);

		BookableMigration::run();

		$log = BookableMigration::get_log();

		expect( $log )->toBeArray();
		expect( $log )->toHaveKeys( array( 'entities', 'services', 'appointments', 'timestamp' ) );
	}
);
