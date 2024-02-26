import { createRoot } from '@wordpress/element';
import BookingFlow from '~/frontend/frontend';

const bookingFlow = document.getElementsByClassName(
	'wpappointments-booking-flow'
);

for (const element of bookingFlow) {
	const rootElement = element as HTMLDivElement;
	const root = createRoot(rootElement);
	const attributes = JSON.parse(atob(rootElement.dataset.attributes || ''));

	root.render(<BookingFlow {...attributes} />);
}
