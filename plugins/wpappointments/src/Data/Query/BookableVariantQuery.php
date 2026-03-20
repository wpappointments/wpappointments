<?php
/**
 * Bookable variant query class file
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Data\Query;

use WP_Query;
use WPAppointments\Core\PluginInfo;

/**
 * BookableVariantQuery class
 */
class BookableVariantQuery {
	/**
	 * Get all variants for a bookable entity
	 *
	 * @param int   $entity_id Bookable entity post ID.
	 * @param array $query     Query parameters.
	 *
	 * @return array
	 */
	public static function by_entity( $entity_id, $query = array() ) {
		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['bookable-variant'],
			'posts_per_page' => $query['postsPerPage'] ?? -1,
			'post_status'    => 'publish',
			'post_parent'    => (int) $entity_id,
			'orderby'        => $query['orderby'] ?? 'date',
			'order'          => $query['order'] ?? 'ASC',
		);

		if ( isset( $query['paged'] ) ) {
			$args['paged'] = (int) $query['paged'];
		}

		if ( isset( $query['active'] ) ) {
			$args['meta_query'] = array(
				array(
					'key'     => 'active',
					'value'   => $query['active'] ? '1' : '0',
					'compare' => '=',
				),
			);
		}

		$variants = new WP_Query( $args );

		$total_items  = $variants->found_posts;
		$per_page     = $args['posts_per_page'] > 0 ? $args['posts_per_page'] : $total_items;
		$total_pages  = $per_page > 0 ? (int) ceil( $total_items / $per_page ) : 1;
		$current_page = $args['paged'] ?? 1;

		return array(
			'variants'       => $variants->posts,
			'total_items'    => $total_items,
			'total_pages'    => $total_pages,
			'posts_per_page' => $per_page,
			'current_page'   => $current_page,
		);
	}

	/**
	 * Get active variants for a bookable entity
	 *
	 * @param int   $entity_id Bookable entity post ID.
	 * @param array $query     Query parameters.
	 *
	 * @return array
	 */
	public static function active( $entity_id, $query = array() ) {
		$query['active'] = true;
		return self::by_entity( $entity_id, $query );
	}

	/**
	 * Find a variant by specific attribute values
	 *
	 * @param int   $entity_id        Bookable entity post ID.
	 * @param array $attribute_values  Attribute values to match.
	 *
	 * @return \WP_Post|null
	 */
	public static function by_attributes( $entity_id, $attribute_values ) {
		$result   = self::active( $entity_id );
		$variants = $result['variants'];

		// Sort the target for comparison.
		$target = $attribute_values;
		ksort( $target );

		foreach ( $variants as $variant_post ) {
			$variant_attrs = get_post_meta( $variant_post->ID, 'attribute_values', true );

			if ( ! is_array( $variant_attrs ) ) {
				$variant_attrs = array();
			}

			ksort( $variant_attrs );

			if ( $variant_attrs === $target ) {
				return $variant_post;
			}
		}

		return null;
	}
}
