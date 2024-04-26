<?php

namespace WPAppointments\Data\Query;

use WP_User_Query;

class CustomersQuery extends Query {
	const POST_TYPE = 'wpa-appointment';

	/**
		* Default query part for appointments
		*
		* @var array
		*/
	const DEFAULT_QUERY_PART = array(
		'role'    => 'wpa-customer',
		'number'  => 10,
		'paged'   => 1,
		'orderby' => 'registered',
		'order'   => 'DESC',
	);

	public static function all( $query = array() ) {
		$user_query = new WP_User_Query(
			array_merge(
				self::DEFAULT_QUERY_PART,
				$query
			)
		);

		$users = array();

		foreach ( $user_query->get_results() as $user ) {
			$users[] = self::normalize( $user );
		}

		return self::paginated( $users, $user_query );
	}

	/**
	 * Create paginated response
	 *
	 * @param array         $users Users array.
	 * @param WP_User_Query $query Query params.
	 *
	 * @return object
	 */
	public static function paginated( $users = array(), $query ) {
		$posts_per_page = $query->get_query_var( 'number' ) ?: 10;
		$paged          = $query->get_query_var( 'paged' ) ?: 1;
		$total          = $query->total_users ?? 0;
		$pages          = ceil( $total / $posts_per_page );

		return array(
			'customers'      => $users,
			'total_items'    => $total,
			'total_pages'    => $pages,
			'posts_per_page' => $posts_per_page,
			'current_page'   => $paged,
		);
	}

	/**
	 * Normalize user object
	 *
	 * @param WP_User $user User object.
	 *
	 * @return array
	 */
	public static function normalize( $user ) {
		return array(
			'id'      => $user->ID,
			'name'    => $user->display_name,
			'email'   => $user->user_email,
			'phone'   => get_user_meta( $user->ID, 'phone', true ),
			'created' => $user->user_registered,
			'updated' => $user->user_registered,
		);
	}
}
