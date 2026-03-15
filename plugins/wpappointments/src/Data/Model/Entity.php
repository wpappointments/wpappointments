<?php
/**
 * Entity model file
 *
 * Bookable entities represent resources that can be booked (rooms, tables,
 * equipment, staff, etc.). Entities support hierarchical nesting via
 * post_parent (e.g., restaurant → table → seat) and can have their own
 * schedules that override the global default.
 *
 * @package WPAppointments
 * @since 0.3.0
 */

namespace WPAppointments\Data\Model;

use WP_Error;
use WP_Post;
use WPAppointments\Core\PluginInfo;

/**
 * Entity model class
 */
class Entity {
	const FIELDS = array(
		'name',
		'active',
		'description',
		'type',
		'capacity',
		'image',
		'schedule_id',
		'schedule_mode',
		'buffer_before',
		'buffer_after',
		'min_lead_time',
		'max_lead_time',
		'sort_order',
		'created',
		'updated',
	);

	/**
	 * Entity post
	 *
	 * @var WP_Post|WP_Error|null
	 */
	public $entity;

	/**
	 * Entity data array
	 *
	 * @var array
	 */
	public $entity_data = array();

	/**
	 * Entity model constructor
	 *
	 * @param WP_Post|int|array $entity Entity post object, ID, or data array.
	 */
	public function __construct( $entity ) {
		if ( $entity instanceof WP_Post ) {
			$this->entity = $entity;
		} elseif ( is_array( $entity ) ) {
			$this->parse_entity_data( $entity );
		} elseif ( is_int( $entity ) || is_string( $entity ) ) {
			$this->parse_entity_from_id( $entity );
		} elseif ( is_null( $entity ) ) {
			$this->entity = new WP_Error(
				'entity_cannot_be_null',
				__( 'Entity value passed to constructor cannot be null. Expected array, int, string or WP_Post', 'wpappointments' )
			);
		} else {
			$this->entity = new WP_Error(
				'entity_invalid_type',
				__( 'Entity value passed to constructor is invalid. Expected array, int, string or WP_Post', 'wpappointments' )
			);
		}
	}

	/**
	 * Create entity
	 *
	 * @return Entity|WP_Error
	 */
	public function save() {
		$title     = $this->entity_data['name'] ?? '';
		$parent_id = $this->entity_data['parent_id'] ?? 0;

		$meta = $this->entity_data;
		unset( $meta['name'] );
		unset( $meta['parent_id'] );

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['entity'],
				'post_status' => 'publish',
				'post_title'  => $title,
				'post_parent' => (int) $parent_id,
				'menu_order'  => (int) ( $meta['sort_order'] ?? 0 ),
				'meta_input'  => $meta,
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$this->entity_data['id'] = $post_id;
		$this->entity            = get_post( $post_id );

		$entity = $this->normalize();

		do_action( 'wpappointments_entity_created', $entity );

		return $this;
	}

	/**
	 * Update entity
	 *
	 * @param array $data Entity update data.
	 *
	 * @return Entity|WP_Error
	 */
	public function update( $data ) {
		if ( is_wp_error( $this->entity ) ) {
			return $this->entity;
		}

		if ( ! $this->entity ) {
			return new WP_Error(
				'entity_object_expected',
				__( 'Entity not found. Instantiate Entity class with an entity object', 'wpappointments' )
			);
		}

		$id        = $this->entity->ID;
		$name      = $data['name'] ?? null;
		$parent_id = $data['parent_id'] ?? null;

		$post_data = array(
			'ID' => $id,
		);

		if ( null !== $name ) {
			$post_data['post_title'] = $name;
		}

		if ( null !== $parent_id ) {
			$post_data['post_parent'] = (int) $parent_id;
		}

		if ( isset( $data['sort_order'] ) ) {
			$post_data['menu_order'] = (int) $data['sort_order'];
		}

		$meta = $data;
		unset( $meta['name'] );
		unset( $meta['parent_id'] );

		$post_data['meta_input'] = $meta;

		wp_update_post( $post_data, true );

		$this->parse_entity_data( $data );
		$this->entity = get_post( $id );

		$entity = $this->normalize();

		do_action( 'wpappointments_entity_updated', $entity );

		return $this;
	}

