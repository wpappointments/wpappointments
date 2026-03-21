import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BookableListPage } from '@wpappointments/components';
import { getBookableType } from '@wpappointments/data';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';

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
	if (!component) {
		const bookableType = domElement.dataset.bookableType;

		if (bookableType) {
			const typeConfig = getBookableType(bookableType);

			if (typeConfig?.listComponent) {
				// Plugin provides a fully custom list component — wrap in layout.
				component = createElement(
					LayoutDefault,
					{ title: typeConfig.label },
					createElement(typeConfig.listComponent)
				);
			} else if (typeConfig) {
				// Plugin registered type with columns — use the generic list page.
				component = createElement(
					LayoutDefault,
					{ title: typeConfig.label },
					createElement(BookableListPage, {
						type: typeConfig.slug,
						label: typeConfig.label,
						columns: typeConfig.columns,
					})
				);
			}
		}
	}

	if (!component) {
		const bookableType = domElement.dataset.bookableType;

		if (bookableType) {
			createRoot(domElement).render(
				createElement(
					LayoutDefault,
					{ title: bookableType },
					createElement(
						'p',
						null,
						`No UI component registered for bookable type "${bookableType}". Make sure the plugin providing this type is active and its JS is built.`
					)
				)
			);
			return;
		}

		throw new Error(`Could not find component for page "${page}"`);
	}

	createRoot(domElement).render(component);
}
