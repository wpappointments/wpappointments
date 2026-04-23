<?php
/**
 * Bookable variant factory
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace TestTools\Factory;

use WP_UnitTest_Factory_For_Thing;
use WP_UnitTest_Generator_Sequence;
use WPAppointments\Core\PluginInfo;

/**
 * Unit test factory for bookable variants.
 *
 * @method int|WP_Error     create( $args = array(), $generation_definitions = null )
 * @method WP_Post|WP_Error create_and_get( $args = array(), $generation_definitions = null )
 * @method (int|WP_Error)[] create_many( $count, $args = array(), $generation_definitions = null )
 */
class BookableVariantFactory extends WP_UnitTest_Factory_For_Thing {
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
			'post_type'   => PluginInfo::POST_TYPES['bookable-variant'],
			'post_title'  => new WP_UnitTest_Generator_Sequence( 'Variant %s' ),
		);
	}

	/**
	 * Creates a bookable variant post.
	 *
	 * @param array $args Array with elements for the variant.
	 *
	 * @return int|WP_Error The post ID on success, WP_Error object on failure.
	 */
	public function create_object( $args ) {
		$variant_meta = array(
			'active'           => $args['active'] ?? true,
			'attribute_values' => $args['attribute_values'] ?? array(),
		);

		if ( isset( $args['meta'] ) ) {
			$variant_meta = wp_parse_args( $args['meta'], $variant_meta );
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['bookable-variant'],
				'post_status' => 'publish',
				'post_title'  => $args['post_title'] ?? 'Variant',
				'post_parent' => $args['post_parent'] ?? 0,
				'meta_input'  => $variant_meta,
			),
			true
		);

		return $post_id;
	}

	/**
	 * Updates an existing variant post.
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
	 * Retrieves a variant by a given ID.
	 *
	 * @param int $post_id ID of the post to retrieve.
	 *
	 * @return WP_Post|null WP_Post object on success, null on failure.
	 */
	public function get_object_by_id( $post_id ) {
		return get_post( $post_id );
	}
}
