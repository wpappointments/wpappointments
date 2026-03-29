import { createRoot } from '@wordpress/element';
import { createHooks } from '@wordpress/hooks';
import StyledButtons from '~/frontend/components/BookingFlow/StyledButtons/StyledButtons';
import BookingFlow from '~/frontend/frontend';
import { Fill } from '~/frontend/slotfill';

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

	// Extract styled button HTML from the data-buttons attribute.
	const buttonHtml: { group?: string; back?: string; submit?: string } = {};
	const buttonsRaw = rootElement.dataset.buttons;

	if (buttonsRaw) {
		const html = atob(buttonsRaw);
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		const group = doc.querySelector('.wp-block-buttons');
		const backBtn = doc.querySelector('.wpa-back-button');
		const submitBtn = doc.querySelector('.wpa-submit-button');

		if (group) {
			buttonHtml.group = group.outerHTML;
		}
		if (backBtn) {
			buttonHtml.back = backBtn.outerHTML;
		}
		if (submitBtn) {
			buttonHtml.submit = submitBtn.outerHTML;
		}
	}

	const hasStyledButtons = !!buttonHtml.group;

	root.render(
		<BookingFlow attributes={attributes} buttonHtml={buttonHtml}>
			{hasStyledButtons && (
				<Fill name="booking-flow/actions">
					<StyledButtons />
				</Fill>
			)}
		</BookingFlow>
	);
}
