<?php
/**
 * Plugin Name: Demo Court Booking
 * Description: Demo plugin for testing the bookable entity abstraction. Registers a "court" bookable type with custom fields and sample data.
 * Version: 0.1.0
 *
 * @package DemoCourtBooking
 * @since 0.1.0
 */

namespace DemoCourtBooking;

use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Define plugin constants.
define( 'DEMO_COURT_BOOKING_FILE', __FILE__ );
define( 'DEMO_COURT_BOOKING_DIR_PATH', plugin_dir_path( __FILE__ ) );

// Load source files that have no core dependencies.
require_once __DIR__ . '/src/Fields.php';

/**
 * Check that WP Appointments core is active
 */
add_action(
	'admin_init',
	function () {
		if ( ! class_exists( 'WPAppointments\\Plugin' ) ) {
			deactivate_plugins( plugin_basename( DEMO_COURT_BOOKING_FILE ) );
			add_action(
				'admin_notices',
				function () {
					echo '<div class="error"><p>Demo Court Booking requires WP Appointments to be active.</p></div>';
				}
			);
		}
	}
);

/**
 * Bootstrap: load files that depend on core classes, register type and layers.
 *
 * Runs on plugins_loaded so WP Appointments' autoloader is available.
 */
add_action(
	'plugins_loaded',
	function () {
		if ( ! class_exists( 'WPAppointments\\Bookable\\AbstractBookableTypeHandler' ) ) {
			return;
		}

		require_once __DIR__ . '/src/CourtType.php';
		require_once __DIR__ . '/src/FacilityHoursLayer.php';
		require_once __DIR__ . '/src/MaintenanceBlockLayer.php';

		// Register type and layers on init (after post types are registered).
		add_action(
			'init',
			function () {
				\WPAppointments\Bookable\register_bookable_type( 'court', CourtType::class );

				\WPAppointments\Availability\register_availability_layer(
					'court-facility-hours',
					10,
					array(
						'type'     => 'base',
						'callback' => array( FacilityHoursLayer::class, 'callback' ),
					)
				);

				\WPAppointments\Availability\register_availability_layer(
					'court-maintenance',
					30,
					array(
						'type'     => 'narrowing',
						'callback' => array( MaintenanceBlockLayer::class, 'callback' ),
					)
				);
			},
			15
		);

		// Register admin page for courts.
		add_action(
			'init',
			function () {
				\WPAppointments\Bookable\register_bookable_type_admin_page(
					'court',
					array(
						'page_title' => 'Courts',
						'menu_title' => 'Courts',
						'capability' => 'wpa_manage_bookables',
						'icon'       => 'dashicons-location',
					)
				);
			},
			15
		);

		// Enqueue admin assets and add as core admin dependency.
		add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\enqueue_admin_assets' );
		add_filter( 'wpappointments_admin_js_dependencies', __NAMESPACE__ . '\\add_admin_dependency' );
	}
);

/**
 * Enqueue demo court booking admin script
 *
 * @return void
 */
