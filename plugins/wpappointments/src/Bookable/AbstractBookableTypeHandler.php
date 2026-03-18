<?php
/**
 * Abstract bookable type handler class file
 *
 * Base class for all bookable type handlers. Plugins extend this to register
 * concrete bookable types (services, tables, rooms, etc.) with their own
 * fields, validation, and normalization.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Bookable;

/**
 * Abstract bookable type handler class
 */
abstract class AbstractBookableTypeHandler {
	/**
	 * Get the type slug
	 *
	 * @return string
	 */
	abstract public function get_slug();

	/**
	 * Get the type label
	 *
	 * @return string
	 */
	abstract public function get_label();

	/**
	 * Get additional meta fields for this type
	 *
	 * Returns an array of field definitions. Each field has a key (meta key)
	 * and a default value used when the field is not set.
	 *
	 * Example:
	 * ```php
	 * return array(
	 *     'duration' => array( 'default' => 60 ),
	 *     'price'    => array( 'default' => 0 ),
	 * );
	 * ```
	 *
	 * @return array
	 */
	public function get_fields() {
		return array();
	}

	/**
	 * Get fields that support per-variant overrides
	 *
	 * Returns an array of field keys (from get_fields()) that can be
	 * overridden at the variant level.
	 *
	 * @return array
	 */
	public function get_variant_overridable_fields() {
		return array_keys( $this->get_fields() );
	}

	/**
	 * Validate type-specific data
	 *
	 * Called during save/update to validate type-specific fields.
	 * Return WP_Error on validation failure, or the validated data array.
	 *
	 * @param array $data Data to validate.
	 *
	 * @return array|\WP_Error Validated data or WP_Error.
	 */
	public function validate( $data ) {
		return $data;
	}

	/**
	 * Add type-specific fields to normalized output
	 *
	 * Called during normalize() to add type-specific fields to the
	 * normalized array. Receives the base normalized array and raw meta.
	 *
	 * @param array $normalized Base normalized array from BookableEntity.
	 * @param array $meta       Raw post meta.
	 *
	 * @return array Normalized array with type-specific fields added.
	 */
	public function normalize( $normalized, $meta ) {
		$fields = $this->get_fields();

		foreach ( $fields as $key => $config ) {
			$default  = $config['default'] ?? null;
			$meta_val = $meta[ $key ] ?? $default;

			// Convert to camelCase for the normalized key.
			$camel_key = lcfirst( str_replace( ' ', '', ucwords( str_replace( '_', ' ', $key ) ) ) );

			$normalized[ $camel_key ] = $meta_val;
		}

		return $normalized;
	}
}
