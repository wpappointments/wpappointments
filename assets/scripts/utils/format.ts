export function formatTimeForPicker(hourOrMinute: number | string) {
	return hourOrMinute.toString().padStart(2, '0');
}
