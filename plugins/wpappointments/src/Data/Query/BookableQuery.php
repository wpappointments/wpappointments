<?php
/**
 * Bookable entities query class file
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Data\Query;

use WP_Query;
use WPAppointments\Core\PluginInfo;

/**
 * BookableQuery class
 */
class BookableQuery {
	/**
	 * Get all bookable entities
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function all( $query = array() ) {
		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['bookable'],
			'posts_per_page' => $query['postsPerPage'] ?? -1,
			'post_status'    => 'publish',
			'orderby'        => $query['orderby'] ?? 'date',
			'order'          => $query['order'] ?? 'DESC',
		);

		if ( isset( $query['paged'] ) ) {
			$args['paged'] = (int) $query['paged'];
		}

		$meta_query = array();

		if ( isset( $query['active'] ) ) {
			$meta_query[] = array(
				'key'     => 'active',
				'value'   => $query['active'] ? '1' : '0',
				'compare' => '=',
			);
		}

		if ( isset( $query['type'] ) && '' !== $query['type'] ) {
			$meta_query[] = array(
				'key'     => 'type',
				'value'   => sanitize_text_field( $query['type'] ),
				'compare' => '=',
			);
		}

		if ( ! empty( $meta_query ) ) {
			$args['meta_query'] = $meta_query;
		}

		$bookables = new WP_Query( $args );

		$total_items  = $bookables->found_posts;
		$per_page     = $args['posts_per_page'] > 0 ? $args['posts_per_page'] : $total_items;
		$total_pages  = $per_page > 0 ? (int) ceil( $total_items / $per_page ) : 1;
		$current_page = $args['paged'] ?? 1;

		return array(
			'bookables'      => $bookables->posts,
			'total_items'    => $total_items,
			'total_pages'    => $total_pages,
			'posts_per_page' => $per_page,
			'current_page'   => $current_page,
		);
	}

	/**
	 * Get only active bookable entities
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function active( $query = array() ) {
		$query['active'] = true;
		return self::all( $query );
	}

	/**
	 * Get bookable entities by type
	 *
	 * @param string $type  Bookable type slug.
	 * @param array  $query Query parameters.
	 *
	 * @return array
	 */
	public static function by_type( $type, $query = array() ) {
		$query['type'] = $type;
		return self::all( $query );
	}
}
