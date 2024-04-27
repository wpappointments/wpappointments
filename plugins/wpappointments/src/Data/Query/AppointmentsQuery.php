<?php
/**
 * Appointments query class file
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Data\Query;

use WP_Query;

/**
 * Appointments query class
 */
class AppointmentsQuery {
	/**
	 * Post type
	 *
	 * @var string
	 */
	const POST_TYPE = 'wpa-appointment';

	/**
		* Default query part for appointments
		*
		* @var array
		*/
	const DEFAULT_QUERY_PART = array(
		'post_type'   => self::POST_TYPE,
		'post_status' => 'publish',
		'orderby'     => 'meta_value',
		'meta_key'    => 'timestamp',
		'order'       => 'ASC',
	);

	/**
	 * Get all appointments
	 *
	 * @param array $query Query params.
	 *
	 * @return array
	 */
	public static function all( $query ) {
		$appointments   = array();
		$posts_per_page = $query['posts_per_page'] ?? 10;
		$default_query  = array_merge(
			self::DEFAULT_QUERY_PART,
			array(
				'posts_per_page' => - 1,
				'meta_query'     => array(),
			)
		);

		$query = new WP_Query(
			array_merge(
				$default_query,
				(array) $query
			)
		);

		foreach ( $query->posts as $post ) {
			$meta           = get_post_meta( $post->ID );
			$appointments[] = self::normalize(
				$post->ID,
				array(
					'status'      => $meta['status'][0],
					'timestamp'   => $meta['timestamp'][0],
					'customer_id' => $meta['customer_id'][0],
					'customer'    => $meta['customer'][0],
					'duration'    => $meta['duration'][0],
				)
			);
		}

		return array(
			'appointments' => $appointments,
			'totalItems'   => $query->found_posts,
			'totalPages'   => ceil( $query->found_posts / $posts_per_page ),
			'postsPerPage' => $posts_per_page,
			'currentPage'  => get_query_var( 'paged' ) ? get_query_var( 'paged' ) : 1,
		);
	}

	/**
	 * Prepare appointment entity
	 *
	 * @param int   $post_id Post ID.
	 * @param array $meta Post meta.
	 *
	 * @return AppointmentInterface
	 */
	protected static function normalize( $post_id, $meta ) {
		$length      = (int) get_option( 'wpappointments_appointments_defaultLength' );
		$timestamp   = $meta['timestamp'];
		$status      = $meta['status'];
		$duration    = $meta['duration'] ?? $length;
		$customer_id = $meta['customer_id'] ?? 0;

		$customer = $meta['customer'] ?? null;

		if ( is_string( $customer ) ) {
			$customer = json_decode( $customer );
		}

		return array(
			'id'         => $post_id,
			'service'    => get_the_title( $post_id ),
			'timestamp'  => (int) $timestamp,
			'status'     => $status,
			'duration'   => (int) $duration,
			'customerId' => (int) $customer_id,
			'customer'   => $customer,
		);
	}
}
