<?php
/**
 * Guards for REST endpoints that are intentionally public.
 *
 * @package WPAppointments
 */

declare(strict_types=1);

namespace WPAppointments\Api;

use WP_Error;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * Reusable security primitives applied to public booking REST endpoints
 * before they reach their callbacks. The endpoints themselves remain
 * unauthenticated by design — public visitors must be able to view
 * availability and submit a booking — but blanket `__return_true`
 * permission callbacks invite abuse, so each public route runs the
 * relevant guards from here.
 */
final class PublicEndpointGuard {
	/**
	 * Hidden honeypot field name. Real visitors never fill it; bots that
	 * spray every input do. Submissions where this field has a value are
	 * silently rejected.
	 */
	public const HONEYPOT_FIELD = '_hp';

	/**
	 * Combined permission callback for the public booking POST endpoint.
	 *
	 * @param WP_REST_Request $request Incoming request.
	 *
	 * @return true|WP_Error
	 */
	public static function booking_create_check( WP_REST_Request $request ) {
		$honeypot = self::honeypot_check( $request );
		if ( is_wp_error( $honeypot ) ) {
			return $honeypot;
		}

		// 5 booking attempts per IP per 15 minutes is generous for legitimate
		// users (one or two retries on form validation errors) and tight
		// enough to neuter scripted abuse.
		return self::rate_limit( $request, 'booking_create', 5, 15 * MINUTE_IN_SECONDS );
	}

	/**
	 * Combined permission callback for the public availability GET endpoints.
	 *
	 * @param WP_REST_Request $request Incoming request.
	 *
	 * @return true|WP_Error
	 */
	public static function availability_read_check( WP_REST_Request $request ) {
		// Higher ceiling than booking creation because the booking flow
		// legitimately fetches availability multiple times per session as
		// the visitor browses days and variants.
		return self::rate_limit( $request, 'availability_read', 60, 5 * MINUTE_IN_SECONDS );
	}

	/**
	 * Reject submissions where a hidden honeypot field is non-empty.
	 *
	 * @param WP_REST_Request $request Incoming request.
	 *
	 * @return true|WP_Error
	 */
	private static function honeypot_check( WP_REST_Request $request ) {
		$value = $request->get_param( self::HONEYPOT_FIELD );

		if ( null === $value || '' === $value ) {
			return true;
		}

		// Quiet 400 — a bot does not need to learn what tripped the trap.
		return new WP_Error(
			'rest_invalid_request',
			__( 'Invalid request.', 'appstip-appointments' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * Per-IP transient counter. Returns `true` while under the cap and a
	 * `429` `WP_Error` once the cap is exceeded for the active window.
	 *
	 * @param WP_REST_Request $request        Incoming request.
	 * @param string          $bucket         Stable identifier — different
	 *                                        endpoints share or split limits
	 *                                        based on this value.
	 * @param int             $max            Allowed requests per window.
	 * @param int             $window_seconds Window length.
	 *
	 * @return true|WP_Error
	 */
	private static function rate_limit(
		WP_REST_Request $request,
		string $bucket,
		int $max,
		int $window_seconds
	) {
		unset( $request );

		$ip  = self::client_ip();
		$key = 'wpa_rl_' . $bucket . '_' . md5( $ip );

		$count = (int) get_transient( $key );

		if ( $count >= $max ) {
			return new WP_Error(
				'rest_too_many_requests',
				__( 'Too many requests. Please try again shortly.', 'appstip-appointments' ),
				array( 'status' => 429 )
			);
		}

		set_transient( $key, $count + 1, $window_seconds );

		return true;
	}

	/**
	 * Best-effort client IP. We deliberately do not trust forwarded headers
	 * (X-Forwarded-For / X-Real-IP) to avoid letting an attacker rotate
	 * past the rate limit by spoofing them. Sites behind a reverse proxy
	 * should be configured so REMOTE_ADDR carries the real client IP.
	 */
	private static function client_ip(): string {
		if ( isset( $_SERVER['REMOTE_ADDR'] ) && is_string( $_SERVER['REMOTE_ADDR'] ) ) {
			$ip = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
			if ( '' !== $ip ) {
				return $ip;
			}
		}

		return '0.0.0.0';
	}
}
