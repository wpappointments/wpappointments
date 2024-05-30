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

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['service'],
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => $meta,
			),
			true
		);

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

		$id   = $this->service->ID;
		$name = $data['name'] ?? null;

		wp_update_post(
			array(
				'ID'         => $id,
				'post_title' => $name,
				'meta_input' => $data,
			),
			true
		);

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
		return $data;
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
