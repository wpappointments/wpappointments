<?php
/**
 * Render booking flow block
 *
 * @package WPAppointments
 * @since 0.0.1
 */

$element = sprintf(
	"<div class='wpappointments-booking-flow' data-attributes='%s'></div>",
	base64_encode( wp_json_encode( $attributes ) )
);

printf(
	'<div %s>%s</div>',
	esc_attr( get_block_wrapper_attributes() ),
	esc_html( $element )
);