function enqueue_admin_assets() {
	$build_path = DEMO_COURT_BOOKING_DIR_PATH . 'build/';
	$build_url  = plugin_dir_url( DEMO_COURT_BOOKING_FILE ) . 'build/';

	if ( ! file_exists( $build_path . 'admin.tsx.asset.php' ) ) {
		return;
	}

	$asset = require $build_path . 'admin.tsx.asset.php';

	wp_register_script(
		'demo-court-booking-admin',
		$build_url . 'admin.tsx.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);

	$screen = get_current_screen();

	if ( $screen && str_contains( $screen->id, 'wpappointments' ) ) {
		wp_enqueue_script( 'demo-court-booking-admin' );
	}
}

/**
 * Add demo plugin script as a dependency of the core admin script
 *
 * This ensures the demo plugin's registerBookableType call runs
 * before the core's render() processes pending registrations.
 *
 * @param array $deps Current dependencies.
 *
 * @return array
 */
function add_admin_dependency( $deps ) {
	$deps[] = 'demo-court-booking-admin';
	return $deps;
}

/**
 * Seed sample courts on activation
 */
function activate() {
	if ( ! class_exists( 'WPAppointments\\Data\\Model\\BookableEntity' ) ) {
		return;
	}

	$courts = array(
		// Variable court: 2 variants from lighting axis (yes/no).
		array(
			'name'         => 'Center Court',
			'type'         => 'court',
			'description'  => 'Main hard court with lighting for evening play.',
			'active'       => true,
			'duration'     => 3600,
			'surface_type' => 'hard',
			'indoor'       => false,
			'lighting'     => true,
			'max_players'  => 4,
			'attributes'   => array(
				array(
					'name'   => 'Lighting',
					'values' => array( 'With Lights', 'No Lights' ),
				),
			),
		),
		// Simple court: no attributes, 1 implicit default variant.
		array(
			'name'         => 'Clay Court A',
			'type'         => 'court',
			'description'  => 'Outdoor clay court for daytime play.',
			'active'       => true,
			'duration'     => 3600,
			'surface_type' => 'clay',
			'indoor'       => false,
			'lighting'     => false,
			'max_players'  => 4,
		),
		// Variable court: 2 variants from session type axis.
		array(
			'name'         => 'Indoor Court 1',
			'type'         => 'court',
			'description'  => 'Climate-controlled indoor hard court.',
			'active'       => true,
			'duration'     => 3600,
			'surface_type' => 'hard',
			'indoor'       => true,
			'lighting'     => true,
			'max_players'  => 4,
			'attributes'   => array(
				array(
					'name'   => 'Session',
					'values' => array( 'Standard', 'Extended' ),
				),
			),
		),
	);

	$seeded_ids = array();

	foreach ( $courts as $court_data ) {
		$entity = new BookableEntity( $court_data );
		$result = $entity->save();

		if ( is_wp_error( $result ) ) {
			continue;
		}

		$entity_id    = $result->bookable->ID;
		$seeded_ids[] = $entity_id;

		// Generate variants from the attribute matrix (or default variant for simple courts).
		$variants = BookableVariant::generate_from_matrix( $entity_id );

		// Apply variant-level overrides for specific courts.
		if ( 'Center Court' === $court_data['name'] && is_array( $variants ) ) {
			foreach ( $variants as $variant ) {
				$attr_values = get_post_meta( $variant->variant->ID, 'attribute_values', true );

				// "No Lights" variant: reduce max_players to 2 (practice only, no evening play).
				if ( is_array( $attr_values ) && isset( $attr_values['Lighting'] ) && 'No Lights' === $attr_values['Lighting'] ) {
					$variant->set_override( 'max_players', 2 );
				}
			}
		}

		// Apply variant-level overrides for Indoor Court 1.
		if ( 'Indoor Court 1' === $court_data['name'] && is_array( $variants ) ) {
			foreach ( $variants as $variant ) {
				$attr_values = get_post_meta( $variant->variant->ID, 'attribute_values', true );

				// "Extended" session variant: 90-minute duration instead of 60.
				if ( is_array( $attr_values ) && isset( $attr_values['Session'] ) && 'Extended' === $attr_values['Session'] ) {
					$variant->set_override( 'duration', 5400 );
				}
			}
		}
	}

	update_option( 'demo_court_booking_seeded_ids', $seeded_ids );
}

register_activation_hook( DEMO_COURT_BOOKING_FILE, __NAMESPACE__ . '\\activate' );

/**
 * Clean up sample courts on deactivation
 */
function deactivate() {
	$seeded_ids = get_option( 'demo_court_booking_seeded_ids', array() );

	foreach ( $seeded_ids as $post_id ) {
		// Delete entity via model — cascades to variants.
		$entity = new BookableEntity( (int) $post_id );

		if ( ! is_wp_error( $entity->bookable ) && $entity->bookable ) {
			$entity->delete();
		}
	}

	delete_option( 'demo_court_booking_seeded_ids' );
}

register_deactivation_hook( DEMO_COURT_BOOKING_FILE, __NAMESPACE__ . '\\deactivate' );
