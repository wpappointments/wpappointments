<?php

$wp_tests_dir = getenv( 'WP_TESTS_DIR' ) ? getenv( 'WP_TESTS_DIR' ) : sys_get_temp_dir();

require_once $wp_tests_dir . '/includes/bootstrap.php';
