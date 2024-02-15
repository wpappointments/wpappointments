import { formatTimeForPicker } from '~/backend/utils/format';

export function createTimeSlot(start: [number, number], end: [number, number]) {
	return {
		start: {
			hour: formatTimeForPicker(start[0]),
			minute: formatTimeForPicker(start[1]),
		},
		end: {
			hour: formatTimeForPicker(end[0]),
			minute: formatTimeForPicker(end[1]),
		},
	};
}