	/**
	 * Delete entity
	 *
	 * Optionally reassigns children to this entity's parent before deletion.
	 *
	 * @param bool $reassign_children Whether to reassign children to parent.
	 *
	 * @return int|WP_Error
	 */
	public function delete( $reassign_children = true ) {
		if ( is_wp_error( $this->entity ) ) {
			return $this->entity;
		}

		if ( ! $this->entity ) {
			return new WP_Error(
				'entity_object_expected',
				__( 'Entity not found. Instantiate Entity class with an entity object', 'wpappointments' )
			);
		}

		$id        = $this->entity->ID;
		$parent_id = $this->entity->post_parent;

		if ( $reassign_children ) {
			$children = get_children(
				array(
					'post_parent' => $id,
					'post_type'   => PluginInfo::POST_TYPES['entity'],
				)
			);

			foreach ( $children as $child ) {
				wp_update_post(
					array(
						'ID'          => $child->ID,
						'post_parent' => $parent_id,
					)
				);
			}
		}

		$deleted = wp_delete_post( $id, true );

		do_action( 'wpappointments_entity_deleted', $id );

		$this->entity      = null;
		$this->entity_data = array();

		return $deleted->ID;
	}

	/**
	 * Normalize entity object
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
	 * @param Entity $data Entity model object.
	 *
	 * @return array
	 */
	public static function default_normalizer( $data ) {
		$post = $data->entity;

		if ( is_wp_error( $post ) || ! $post ) {
			return array();
		}

		$id   = $post->ID;
		$meta = get_post_meta( $id );

		$normalized_meta = array();

		foreach ( $meta as $key => $value ) {
			$normalized_meta[ $key ] = maybe_unserialize( $value[0] );
		}

		$active        = isset( $normalized_meta['active'] ) ? (bool) $normalized_meta['active'] : true;
		$description   = $normalized_meta['description'] ?? '';
		$type          = $normalized_meta['type'] ?? '';
		$capacity      = isset( $normalized_meta['capacity'] ) ? (int) $normalized_meta['capacity'] : 1;
		$image         = $normalized_meta['image'] ?? '';
		$schedule_id   = isset( $normalized_meta['schedule_id'] ) ? (int) $normalized_meta['schedule_id'] : 0;
		$schedule_mode = $normalized_meta['schedule_mode'] ?? 'inherit';
		$buffer_before = isset( $normalized_meta['buffer_before'] ) ? (int) $normalized_meta['buffer_before'] : 0;
		$buffer_after  = isset( $normalized_meta['buffer_after'] ) ? (int) $normalized_meta['buffer_after'] : 0;
		$min_lead_time = isset( $normalized_meta['min_lead_time'] ) ? (int) $normalized_meta['min_lead_time'] : 0;
		$max_lead_time = isset( $normalized_meta['max_lead_time'] ) ? (int) $normalized_meta['max_lead_time'] : 0;

		return array(
			'id'            => $id,
			'name'          => $post->post_title,
			'parentId'      => (int) $post->post_parent,
			'active'        => $active,
			'description'   => $description,
			'type'          => $type,
			'capacity'      => $capacity,
			'image'         => $image,
			'scheduleId'    => $schedule_id,
			'scheduleMode'  => $schedule_mode,
			'bufferBefore'  => $buffer_before,
			'bufferAfter'   => $buffer_after,
			'minLeadTime'   => $min_lead_time,
			'maxLeadTime'   => $max_lead_time,
			'sortOrder'     => (int) $post->menu_order,
			'depth'         => self::get_depth( $post ),
			'childrenCount' => self::get_children_count( $id ),
			'meta'          => $normalized_meta,
		);
	}

	/**
	 * Get entity depth in hierarchy
	 *
	 * @param WP_Post $post Entity post.
	 *
	 * @return int
	 */
	public static function get_depth( $post ) {
		$depth = 0;

		while ( $post->post_parent > 0 ) {
			$post = get_post( $post->post_parent );

			if ( ! $post ) {
				break;
			}

			++$depth;
		}

		return $depth;
	}

	/**
	 * Get direct children count
	 *
	 * @param int $entity_id Entity post ID.
	 *
	 * @return int
	 */
	public static function get_children_count( $entity_id ) {
		$children = get_children(
			array(
				'post_parent' => $entity_id,
				'post_type'   => PluginInfo::POST_TYPES['entity'],
				'numberposts' => -1,
				'fields'      => 'ids',
			)
		);

		return count( $children );
	}

	/**
	 * Get effective schedule ID for this entity
	 *
	 * Walks up the hierarchy: entity → parent entity → ... → global default.
	 *
	 * @return int Schedule post ID.
	 */
	public function get_effective_schedule_id() {
		if ( is_wp_error( $this->entity ) || ! $this->entity ) {
			return (int) get_option( 'wpappointments_default_scheduleId', 0 );
		}

		$schedule_mode = get_post_meta( $this->entity->ID, 'schedule_mode', true );
		$schedule_id   = get_post_meta( $this->entity->ID, 'schedule_id', true );

		if ( 'own' === $schedule_mode && $schedule_id ) {
			return (int) $schedule_id;
		}

		if ( $this->entity->post_parent > 0 ) {
			$parent = new Entity( (int) $this->entity->post_parent );
			return $parent->get_effective_schedule_id();
		}

		return (int) get_option( 'wpappointments_default_scheduleId', 0 );
	}

