<?php
/**
 * Schedule query class file
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Data\Query;

use WP_Query;
use WPAppointments\Core\PluginInfo;
use WPAppointments\Utils\Query;

/**
 * ScheduleQuery class
 */
class ScheduleQuery {
	/**
	 * Get all schedules
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function all( $query = array() ) {
		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['schedule'],
			'posts_per_page' => Query::sanitize_per_page( $query ),
			'post_status'    => 'publish',
			'orderby'        => 'date',
			'order'          => 'ASC',
		);

		if ( isset( $query['paged'] ) ) {
			$args['paged'] = Query::sanitize_paged( $query );
		}

		$schedules = new WP_Query( $args );

		$total_items  = $schedules->found_posts;
		$per_page     = $args['posts_per_page'] > 0 ? $args['posts_per_page'] : $total_items;
		$total_pages  = $per_page > 0 ? (int) ceil( $total_items / $per_page ) : 1;
		$current_page = $args['paged'] ?? 1;

		return array(
			'schedules'      => $schedules->posts,
			'total_items'    => $total_items,
			'total_pages'    => $total_pages,
			'posts_per_page' => $per_page,
			'current_page'   => $current_page,
		);
	}

	/**
	 * Get the default schedule
	 *
	 * @return \WP_Post|null
	 */
	public static function get_default() {
		$schedule_id = get_option( 'wpappointments_default_scheduleId' );

		if ( ! $schedule_id ) {
			return null;
		}

		$post = get_post( absint( $schedule_id ) );

		if ( ! $post || PluginInfo::POST_TYPES['schedule'] !== $post->post_type ) {
			return null;
		}

		return $post;
	}
}
