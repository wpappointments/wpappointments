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
			$this->service_data = $service;
		} else {
			$valid_id = $this->validate_post_id( $service );

			if ( is_wp_error( $valid_id ) ) {
				$this->service = $valid_id;
			} else {
				$this->service = get_post( $valid_id );
			}
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

		$title    = $this->service_data['title'] ?? $default_service_name;
		$duration = $this->service_data['duration'] ?? $default_duration;

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['service'],
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => array(
					'duration' => $duration,
				),
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

		return call_user_func( $normalizer, $this->service );
	}

	/**
	 * Default normalizer
	 *
	 * @param WP_Post $service Service post object.
	 *
	 * @return array
	 */
	public static function default_normalizer( $service ) {
		$duration = get_post_meta( $service->ID, 'duration', true );

		return array(
			'id'       => $service->ID,
			'name'     => $service->post_title,
			'duration' => $duration,
			'created'  => $service->post_date_gmt,
			'updated'  => $service->post_modified_gmt,
		);
	}

	/**
	 * Validate post ID
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return int|WP_Error
	 */
	protected function validate_post_id( $post_id ) {
		if ( ! $post_id ) {
			return new WP_Error( 'service_id_required', __( 'Service ID is required', 'wpappointments' ) );
		}

		if ( ! get_post( $post_id ) ) {
			return new WP_Error( 'service_not_found', __( 'Service not found', 'wpappointments' ) );
		}

		return $post_id;
	}
}