	/**
	 * Get effective buffer times for this entity
	 *
	 * Returns the most specific (closest to entity) non-zero values.
	 * Falls back to global settings.
	 *
	 * @return array{before: int, after: int}
	 */
	public function get_effective_buffers() {
		if ( is_wp_error( $this->entity ) || ! $this->entity ) {
			return array(
				'before' => (int) get_option( 'wpappointments_buffer_before', 0 ),
				'after'  => (int) get_option( 'wpappointments_buffer_after', 0 ),
			);
		}

		$buffer_before = (int) get_post_meta( $this->entity->ID, 'buffer_before', true );
		$buffer_after  = (int) get_post_meta( $this->entity->ID, 'buffer_after', true );

		if ( $buffer_before > 0 || $buffer_after > 0 ) {
			return array(
				'before' => $buffer_before,
				'after'  => $buffer_after,
			);
		}

		if ( $this->entity->post_parent > 0 ) {
			$parent = new Entity( (int) $this->entity->post_parent );
			return $parent->get_effective_buffers();
		}

		return array(
			'before' => (int) get_option( 'wpappointments_buffer_before', 0 ),
			'after'  => (int) get_option( 'wpappointments_buffer_after', 0 ),
		);
	}

	/**
	 * Get effective lead times for this entity
	 *
	 * Returns the most specific (closest to entity) non-zero values.
	 * Falls back to global settings.
	 *
	 * @return array{min: int, max: int}
	 */
	public function get_effective_lead_times() {
		if ( is_wp_error( $this->entity ) || ! $this->entity ) {
			return array(
				'min' => (int) get_option( 'wpappointments_min_lead_time', 0 ),
				'max' => (int) get_option( 'wpappointments_max_lead_time', 0 ),
			);
		}

		$min_lead_time = (int) get_post_meta( $this->entity->ID, 'min_lead_time', true );
		$max_lead_time = (int) get_post_meta( $this->entity->ID, 'max_lead_time', true );

		if ( $min_lead_time > 0 || $max_lead_time > 0 ) {
			return array(
				'min' => $min_lead_time,
				'max' => $max_lead_time,
			);
		}

		if ( $this->entity->post_parent > 0 ) {
			$parent = new Entity( (int) $this->entity->post_parent );
			return $parent->get_effective_lead_times();
		}

		return array(
			'min' => (int) get_option( 'wpappointments_min_lead_time', 0 ),
			'max' => (int) get_option( 'wpappointments_max_lead_time', 0 ),
		);
	}

	/**
	 * Parse entity data from array
	 *
	 * @param array $entity_data Entity data.
	 */
	private function parse_entity_data( $entity_data ) {
		$data = $this->validate_entity_data( $entity_data );

		if ( is_wp_error( $data ) ) {
			$this->entity = $data;
			return;
		}

		$this->entity_data = wp_parse_args(
			$data,
			array(
				'active'        => true,
				'description'   => '',
				'type'          => '',
				'capacity'      => 1,
				'image'         => '',
				'schedule_id'   => 0,
				'schedule_mode' => 'inherit',
				'buffer_before' => 0,
				'buffer_after'  => 0,
				'min_lead_time' => 0,
				'max_lead_time' => 0,
				'sort_order'    => 0,
				'parent_id'     => 0,
				'created'       => time(),
				'updated'       => time(),
			)
		);
	}

	/**
	 * Parse entity from ID
	 *
	 * @param int|string $id Entity ID.
	 */
	private function parse_entity_from_id( $id ) {
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			$this->entity = $valid_id;
		} else {
			$this->entity = get_post( $valid_id );
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
			return new WP_Error( 'entity_id_required', __( 'Entity ID is required', 'wpappointments' ) );
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			return new WP_Error( 'entity_not_found', __( 'Entity not found', 'wpappointments' ) );
		}

		if ( PluginInfo::POST_TYPES['entity'] !== $post->post_type ) {
			return new WP_Error( 'entity_invalid_type', __( 'Post is not an entity', 'wpappointments' ) );
		}

		return $post_id;
	}

	/**
	 * Validate entity data
	 *
	 * @param array $data Entity data.
	 *
	 * @return array|WP_Error
	 */
	private function validate_entity_data( $data ) {
		if ( ! isset( $data['name'] ) ) {
			return new WP_Error( 'entity_name_required', __( 'Entity name is required', 'wpappointments' ) );
		}

		return $data;
	}
}
