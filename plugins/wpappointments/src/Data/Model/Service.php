<?php
/**
 * Service model file
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Data\Model;

use WP_Error;
use WP_Post;
use WP_Term;
use WPAppointments\Core\PluginInfo;

/**
 * Service model class
 */
class Service {
	const FIELDS = array(
		'name',
		'active',
		'attributes',
		'variants',
		'category',
		'description',
		'image',
		'price',
		'created',
		'updated',
	);

	/**
	 * Service post
	 *
	 * @var WP_Post|WP_Error
	 */
	public $service;

	/**
	 * Service data array
	 *
	 * @var array
	 */
	public $service_data = array();

	/**
	 * Service model constructor
	 *
	 * @param WP_Post|int|array $service Service post object or service ID or service data array.
	 */
	public function __construct( $service ) {
		if ( $service instanceof WP_Post ) {
			$this->service = $service;
		} elseif ( is_array( $service ) ) {
			$this->parse_service_data( $service );
		} elseif ( is_int( $service ) || is_string( $service ) ) {
			$this->parse_service_from_id( $service );
		} elseif ( is_null( $service ) ) {
			$this->service = new WP_Error(
				'service_cannot_be_null',
				__( 'Service value passed to a service model constructor cannot be null. Expected array, int, string or WP_Post but received null', 'wpappointments' )
			);
		} else {
			$this->service = new WP_Error(
				'service_invalid_type',
				__( 'Service value passed to a service model constructor is invalid. Expected array, int, string or WP_Post', 'wpappointments' )
			);
		}
	}

	/**
	 * Create service
	 *
	 * @return Service|WP_Error
	 */
	public function save() {
		$settings             = new Settings();
		$default_service_name = $settings->get_setting( 'appointments', 'serviceName' );
		$default_duration     = $settings->get_setting( 'appointments', 'defaultLength' );

		$title    = $this->service_data['name'] ?? $default_service_name;
		$duration = $this->service_data['duration'] ?? $default_duration;

		$meta = wp_parse_args(
			$this->service_data,
			array(
				'duration' => $duration,
			)
		);

		unset( $meta['name'] );

		$category = $meta['category'] ?? null;
		unset( $meta['category'] );

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['service'],
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => $meta,
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			$this->service = $post_id;
			return $post_id;
		}

		if ( $category ) {
			self::set_service_category( (int) $post_id, $category );
		}

		$this->service_data['id'] = $post_id;

		$this->service = get_post( $post_id );
		$service       = $this->normalize();

		do_action( 'wpappointments_service_created', $service );

