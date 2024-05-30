<?php
/**
 * Facotry
 *
 * @package WPAppointments
 * @since 0.1.2
 */

namespace TestTools\Factory;

use WP_UnitTest_Factory_For_Thing;
use WP_UnitTest_Generator_Sequence;
use WPAppointments\Core\PluginInfo;

/**
 * Unit test factory for posts.
 *
 * Note: The below @method notations are defined solely for the benefit of IDEs,
 * as a way to indicate expected return values from the given factory methods.
 *
 * @method int|WP_Error     create( $args = array(), $generation_definitions = null )
 * @method WP_Post|WP_Error create_and_get( $args = array(), $generation_definitions = null )
 * @method (int|WP_Error)[] create_many( $count, $args = array(), $generation_definitions = null )
 */
class ServiceFactory extends WP_UnitTest_Factory_For_Thing {
	/**
	 * Constructor.
	 *
	 * @param WP_UnitTest_Factory $factory Factory object.
	 *
	 * @return void
	 */
	public function __construct( $factory = null ) {
		parent::__construct( $factory );

		$this->default_generation_definitions = array(
			'id'           => new WP_UnitTest_Generator_Sequence( '%d' ),
			'post_status'  => 'publish',
			'post_type'    => 'wpa-service',
			'post_title'   => new WP_UnitTest_Generator_Sequence( 'Service %s' ),
			'post_content' => new WP_UnitTest_Generator_Sequence( 'Service content %s' ),
		);
	}

	/**
	 * Creates a post object.
	 *
	 * @param array $args Array with elements for the post.
	 *
	 * @return int|WP_Error The post ID on success, WP_Error object on failure.
	 */
	public function create_object( $args ) {
		$service_meta = array(
			'duration' => $args['duration'] ?? 30,
		);

		if ( isset( $args['meta'] ) ) {
			$service_meta = wp_parse_args( $args['meta'], $service_meta );
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['service'],
				'post_status' => 'publish',
				'post_title'  => $args['post_title'],
				'meta_input'  => $service_meta,
			),
			true
		);

		return $post_id;
	}

	/**
	 * Updates an existing post object.
	 *
	 * @param int   $post_id ID of the post to update.
	 * @param array $fields  Post data.
	 *
	 * @return int|WP_Error The post ID on success, WP_Error object on failure.
	 */
	public function update_object( $post_id, $fields ) {
		$fields['ID'] = $post_id;
		return wp_update_post( $fields, true );
	}

	/**
	 * Retrieves a post by a given ID.
	 *
	 * @since UT (3.7.0)
	 *
	 * @param int $post_id ID of the post to retrieve.
	 *
	 * @return WP_Post|null WP_Post object on success, null on failure.
	 */
	public function get_object_by_id( $post_id ) {
		return get_post( $post_id );
	}
}
