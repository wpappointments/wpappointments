export function applyFilters<T>(name: string, value: T, ...args: unknown[]): T {
	return window.wpappointments.hooks.applyFilters(name, value, ...args) as T;
}

export function doAction(name: string, ...args: unknown[]): void {
	window.wpappointments.hooks.doAction(name, ...args);
}
