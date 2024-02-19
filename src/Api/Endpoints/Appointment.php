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
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/appointment/(?P<id>\d+)/cancel',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'cancel_appointment' ),
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
		$query       = $request->get_param( 'query' );
		$appointment = new AppointmentPost();
		$results     = $appointment->get_all( $query );

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'appointments' => $results->appointments,
					'post_count'   => $results->post_count,
					'found_posts'  => $results->found_posts,
					'query'        => $query,
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
		$query       = $request->get_param( 'query' );
		$appointment = new AppointmentPost();
		$results     = $appointment->get_upcoming( $query );

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'appointments' => $results->appointments,
					'post_count'   => $results->post_count,
					'found_posts'  => $results->found_posts,
					'query'        => $query,
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
		$params      = $request->get_params();
		$service     = $request->get_param( 'service' );
		$duration    = $request->get_param( 'duration' );
		$date        = rest_parse_date( get_gmt_from_date( $params['date'] ) );
		$customer    = $request->get_param( 'customer' );
		$customer_id = $request->get_param( 'customerId' );

		$appointment_post = new AppointmentPost();
		$appointment      = $appointment_post->create(
			$service,
			array(
				'timestamp'   => $date,
				'duration'    => $duration,
				'customer'    => $customer,
				'customer_id' => $customer_id,
				'status'      => 'confirmed',
			)
		);

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
	 * Update appointment post
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function update_appointment( WP_REST_Request $request ) {
		$params      = $request->get_params();
		$id          = $request->get_param( 'id' );
		$service     = $request->get_param( 'service' );
		$duration    = $request->get_param( 'duration' );
		$status      = $request->get_param( 'status' );
		$customer    = $request->get_param( 'customer' );
		$customer_id = $request->get_param( 'customerId' );

		if ( null === $id ) {
			return self::error( __( 'Appointment ID is required', 'wpappointments' ) );
		}

		$date = rest_parse_date( get_gmt_from_date( $params['date'] ) );

		$appointment_post = new AppointmentPost();
		$appointment      = $appointment_post->update(
			$id,
			$service,
			array(
				'timestamp'   => $date,
				'duration'    => $duration,
				'customer'    => $customer,
				'customer_id' => $customer_id,
				'status'      => $status,
			)
		);

		if ( is_wp_error( $appointment ) ) {
			return self::error( $appointment->get_error_message() );
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message'     => __( 'Appointment updated successfully', 'wpappointments' ),
					'appointment' => $appointment,
				),
			)
		);
	}

	/**
	 * Cancel appointment
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function cancel_appointment( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$appointment_post = new AppointmentPost();
		$cancelled        = $appointment_post->cancel( $id );

		if ( is_wp_error( $cancelled ) ) {
			return self::error( $cancelled->get_error_message() );
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message'       => __( 'Appointment cancelled successfully', 'wpappointments' ),
					'appointmentId' => $cancelled,
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
		$result           = $appointment_post->delete( $request->get_param( 'id' ) );

		if ( is_wp_error( $result ) ) {
			return self::error( $result->get_error_message() );
		}

		return self::response(
			array(
				'type'    => 'success',
				'message' => __( 'Appointment deleted successfully', 'wpappointments' ),
				'data'    => array(
					'id' => $result,
				),
			)
		);
	}
}
