<?php
/**
 * Services query class file
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Data\Query;

use WP_Query;
use WPAppointments\Core\PluginInfo;

/**
 * ServicesQuery class
 */
class ServicesQuery {
	/**
	 * Get all services
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function all( $query = array() ) {
		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['service'],
			'posts_per_page' => $query['postsPerPage'] ?? -1,
			'post_status'    => 'publish',
		);

		if ( isset( $query['active'] ) ) {
			$args['meta_query'] = array(
				array(
					'key'     => 'active',
					'value'   => $query['active'] ? '1' : '0',
					'compare' => '=',
				),
			);
		}

		$services = new WP_Query( $args );

		return array(
			'services' => $services->posts,
			'total'    => $services->found_posts,
		);
	}

	/**
	 * Get only active services
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function active( $query = array() ) {
		$query['active'] = true;
		return self::all( $query );
	}
}
