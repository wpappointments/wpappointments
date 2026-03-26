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
		$user_id        = absint( $user_id );
		$posts_per_page = isset( $query['postsPerPage'] )
		? min( absint( $query['postsPerPage'] ), 100 )
		: -1;

		if ( 0 === $posts_per_page ) {
			$posts_per_page = -1;
		}

		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['ooo'],
			'posts_per_page' => $posts_per_page,
			'post_status'    => 'publish',
			'orderby'        => 'meta_value',
			'meta_key'       => 'start_date',
			'order'          => 'ASC',
			'meta_query'     => array(
				array(
					'key'     => 'user_id',
					'value'   => $user_id,
					'compare' => '=',
				),
			),
		);

		if ( isset( $query['paged'] ) ) {
			$args['paged'] = max( 1, absint( $query['paged'] ) );
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
		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['ooo'],
			'posts_per_page' => -1,
			'post_status'    => 'publish',
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
		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['ooo'],
			'posts_per_page' => -1,
			'post_status'    => 'publish',
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
