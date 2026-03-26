<?php
/**
 * Query utilities
 *
 * Shared sanitization helpers for WP_Query argument building.
 *
 * @package WPAppointments
 * @since 0.6.0
 */

namespace WPAppointments\Utils;

/**
 * Query utilities class
 */
class Query {
	/**
	 * Default maximum posts per page
	 */
	const MAX_PER_PAGE = 100;

	/**
	 * Sanitize posts_per_page from query params
	 *
	 * Returns -1 (unlimited) when not set or zero, otherwise clamps to max.
	 *
	 * @param array $query Query params with optional 'postsPerPage' key.
	 * @param int   $max   Maximum allowed value (default 100).
	 *
	 * @return int Sanitized posts_per_page value.
	 */
	public static function sanitize_per_page( array $query, int $max = self::MAX_PER_PAGE ): int {
		if ( ! isset( $query['postsPerPage'] ) ) {
			return -1;
		}

		$value = absint( $query['postsPerPage'] );

		if ( 0 === $value ) {
			return -1;
		}

		return min( $value, $max );
	}

	/**
	 * Sanitize paged param
	 *
	 * @param array $query Query params with optional 'paged' key.
	 *
	 * @return int Page number (minimum 1).
	 */
	public static function sanitize_paged( array $query ): int {
		if ( ! isset( $query['paged'] ) ) {
			return 1;
		}

		return max( 1, absint( $query['paged'] ) );
	}

	/**
	 * Sanitize an array of user IDs
	 *
	 * @param array $user_ids Raw user IDs.
	 *
	 * @return int[] Sanitized, non-zero user IDs.
	 */
	public static function sanitize_user_ids( array $user_ids ): array {
		return array_values( array_filter( array_map( 'absint', $user_ids ) ) );
	}
}
