<?php
/**
 * Plugin class test
 *
 * @package WPAppointments
 */

namespace Tests;

use WPAppointments\Plugin;

uses( \TestTools\TestCase::class )->group( 'core' );

test(
	'Plugin::get_instance',
	function () {
		expect( Plugin::get_instance() )->toBeInstanceOf( Plugin::class );
	}
);

test(
	'Plugin::get api',
	function () {
		expect( Plugin::get( 'api' ) )->toBeInstanceOf( \WPAppointments\Api\Api::class );
	}
);
