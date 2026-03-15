<?php
/**
 * PluginInfo Test
 *
 * @package WPAppointments
 */

namespace Tests\Core;

use WPAppointments\Core\PluginInfo;

uses( \TestTools\TestCase::class )->group( 'core' );

test(
	'PluginInfo::get_version',
	function () {
		expect( PluginInfo::get_version() )->toBeString();
	}
);
