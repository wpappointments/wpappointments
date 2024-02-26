<?php
/**
 * Date utility class
 *
 * @package WPAppointments
 */

namespace TestsPHP;

use WPAppointments\Utils\Availability;

uses( \TestsPHP\TestCase::class );

beforeEach( function () {
  $post_id = wp_insert_post(
    array(
      'post_title'  => 'Default Schedule',
      'post_status' => 'publish',
      'post_type'   => 'wpa_schedule',
    )
  );

  update_option( 'wpappointments_default_schedule_id', $post_id );
  update_option( 'wpappointments_appointments_defaultLength', 30 );
  update_option( 'wpappointments_appointments_timePickerPrecision', 30 );

  $schedule_post_id = get_option( 'wpappointments_default_schedule_id' );
  $make_slot = function ( $day, $start, $end, $enabled = false ) {
    return (object) [
      'day'     => $day,
      'enabled' => $enabled,
      'slots'   => (object) [
        'list' => array(
          (object) array(
            'start' => (object) [
              'hour'   => explode( ':', $start )[0],
              'minute' => explode( ':', $start )[1],
            ],
            'end'   => (object) [
              'hour'   => explode( ':', $end )[0],
              'minute' => explode( ':', $end )[1],
            ],
          ),
        ),
      ],
    ];
  };

  $settings = (object) [
    'monday'    => $make_slot( 'monday', '09:00', '17:00' ),
    'tuesday'   => $make_slot( 'tuesday', '09:00', '17:00' ),
    'wednesday' => $make_slot( 'wednesday', '09:00', '17:00' ),
    'thursday'  => $make_slot( 'thursday', '09:00', '17:00' ),
    'friday'    => $make_slot( 'friday', '09:00', '17:00', true ),
    'saturday'  => $make_slot( 'saturday', '09:00', '17:00' ),
    'sunday'    => $make_slot( 'sunday', '09:00', '17:00' ),
  ];

  if ( $schedule_post_id ) {
    foreach ( array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ) as $day ) {
      $schedule = wp_json_encode( $settings->$day );
      update_post_meta( $schedule_post_id, 'wpappointments_schedule_' . $day, $schedule );
    }
  }
} );

test( 'Should create availability array - one day period - using only GMT timezone', function () {
  $start_date = '2024-03-01T00:00:00.000Z';
  $end_date = '2024-03-01T23:59:59.000Z';

  $result = Availability::get_availability( $start_date, $end_date, '+00:00' );
  
  expect( $result )->toBeArray();
  expect( $result )->toHaveCount( 48 );
  expect( $result[0]->dateString )->toBe( '2024-03-01T00:00:00+00:00' );
  expect( $result[0]->available )->toBeFalse();
  expect( $result[17]->dateString )->toBe( '2024-03-01T08:30:00+00:00' );
  expect( $result[17]->available )->toBeFalse();
  expect( $result[18]->dateString )->toBe( '2024-03-01T09:00:00+00:00' );
  expect( $result[18]->available )->toBeTrue();
  expect( $result[33]->dateString )->toBe( '2024-03-01T16:30:00+00:00' );
  expect( $result[33]->available )->toBeTrue();
  expect( $result[34]->dateString )->toBe( '2024-03-01T17:00:00+00:00' );
  expect( $result[34]->available )->toBeFalse();
  expect( $result[47]->dateString )->toBe( '2024-03-01T23:30:00+00:00' );
  expect( $result[47]->available )->toBeFalse();

  $available = array_filter( $result, function ( $slot ) {
    return $slot->available === true;
  } );

  expect( $available )->toHaveCount( 16 );
} );

