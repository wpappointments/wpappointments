<?php
/**
 * BookableVariant model file
 *
 * Variants are the actual bookable units. Every BookableEntity has at least
 * one variant. Variants link to their parent entity via post_parent and can
 * override specific fields from the parent.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Data\Model;

use WP_Error;
use WP_Post;
use WPAppointments\Bookable\BookableTypeRegistry;
use WPAppointments\Core\PluginInfo;

/**
 * BookableVariant model class
 */
class BookableVariant {
	/**
	 * Meta key prefix for overridden fields
	 *
	 * When a variant overrides a parent field, it stores the value under
	 * this key. The "overrides" meta is a serialized array of field names
	 * that have been explicitly overridden.
	 */
	const OVERRIDE_TRACKING_KEY = '_overrides';

	const FIELDS = array(
		'parent_id',
		'attribute_values',
		'active',
		'duration',
		'schedule_id',
		'buffer_before',
		'buffer_after',
		'min_lead_time',
		'max_lead_time',
		'created',
		'updated',
	);

	/**
	 * Core fields that can be overridden from parent
	 */
	const OVERRIDABLE_CORE_FIELDS = array(
		'duration',
		'schedule_id',
		'buffer_before',
		'buffer_after',
		'min_lead_time',
		'max_lead_time',
	);

	/**
	 * Variant post
	 *
	 * @var WP_Post|WP_Error|null
	 */
	public $variant;

	/**
	 * Variant data array
	 *
	 * @var array
	 */
	public $variant_data = array();

	/**
	 * BookableVariant model constructor
	 *
	 * @param WP_Post|int|array|string $variant Variant post object, ID, or data array.
	 */
	public function __construct( $variant ) {
		if ( $variant instanceof WP_Post ) {
			if ( PluginInfo::POST_TYPES['bookable-variant'] !== $variant->post_type ) {
				$this->variant = new WP_Error(
					'variant_invalid_post_type',
					__( 'Post is not a bookable variant. Expected post_type wpa-bookable-variant', 'appointments-booking' )
				);
				return;
			}
			$this->variant = $variant;
		} elseif ( is_array( $variant ) ) {
			$this->parse_variant_data( $variant );
		} elseif ( is_int( $variant ) || is_string( $variant ) ) {
			$this->parse_variant_from_id( $variant );
		} elseif ( is_null( $variant ) ) {
			$this->variant = new WP_Error(
				'variant_cannot_be_null',
				__( 'Variant value passed to constructor cannot be null. Expected array, int, string or WP_Post', 'appointments-booking' )
			);
		} else {
			$this->variant = new WP_Error(
				'variant_invalid_type',
				__( 'Variant value passed to constructor is invalid. Expected array, int, string or WP_Post', 'appointments-booking' )
			);
		}
	}

