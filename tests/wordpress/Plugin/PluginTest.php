<?php

namespace TestsWP\Plugin;

use \WPAppointments\Plugin;

uses(\TestsWP\TestCase::class);

test('plugin-init', function () {
  $plugin = Plugin::get_instance();
  $initialized = $plugin->plugin_init();

  // everything is ok.
  expect($initialized)->toBeNull();
});

test('plugin-init-unsupported-php-version', function () {
  $plugin = \WPAppointments\Plugin::get_instance();
  // set very high php version requirement,
  // to trigger early return.
  $initialized = $plugin->plugin_init('999.0.0');

  // returned early.
  expect($initialized)->toBeFalse();
});

test('plugin-hooks-registered', function () {
  global $wp_filter;

  $plugin = \WPAppointments\Plugin::get_instance();
  $plugin_init_priority = $wp_filter['plugins_loaded']->has_filter('plugins_loaded', [$plugin, 'plugin_init']);

  expect($plugin_init_priority)->toBe(10);
  expect(post_type_exists('appointment'))->toBe(true);
});