test( 'Should create availability array - one day period - +0100 timezone', function() {
  $start_date = '2024-02-29T23:00:00.000Z';
  $end_date = '2024-03-01T22:59:59.000Z';
  $timezone = 'Europe/Warsaw';

  $result = Availability::get_availability( $start_date, $end_date, $timezone );

  expect( $result )->toBeArray();
  expect( $result )->toHaveCount( 48 );
  expect( $result[0]->dateString )->toBe( '2024-03-01T00:00:00+01:00' );
  expect( $result[0]->available )->toBeFalse();
  expect( $result[19]->dateString )->toBe( '2024-03-01T09:30:00+01:00' );
  expect( $result[19]->available )->toBeFalse();
  expect( $result[20]->dateString )->toBe( '2024-03-01T10:00:00+01:00' );
  expect( $result[20]->available )->toBeTrue();
  expect( $result[35]->dateString )->toBe( '2024-03-01T17:30:00+01:00' );
  expect( $result[35]->available )->toBeTrue();
  expect( $result[36]->dateString )->toBe( '2024-03-01T18:00:00+01:00' );
  expect( $result[36]->available )->toBeFalse();
  expect( $result[47]->dateString )->toBe( '2024-03-01T23:30:00+01:00' );
  expect( $result[47]->available )->toBeFalse();

  $available = array_filter( $result, function ( $slot ) {
    return $slot->available === true;
  } );

  expect( $available )->toHaveCount( 16 );
} );

test( 'Should create availability array - one day period - -0800 timezone', function() {
  $start_date = '2024-03-01T08:00:00.000Z';
  $end_date = '2024-03-02T07:59:59.000Z';
  $timezone = 'America/Los_Angeles';

  $result = Availability::get_availability( $start_date, $end_date, $timezone );

  expect( $result )->toBeArray();
  expect( $result )->toHaveCount( 48 );
  expect( $result[0]->dateString )->toBe( '2024-03-01T00:00:00-08:00' );
  expect( $result[0]->available )->toBeFalse();
  expect( $result[1]->dateString )->toBe( '2024-03-01T00:30:00-08:00' );
  expect( $result[1]->available )->toBeFalse();
  expect( $result[2]->dateString )->toBe( '2024-03-01T01:00:00-08:00' );
  expect( $result[2]->available )->toBeTrue();
  expect( $result[17]->dateString )->toBe( '2024-03-01T08:30:00-08:00' );
  expect( $result[17]->available )->toBeTrue();
  expect( $result[18]->dateString )->toBe( '2024-03-01T09:00:00-08:00' );
  expect( $result[18]->available )->toBeFalse();
  expect( $result[47]->dateString )->toBe( '2024-03-01T23:30:00-08:00' );
  expect( $result[47]->available )->toBeFalse();

  $available = array_filter( $result, function ( $slot ) {
    return $slot->available === true;
  } );

  expect( $available )->toHaveCount( 16 );
} );

test( 'Should create availability array - one hour period - GMT timezone', function() {
  $start_date = '2024-03-01T09:00:00.000Z';
  $end_date = '2024-03-01T09:59:59.000Z';

  $result = Availability::get_availability( $start_date, $end_date, '+00:00' );

  expect( $result )->toBeArray();
  expect( $result )->toHaveCount( 2 );
  expect( $result[0]->dateString )->toBe( '2024-03-01T09:00:00+00:00' );
  expect( $result[0]->available )->toBeTrue();
  expect( $result[1]->dateString )->toBe( '2024-03-01T09:30:00+00:00' );
  expect( $result[1]->available )->toBeTrue();
} );

test( 'Should create availability array - trimmed - one day period - current time 16:00 - GMT timezone', function() {
  $start_date = '2024-03-01T00:00:00.000Z';
  $end_date = '2024-03-01T23:59:59.000Z';

  $result = Availability::get_availability( $start_date, $end_date, '+00:00', new \DateTime( '2024-03-01T16:00:00.000Z' ) );

  $available = array_filter( $result, function ( $slot ) {
    return $slot->available === true;
  } );

  expect( $available )->toHaveCount( 2 );
} );

test( 'Should create availability array - trimmed - one day period - current time 16:00 - +01:00 timezone', function() {
  $start_date = '2024-03-01T00:00:00.000Z';
  $end_date = '2024-03-01T23:59:59.000Z';

  $result = Availability::get_availability( $start_date, $end_date, '+01:00', new \DateTime( '2024-03-01T16:00:00.000Z' ) );

  $available = array_filter( $result, function ( $slot ) {
    return $slot->available === true;
  } );

  expect( $available )->toHaveCount( 2 );
} );
