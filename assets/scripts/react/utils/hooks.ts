export function applyFilters< T >( name: string, value: T ): T {
	return window.wpappointments.hooks.applyFilters( name, value ) as T;
}
