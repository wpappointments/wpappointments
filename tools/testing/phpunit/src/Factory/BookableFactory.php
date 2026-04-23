<?php
/**
 * Bookable entity factory
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace TestTools\Factory;

use WP_UnitTest_Factory_For_Thing;
use WP_UnitTest_Generator_Sequence;
use WPAppointments\Core\PluginInfo;

/**
 * Unit test factory for bookable entities.
 *
 * @method int|WP_Error     create( $args = array(), $generation_definitions = null )
 * @method WP_Post|WP_Error create_and_get( $args = array(), $generation_definitions = null )
 * @method (int|WP_Error)[] create_many( $count, $args = array(), $generation_definitions = null )
 */
class BookableFactory extends WP_UnitTest_Factory_For_Thing {
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
			'id'          => new WP_UnitTest_Generator_Sequence( '%d' ),
			'post_status' => 'publish',
			'post_type'   => PluginInfo::POST_TYPES['bookable'],
			'post_title'  => new WP_UnitTest_Generator_Sequence( 'Bookable %s' ),
		);
	}

	/**
	 * Creates a bookable entity post.
	 *
	 * @param array $args Array with elements for the bookable entity.
	 *
	 * @return int|WP_Error The post ID on success, WP_Error object on failure.
	 */
	public function create_object( $args ) {
		$bookable_meta = array(
			'active' => $args['active'] ?? true,
			'type'   => $args['type'] ?? '',
		);

		if ( isset( $args['meta'] ) ) {
			$bookable_meta = wp_parse_args( $args['meta'], $bookable_meta );
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['bookable'],
				'post_status' => 'publish',
				'post_title'  => $args['post_title'] ?? 'Bookable',
				'meta_input'  => $bookable_meta,
			),
			true
		);

		return $post_id;
	}

	/**
	 * Updates an existing bookable entity post.
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
	 * Retrieves a bookable entity by a given ID.
	 *
	 * @param int $post_id ID of the post to retrieve.
	 *
	 * @return WP_Post|null WP_Post object on success, null on failure.
	 */
	public function get_object_by_id( $post_id ) {
		return get_post( $post_id );
	}
}
