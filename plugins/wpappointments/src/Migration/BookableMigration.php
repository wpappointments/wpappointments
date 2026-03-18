<?php
/**
 * Bookable migration class file
 *
 * Migrates data from the old Entity + Service models to the new unified
 * BookableEntity + Variant system.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Migration;

use WPAppointments\Core\PluginInfo;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;

/**
 * BookableMigration class
 */
class BookableMigration {
	/**
	 * Option key for tracking migration version
	 */
	const VERSION_OPTION = 'wpappointments_bookable_migration_version';

	/**
	 * Current migration version
	 */
	const CURRENT_VERSION = '1';

	/**
	 * Option key for migration log
	 */
	const LOG_OPTION = 'wpappointments_bookable_migration_log';

	/**
	 * Run migration if needed
	 *
	 * Checks the version flag and runs the migration if it hasn't been
	 * applied yet. Safe to call multiple times (idempotent).
	 *
	 * @return bool True if migration ran, false if already up to date.
	 */
	public static function maybe_run() {
		$current = get_option( self::VERSION_OPTION, '0' );

		if ( version_compare( $current, self::CURRENT_VERSION, '>=' ) ) {
			return false;
		}

		self::run();

		return true;
	}

	/**
	 * Run the migration
	 *
	 * Migrates entities and services to the new bookable system.
	 *
	 * @return array Migration results with counts and log entries.
	 */
	public static function run() {
		$log = array();

		$entity_results  = self::migrate_entities();
		$service_results = self::migrate_services();
		$appt_results    = self::migrate_appointment_references();

		$log['entities']     = $entity_results;
		$log['services']     = $service_results;
		$log['appointments'] = $appt_results;
		$log['timestamp']    = time();

		update_option( self::LOG_OPTION, $log );
		update_option( self::VERSION_OPTION, self::CURRENT_VERSION );

		return $log;
	}

