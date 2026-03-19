<?php
/**
 * Migration from Entity + Service models to BookableEntity + Variants
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Data\Migration;

use WP_Query;
use WPAppointments\Core\PluginInfo;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;

/**
 * Handles data migration from old Entity/Service CPTs to unified BookableEntity.
 *
 * Migration is idempotent — safe to run multiple times.
 * Tracks migration state via options table.
 */
class BookableMigration {
	const MIGRATION_VERSION_KEY = 'wpappointments_bookable_migration_version';
	const CURRENT_VERSION       = 1;
	const LOG_KEY               = 'wpappointments_migration_log';

	/**
	 * Run the migration if not already completed
	 *
	 * @return array Migration results summary.
	 */
	public static function run() {
		$current = (int) get_option( self::MIGRATION_VERSION_KEY, 0 );

		if ( $current >= self::CURRENT_VERSION ) {
			return array(
				'status'  => 'skipped',
				'message' => __( 'Migration already completed', 'wpappointments' ),
			);
		}

		$results = array(
			'services_migrated'    => 0,
			'entities_migrated'    => 0,
			'variants_created'     => 0,
			'appointments_updated' => 0,
			'errors'               => array(),
		);

		$results = self::migrate_services( $results );
		$results = self::migrate_entities( $results );
		$results = self::update_appointment_references( $results );

		update_option( self::MIGRATION_VERSION_KEY, self::CURRENT_VERSION );
		update_option( self::LOG_KEY, $results );

		return array(
			'status'  => 'completed',
			'message' => __( 'Migration completed successfully', 'wpappointments' ),
			'results' => $results,
		);
	}

