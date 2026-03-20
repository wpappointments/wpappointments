<?php
/**
 * BookableEntity model file
 *
 * Abstract base model for all bookable resources. Concrete types (services,
 * tables, rooms, etc.) are registered by plugins via the bookable type
 * registration API. Every bookable entity has at least one variant, which
 * is the actual unit that gets booked.
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
 * BookableEntity model class
 */
class BookableEntity {
	const FIELDS = array(
		'name',
		'active',
		'description',
		'type',
		'image',
		'schedule_id',
		'buffer_before',
		'buffer_after',
		'min_lead_time',
		'max_lead_time',
		'duration',
		'attributes',
		'created',
		'updated',
	);

	/**
	 * Bookable entity post
	 *
	 * @var WP_Post|WP_Error|null
	 */
	public $bookable;

	/**
	 * Bookable entity data array
	 *
	 * @var array
	 */
	public $bookable_data = array();

	/**
	 * BookableEntity model constructor
	 *
	 * @param WP_Post|int|array|string $bookable Bookable post object, ID, or data array.
	 */
	public function __construct( $bookable ) {
		if ( $bookable instanceof WP_Post ) {
			if ( PluginInfo::POST_TYPES['bookable'] !== $bookable->post_type ) {
				$this->bookable = new WP_Error(
					'bookable_invalid_post_type',
					__( 'Post is not a bookable entity. Expected post_type wpa-bookable', 'wpappointments' )
				);
				return;
			}
			$this->bookable = $bookable;
		} elseif ( is_array( $bookable ) ) {
			$this->parse_bookable_data( $bookable );
		} elseif ( is_int( $bookable ) || is_string( $bookable ) ) {
			$this->parse_bookable_from_id( $bookable );
		} elseif ( is_null( $bookable ) ) {
			$this->bookable = new WP_Error(
				'bookable_cannot_be_null',
				__( 'Bookable value passed to constructor cannot be null. Expected array, int, string or WP_Post', 'wpappointments' )
			);
		} else {
			$this->bookable = new WP_Error(
				'bookable_invalid_type',
				__( 'Bookable value passed to constructor is invalid. Expected array, int, string or WP_Post', 'wpappointments' )
			);
		}
	}

	/**
	 * Create bookable entity
	 *
	 * @return BookableEntity|WP_Error
	 */
	public function save() {
		if ( is_wp_error( $this->bookable ) ) {
			return $this->bookable;
		}

		if ( $this->bookable instanceof WP_Post ) {
			return new WP_Error(
				'bookable_already_persisted',
				__( 'This bookable entity is already persisted. Use update() instead', 'wpappointments' )
			);
		}

		$title = $this->bookable_data['name'] ?? '';
		$type  = $this->bookable_data['type'] ?? '';

		// Run type-specific validation if handler is registered.
		$handler = BookableTypeRegistry::get_instance()->get( $type );

		if ( $handler ) {
			$validated = $handler->validate( $this->bookable_data );

			if ( is_wp_error( $validated ) ) {
				return $validated;
			}

			$this->bookable_data = wp_parse_args( $validated, $this->bookable_data );
		}

		$meta = $this->bookable_data;
		unset( $meta['name'] );

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['bookable'],
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => $meta,
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$this->bookable_data['id'] = $post_id;
		$this->bookable            = get_post( $post_id );

		$bookable = $this->normalize();

		do_action( 'wpappointments_bookable_created', $bookable );

		return $this;
	}

	/**
	 * Update bookable entity
	 *
	 * @param array $data Bookable update data.
	 *
	 * @return BookableEntity|WP_Error
	 */
	public function update( $data ) {
		if ( is_wp_error( $this->bookable ) ) {
			return $this->bookable;
		}

		if ( ! $this->bookable ) {
			return new WP_Error(
				'bookable_object_expected',
				__( 'Bookable not found. Instantiate BookableEntity class with a bookable object', 'wpappointments' )
			);
		}

		$id   = $this->bookable->ID;
		$name = $data['name'] ?? null;
		$type = $data['type'] ?? get_post_meta( $id, 'type', true );

		// Run type-specific validation if handler is registered.
		$handler = BookableTypeRegistry::get_instance()->get( $type );

		if ( $handler ) {
			$validated = $handler->validate( $data );

			if ( is_wp_error( $validated ) ) {
				return $validated;
			}

			$data = wp_parse_args( $validated, $data );
		}

		$post_data = array(
			'ID' => $id,
		);

		if ( null !== $name ) {
			$post_data['post_title'] = $name;
		}

		$meta = $data;
		unset( $meta['name'] );

		$post_data['meta_input'] = $meta;

		$result = wp_update_post( $post_data, true );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( 0 === $result ) {
			return new WP_Error(
				'bookable_update_failed',
				__( 'Failed to update bookable entity', 'wpappointments' )
			);
		}

		$this->parse_bookable_data( $data );
		$this->bookable = get_post( $id );

		$bookable = $this->normalize();

		do_action( 'wpappointments_bookable_updated', $bookable );

		return $this;
	}

