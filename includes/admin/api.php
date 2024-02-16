<?php
/**
 * Plugin admin includes
 *
 * Require all admin files here
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin\Api;

defined( 'ABSPATH' ) || exit;

add_action( 'rest_api_init', array( $wpappointments::get( 'api' ), 'init' ) );
