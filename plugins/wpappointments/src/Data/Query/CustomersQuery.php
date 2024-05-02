<?php
/**
 * Customers query class file
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Data\Query;

use WP_User_Query;

/**
 * Customers query class
 */
class CustomersQuery {
	/**
	 * User role
	 *
	 * @var string
	 */
	const ROLE = 'wpa-customer';

	/**
		* Default query part for appointments
		*
		* @var array
		*/
	const DEFAULT_QUERY_PART = array(
		'role'    => self::ROLE,
		'number'  => 10,
		'paged'   => 1,
		'orderby' => 'registered',
		'order'   => 'DESC',
	);

	/**
	 * Get all customers
	 *
	 * @param array $query Query params.
	 */
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

		return self::paginated( $user_query, $users );
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

	/**
	 * Create paginated response
	 *
	 * @param WP_User_Query $query Query params.
	 * @param array         $users Users array.
	 *
	 * @return object
	 */
	public static function paginated( $query, $users = array() ) {
		$posts_per_page = (int) $query->get( 'number' ) ?? 10;
		$paged          = (int) $query->get( 'paged' ) ?? 1;
		$total          = $query->get_total();
		$pages          = (int) ceil( $total / $posts_per_page );

		return array(
			'customers'      => $users,
			'total_items'    => $total,
			'total_pages'    => $pages,
			'posts_per_page' => $posts_per_page,
			'current_page'   => $paged,
		);
	}
}
