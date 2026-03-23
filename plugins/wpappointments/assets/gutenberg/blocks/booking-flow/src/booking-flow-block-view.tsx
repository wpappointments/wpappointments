import { createRoot } from '@wordpress/element';
import { createHooks } from '@wordpress/hooks';
import BookingFlow from '~/frontend/frontend';

if (!window.wpappointments) {
	(window as unknown as Record<string, unknown>).wpappointments = {};
}

if (!window.wpappointments.hooks) {
	window.wpappointments.hooks = createHooks();
}

const bookingFlow = document.getElementsByClassName(
	'wpappointments-booking-flow'
);

for (const element of bookingFlow) {
	const rootElement = element as HTMLDivElement;
	const root = createRoot(rootElement);
	const attributes = JSON.parse(atob(rootElement.dataset.attributes || ''));

	root.render(<BookingFlow attributes={attributes} />);
}
