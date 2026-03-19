/**
 * Demo Court Booking admin entry point
 *
 * Registers the court bookable type on the JS side using the declarative
 * columns API. Core auto-generates the list page with native UI.
 */

declare global {
	interface Window {
		wpappointments: {
			api: {
				root: string;
				namespace: string;
				url: string;
			};
			_pendingBookableTypes?: Array<{
				slug: string;
				label: string;
				columns?: Array<{
					id: string;
					header: string;
					getValue?: (entity: Record<string, unknown>) => unknown;
				}>;
			}>;
		};
	}
}

window.wpappointments =
	window.wpappointments || ({} as Window['wpappointments']);
window.wpappointments._pendingBookableTypes =
	window.wpappointments._pendingBookableTypes || [];

window.wpappointments._pendingBookableTypes.push({
	slug: 'court',
	label: 'Courts',
	columns: [
		{ id: 'name', header: 'Name' },
		{ id: 'surface_type', header: 'Surface' },
		{ id: 'indoor', header: 'Indoor' },
		{ id: 'lighting', header: 'Lighting' },
		{ id: 'max_players', header: 'Max Players' },
		{
			id: 'active',
			header: 'Status',
			getValue: (entity) => (entity.active ? 'Active' : 'Inactive'),
		},
	],
});
