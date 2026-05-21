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
use WPAppointments\Utils\Query;

/**
 * BookableQuery class
 */
class BookableQuery {
	/**
	 * Allowed orderby values for WP_Query
	 */
	const ALLOWED_ORDERBY = array( 'date', 'title', 'modified', 'ID', 'menu_order' );

	/**
	 * Allowed order directions
	 */
	const ALLOWED_ORDER = array( 'ASC', 'DESC' );

	/**
	 * Get all bookable entities
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function all( $query = array() ) {
		$orderby   = $query['orderby'] ?? 'date';
		$order_raw = $query['order'] ?? 'DESC';
		$order     = is_string( $order_raw ) ? strtoupper( $order_raw ) : 'DESC';

		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['bookable'],
			'posts_per_page' => Query::sanitize_per_page( $query ),
			'post_status'    => 'publish',
			'orderby'        => in_array( $orderby, self::ALLOWED_ORDERBY, true ) ? $orderby : 'date',
			'order'          => in_array( $order, self::ALLOWED_ORDER, true ) ? $order : 'DESC',
		);

		if ( isset( $query['paged'] ) ) {
			$args['paged'] = Query::sanitize_paged( $query );
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
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Admin-only filter for bookables by active/type; bounded result set.
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
