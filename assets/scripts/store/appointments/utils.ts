export function getPeriodFromTimestamp(appointmentTimestamp: string) {
	const timestamp = parseInt(appointmentTimestamp);

	const now = Date.now() / 1000;

	// timestamp is later than 365 days from now
	if (timestamp > now + 60 * 60 * 24 * 365) {
		return ['all', 'year', 'month', 'week', ''];
	}

	// timestamp is in next 365 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 365) {
		return ['all', 'year', 'month', 'week', ''];
	}

	// timestamp is in next 30 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 30) {
		return ['all', 'month', 'week', ''];
	}

	// timestamp is in next 7 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 7) {
		return ['all', 'week', ''];
	}

	// timestamp is in past
	if (timestamp <= now) {
		return ['past'];
	}

	return [''];
}
