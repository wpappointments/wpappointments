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
		'meta_key'    => 'timestamp', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Ordering by timestamp is intrinsic to appointment scheduling.
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
		$query          = is_array( $query ) ? $query : array();
		$posts_per_page = isset( $query['posts_per_page'] ) ? absint( $query['posts_per_page'] ) : 10;
		$paged          = isset( $query['paged'] ) ? absint( $query['paged'] ) : 1;

		$args = array_merge(
			self::DEFAULT_QUERY_PART,
			array(
				'posts_per_page' => $posts_per_page,
				'paged'          => $paged,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Filters admin appointment listing by status/date; bounded result set.
				'meta_query'     => array(),
			)
		);

		if ( ! empty( $query['status'] ) ) {
			$allowed_statuses = array( 'pending', 'confirmed', 'cancelled' );
			$status           = sanitize_text_field( $query['status'] );

			if ( in_array( $status, $allowed_statuses, true ) ) {
				$args['meta_query'][] = array(
					'key'     => 'status',
					'value'   => $status,
					'compare' => '=',
				);
			}
		}

		if ( ! empty( $query['date_from'] ) ) {
			$args['meta_query'][] = array(
				'key'     => 'timestamp',
				'value'   => (int) $query['date_from'],
				'compare' => '>=',
			);
		}

		if ( ! empty( $query['date_to'] ) ) {
			$args['meta_query'][] = array(
				'key'     => 'timestamp',
				'value'   => (int) $query['date_to'],
				'compare' => '<=',
			);
		}

		$query = new WP_Query( $args );

		foreach ( $query->posts as $post ) {
			$appointments[] = self::normalize(
				$post->ID,
				array(
					'status'      => get_post_meta( $post->ID, 'status', true ),
					'timestamp'   => get_post_meta( $post->ID, 'timestamp', true ),
					'customer_id' => get_post_meta( $post->ID, 'customer_id', true ),
					'customer'    => get_post_meta( $post->ID, 'customer', true ),
					'duration'    => get_post_meta( $post->ID, 'duration', true ),
				)
			);
		}

		return self::paginated( $query, $appointments );
	}

	/**
	 * Get upcoming appointments
	 *
	 * @param array $query Query params.
	 *
	 * @return array
	 */
	public static function upcoming( $query ) {
		$query          = is_array( $query ) ? $query : array();
		$posts_per_page = isset( $query['posts_per_page'] ) ? absint( $query['posts_per_page'] ) : 10;
		$paged          = isset( $query['paged'] ) ? absint( $query['paged'] ) : 1;

		$date_query = array(
			array(
				'key'     => 'timestamp',
				'value'   => time(),
				'compare' => '>=',
			),
			array(
				'key'     => 'timestamp',
				'value'   => time() + 60 * 60 * 24 * 7,
				'compare' => '<=',
			),
		);

		$status_query = array(
			'key'     => 'status',
			'value'   => 'confirmed',
			'compare' => '=',
		);

		$args = array_merge(
			self::DEFAULT_QUERY_PART,
			array(
				'posts_per_page' => $posts_per_page,
				'paged'          => $paged,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Upcoming appointments bounded to a 7-day window plus confirmed status.
				'meta_query'     => array_merge(
					array(
						'relation' => 'AND',
						$status_query,
					),
					$date_query
				),
			),
		);

		$query = new \WP_Query( $args );

		$appointments = array();

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

		return self::paginated( $query, $appointments );
	}

	/**
	 * Get date range appointments
	 *
	 * @param \DateTimeImmutable $start_date Start date.
	 * @param \DateTimeImmutable $end_date End date.
	 *
	 * @return object
	 */
	public static function get_date_range_appointments( $start_date, $end_date ) {
		$query = new \WP_Query(
			array_merge(
				self::DEFAULT_QUERY_PART,
				array(
					'posts_per_page' => - 1,
					// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Date-bounded meta query driving the admin calendar view.
					'meta_query'     => array(
						'relation' => 'AND',
						array(
							'key'     => 'timestamp',
							'value'   => $start_date,
							'compare' => '>=',
						),
						array(
							'key'     => 'timestamp',
							'value'   => $end_date,
							'compare' => '<=',
						),
					),
				)
			)
		);

		$appointments = array();

		foreach ( $query->posts as $post ) {
			$meta           = get_post_meta( $post->ID );
			$appointments[] = self::normalize(
				$post->ID,
				array(
					'status'    => $meta['status'][0],
					'timestamp' => $meta['timestamp'][0],
					'duration'  => $meta['duration'][0],
				)
			);
		}

		return self::paginated( $query, $appointments );
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
			$customer = maybe_unserialize( $customer );
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

	/**
	 * Create paginated response
	 *
	 * @param WP_User_Query $query Query params.
	 * @param array         $appointments Appointments array.
	 *
	 * @return object
	 */
	public static function paginated( $query, $appointments = array() ) {
		$posts_per_page = (int) $query->get( 'posts_per_page' ) ?? 10;
		$paged          = (int) $query->get( 'paged' ) ?? 1;
		$total          = $query->found_posts;
		$pages          = (int) ceil( $total / $posts_per_page );

		return array(
			'appointments'   => $appointments,
			'total_items'    => $total,
			'total_pages'    => $pages,
			'posts_per_page' => $posts_per_page,
			'current_page'   => $paged,
		);
	}
}
