<?php
/**
 * Bookable availability controller
 *
 * Endpoints for querying effective availability for bookable variants.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WP_Error;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Availability\AvailabilityEngine;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;
use WPAppointments\Data\Query\AppointmentsQuery;
use WPAppointments\Data\Query\BookableVariantQuery;
use WPAppointments\Utils\Date;

/**
 * Bookable availability endpoint class
 */
class BookableAvailabilityController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/bookable-availability/(?P<variant_id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_variant_availability' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/availability',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_entity_availability' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/calendar-slots',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_calendar_slots' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Get effective availability for a variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_variant_availability( $request ) {
		$variant_id = absint( $request->get_param( 'variant_id' ) );

		$date_range = array(
			'start' => sanitize_text_field( $request->get_param( 'start_date' ) ?? '' ),
			'end'   => sanitize_text_field( $request->get_param( 'end_date' ) ?? '' ),
		);

		$availability = AvailabilityEngine::get_effective_availability( $variant_id, $date_range );
		$buffers      = self::get_effective_buffers( $variant_id );

		return self::response(
			__( 'Availability fetched successfully', 'wpappointments' ),
			array(
				'availability' => $availability,
				'buffers'      => $buffers,
			)
		);
	}

	/**
	 * Get availability for all variants of a bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_entity_availability( $request ) {
		$entity_id = absint( $request->get_param( 'entity_id' ) );

		$date_range = array(
			'start' => sanitize_text_field( $request->get_param( 'start_date' ) ?? '' ),
			'end'   => sanitize_text_field( $request->get_param( 'end_date' ) ?? '' ),
		);

		$result   = BookableVariantQuery::by_entity( $entity_id );
		$variants = array();

		foreach ( $result['variants'] as $variant_post ) {
			$model        = new BookableVariant( $variant_post );
			$availability = AvailabilityEngine::get_effective_availability( $variant_post->ID, $date_range );

			$variants[] = array(
				'variant'      => $model->normalize(),
				'availability' => $availability,
			);
		}

		return self::response(
			__( 'Entity availability fetched successfully', 'wpappointments' ),
			array( 'variants' => $variants )
		);
	}

	/**
	 * Get calendar slots for an entity's default variant
	 *
	 * Returns time slots grouped by week/day in the same format as the
	 * legacy calendar-availability endpoint, but computed through the
	 * AvailabilityEngine (supports overrides, layers).
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_calendar_slots( $request ) {
		$entity_id    = absint( $request->get_param( 'entity_id' ) );
		$calendar_raw = $request->get_param( 'calendar' );
		$timezone_raw = $request->get_param( 'timezone' );
		$trim         = rest_sanitize_boolean( $request->get_param( 'trim' ) );

		$timezone = ! empty( $timezone_raw ) ? sanitize_text_field( $timezone_raw ) : wp_timezone_string();

		if ( ! in_array( $timezone, \DateTimeZone::listIdentifiers(), true ) ) {
			return self::error(
				new WP_Error( 'invalid_timezone', __( 'Invalid timezone', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		if ( ! is_string( $calendar_raw ) ) {
			return self::error(
				new WP_Error( 'missing_calendar', __( 'Calendar data is required', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		$calendar = json_decode( $calendar_raw );

		if ( ! is_array( $calendar ) ) {
			return self::error(
				new WP_Error( 'invalid_calendar', __( 'Invalid calendar data', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		// Find the first variant for this entity.
		$variants   = BookableVariantQuery::by_entity( $entity_id );
		$variant_id = 0;

		if ( ! empty( $variants['variants'] ) ) {
			$variant_id = $variants['variants'][0]->ID;
		}

		// Get engine availability for the date range covered by the calendar.
		$all_dates = array();

		foreach ( $calendar as $week ) {
			if ( ! is_array( $week ) ) {
				continue;
			}

			foreach ( $week as $day_str ) {
				if ( is_string( $day_str ) ) {
					$all_dates[] = $day_str;
				}
			}
		}

		// Normalize and validate date strings (accept Y-m-d or ISO 8601).
		$all_dates = array_values(
			array_filter(
				array_map(
					function ( $d ) {
						$obj = date_create( $d );
						return $obj ? $obj->format( 'Y-m-d' ) : null;
					},
					$all_dates
				)
			)
		);

		if ( empty( $all_dates ) ) {
			return self::response(
				__( 'Calendar slots fetched successfully', 'wpappointments' ),
				array( 'availability' => array() )
			);
		}

		$first_date = new \DateTime( $all_dates[0] );
		$last_date  = new \DateTime( end( $all_dates ) );

		$date_range = array(
			'start' => $first_date->format( 'Y-m-d' ),
			'end'   => $last_date->format( 'Y-m-d' ),
		);

		$engine_availability = $variant_id
		? AvailabilityEngine::get_effective_availability( $variant_id, $date_range )
		: AvailabilityEngine::empty_availability();

		// Settings for slot generation.
		$precision          = (int) get_option( 'wpappointments_appointments_timePickerPrecision', 30 );
		$appointment_length = (int) get_option( 'wpappointments_appointments_defaultLength', 30 );
		$buffers            = $variant_id ? self::get_effective_buffers( $variant_id ) : array(
			'before' => 0,
			'after'  => 0,
		);
		$min_lead_minutes   = self::lead_time_to_minutes(
			(int) get_option( 'wpappointments_appointments_minLeadTimeValue', 0 ),
			(string) get_option( 'wpappointments_appointments_minLeadTimeUnit', 'minute' )
		);
		$max_lead_minutes   = self::lead_time_to_minutes(
			(int) get_option( 'wpappointments_appointments_maxLeadTimeValue', 0 ),
			(string) get_option( 'wpappointments_appointments_maxLeadTimeUnit', 'day' )
		);

		$now = new \DateTime( 'now', new \DateTimeZone( $timezone ) );

		$earliest = null;
		$latest   = null;

		if ( $min_lead_minutes > 0 ) {
			$earliest = clone $now;
			$earliest->add( new \DateInterval( 'PT' . $min_lead_minutes . 'M' ) );
		}

		if ( $max_lead_minutes > 0 ) {
			$latest = clone $now;
			$latest->add( new \DateInterval( 'PT' . $max_lead_minutes . 'M' ) );
		}

		// Get appointments for the entire calendar range.
		$range_start = new \DateTime( $all_dates[0] );
		$range_start->setTimezone( new \DateTimeZone( $timezone ) );
		$range_start->setTime( 0, 0, 0 );

		$range_end = clone $last_date;
		$range_end->setTimezone( new \DateTimeZone( $timezone ) );
		$range_end->setTime( 23, 59, 59 );

		$appointments_data = AppointmentsQuery::get_date_range_appointments(
			(int) $range_start->getTimestamp(),
			(int) $range_end->getTimestamp(),
			$entity_id
		);

		$appointments = $appointments_data['appointments'];

		$appointment_periods = array();

		foreach ( $appointments as $appointment ) {
			$start = new \DateTime();
			$start->setTimestamp( $appointment['timestamp'] - $buffers['before'] * 60 );
			$end = new \DateTime();
			$end->setTimestamp( $appointment['timestamp'] + $appointment['duration'] * 60 + $buffers['after'] * 60 );
			$total                 = $buffers['before'] + $appointment['duration'] + $buffers['after'];
			$appointment_periods[] = new \DatePeriod(
				$start,
				new \DateInterval( 'PT' . $total . 'M' ),
				$end
			);
		}

		// Generate slots for each day in the calendar.
		$availability = array();

		foreach ( $calendar as $week ) {
			if ( ! is_array( $week ) ) {
				continue;
			}

			$week_availability = array();

			foreach ( $week as $day_str ) {
				$valid_date = is_string( $day_str )
				? date_create( $day_str )
				: false;

				if ( ! $valid_date ) {
					$week_availability[] = array(
						'date'           => '',
						'day'            => array(),
						'available'      => false,
						'totalAvailable' => 0,
						'totalSlots'     => 0,
					);
					continue;
				}

				$day_date = $valid_date;
				$day_date->setTimezone( new \DateTimeZone( $timezone ) );

				$ymd         = $day_date->format( 'Y-m-d' );
				$time_ranges = AvailabilityEngine::get_for_date( $engine_availability, $ymd );

				$day_start = clone $day_date;
				$day_start->setTime( 0, 0, 0 );

				$day_end = clone $day_date;
				$day_end->setTime( 23, 59, 59 );

				$interval = new \DateInterval( 'PT' . $precision . 'M' );
				$range    = new \DatePeriod( $day_start, $interval, $day_end );

				$appt_interval = new \DateInterval( 'PT' . $appointment_length . 'M' );

				// Convert engine time ranges to DatePeriods for overlap checking.
				$schedule_periods = array();

				foreach ( $time_ranges as $tr ) {
					$parts_start = explode( ':', $tr['start'] );
					$parts_end   = explode( ':', $tr['end'] );

					$period_start = clone $day_date;
					$period_start->setTime( (int) $parts_start[0], (int) ( $parts_start[1] ?? 0 ) );

					$period_end = clone $day_date;
					$end_hour   = (int) $parts_end[0];
					$end_min    = (int) ( $parts_end[1] ?? 0 );

					// Handle hour 24 as next day midnight.
					if ( $end_hour >= 24 ) {
						$period_end->setTime( 0, 0, 0 );
						$period_end->add( new \DateInterval( 'P1D' ) );
					} else {
						$period_end->setTime( $end_hour, $end_min );
					}

					$schedule_periods[] = new \DatePeriod(
						$period_start,
						$interval,
						$period_end
					);
				}

				$slots = array();

				foreach ( $range as $slot ) {
					$slot_start = clone $slot;
					$slot_start->setTimezone( new \DateTimeZone( $timezone ) );
					$slot_end = clone $slot;
					$slot_end->add( $appt_interval );
					$slot_end->setTimezone( new \DateTimeZone( $timezone ) );

					$slot_range = new \DatePeriod( $slot_start, $appt_interval, $slot_end );

					$in_schedule = Date::date_range_overlaps_with_any_date_range( $slot_range, $schedule_periods );
					$booked      = Date::date_range_intersects_any( $slot_range, $appointment_periods );
					$is_past     = $slot < $now;
					$too_soon    = $earliest && $slot < $earliest;
					$too_far     = $latest && $slot > $latest;

					$slots[] = array(
						'timestamp'  => (int) $slot->format( 'U' ) * 1000,
						'dateString' => $slot->format( 'c' ),
						'available'  => $in_schedule && ! $is_past && ! $booked && ! $too_soon && ! $too_far,
						'inSchedule' => $in_schedule,
					);
				}

				// Trim slots.
				$display_slots = $trim ? self::trim_slots( $slots ) : $slots;

				$available_count = count(
					array_filter(
						$display_slots,
						function ( $s ) {
							return true === $s['available'];
						}
					)
				);

				$week_availability[] = array(
					'date'           => $day_date->format( 'c' ),
					'day'            => $display_slots,
					'available'      => $available_count > 0,
					'totalAvailable' => $available_count,
					'totalSlots'     => count( $display_slots ),
				);
			}

			$availability[] = $week_availability;
		}

		return self::response(
			__( 'Calendar slots fetched successfully', 'wpappointments' ),
			array( 'availability' => $availability )
		);
	}

	/**
	 * Trim slots to only include from first in-schedule to last in-schedule
	 *
	 * @param array $slots Slots array.
	 *
	 * @return array Trimmed slots.
	 */
	private static function trim_slots( $slots ) {
		$trimmed = array();
		$found   = false;

		foreach ( $slots as $slot ) {
			if ( $slot['inSchedule'] ) {
				$found = true;
			}

			if ( $found ) {
				$trimmed[] = $slot;
			}
		}

		$trimmed = array_reverse( $trimmed );
		$result  = array();
		$found   = false;

		foreach ( $trimmed as $slot ) {
			if ( $slot['inSchedule'] ) {
				$found = true;
			}

			if ( $found ) {
				$result[] = $slot;
			}
		}

		return array_reverse( $result );
	}

	/**
	 * Convert lead time value + unit to minutes
	 *
	 * @param int    $value Numeric value.
	 * @param string $unit  Unit: minute, hour, day, week, month.
	 *
	 * @return int Total minutes.
	 */
	private static function lead_time_to_minutes( $value, $unit ) {
		$multipliers = array(
			'minute' => 1,
			'hour'   => 60,
			'day'    => 1440,
			'week'   => 10080,
			'month'  => 43200,
		);

		if ( ! isset( $multipliers[ $unit ] ) || $value < 0 ) {
			return 0;
		}

		return $value * $multipliers[ $unit ];
	}

	/**
	 * Get effective buffer times for a variant
	 *
	 * Returns the variant's buffer values if set, otherwise falls back
	 * to the global default buffer settings.
	 *
	 * @param int $variant_id Variant post ID.
	 *
	 * @return array{before: int, after: int}
	 */
	private static function get_effective_buffers( $variant_id ) {
		$global_before = (int) get_option( 'wpappointments_appointments_defaultBufferBefore', 0 );
		$global_after  = (int) get_option( 'wpappointments_appointments_defaultBufferAfter', 0 );

		$variant_post = get_post( $variant_id );

		if ( ! $variant_post ) {
			return array(
				'before' => $global_before,
				'after'  => $global_after,
			);
		}

		$model     = new BookableVariant( $variant_post );
		$normalize = $model->normalize();

		$overrides = $normalize['overrides'] ?? array();
		$before    = in_array( 'buffer_before', $overrides, true ) ? (int) $normalize['bufferBefore'] : $global_before;
		$after     = in_array( 'buffer_after', $overrides, true ) ? (int) $normalize['bufferAfter'] : $global_after;

		return array(
			'before' => $before,
			'after'  => $after,
		);
	}
}
