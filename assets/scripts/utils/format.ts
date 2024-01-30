export function formatTimeForPicker(hourOrMinute: number | string) {
	return hourOrMinute.toString().padStart(2, '0');
}

export function formatTime24HourFromDate(date: Date) {
	const hour = date.getHours();
	const minute = date.getMinutes();

	return `${formatTimeForPicker(hour)}:${formatTimeForPicker(minute)}`;
}
