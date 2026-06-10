<?php
/**
 * Appointments query class file
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Data\Query;

use WP_Query;
use WPAppointments\Recurrence\RecurrenceExpander;

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
	 * @param int $start_date Start date (unix timestamp).
	 * @param int $end_date   End date (unix timestamp).
	 * @param int $entity_id  Optional bookable entity ID. When supplied, only
	 *                        appointments booked against that entity block
	 *                        availability. When 0, all appointments are returned
	 *                        (legacy behavior).
	 *
	 * @return array
	 */
	public static function get_date_range_appointments( $start_date, $end_date, $entity_id = 0 ) {
		$meta_query = array(
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
			// Recurring masters are expanded separately so their first
			// occurrence is not also returned as a raw single appointment.
			array(
				'key'     => 'rrule',
				'compare' => 'NOT EXISTS',
			),
		);

		if ( $entity_id > 0 ) {
			// Include appointments for the specific entity AND legacy
			// appointments that have no entity_id meta yet (upgrade path).
			$meta_query[] = array(
				'relation' => 'OR',
				array(
					'key'     => 'entity_id',
					'value'   => $entity_id,
					'compare' => '=',
				),
				array(
					'key'     => 'entity_id',
					'compare' => 'NOT EXISTS',
				),
			);
		}

		$query = new \WP_Query(
			array_merge(
				self::DEFAULT_QUERY_PART,
				array(
					'posts_per_page' => - 1,
					// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Date range queries expected to be used in availability checks; not expected to return unbounded result sets.
					'meta_query'     => $meta_query,
				)
			)
		);

		$appointments = array();

		foreach ( $query->posts as $post ) {
			$meta           = get_post_meta( $post->ID );
			$appointments[] = self::normalize(
				$post->ID,
				array(
					'status'        => $meta['status'][0],
					'timestamp'     => $meta['timestamp'][0],
					'duration'      => $meta['duration'][0],
					'end_timestamp' => $meta['end_timestamp'][0] ?? '',
					'all_day'       => $meta['all_day'][0] ?? '',
				)
			);
		}

		$appointments = array_merge(
			$appointments,
			self::expand_recurring_in_range( $start_date, $end_date, $entity_id )
		);

		// This method returns the full date-range set (posts_per_page = -1), so
		// the item total must include expanded occurrences, not just the raw
		// posts WP_Query counted.
		return self::paginated( $query, $appointments, count( $appointments ) );
	}

	/**
	 * Expand recurring masters into virtual occurrences overlapping a range.
	 *
	 * Masters store an RRULE plus EXDATE timestamps; their `timestamp` (DTSTART)
	 * may sit before the requested range yet still produce occurrences inside
	 * it, so they are queried independently of the date-range filter and
	 * expanded via RecurrenceExpander. Each occurrence is returned as a
	 * normalized appointment row sharing the master's id/service/customer, with
	 * its own start/end timestamps. Returns an empty array when no masters
	 * exist, keeping non-recurring installs free of any extra work.
	 *
	 * @param int $start_date Range start (unix UTC).
	 * @param int $end_date   Range end (unix UTC).
	 * @param int $entity_id  Optional bookable entity scope.
	 *
	 * @return array
	 */
	protected static function expand_recurring_in_range( $start_date, $end_date, $entity_id = 0 ) {
		$meta_query = array(
			'relation' => 'AND',
			array(
				'key'     => 'rrule',
				'compare' => 'EXISTS',
			),
		);

		if ( $entity_id > 0 ) {
			$meta_query[] = array(
				'relation' => 'OR',
				array(
					'key'     => 'entity_id',
					'value'   => $entity_id,
					'compare' => '=',
				),
				array(
					'key'     => 'entity_id',
					'compare' => 'NOT EXISTS',
				),
			);
		}

		$query = new \WP_Query(
			array_merge(
				self::DEFAULT_QUERY_PART,
				array(
					'posts_per_page' => - 1,
					// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Bounded to recurring masters; expanded in-memory for the requested range.
					'meta_query'     => $meta_query,
				)
			)
		);

		if ( empty( $query->posts ) ) {
			return array();
		}

		$timezone = wp_timezone();

		$occurrences = array();

		foreach ( $query->posts as $post ) {
			$meta  = get_post_meta( $post->ID );
			$rrule = $meta['rrule'][0] ?? '';

			if ( '' === $rrule ) {
				continue;
			}

			$master_start = (int) ( $meta['timestamp'][0] ?? 0 );
			$duration     = (int) ( $meta['duration'][0] ?? 0 );
			$master_end   = isset( $meta['end_timestamp'][0] ) && '' !== $meta['end_timestamp'][0]
			? (int) $meta['end_timestamp'][0]
			: $master_start + $duration * 60;

			$exceptions = isset( $meta['recurrence_exceptions'][0] )
			? maybe_unserialize( $meta['recurrence_exceptions'][0] )
			: array();
			$exceptions = is_array( $exceptions ) ? $exceptions : array();

			$expanded = RecurrenceExpander::expand_in_range(
				$rrule,
				$master_start,
				$master_end,
				(int) $start_date,
				(int) $end_date,
				$exceptions,
				$timezone
			);

			foreach ( $expanded as $occurrence ) {
				$occurrences[] = self::normalize(
					$post->ID,
					array(
						'status'        => $meta['status'][0] ?? '',
						'timestamp'     => $occurrence['start'],
						'duration'      => $duration,
						'end_timestamp' => $occurrence['end'],
						'all_day'       => $meta['all_day'][0] ?? '',
					)
				);
			}
		}

		return $occurrences;
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

		// End timestamp falls back to start + duration when not explicitly
		// stored (every legacy appointment), so consumers can treat single-day
		// and multi-day / all-day appointments uniformly.
		$end_meta      = $meta['end_timestamp'] ?? '';
		$end_timestamp = '' !== $end_meta && null !== $end_meta
		? (int) $end_meta
		: (int) $timestamp + (int) $duration * 60;

		return array(
			'id'           => $post_id,
			'service'      => get_the_title( $post_id ),
			'timestamp'    => (int) $timestamp,
			'endTimestamp' => $end_timestamp,
			'allDay'       => ! empty( $meta['all_day'] ),
			'status'       => $status,
			'duration'     => (int) $duration,
			'customerId'   => (int) $customer_id,
			'customer'     => $customer,
		);
	}

	/**
	 * Create paginated response
	 *
	 * @param WP_User_Query $query Query params.
	 * @param array         $appointments Appointments array.
	 * @param int|null      $total_override Explicit total item count. Use when
	 *                                      $appointments includes rows not counted
	 *                                      by the WP_Query (e.g. expanded recurring
	 *                                      occurrences). Defaults to found_posts.
	 *
	 * @return object
	 */
	public static function paginated( $query, $appointments = array(), $total_override = null ) {
		$posts_per_page = (int) $query->get( 'posts_per_page' ) ?? 10;
		$paged          = (int) $query->get( 'paged' ) ?? 1;
		$total          = null === $total_override ? $query->found_posts : (int) $total_override;
		$pages          = $posts_per_page > 0 ? (int) ceil( $total / $posts_per_page ) : 1;

		return array(
			'appointments'   => $appointments,
			'total_items'    => $total,
			'total_pages'    => $pages,
			'posts_per_page' => $posts_per_page,
			'current_page'   => $paged,
		);
	}
}
