<?php
/**
 * Example controller (appointment endpoint)
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Model\AppointmentPost;

/**
 * Appointment endpoint
 */
class Appointment extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/appointment',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_appointments' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/appointment/upcoming',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_upcoming_appointments' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/appointment',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/appointment/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Get all appointments
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_all_appointments( WP_REST_Request $request ) {
		$appointment  = new AppointmentPost();
		$appointments = $appointment->get_all();

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'appointments' => $appointments,
				),
			)
		);
	}

	/**
	 * Get upcoming appointments
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_upcoming_appointments( WP_REST_Request $request ) {
		$appointment  = new AppointmentPost();
		$appointments = $appointment->get_upcoming();

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'appointments' => $appointments,
				),
			)
		);
	}

	/**
	 * Create appointment post
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create_appointment( WP_REST_Request $request ) {
		$params = $request->get_params();
		$title  = $request->get_param( 'title' );
		$date   = rest_parse_date( get_gmt_from_date( $params['datetime'] ) );

		$appointment_post = new AppointmentPost();
		$appointment      = $appointment_post->create( $title, array( 'datetime' => $date ) );

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message'     => __( 'Appointment created successfully', 'wpappointments' ),
					'appointment' => $appointment,
				),
			)
		);
	}

	/**
	 * Delete appointment post
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function delete_appointment( WP_REST_Request $request ) {
		$appointment_post = new AppointmentPost();
		$id               = $appointment_post->delete( $request->get_param( 'id' ) );

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message' => __( 'Appointment deleted successfully', 'wpappointments' ),
					'id'      => $id,
				),
			)
		);
	}
}