	/**
	 * Migrate wpa-service posts to wpa-bookable with type="service"
	 *
	 * Each service becomes a bookable entity with one auto-generated variant.
	 * Duration, price, and category are preserved.
	 *
	 * @param array $results Running results array.
	 *
	 * @return array Updated results.
	 */
	private static function migrate_services( array $results ): array {
		$services = new WP_Query(
			array(
				'post_type'      => PluginInfo::POST_TYPES['service'],
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		foreach ( $services->posts as $service_post ) {
			$meta = get_post_meta( $service_post->ID );

			$normalized_meta = array();
			foreach ( $meta as $key => $value ) {
				$normalized_meta[ $key ] = maybe_unserialize( $value[0] );
			}

			$bookable_data = array(
				'name'        => $service_post->post_title,
				'type'        => 'service',
				'active'      => isset( $normalized_meta['active'] ) ? (bool) $normalized_meta['active'] : true,
				'description' => $normalized_meta['description'] ?? '',
				'image'       => $normalized_meta['image'] ?? '',
				'duration'    => isset( $normalized_meta['duration'] ) ? (int) $normalized_meta['duration'] : 30,
			);

			$bookable = new BookableEntity( $bookable_data );
			$saved    = $bookable->save();

			if ( is_wp_error( $saved ) ) {
				$results['errors'][] = sprintf(
					'Failed to migrate service #%d (%s): %s',
					$service_post->ID,
					$service_post->post_title,
					$saved->get_error_message()
				);
				continue;
			}

			$bookable_id = $saved->bookable->ID;

			// Copy type-specific meta (price, category) to the bookable.
			if ( isset( $normalized_meta['price'] ) ) {
				update_post_meta( $bookable_id, 'price', $normalized_meta['price'] );
			}

			// Preserve category taxonomy assignment.
			$categories = wp_get_post_terms( $service_post->ID, PluginInfo::TAXONOMIES['service-category'] );
			if ( ! is_wp_error( $categories ) && ! empty( $categories ) ) {
				$term_ids = wp_list_pluck( $categories, 'term_id' );
				wp_set_post_terms( $bookable_id, $term_ids, PluginInfo::TAXONOMIES['service-category'] );
			}

			// Store mapping for appointment reference updates.
			update_post_meta( $bookable_id, '_migrated_from_service', $service_post->ID );
			update_post_meta( $service_post->ID, '_migrated_to_bookable', $bookable_id );

			// Ensure default variant exists.
			$variants = BookableVariant::ensure_default_variant( $bookable_id );

			if ( ! empty( $variants ) ) {
				$variant    = $variants[0];
				$variant_id = $variant->variant->ID;
				update_post_meta( $service_post->ID, '_migrated_to_variant', $variant_id );
			}

			++$results['services_migrated'];
			++$results['variants_created'];
		}

		return $results;
	}

	/**
	 * Migrate wpa-entity posts to wpa-bookable
	 *
	 * Entities become bookable entities. Hierarchy is flattened (parent_id dropped).
	 * Schedule, buffers, and lead times are preserved.
	 *
	 * @param array $results Running results array.
	 *
	 * @return array Updated results.
	 */
	private static function migrate_entities( array $results ): array {
		$entities = new WP_Query(
			array(
				'post_type'      => PluginInfo::POST_TYPES['entity'],
				'posts_per_page' => -1,
				'post_status'    => 'any',
			)
		);

		foreach ( $entities->posts as $entity_post ) {
			$meta = get_post_meta( $entity_post->ID );

			$normalized_meta = array();
			foreach ( $meta as $key => $value ) {
				$normalized_meta[ $key ] = maybe_unserialize( $value[0] );
			}

			$entity_type = $normalized_meta['type'] ?? 'entity';

			$bookable_data = array(
				'name'          => $entity_post->post_title,
				'type'          => $entity_type,
				'active'        => isset( $normalized_meta['active'] ) ? (bool) $normalized_meta['active'] : true,
				'description'   => $normalized_meta['description'] ?? '',
				'image'         => $normalized_meta['image'] ?? '',
				'schedule_id'   => isset( $normalized_meta['schedule_id'] ) ? (int) $normalized_meta['schedule_id'] : 0,
				'buffer_before' => isset( $normalized_meta['buffer_before'] ) ? (int) $normalized_meta['buffer_before'] : 0,
				'buffer_after'  => isset( $normalized_meta['buffer_after'] ) ? (int) $normalized_meta['buffer_after'] : 0,
				'min_lead_time' => isset( $normalized_meta['min_lead_time'] ) ? (int) $normalized_meta['min_lead_time'] : 0,
				'max_lead_time' => isset( $normalized_meta['max_lead_time'] ) ? (int) $normalized_meta['max_lead_time'] : 0,
			);

			$bookable = new BookableEntity( $bookable_data );
			$saved    = $bookable->save();

			if ( is_wp_error( $saved ) ) {
				$results['errors'][] = sprintf(
					'Failed to migrate entity #%d (%s): %s',
					$entity_post->ID,
					$entity_post->post_title,
					$saved->get_error_message()
				);
				continue;
			}

			$bookable_id = $saved->bookable->ID;

			update_post_meta( $bookable_id, '_migrated_from_entity', $entity_post->ID );
			update_post_meta( $entity_post->ID, '_migrated_to_bookable', $bookable_id );

			BookableVariant::ensure_default_variant( $bookable_id );

			++$results['entities_migrated'];
			++$results['variants_created'];
		}

		return $results;
	}

	/**
	 * Update appointment references from service name to variant ID
	 *
	 * Finds appointments that reference services by name (stored in post_title)
	 * and adds a variant_id meta pointing to the migrated variant.
	 *
	 * @param array $results Running results array.
	 *
	 * @return array Updated results.
	 */
	private static function update_appointment_references( array $results ): array {
		$appointments = new WP_Query(
			array(
				'post_type'      => PluginInfo::POST_TYPES['appointment'],
				'posts_per_page' => -1,
				'post_status'    => 'any',
				'meta_query'     => array(
					array(
						'key'     => 'variant_id',
						'compare' => 'NOT EXISTS',
					),
				),
			)
		);

		foreach ( $appointments->posts as $appointment_post ) {
			$service_name = $appointment_post->post_title;

			if ( empty( $service_name ) ) {
				continue;
			}

			// Find the service that was migrated.
			$service_query = new WP_Query(
				array(
					'post_type'      => PluginInfo::POST_TYPES['service'],
					'title'          => $service_name,
					'posts_per_page' => 1,
					'post_status'    => 'any',
				)
			);

			if ( empty( $service_query->posts ) ) {
				$results['errors'][] = sprintf(
					'Appointment #%d references unknown service "%s" — skipped',
					$appointment_post->ID,
					$service_name
				);
				continue;
			}

			$service_post = $service_query->posts[0];
			$variant_id   = get_post_meta( $service_post->ID, '_migrated_to_variant', true );

			if ( $variant_id ) {
				update_post_meta( $appointment_post->ID, 'variant_id', (int) $variant_id );
				++$results['appointments_updated'];
			}
		}

		return $results;
	}

	/**
	 * Check if migration is needed
	 *
	 * @return bool
	 */
	public static function needs_migration(): bool {
		$current = (int) get_option( self::MIGRATION_VERSION_KEY, 0 );
		return $current < self::CURRENT_VERSION;
	}

	/**
	 * Get migration log from last run
	 *
	 * @return array|false
	 */
	public static function get_log() {
		return get_option( self::LOG_KEY, false );
	}

	/**
	 * Reset migration state (for re-running)
	 *
	 * @return void
	 */
	public static function reset() {
		delete_option( self::MIGRATION_VERSION_KEY );
		delete_option( self::LOG_KEY );
	}
}
