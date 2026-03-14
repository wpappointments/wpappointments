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
	'PluginInfo::get_plugin_name',
	function () {
		expect( PluginInfo::get_plugin_name() )->toBe( 'WPAppointments' );
	}
);

test(
	'PluginInfo::get_version',
	function () {
		expect( PluginInfo::get_version() )->toBeString();
	}
);

test(
	'PluginInfo::get_text_domain',
	function () {
		expect( PluginInfo::get_text_domain() )->toBe( 'wpappointments' );
	}
);
