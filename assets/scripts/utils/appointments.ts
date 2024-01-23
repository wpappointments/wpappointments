export function isTimeRangeInAvailableRange(
	timeRange: [Date, Date],
	availableRange: [Date, Date]
): boolean {
	const [start, end] = timeRange;
	const [availableStart, availableEnd] = availableRange;

	return (
		start.getTime() >= availableStart.getTime() &&
		end.getTime() <= availableEnd.getTime()
	);
}
