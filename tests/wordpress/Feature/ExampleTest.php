<?php

namespace TestsWP\Feature;

use WPAppointments\Example;

uses( \TestsWP\TestCase::class );

beforeEach(
	function () {
		$args = array(
			'post_type'  => 'post',
			'post_name'  => 'hello-world',
			'post_title' => 'Hello World!',
		);

		$this->post = self::factory()->post->create_and_get( $args );
		update_option( 'default_post_id', $this->post->ID );
	}
);

test(
	'example',
	function () {
		$example = new Example();
		expect( $example->testwp() )->toBe( 'Hello World!' );
	}
);