		return $this;
	}

	/**
	 * Update service
	 *
	 * @param array $data Service update data.
	 *
	 * @return Service|WP_Error
	 */
	public function update( $data ) {
		if ( is_wp_error( $this->service ) ) {
			return $this->service;
		}

		if ( ! $this->service ) {
			return new WP_Error(
				'service_object_expected',
				__( 'Service not found. You have to instantiate Service class with a service object', 'wpappointments' )
			);
		}

		$id       = $this->service->ID;
		$name     = $data['name'] ?? null;
		$category = $data['category'] ?? null;

		$meta = $data;
		unset( $meta['category'] );

		$updated = wp_update_post(
			array(
				'ID'         => $id,
				'post_title' => $name,
				'meta_input' => $meta,
			),
			true
		);

		if ( is_wp_error( $updated ) ) {
			return $updated;
		}

		if ( null !== $category ) {
			self::set_service_category( $id, $category );
		}

		$this->parse_service_data( $data );
		$this->service = get_post( $id );
		$service       = $this->normalize();

		do_action( 'wpappointments_service_updated', $service );

		return $this;
	}

	/**
	 * Delete service
	 *
	 * @return Service|WP_Error
	 */
	public function delete() {
		if ( is_wp_error( $this->service ) ) {
			return $this->service;
		}

		if ( ! $this->service ) {
			return new WP_Error(
				'service_object_expected',
				__( 'Service not found. You have to instantiate Service class with a service object', 'wpappointments' )
			);
		}

		$id = $this->service->ID;

		$deleted = wp_delete_post( $id, true );

		$this->service      = null;
		$this->service_data = array();

		do_action( 'wpappointments_service_deleted', $id );

		return $deleted->ID;
	}

	/**
	 * Normalize user object
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
	 * @param Service $data Service model object.
	 *
	 * @return array
	 */
	public static function default_normalizer( $data ) {
		$post = $data->service;

		if ( is_wp_error( $post ) || ! $post ) {
			return array();
		}

		$id   = $post->ID;
		$meta = get_post_meta( $id );

		$normalized_meta = array();

		foreach ( $meta as $key => $value ) {
			$normalized_meta[ $key ] = maybe_unserialize( $value[0] );
		}

		$active      = isset( $normalized_meta['active'] ) ? (bool) $normalized_meta['active'] : true;
		$duration    = isset( $normalized_meta['duration'] ) ? (int) $normalized_meta['duration'] : 30;
		$description = $normalized_meta['description'] ?? '';
		$price       = isset( $normalized_meta['price'] ) ? (float) $normalized_meta['price'] : 0;
		$image_raw   = $normalized_meta['image'] ?? '';
		$image       = '';

		if ( ! empty( $image_raw ) ) {
			if ( is_numeric( $image_raw ) ) {
				$image_url = wp_get_attachment_url( (int) $image_raw );
				if ( false !== $image_url ) {
					$image = $image_url;
				}
			} else {
				$image = $image_raw;
			}
		}

		$category_terms = wp_get_post_terms( $id, PluginInfo::TAXONOMIES['service-category'] );
		$category       = '';

		if ( ! is_wp_error( $category_terms ) && ! empty( $category_terms ) ) {
			$first_term = $category_terms[0];
			$category   = array(
				'id'   => $first_term->term_id,
				'name' => $first_term->name,
				'slug' => $first_term->slug,
			);
		}

		return array(
			'id'          => $id,
			'name'        => $post->post_title,
			'content'     => $post->post_content,
			'active'      => $active,
			'duration'    => $duration,
			'description' => $description,
			'price'       => $price,
			'category'    => $category,
			'image'       => $image,
			'imageId'     => is_numeric( $image_raw ) ? (int) $image_raw : 0,
			'meta'        => $normalized_meta,
		);
	}

	/**
	 * Set service category term by name or term ID
	 *
	 * @param int        $post_id  Service post ID.
	 * @param string|int $category Category name or term ID.
	 *
	 * @return void
	 */
	private static function set_service_category( $post_id, $category ) {
		$taxonomy = PluginInfo::TAXONOMIES['service-category'];

		if ( empty( $category ) ) {
			wp_set_post_terms( $post_id, array(), $taxonomy );
			return;
		}

		if ( is_numeric( $category ) ) {
			$term = get_term( (int) $category, $taxonomy );
			if ( $term && ! is_wp_error( $term ) ) {
				wp_set_post_terms( $post_id, array( $term->term_id ), $taxonomy );
			}
			return;
		}

		$term = get_term_by( 'name', $category, $taxonomy );

		if ( ! $term ) {
			$result = wp_insert_term( $category, $taxonomy );
			if ( ! is_wp_error( $result ) ) {
				wp_set_post_terms( $post_id, array( $result['term_id'] ), $taxonomy );
			}
		} else {
			wp_set_post_terms( $post_id, array( $term->term_id ), $taxonomy );
		}
	}

	/**
	 * Parse service data
	 *
	 * @param array $service_data Service data.
	 */
	private function parse_service_data( $service_data ) {
		$data = $this->validate_service_data( $service_data );

		if ( is_wp_error( $data ) ) {
			$this->service = $data;
			return;
		}

		$service_data = wp_parse_args(
			$data,
			array(
				'active'      => true,
				'attributes'  => array(),
				'variants'    => array(),
				'category'    => '',
				'description' => '',
				'image'       => '',
				'price'       => 0,
				'created'     => time(),
				'updated'     => time(),
			)
		);

		$this->service_data = $service_data;
	}

	/**
	 * Parse service from ID
	 *
	 * @param int $id Service ID.
	 */
	private function parse_service_from_id( $id ) {
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			$this->service = $valid_id;
		} else {
			$this->service = get_post( $valid_id );
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
			return new WP_Error( 'service_id_required', __( 'Service ID is required', 'wpappointments' ) );
		}

		if ( ! get_post( $post_id ) ) {
			return new WP_Error( 'service_not_found', __( 'Service not found', 'wpappointments' ) );
		}

		return $post_id;
	}

	/**
	 * Validate service data
	 *
	 * @param array $data Service data.
	 *
	 * @return array|WP_Error
	 */
	private function validate_service_data( $data ) {
		if ( ! isset( $data['name'] ) ) {
			return new WP_Error( 'service_name_required', __( 'Service name is required', 'wpappointments' ) );
		}

		if ( ! isset( $data['duration'] ) ) {
			return new WP_Error( 'service_duration_required', __( 'Service duration is required', 'wpappointments' ) );
		}

		return $data;
	}
}
