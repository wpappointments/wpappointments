<?php
/**
 * Facility Hours availability layer
 *
 * Base availability layer that replaces system defaults for court entities.
 * Provides facility operating hours: 07:00–22:00 daily.
 *
 * @package DemoCourtBooking
 * @since 0.1.0
 */

namespace DemoCourtBooking;

/**
 * Facility Hours layer class
 */
class FacilityHoursLayer {
	/**
	 * Layer callback
	 *
	 * Returns facility hours for court-type entities.
	 * Returns null for non-court entities (pass-through).
	 *
	 * @param array $context Layer context with variant_id, entity_id, date_range.
	 *
	 * @return array|null Availability data or null.
	 */
	public static function callback( $context ) {
		$entity_id = $context['entity_id'] ?? 0;

		if ( ! $entity_id ) {
			return null;
		}

		$type = get_post_meta( $entity_id, 'type', true );

		if ( 'court' !== $type ) {
			return null;
		}

		$daily_hours = array(
			array(
				'start' => '07:00',
				'end'   => '22:00',
			),
		);

		return array(
			'weekly'    => array(
				'monday'    => $daily_hours,
				'tuesday'   => $daily_hours,
				'wednesday' => $daily_hours,
				'thursday'  => $daily_hours,
				'friday'    => $daily_hours,
				'saturday'  => $daily_hours,
				'sunday'    => $daily_hours,
			),
			'overrides' => array(),
		);
	}
}
