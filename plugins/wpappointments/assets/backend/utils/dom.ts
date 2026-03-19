import { createRoot } from 'react-dom/client';

export function render(elements: Map<string, React.JSX.Element>): void {
	const domElement = document.getElementById('wpappointments-admin');

	if (!domElement) {
		return;
	}

	const page = domElement.dataset.page;

	if (!page) {
		throw new Error('Could not find page name (data-page="page-id")');
	}

	const component = elements.get(page);

	if (!component) {
		// Page not found in core registry — likely an addon page.
		// Addon plugins mount their own React app via mountAddonPage().
		return;
	}

	createRoot(domElement).render(component);
}
