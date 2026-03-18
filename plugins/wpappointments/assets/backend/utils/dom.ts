import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { getBookableType } from '~/backend/bookable/registry';

export function render(elements: Map<string, React.JSX.Element>): void {
	const domElement = document.getElementById('wpappointments-admin');

	if (!domElement) {
		return;
	}

	const page = domElement.dataset.page;

	if (!page) {
		throw new Error('Could not find page name (data-page="page-id")');
	}

	// Check static pages first.
	let component = elements.get(page);

	// If not found, check for dynamically registered bookable type pages.
	// Bookable type pages have data-page="bookable-{type}" and data-bookable-type="{type}".
	if (!component) {
		const bookableType = domElement.dataset.bookableType;

		if (bookableType) {
			const typeConfig = getBookableType(bookableType);

			if (typeConfig?.listComponent) {
				component = createElement(typeConfig.listComponent);
			}
		}
	}

	if (!component) {
		throw new Error(`Could not find component for page "${page}"`);
	}

	createRoot(domElement).render(component);
}
