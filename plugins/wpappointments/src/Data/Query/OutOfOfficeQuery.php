<?php
/**
 * Out of Office query class file
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Data\Query;

use WP_Query;
use WPAppointments\Core\PluginInfo;
use WPAppointments\Utils\Query;

/**
 * OutOfOfficeQuery class
 */
class OutOfOfficeQuery {
	/**
	 * Get all OOO entries for a user
	 *
	 * @param int   $user_id User ID.
	 * @param array $query   Query parameters.
	 *
	 * @return array
	 */
	public static function all( $user_id, $query = array() ) {
		$user_id = absint( $user_id );

		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['ooo'],
			'posts_per_page' => Query::sanitize_per_page( $query ),
			'post_status'    => 'publish',
			'orderby'        => 'meta_value',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Required to filter OOO entries by user; scope is bounded to a single user's entries.
			'meta_key'       => 'start_date',
			'order'          => 'ASC',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Admin-only query bounded by user_id meta to fetch OOO entries per user.
			'meta_query'     => array(
				array(
					'key'     => 'user_id',
					'value'   => $user_id,
					'compare' => '=',
				),
			),
		);

		if ( isset( $query['paged'] ) ) {
			$args['paged'] = Query::sanitize_paged( $query );
		}

		$ooo = new WP_Query( $args );

		$total_items  = $ooo->found_posts;
		$per_page     = $args['posts_per_page'] > 0 ? $args['posts_per_page'] : $total_items;
		$total_pages  = $per_page > 0 ? (int) ceil( $total_items / $per_page ) : 1;
		$current_page = $args['paged'] ?? 1;

		return array(
			'entries'        => $ooo->posts,
			'total_items'    => $total_items,
			'total_pages'    => $total_pages,
			'posts_per_page' => $per_page,
			'current_page'   => $current_page,
		);
	}

	/**
	 * Get OOO entries for user(s) overlapping a date range
	 *
	 * @param string $start    Start date (Y-m-d).
	 * @param string $end      End date (Y-m-d).
	 * @param int[]  $user_ids Array of user IDs.
	 *
	 * @return \WP_Post[]
	 */
	public static function for_date_range( $start, $end, $user_ids ) {
		$user_ids = Query::sanitize_user_ids( (array) $user_ids );

		if ( empty( $user_ids ) ) {
			return array();
		}

		$start_obj = \DateTime::createFromFormat( 'Y-m-d', $start );
		$end_obj   = \DateTime::createFromFormat( 'Y-m-d', $end );

		if ( ! $start_obj || $start_obj->format( 'Y-m-d' ) !== $start ) {
			return array();
		}

		if ( ! $end_obj || $end_obj->format( 'Y-m-d' ) !== $end ) {
			return array();
		}

		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['ooo'],
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Bounded by explicit user_ids and date range; admin/availability-only scope.
			'meta_query'     => array(
				'relation' => 'AND',
				array(
					'key'     => 'user_id',
					'value'   => $user_ids,
					'compare' => 'IN',
				),
				array(
					'key'     => 'start_date',
					'value'   => $end,
					'compare' => '<=',
				),
				array(
					'key'     => 'end_date',
					'value'   => $start,
					'compare' => '>=',
				),
			),
		);

		$query = new WP_Query( $args );

		return $query->posts;
	}

	/**
	 * Get all OOO entries for specific user(s)
	 *
	 * @param int[] $user_ids Array of user IDs.
	 *
	 * @return \WP_Post[]
	 */
	public static function for_users( $user_ids ) {
		$user_ids = Query::sanitize_user_ids( (array) $user_ids );

		if ( empty( $user_ids ) ) {
			return array();
		}

		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['ooo'],
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Bounded by explicit user_ids; admin-scoped OOO lookup.
			'meta_query'     => array(
				array(
					'key'     => 'user_id',
					'value'   => $user_ids,
					'compare' => 'IN',
				),
			),
		);

		$query = new WP_Query( $args );

		return $query->posts;
	}
}
