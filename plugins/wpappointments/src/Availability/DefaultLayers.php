<?php
/**
 * Default availability layers file
 *
 * Registers the core availability layers: system defaults and entity.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Availability;

use WPAppointments\Data\Model\Settings;

/**
 * Default availability layers class
 */
class DefaultLayers {
	/**
	 * Register the default core layers
	 *
	 * Should be called during plugin initialization.
	 *
	 * @return void
	 */
	public static function register() {
		AvailabilityLayerRegistry::get_instance()->register(
			'system',
			0,
			array(
				'type'     => 'base',
				'callback' => array( __CLASS__, 'system_defaults_callback' ),
			)
		);

		AvailabilityLayerRegistry::get_instance()->register(
			'entity',
			20,
			array(
				'type'     => 'narrowing',
				'callback' => array( __CLASS__, 'entity_callback' ),
			)
		);
	}

	/**
	 * System defaults layer callback
	 *
	 * Reads from the global default schedule (wpa-schedule post).
	 * Returns availability in the standardized format.
	 *
	 * @param array $context Layer context with variant_id, entity_id, date_range.
	 *
	 * @return array|null Availability data or null if no schedule configured.
	 */
	public static function system_defaults_callback( $context ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Required by layer callback contract.
		$schedule_post_id = get_option( 'wpappointments_default_scheduleId' );

		if ( ! $schedule_post_id ) {
			return null;
		}

		return self::schedule_post_to_availability( $schedule_post_id );
	}

	/**
	 * Entity availability layer callback
	 *
	 * Reads from the bookable entity's schedule_id meta.
	 * Returns null (pass-through) if entity has no custom schedule.
	 *
	 * @param array $context Layer context with variant_id, entity_id, date_range.
	 *
	 * @return array|null Availability data or null if no entity schedule.
	 */
	public static function entity_callback( $context ) {
		$entity_id = $context['entity_id'] ?? 0;

		if ( ! $entity_id ) {
			return null;
		}

		$schedule_id = get_post_meta( $entity_id, 'schedule_id', true );

		if ( ! $schedule_id ) {
			return null;
		}

		return self::schedule_post_to_availability( $schedule_id );
	}

	/**
	 * Convert a wpa-schedule post to the standardized availability format
	 *
	 * Reads the per-day meta stored on the schedule post and converts to
	 * the weekly + overrides format used by the availability engine.
	 *
	 * @param int $schedule_post_id Schedule post ID.
	 *
	 * @return array|null Availability data or null.
	 */
	public static function schedule_post_to_availability( $schedule_post_id ) {
		$post = get_post( $schedule_post_id );

		if ( ! $post ) {
			return null;
		}

		$days   = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );
		$weekly = array();

		foreach ( $days as $day ) {
			$meta_key = 'wpappointments_schedule_' . $day;
			$day_data = get_post_meta( $schedule_post_id, $meta_key, true );

			if ( ! $day_data ) {
				$weekly[ $day ] = array();
				continue;
			}

			if ( is_string( $day_data ) ) {
				$day_data = json_decode( $day_data, true );
			}

			if ( ! is_array( $day_data ) ) {
				$weekly[ $day ] = array();
				continue;
			}

			$enabled = $day_data['enabled'] ?? false;
			$all_day = $day_data['allDay'] ?? false;

			if ( ! $enabled && ! $all_day ) {
				$weekly[ $day ] = array();
				continue;
			}

			if ( $all_day ) {
				$weekly[ $day ] = array(
					array(
						'start' => '00:00',
						'end'   => '23:59',
					),
				);
				continue;
			}

			$slots       = $day_data['slots']['list'] ?? array();
			$time_ranges = array();

			foreach ( $slots as $slot ) {
				$start_hour   = $slot['start']['hour'] ?? '00';
				$start_minute = $slot['start']['minute'] ?? '00';
				$end_hour     = $slot['end']['hour'] ?? '00';
				$end_minute   = $slot['end']['minute'] ?? '00';

				$time_ranges[] = array(
					'start' => sprintf( '%02d:%02d', (int) $start_hour, (int) $start_minute ),
					'end'   => sprintf( '%02d:%02d', (int) $end_hour, (int) $end_minute ),
				);
			}

			$weekly[ $day ] = $time_ranges;
		}

		$overrides_raw = get_post_meta( $schedule_post_id, 'wpappointments_schedule_overrides', true );
		$overrides     = array();

		if ( is_string( $overrides_raw ) && '' !== $overrides_raw ) {
			$overrides_raw = json_decode( $overrides_raw, true );
		}

		// Override groups: [{id, dates, type, slots}] → flatten to date → time ranges.
		if ( is_array( $overrides_raw ) ) {
			foreach ( $overrides_raw as $group ) {
				if ( ! is_array( $group ) || ! isset( $group['dates'] ) ) {
					continue;
				}

				$type  = $group['type'] ?? 'closed';
				$dates = $group['dates'] ?? array();

				$time_ranges = array();

				if ( 'custom' === $type ) {
					foreach ( ( $group['slots'] ?? array() ) as $slot ) {
						if ( ! is_array( $slot ) ) {
							continue;
						}

						$start_hour   = $slot['start']['hour'] ?? '00';
						$start_minute = $slot['start']['minute'] ?? '00';
						$end_hour     = $slot['end']['hour'] ?? '00';
						$end_minute   = $slot['end']['minute'] ?? '00';

						$time_ranges[] = array(
							'start' => sprintf( '%02d:%02d', (int) $start_hour, (int) $start_minute ),
							'end'   => sprintf( '%02d:%02d', (int) $end_hour, (int) $end_minute ),
						);
					}
				}

				foreach ( $dates as $date ) {
					if ( ! is_string( $date ) ) {
						continue;
					}
					$overrides[ $date ] = $time_ranges;
				}
			}
		}

		return array(
			'weekly'    => $weekly,
			'overrides' => $overrides,
		);
	}
}
