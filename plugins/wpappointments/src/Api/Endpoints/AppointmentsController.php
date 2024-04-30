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
use WPAppointments\Data\Model\Appointment;
use WPAppointments\Data\Model\Customer;
use WPAppointments\Data\Model\Settings;

/**
 * Appointment endpoint class
 */
class AppointmentsController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		self::init_public_routes();

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments',
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
			static::API_NAMESPACE,
			'/appointments/upcoming',
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
			static::API_NAMESPACE,
			'/appointments',
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
			static::API_NAMESPACE,
			'/appointments/(?P<id>\d+)',
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
			static::API_NAMESPACE,
			'/appointments/(?P<id>\d+)/cancel',
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
			static::API_NAMESPACE,
			'/appointments/(?P<id>\d+)',
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

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments/(?P<id>\d+)/confirm',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'confirm_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Register public routes
	 *
	 * @return void
	 */
	public static function init_public_routes() {
		register_rest_route(
			static::API_NAMESPACE,
			'/public/appointments',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_appointment_public' ),
					'permission_callback' => '__return_true',
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
		$appointment = new Appointment();
		$results     = $appointment->get_all( $query );

		return self::response(
			__( 'Appointments fetched successfully', 'wpappointments' ),
			array(
				'appointments' => $results['appointments'],
				'totalItems'   => $results['totalItems'],
				'totalPages'   => $results['totalPages'],
				'postsPerPage' => $results['postsPerPage'],
				'currentPage'  => $results['currentPage'],
				'query'        => $query,
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
		$appointment = new Appointment();
		$results     = $appointment->get_upcoming( $query );

		return self::response(
			__( 'Upcoming appointments fetched successfully', 'wpappointments' ),
			array(
				'appointments' => $results['appointments'],
				'postCount'    => $results['post_count'],
				'foundPosts'   => $results['found_posts'],
				'query'        => $query,
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
		$date        = $request->get_param( 'date' );
		$service     = $request->get_param( 'service' );
		$duration    = $request->get_param( 'duration' );
		$customer    = $request->get_param( 'customer' );
		$customer_id = $request->get_param( 'customerId' );
		$status      = $request->get_param( 'status' );

		$date = rest_parse_date( get_gmt_from_date( $date ) );

		$appointment_post = new Appointment();
		$appointment      = $appointment_post->create(
			$service,
			array(
				'timestamp'   => $date,
				'duration'    => $duration,
				'customer'    => $customer,
				'customer_id' => $customer_id,
				'status'      => $status,
			)
		);

		return self::response(
			__( 'Appointment created successfully', 'wpappointments' ),
			array(
				'appointment' => $appointment,
			),
		);
	}

	/**
	 * Create appointment post (publicly accessible)
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create_appointment_public( WP_REST_Request $request ) {
		$date           = $request->get_param( 'date' );
		$customer       = $request->get_param( 'customer' );
		$create_account = $request->get_param( 'createAccount' );
		$password       = $request->get_param( 'password' );

		$date = rest_parse_date( get_gmt_from_date( $date ) );

		$settings = new Settings();
		$duration = $settings->get_setting( 'appointments', 'defaultLength' );

		$customer_id = null;

		if ( $create_account ) {
			$customer_data = $customer;

			if ( $password ) {
				$customer_data['password'] = $password;
			}

			$customer       = new Customer( $customer_data );
			$saved_customer = $customer->save();
			$customer_id    = $saved_customer->user->ID;
		}

		$status = $settings->get_setting( 'appointments', 'defaultStatus' ) ?? 'confirmed';

		$appointment_post = new Appointment();
		$appointment      = $appointment_post->create(
			__( 'Appointment', 'wpappointments' ),
			array(
				'timestamp'   => $date,
				'duration'    => $duration,
				'customer'    => wp_json_encode( (object) $customer, JSON_UNESCAPED_UNICODE ),
				'customer_id' => $customer_id,
				'status'      => $status,
			)
		);

		return self::response(
			__( 'Appointment created successfully', 'wpappointments' ),
			array(
				'appointment' => $appointment,
			),
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
		$date        = $request->get_param( 'date' );
		$id          = $request->get_param( 'id' );
		$service     = $request->get_param( 'service' );
		$duration    = $request->get_param( 'duration' );
		$status      = $request->get_param( 'status' );
		$customer    = $request->get_param( 'customer' );
		$customer_id = $request->get_param( 'customerId' );

		$date = rest_parse_date( get_gmt_from_date( $date ) );

		$appointment_post = new Appointment();
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
			return self::error( $appointment );
		}

		return self::response(
			__( 'Appointment updated successfully', 'wpappointments' ),
			array(
				'appointment' => $appointment,
			),
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

		$appointment_post = new Appointment();
		$cancelled        = $appointment_post->cancel( $id );

		if ( is_wp_error( $cancelled ) ) {
			return self::error( $cancelled );
		}

		return self::response(
			__( 'Appointment cancelled successfully', 'wpappointments' ),
			array(
				'appointmentId' => $cancelled,
			),
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
		$id = $request->get_param( 'id' );

		$appointment_post = new Appointment();
		$deleted          = $appointment_post->delete( $id );

		if ( is_wp_error( $deleted ) ) {
			return self::error( $deleted );
		}

		return self::response(
			__( 'Appointment deleted successfully', 'wpappointments' ),
			array(
				'appointmentId' => $deleted,
			),
		);
	}

	/**
	 * Confirm appointment
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function confirm_appointment( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$appointment_post = new Appointment();
		$confirmed        = $appointment_post->confirm( $id );

		if ( is_wp_error( $confirmed ) ) {
			return self::error( $confirmed );
		}

		return self::response(
			__( 'Appointment confirmed successfully', 'wpappointments' ),
			array(
				'appointmentId' => $confirmed,
			),
		);
	}
}
