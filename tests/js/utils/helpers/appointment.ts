export function createAppointmentRange(
	start: [number, number],
	end: [number, number]
) {
	const appointmentRange: [Date, Date] = [
		new Date(2024, 1, 1, start[0], start[1]),
		new Date(2024, 1, 1, end[0], end[1]),
	];

	return appointmentRange;
}
