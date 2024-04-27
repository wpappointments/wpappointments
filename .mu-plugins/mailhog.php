<?php
/**
 * Plugin Name: Mailhog
 * Version: 1.0
 * License: GPL2
 */

add_filter( 'wp_mail_from', function() {
  return 'contact@wpappointments.com';
} );

add_filter( 'wp_mail_from_name', function() {
  return 'WP Appointments';
} );

add_action( 'phpmailer_init', function( $phpmailer ) {
  $phpmailer->Host = 'mailhog';
  $phpmailer->Port = 1025;
  $phpmailer->IsSMTP();
} );