	/**
	 * Delete bookable entity
	 *
	 * @return int|WP_Error
	 */
	public function delete() {
		if ( is_wp_error( $this->bookable ) ) {
			return $this->bookable;
		}

		if ( ! $this->bookable ) {
			return new WP_Error(
				'bookable_object_expected',
				__( 'Bookable not found. Instantiate BookableEntity class with a bookable object', 'wpappointments' )
			);
		}

		$id = $this->bookable->ID;

		// Cascade delete all variants.
		BookableVariant::delete_all_for_entity( $id );

		$deleted = wp_delete_post( $id, true );

		if ( ! $deleted ) {
			return new WP_Error(
				'bookable_delete_failed',
				__( 'Failed to delete bookable entity', 'wpappointments' )
			);
		}

		do_action( 'wpappointments_bookable_deleted', $id );

		$this->bookable      = null;
		$this->bookable_data = array();

		return $deleted->ID;
	}

	/**
	 * Normalize bookable entity object
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
	 * @param BookableEntity $data BookableEntity model object.
	 *
	 * @return array
	 */
	public static function default_normalizer( $data ) {
		$post = $data->bookable;

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
		$image         = $normalized_meta['image'] ?? '';
		$schedule_id   = isset( $normalized_meta['schedule_id'] ) ? (int) $normalized_meta['schedule_id'] : 0;
		$buffer_before = isset( $normalized_meta['buffer_before'] ) ? (int) $normalized_meta['buffer_before'] : 0;
		$buffer_after  = isset( $normalized_meta['buffer_after'] ) ? (int) $normalized_meta['buffer_after'] : 0;
		$min_lead_time = isset( $normalized_meta['min_lead_time'] ) ? (int) $normalized_meta['min_lead_time'] : 0;
		$max_lead_time = isset( $normalized_meta['max_lead_time'] ) ? (int) $normalized_meta['max_lead_time'] : 0;
		$duration      = isset( $normalized_meta['duration'] ) ? (int) $normalized_meta['duration'] : 0;
		$attributes    = isset( $normalized_meta['attributes'] ) ? (array) $normalized_meta['attributes'] : array();

		$normalized = array(
			'id'           => $id,
			'name'         => $post->post_title,
			'active'       => $active,
			'description'  => $description,
			'type'         => $type,
			'image'        => $image,
			'scheduleId'   => $schedule_id,
			'bufferBefore' => $buffer_before,
			'bufferAfter'  => $buffer_after,
			'minLeadTime'  => $min_lead_time,
			'maxLeadTime'  => $max_lead_time,
			'duration'     => $duration,
			'attributes'   => $attributes,
			'meta'         => $normalized_meta,
		);

		// Add type-specific fields via handler.
		$handler = BookableTypeRegistry::get_instance()->get( $type );

		if ( $handler ) {
			$normalized = $handler->normalize( $normalized, $normalized_meta );
		}

		return $normalized;
	}

	/**
	 * Parse bookable data from array
	 *
	 * @param array $bookable_data Bookable data.
	 */
	private function parse_bookable_data( $bookable_data ) {
		$data = $this->validate_bookable_data( $bookable_data );

		if ( is_wp_error( $data ) ) {
			$this->bookable = $data;
			return;
		}

		$this->bookable_data = wp_parse_args(
			$data,
			array(
				'active'        => true,
				'description'   => '',
				'type'          => '',
				'image'         => '',
				'schedule_id'   => 0,
				'buffer_before' => 0,
				'buffer_after'  => 0,
				'min_lead_time' => 0,
				'max_lead_time' => 0,
				'duration'      => 0,
				'attributes'    => array(),
				'created'       => time(),
				'updated'       => time(),
			)
		);
	}

	/**
	 * Parse bookable from ID
	 *
	 * @param int|string $id Bookable ID.
	 */
	private function parse_bookable_from_id( $id ) {
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			$this->bookable = $valid_id;
		} else {
			$this->bookable = get_post( $valid_id );
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
			return new WP_Error( 'bookable_id_required', __( 'Bookable ID is required', 'wpappointments' ) );
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			return new WP_Error( 'bookable_not_found', __( 'Bookable not found', 'wpappointments' ) );
		}

		if ( PluginInfo::POST_TYPES['bookable'] !== $post->post_type ) {
			return new WP_Error( 'bookable_invalid_type', __( 'Post is not a bookable entity', 'wpappointments' ) );
		}

		return $post_id;
	}

	/**
	 * Validate bookable data
	 *
	 * @param array $data Bookable data.
	 *
	 * @return array|WP_Error
	 */
	private function validate_bookable_data( $data ) {
		if ( ! isset( $data['name'] ) || '' === trim( $data['name'] ) ) {
			return new WP_Error( 'bookable_name_required', __( 'Bookable name is required', 'wpappointments' ) );
		}

		return $data;
	}
}