	/**
	 * Create variant
	 *
	 * @return BookableVariant|WP_Error
	 */
	public function save() {
		$parent_id        = $this->variant_data['parent_id'] ?? 0;
		$attribute_values = $this->variant_data['attribute_values'] ?? array();

		if ( ! $parent_id ) {
			return new WP_Error(
				'variant_parent_required',
				__( 'Variant must have a parent bookable entity', 'appointments-booking' )
			);
		}

		// Verify parent exists and is a bookable entity.
		$parent = get_post( $parent_id );

		if ( ! $parent || PluginInfo::POST_TYPES['bookable'] !== $parent->post_type ) {
			return new WP_Error(
				'variant_parent_invalid',
				__( 'Parent must be a valid bookable entity', 'appointments-booking' )
			);
		}

		// Build variant title from parent name + attribute values.
		$title = self::build_variant_title( $parent->post_title, $attribute_values );

		// Only store explicitly provided meta — don't store defaults for
		// inheritable fields, so they properly fall back to parent values.
		$meta = array(
			'attribute_values' => $this->variant_data['attribute_values'] ?? array(),
			'active'           => $this->variant_data['active'] ?? true,
			'created'          => $this->variant_data['created'] ?? time(),
			'updated'          => $this->variant_data['updated'] ?? time(),
		);

		// Only add inheritable fields if explicitly provided.
		// Use the _overrides tracking key to detect intentional overrides
		// (including zero values), otherwise skip default/unset values.
		$overrides = $this->variant_data[ self::OVERRIDE_TRACKING_KEY ] ?? array();

		foreach ( self::OVERRIDABLE_CORE_FIELDS as $field ) {
			if ( in_array( $field, $overrides, true ) ) {
				$meta[ $field ] = $this->variant_data[ $field ] ?? 0;
			} elseif ( isset( $this->variant_data[ $field ] ) && 0 !== $this->variant_data[ $field ] && '' !== $this->variant_data[ $field ] ) {
				$meta[ $field ] = $this->variant_data[ $field ];
			}
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['bookable-variant'],
				'post_status' => 'publish',
				'post_title'  => $title,
				'post_parent' => (int) $parent_id,
				'meta_input'  => $meta,
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$this->variant_data['id'] = $post_id;
		$this->variant            = get_post( $post_id );

		$variant = $this->normalize();

		do_action( 'wpappointments_variant_created', $variant );

		return $this;
	}

	/**
	 * Update variant
	 *
	 * @param array $data Variant update data.
	 *
	 * @return BookableVariant|WP_Error
	 */
	public function update( $data ) {
		if ( is_wp_error( $this->variant ) ) {
			return $this->variant;
		}

		if ( ! $this->variant ) {
			return new WP_Error(
				'variant_object_expected',
				__( 'Variant not found. Instantiate BookableVariant class with a variant object', 'appointments-booking' )
			);
		}

		$id = $this->variant->ID;

		$post_data = array(
			'ID' => $id,
		);

		// Update title if attribute values changed.
		if ( isset( $data['attribute_values'] ) ) {
			$parent                  = get_post( $this->variant->post_parent );
			$title                   = $parent ? self::build_variant_title( $parent->post_title, $data['attribute_values'] ) : '';
			$post_data['post_title'] = $title;
		}

		$meta = $data;
		unset( $meta['parent_id'] );

		$post_data['meta_input'] = $meta;

		$result = wp_update_post( $post_data, true );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( 0 === $result ) {
			return new WP_Error(
				'variant_update_failed',
				__( 'Failed to update bookable variant', 'appointments-booking' )
			);
		}

		$this->parse_variant_data( $data );
		$this->variant = get_post( $id );

		$variant = $this->normalize();

		do_action( 'wpappointments_variant_updated', $variant );

		return $this;
	}

	/**
	 * Delete variant
	 *
	 * @return int|WP_Error
	 */
	public function delete() {
		if ( is_wp_error( $this->variant ) ) {
			return $this->variant;
		}

		if ( ! $this->variant ) {
			return new WP_Error(
				'variant_object_expected',
				__( 'Variant not found. Instantiate BookableVariant class with a variant object', 'appointments-booking' )
			);
		}

		$id = $this->variant->ID;

		$deleted = wp_delete_post( $id, true );

		if ( ! $deleted ) {
			return new WP_Error(
				'variant_delete_failed',
				__( 'Failed to delete bookable variant', 'appointments-booking' )
			);
		}

		do_action( 'wpappointments_variant_deleted', $id );

		$this->variant      = null;
		$this->variant_data = array();

		return $id;
	}

	/**
	 * Set a field override on this variant
	 *
	 * Marks the field as overridden and stores the value.
	 *
	 * @param string $field Field name.
	 * @param mixed  $value Field value.
	 *
	 * @return bool
	 */
	public function set_override( $field, $value ) {
		if ( ! $this->variant || is_wp_error( $this->variant ) ) {
			return false;
		}

		$id        = $this->variant->ID;
		$overrides = get_post_meta( $id, self::OVERRIDE_TRACKING_KEY, true );

		if ( ! is_array( $overrides ) ) {
			$overrides = array();
		}

		if ( ! in_array( $field, $overrides, true ) ) {
			$overrides[] = $field;
		}

		update_post_meta( $id, self::OVERRIDE_TRACKING_KEY, $overrides );
		update_post_meta( $id, $field, $value );

		return true;
	}

	/**
	 * Remove a field override, reverting to parent value
	 *
	 * @param string $field Field name.
	 *
	 * @return bool
	 */
	public function unset_override( $field ) {
		if ( ! $this->variant || is_wp_error( $this->variant ) ) {
			return false;
		}

		$id        = $this->variant->ID;
		$overrides = get_post_meta( $id, self::OVERRIDE_TRACKING_KEY, true );

		if ( ! is_array( $overrides ) ) {
			return false;
		}

		$overrides = array_values( array_diff( $overrides, array( $field ) ) );

		update_post_meta( $id, self::OVERRIDE_TRACKING_KEY, $overrides );
		delete_post_meta( $id, $field );

		return true;
	}

	/**
	 * Check if a field is overridden on this variant
	 *
	 * @param string $field Field name.
	 *
	 * @return bool
	 */
	public function is_overridden( $field ) {
		if ( ! $this->variant || is_wp_error( $this->variant ) ) {
			return false;
		}

		$overrides = get_post_meta( $this->variant->ID, self::OVERRIDE_TRACKING_KEY, true );

		if ( ! is_array( $overrides ) ) {
			return false;
		}

		return in_array( $field, $overrides, true );
	}

	/**
	 * Get the effective value of a field
	 *
	 * Returns the variant's own value if set (either via override or sync),
	 * otherwise falls back to the parent entity's value.
	 *
	 * @param string $field Field name (snake_case meta key).
	 *
	 * @return mixed
	 */
	public function get_effective_field( $field ) {
		if ( ! $this->variant || is_wp_error( $this->variant ) ) {
			return null;
		}

		// Check if variant has its own value for this field.
		$variant_value = get_post_meta( $this->variant->ID, $field, true );

		if ( '' !== $variant_value ) {
			return $variant_value;
		}

		// Fall back to parent.
		$parent_id = $this->variant->post_parent;

		if ( ! $parent_id ) {
			return null;
		}

		return get_post_meta( $parent_id, $field, true );
	}

	/**
	 * Normalize variant object
	 *
	 * @param callable|null $normalizer Normalizer function.
	 *
	 * @return mixed
	 */
	public function normalize( $normalizer = null ) {
		if ( ! $normalizer ) {
			$normalizer = array( __CLASS__, 'default_normalizer' );
		}

		return call_user_func( $normalizer, $this );
	}

	/**
	 * Default normalizer
	 *
	 * Returns both raw override values and effective (computed) values.
	 *
	 * @param BookableVariant $data BookableVariant model object.
	 *
	 * @return array
	 */
	public static function default_normalizer( $data ) {
		$post = $data->variant;

		if ( is_wp_error( $post ) || ! $post ) {
			return array();
		}

		$id   = $post->ID;
		$meta = get_post_meta( $id );

		$normalized_meta = array();

		foreach ( $meta as $key => $value ) {
			$normalized_meta[ $key ] = maybe_unserialize( $value[0] );
		}

		$overrides        = isset( $normalized_meta[ self::OVERRIDE_TRACKING_KEY ] ) ? (array) $normalized_meta[ self::OVERRIDE_TRACKING_KEY ] : array();
		$attribute_values = isset( $normalized_meta['attribute_values'] ) ? (array) $normalized_meta['attribute_values'] : array();
		$active           = isset( $normalized_meta['active'] ) ? (bool) $normalized_meta['active'] : true;

		// Build effective values by checking overrides then falling back to parent.
		$parent_id   = $post->post_parent;
		$parent_meta = array();

		if ( $parent_id ) {
			$raw_parent_meta = get_post_meta( $parent_id );

			foreach ( $raw_parent_meta as $key => $value ) {
				$parent_meta[ $key ] = maybe_unserialize( $value[0] );
			}
		}

		// Compute effective values: variant meta first, then parent meta.
		$effective = array();

		foreach ( self::OVERRIDABLE_CORE_FIELDS as $field ) {
			if ( isset( $normalized_meta[ $field ] ) && '' !== $normalized_meta[ $field ] ) {
				$effective[ $field ] = $normalized_meta[ $field ];
			} else {
				$effective[ $field ] = $parent_meta[ $field ] ?? null;
			}
		}

		// Also resolve type-specific overridable fields from handler.
		$parent_type = $parent_meta['type'] ?? '';
		$handler     = BookableTypeRegistry::get_instance()->get( $parent_type );

		if ( $handler ) {
			$type_overridable = $handler->get_variant_overridable_fields();

			foreach ( $type_overridable as $field ) {
				if ( ! isset( $effective[ $field ] ) ) {
					if ( isset( $normalized_meta[ $field ] ) && '' !== $normalized_meta[ $field ] ) {
						$effective[ $field ] = $normalized_meta[ $field ];
					} else {
						$effective[ $field ] = $parent_meta[ $field ] ?? null;
					}
				}
			}
		}

		$normalized = array(
			'id'              => $id,
			'parentId'        => $parent_id,
			'name'            => $post->post_title,
			'active'          => $active,
			'attributeValues' => $attribute_values,
			'overrides'       => $overrides,
			'duration'        => isset( $effective['duration'] ) ? (int) $effective['duration'] : 0,
			'scheduleId'      => isset( $effective['schedule_id'] ) ? (int) $effective['schedule_id'] : 0,
			'bufferBefore'    => isset( $effective['buffer_before'] ) ? (int) $effective['buffer_before'] : 0,
			'bufferAfter'     => isset( $effective['buffer_after'] ) ? (int) $effective['buffer_after'] : 0,
			'minLeadTime'     => isset( $effective['min_lead_time'] ) ? (int) $effective['min_lead_time'] : 0,
			'maxLeadTime'     => isset( $effective['max_lead_time'] ) ? (int) $effective['max_lead_time'] : 0,
			'meta'            => $normalized_meta,
		);

		// Include type-specific effective fields in the normalized output,
		// converting snake_case keys to camelCase via the handler normalizer.
		if ( $handler ) {
			$normalized = $handler->normalize( $normalized, $effective );
		}

		return $normalized;
	}

	/**
	 * Build variant title from parent name and attribute values
	 *
	 * @param string $parent_title    Parent entity title.
	 * @param array  $attribute_values Attribute values array.
	 *
	 * @return string
	 */
	public static function build_variant_title( $parent_title, $attribute_values ) {
		if ( empty( $attribute_values ) ) {
			return $parent_title;
		}

		$parts = array_values( $attribute_values );

		return $parent_title . ' — ' . implode( ', ', $parts );
	}

	/**
	 * Generate variants from attribute matrix on a bookable entity
	 *
	 * Takes the attributes defined on the parent entity and generates all
	 * combinations as variant posts. Existing variants with matching
	 * attribute values are preserved.
	 *
	 * @param int $entity_id Bookable entity post ID.
	 *
	 * @return array|WP_Error Array of BookableVariant objects, or WP_Error.
	 */
	public static function generate_from_matrix( $entity_id ) {
		$entity = get_post( $entity_id );

		if ( ! $entity || PluginInfo::POST_TYPES['bookable'] !== $entity->post_type ) {
			return new WP_Error(
				'variant_entity_invalid',
				__( 'Invalid bookable entity for variant generation', 'appointments-booking' )
			);
		}

		$attributes = get_post_meta( $entity_id, 'attributes', true );

		if ( ! is_array( $attributes ) || empty( $attributes ) ) {
			// No attributes — ensure exactly one "default" variant exists.
			return self::ensure_default_variant( $entity_id );
		}

		// Generate all combinations from the attribute matrix.
		$combinations = self::generate_combinations( $attributes );

		if ( empty( $combinations ) ) {
			return self::ensure_default_variant( $entity_id );
		}

		// Get existing variants.
		$existing = self::get_existing_variant_map( $entity_id );

		$variants = array();

		foreach ( $combinations as $combo ) {
			$combo_key = self::get_combination_key( $combo );

			if ( isset( $existing[ $combo_key ] ) ) {
				$existing_post = $existing[ $combo_key ];

				// Reactivate if previously deactivated.
				$is_active = get_post_meta( $existing_post->ID, 'active', true );

				if ( ! $is_active ) {
					update_post_meta( $existing_post->ID, 'active', true );
				}

				$variants[] = new BookableVariant( $existing_post );
				unset( $existing[ $combo_key ] );
			} else {
				// Create new variant.
				$variant_model = new BookableVariant(
					array(
						'parent_id'        => $entity_id,
						'attribute_values' => $combo,
						'active'           => true,
					)
				);

				$saved = $variant_model->save();

				if ( is_wp_error( $saved ) ) {
					return $saved;
				}

				$variants[] = $saved;
			}
		}

		// Deactivate variants that no longer match any combination.
		foreach ( $existing as $orphan_post ) {
			update_post_meta( $orphan_post->ID, 'active', false );
		}

		return $variants;
	}

	/**
	 * Ensure a default variant exists for a simple (no-attribute) bookable
	 *
	 * @param int $entity_id Bookable entity post ID.
	 *
	 * @return array|WP_Error Array containing the single default variant, or WP_Error on failure.
	 */
	public static function ensure_default_variant( $entity_id ) {
		$existing_variants = get_children(
			array(
				'post_parent' => $entity_id,
				'post_type'   => PluginInfo::POST_TYPES['bookable-variant'],
				'numberposts' => 1,
				'post_status' => 'publish',
			)
		);

		if ( ! empty( $existing_variants ) ) {
			$variant_post = reset( $existing_variants );
			return array( new BookableVariant( $variant_post ) );
		}

		$variant = new BookableVariant(
			array(
				'parent_id'        => $entity_id,
				'attribute_values' => array(),
				'active'           => true,
			)
		);

		$saved = $variant->save();

		if ( is_wp_error( $saved ) ) {
			return $saved;
		}

		return array( $saved );
	}

	/**
	 * Sync a default (single) variant with its parent entity's fields
	 *
	 * Called when a simple bookable's fields are updated — the single
	 * variant should mirror the parent.
	 *
	 * @param int   $entity_id Bookable entity post ID.
	 * @param array $fields    Fields to sync from parent to variant.
	 *
	 * @return BookableVariant|null
	 */
	public static function sync_default_variant( $entity_id, $fields ) {
		$existing_variants = get_children(
			array(
				'post_parent' => $entity_id,
				'post_type'   => PluginInfo::POST_TYPES['bookable-variant'],
				'numberposts' => -1,
				'post_status' => 'publish',
			)
		);

		// Only sync if there's exactly one variant (simple bookable).
		if ( count( $existing_variants ) !== 1 ) {
			return null;
		}

		$variant_post  = reset( $existing_variants );
		$variant_model = new BookableVariant( $variant_post );

		// Only update non-overridden fields.
		$update_data = array();

		foreach ( $fields as $field => $value ) {
			if ( ! $variant_model->is_overridden( $field ) ) {
				$update_data[ $field ] = $value;
			}
		}

		if ( ! empty( $update_data ) ) {
			return $variant_model->update( $update_data );
		}

		return $variant_model;
	}

	/**
	 * Delete all variants for a bookable entity
	 *
	 * @param int $entity_id Bookable entity post ID.
	 *
	 * @return int Number of variants deleted.
	 */
	public static function delete_all_for_entity( $entity_id ) {
		$variants = get_children(
			array(
				'post_parent' => $entity_id,
				'post_type'   => PluginInfo::POST_TYPES['bookable-variant'],
				'numberposts' => -1,
			)
		);

		$count = 0;

		foreach ( $variants as $variant_post ) {
			wp_delete_post( $variant_post->ID, true );
			++$count;
		}

		return $count;
	}

	/**
	 * Generate all combinations from attribute definitions
	 *
	 * @param array $attributes Array of {name: string, values: string[]}.
	 *
	 * @return array Array of combination arrays, e.g., [{Duration: "30", Type: "Swedish"}, ...].
	 */
	private static function generate_combinations( $attributes ) {
		$result = array( array() );

		foreach ( $attributes as $attribute ) {
			$name   = $attribute['name'] ?? '';
			$values = $attribute['values'] ?? array();

			if ( empty( $name ) || empty( $values ) ) {
				continue;
			}

			$new_result = array();

			foreach ( $result as $existing_combo ) {
				foreach ( $values as $value ) {
					$new_combo          = $existing_combo;
					$new_combo[ $name ] = $value;
					$new_result[]       = $new_combo;
				}
			}

			$result = $new_result;
		}

		// Filter out the initial empty array if no attributes processed.
		return array_filter(
			$result,
			function ( $combo ) {
				return ! empty( $combo );
			}
		);
	}

	/**
	 * Get a deterministic key for a combination of attribute values
	 *
	 * @param array $combo Attribute values array.
	 *
	 * @return string
	 */
	private static function get_combination_key( $combo ) {
		ksort( $combo );
		return md5( wp_json_encode( $combo ) );
	}

	/**
	 * Get existing variants mapped by their attribute combination key
	 *
	 * @param int $entity_id Bookable entity post ID.
	 *
	 * @return array Map of combination_key => WP_Post.
	 */
	private static function get_existing_variant_map( $entity_id ) {
		$variants = get_children(
			array(
				'post_parent' => $entity_id,
				'post_type'   => PluginInfo::POST_TYPES['bookable-variant'],
				'numberposts' => -1,
			)
		);

		$map = array();

		foreach ( $variants as $variant_post ) {
			$attr_values = get_post_meta( $variant_post->ID, 'attribute_values', true );

			if ( ! is_array( $attr_values ) ) {
				$attr_values = array();
			}

			$key         = self::get_combination_key( $attr_values );
			$map[ $key ] = $variant_post;
		}

		return $map;
	}

	/**
	 * Parse variant data from array
	 *
	 * @param array $variant_data Variant data.
	 */
	private function parse_variant_data( $variant_data ) {
		$data = $this->validate_variant_data( $variant_data );

		if ( is_wp_error( $data ) ) {
			$this->variant = $data;
			return;
		}

		// Track which overridable fields were explicitly provided in the
		// raw input so save() can persist intentional zero/empty overrides.
		$explicit_overrides = array();

		foreach ( self::OVERRIDABLE_CORE_FIELDS as $field ) {
			if ( array_key_exists( $field, $data ) ) {
				$explicit_overrides[] = $field;
			}
		}

		$this->variant_data = wp_parse_args(
			$data,
			array(
				'parent_id'        => 0,
				'attribute_values' => array(),
				'active'           => true,
				'duration'         => 0,
				'schedule_id'      => 0,
				'buffer_before'    => 0,
				'buffer_after'     => 0,
				'min_lead_time'    => 0,
				'max_lead_time'    => 0,
				'created'          => time(),
				'updated'          => time(),
			)
		);

		if ( ! empty( $explicit_overrides ) ) {
			$existing = $this->variant_data[ self::OVERRIDE_TRACKING_KEY ] ?? array();
			$this->variant_data[ self::OVERRIDE_TRACKING_KEY ] = array_values(
				array_unique( array_merge( $existing, $explicit_overrides ) )
			);
		}
	}

	/**
	 * Parse variant from ID
	 *
	 * @param int|string $id Variant ID.
	 */
	private function parse_variant_from_id( $id ) {
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			$this->variant = $valid_id;
		} else {
			$this->variant = get_post( $valid_id );
		}
	}

	/**
	 * Validate post ID
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return int|WP_Error
	 */
	private function validate_post_id( $post_id ) {
		if ( ! $post_id ) {
			return new WP_Error( 'variant_id_required', __( 'Variant ID is required', 'appointments-booking' ) );
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			return new WP_Error( 'variant_not_found', __( 'Variant not found', 'appointments-booking' ) );
		}

		if ( PluginInfo::POST_TYPES['bookable-variant'] !== $post->post_type ) {
			return new WP_Error( 'variant_invalid_type', __( 'Post is not a bookable variant', 'appointments-booking' ) );
		}

		return $post_id;
	}

	/**
	 * Validate variant data
	 *
	 * @param array $data Variant data.
	 *
	 * @return array|WP_Error
	 */
	private function validate_variant_data( $data ) {
		if ( ! isset( $data['parent_id'] ) && ! isset( $data['attribute_values'] ) ) {
			// Allow partial updates (just field overrides).
			return $data;
		}

		return $data;
	}
}
