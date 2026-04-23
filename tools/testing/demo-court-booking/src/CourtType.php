<?php
/**
 * Court bookable type handler
 *
 * @package DemoCourtBooking
 * @since 0.1.0
 */

namespace DemoCourtBooking;

use WP_Error;
use WPAppointments\Bookable\AbstractBookableTypeHandler;

/**
 * Court type handler class
 *
 * Implements the bookable type handler contract for tennis/padel courts.
 */
class CourtType extends AbstractBookableTypeHandler {
	/**
	 * Get the type slug
	 *
	 * @return string
	 */
	public function get_slug() {
		return 'court';
	}

	/**
	 * Get the type label
	 *
	 * @return string
	 */
	public function get_label() {
		return 'Court';
	}

	/**
	 * Get additional meta fields for this type
	 *
	 * @return array
	 */
	public function get_fields() {
		return Fields::get_definitions();
	}

	/**
	 * Get fields that support per-variant overrides
	 *
	 * Only max_players varies by court configuration.
	 * Surface type, indoor, and lighting are fixed per court.
	 *
	 * @return array
	 */
	public function get_variant_overridable_fields() {
		return array( 'max_players' );
	}

	/**
	 * Validate court-specific data
	 *
	 * @param array $data Data to validate.
	 *
	 * @return array|WP_Error Validated data or WP_Error.
	 */
	public function validate( $data ) {
		if ( isset( $data['surface_type'] ) && ! in_array( $data['surface_type'], Fields::SURFACE_TYPES, true ) ) {
			return new WP_Error(
				'invalid_surface_type',
				sprintf(
					'Surface type must be one of: %s',
					implode( ', ', Fields::SURFACE_TYPES )
				)
			);
		}

		if ( isset( $data['max_players'] ) && ( ! is_int( $data['max_players'] ) || $data['max_players'] < 1 ) ) {
			return new WP_Error(
				'invalid_max_players',
				'Max players must be a positive integer'
			);
		}

		return $data;
	}
}