	/**
	 * Migrate entity posts to bookable entities
	 *
	 * @return array Migration results.
	 */
	private static function migrate_entities() {
		$results = array(
			'migrated' => 0,
			'skipped'  => 0,
			'errors'   => array(),
		);

		$entities = get_posts(
			array(
				'post_type'      => 'wpa-entity',
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		foreach ( $entities as $entity_post ) {
			// Check if already migrated (bookable with same origin).
			$existing = self::find_migrated_bookable( 'entity', $entity_post->ID );

			if ( $existing ) {
				++$results['skipped'];
				continue;
			}

			$meta = get_post_meta( $entity_post->ID );

			$bookable_data = array(
				'name'          => $entity_post->post_title,
				'active'        => isset( $meta['active'] ) ? (bool) maybe_unserialize( $meta['active'][0] ) : true,
				'description'   => isset( $meta['description'] ) ? maybe_unserialize( $meta['description'][0] ) : '',
				'type'          => isset( $meta['type'] ) ? maybe_unserialize( $meta['type'][0] ) : '',
				'image'         => isset( $meta['image'] ) ? maybe_unserialize( $meta['image'][0] ) : '',
				'schedule_id'   => isset( $meta['schedule_id'] ) ? (int) maybe_unserialize( $meta['schedule_id'][0] ) : 0,
				'buffer_before' => isset( $meta['buffer_before'] ) ? (int) maybe_unserialize( $meta['buffer_before'][0] ) : 0,
				'buffer_after'  => isset( $meta['buffer_after'] ) ? (int) maybe_unserialize( $meta['buffer_after'][0] ) : 0,
				'min_lead_time' => isset( $meta['min_lead_time'] ) ? (int) maybe_unserialize( $meta['min_lead_time'][0] ) : 0,
				'max_lead_time' => isset( $meta['max_lead_time'] ) ? (int) maybe_unserialize( $meta['max_lead_time'][0] ) : 0,
			);

			$bookable = new BookableEntity( $bookable_data );
			$saved    = $bookable->save();

			if ( is_wp_error( $saved ) ) {
				$results['errors'][] = array(
					'entity_id' => $entity_post->ID,
					'error'     => $saved->get_error_message(),
				);
				continue;
			}

			// Track migration origin.
			update_post_meta( $saved->bookable->ID, '_migrated_from', 'entity' );
			update_post_meta( $saved->bookable->ID, '_migrated_from_id', $entity_post->ID );

			// Create a default variant.
			BookableVariant::ensure_default_variant( $saved->bookable->ID );

			++$results['migrated'];
		}

		return $results;
	}

	/**
	 * Migrate service posts to bookable entities with variants
	 *
	 * @return array Migration results.
	 */
	private static function migrate_services() {
		$results = array(
			'migrated' => 0,
			'skipped'  => 0,
			'errors'   => array(),
		);

		$services = get_posts(
			array(
				'post_type'      => 'wpa-service',
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		foreach ( $services as $service_post ) {
			// Check if already migrated.
			$existing = self::find_migrated_bookable( 'service', $service_post->ID );

			if ( $existing ) {
				++$results['skipped'];
				continue;
			}

			$meta = get_post_meta( $service_post->ID );

			$bookable_data = array(
				'name'        => $service_post->post_title,
				'active'      => isset( $meta['active'] ) ? (bool) maybe_unserialize( $meta['active'][0] ) : true,
				'description' => isset( $meta['description'] ) ? maybe_unserialize( $meta['description'][0] ) : '',
				'type'        => 'service',
				'image'       => isset( $meta['image'] ) ? maybe_unserialize( $meta['image'][0] ) : '',
				'duration'    => isset( $meta['duration'] ) ? (int) maybe_unserialize( $meta['duration'][0] ) : 0,
			);

			$bookable = new BookableEntity( $bookable_data );
			$saved    = $bookable->save();

			if ( is_wp_error( $saved ) ) {
				$results['errors'][] = array(
					'service_id' => $service_post->ID,
					'error'      => $saved->get_error_message(),
				);
				continue;
			}

			// Track migration origin.
			update_post_meta( $saved->bookable->ID, '_migrated_from', 'service' );
			update_post_meta( $saved->bookable->ID, '_migrated_from_id', $service_post->ID );

			// Create a default variant with service-specific fields.
			$variants = BookableVariant::ensure_default_variant( $saved->bookable->ID );

			if ( ! empty( $variants ) ) {
				$variant = $variants[0];

				// Store service-specific fields on the variant.
				$price    = isset( $meta['price'] ) ? maybe_unserialize( $meta['price'][0] ) : 0;
				$category = isset( $meta['category'] ) ? maybe_unserialize( $meta['category'][0] ) : '';

				if ( $price ) {
					update_post_meta( $variant->variant->ID, 'price', $price );
				}

				if ( $category ) {
					update_post_meta( $variant->variant->ID, 'category', $category );
				}

				// Track the original service ID on the variant for appointment reference migration.
				update_post_meta( $variant->variant->ID, '_migrated_from_service_id', $service_post->ID );
				update_post_meta( $variant->variant->ID, '_migrated_from_service_name', $service_post->post_title );
			}

			++$results['migrated'];
		}

		return $results;
	}

	/**
	 * Migrate appointment references from service name to variant ID
	 *
	 * @return array Migration results.
	 */
	private static function migrate_appointment_references() {
		$results = array(
			'updated' => 0,
			'skipped' => 0,
			'errors'  => array(),
		);

		$appointments = get_posts(
			array(
				'post_type'      => PluginInfo::POST_TYPES['appointment'],
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		foreach ( $appointments as $appointment ) {
			// Skip if already has a variant_id.
			$existing_variant_id = get_post_meta( $appointment->ID, 'variant_id', true );

			if ( $existing_variant_id ) {
				++$results['skipped'];
				continue;
			}

			$service_name = get_post_meta( $appointment->ID, 'service', true );

			if ( ! $service_name ) {
				++$results['skipped'];
				continue;
			}

			// Find the variant that was migrated from a service with this name.
			$variant = self::find_variant_by_service_name( $service_name );

			if ( $variant ) {
				update_post_meta( $appointment->ID, 'variant_id', $variant->ID );
				++$results['updated'];
			} else {
				$results['errors'][] = array(
					'appointment_id' => $appointment->ID,
					'service_name'   => $service_name,
					'error'          => 'No matching variant found for service name',
				);
			}
		}

		return $results;
	}

	/**
	 * Find a bookable entity that was migrated from a specific source
	 *
	 * @param string $source    Source type ('entity' or 'service').
	 * @param int    $source_id Original post ID.
	 *
	 * @return \WP_Post|null
	 */
	private static function find_migrated_bookable( $source, $source_id ) {
		$posts = get_posts(
			array(
				'post_type'      => PluginInfo::POST_TYPES['bookable'],
				'posts_per_page' => 1,
				'post_status'    => 'any',
				'meta_query'     => array(
					'relation' => 'AND',
					array(
						'key'   => '_migrated_from',
						'value' => $source,
					),
					array(
						'key'   => '_migrated_from_id',
						'value' => $source_id,
					),
				),
			)
		);

		return ! empty( $posts ) ? $posts[0] : null;
	}

	/**
	 * Find a variant by the original service name it was migrated from
	 *
	 * @param string $service_name Original service name.
	 *
	 * @return \WP_Post|null
	 */
	private static function find_variant_by_service_name( $service_name ) {
		$posts = get_posts(
			array(
				'post_type'      => PluginInfo::POST_TYPES['bookable-variant'],
				'posts_per_page' => 1,
				'post_status'    => 'any',
				'meta_query'     => array(
					array(
						'key'   => '_migrated_from_service_name',
						'value' => $service_name,
					),
				),
			)
		);

		return ! empty( $posts ) ? $posts[0] : null;
	}

	/**
	 * Get the migration log
	 *
	 * @return array|false
	 */
	public static function get_log() {
		return get_option( self::LOG_OPTION, false );
	}

	/**
	 * Reset migration state (allows re-running)
	 *
	 * @return void
	 */
	public static function reset() {
		delete_option( self::VERSION_OPTION );
		delete_option( self::LOG_OPTION );
	}
}
