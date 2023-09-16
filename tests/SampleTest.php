<?php
/**
 * Class SampleTest
 *
 * @package Plugin
 */

use WPAppointments\Example;

/**
 * Sample test case.
 */
class SampleTest extends \WP_UnitTestCase {
	private $post;

	public function set_up() {
		$args       = array(
			'post_type'    => 'post',
			'post_name'    => 'hello-world',
			'post_title'   => 'Hello World!'
		);

		$this->post = $this->factory()->post->create_and_get($args);
		update_option( 'default_post_id', $this->post->ID );
	}

	public function test_sample() {
		$example = new Example();
		$this->assertEquals( 5, $example->add( $this->post->ID, 1 ) );
	}

	public function test_wp() {
		$example = new Example();
		$this->assertEquals( 'Hello World!', $example->testwp() );
	}
}