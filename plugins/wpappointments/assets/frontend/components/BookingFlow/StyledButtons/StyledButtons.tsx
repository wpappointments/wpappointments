import { useRef } from 'react';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

/**
 * Renders the Gutenberg-styled button group with event delegation.
 * Uses the full wp-block-buttons HTML from the saved block content,
 * preserving wrapper layout/spacing styles.
 */
export default function StyledButtons() {
	const { buttonHtml, goBack } = useBookingFlowContext();
	const ref = useRef<HTMLDivElement>(null);

	if (!buttonHtml?.group) {
		return null;
	}

	return (
		<div
			ref={ref}
			onClick={(e) => {
				const target = e.target as HTMLElement;
				const button = target.closest(
					'.wpa-back-button, .wpa-submit-button'
				);
				if (!button) return;

				if (button.classList.contains('wpa-back-button')) {
					e.preventDefault();
					goBack?.();
				} else if (button.classList.contains('wpa-submit-button')) {
					e.preventDefault();
					const form = ref.current?.closest('form');
					if (form) {
						form.requestSubmit();
					}
				}
			}}
			// Safe: buttonHtml.group is Gutenberg saved block markup (InnerBlocks
			// outerHTML), sanitized by wp_kses_post in render.php before base64 encoding.
			dangerouslySetInnerHTML={{ __html: buttonHtml.group }}
		/>
	);
}
