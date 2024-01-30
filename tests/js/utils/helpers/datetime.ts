export function createTimeRange(
	start: [number, number],
	end: [number, number]
) {
	const dateTimeRange: [Date, Date] = [
		new Date(2024, 1, 1, start[0], start[1], 0),
		new Date(2024, 1, 1, end[0], end[1], 0),
	];

	return dateTimeRange;
}
