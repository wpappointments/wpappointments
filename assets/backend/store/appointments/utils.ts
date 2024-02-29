export function getPeriodFromTimestamp(timestamp: number) {
	const now = Math.floor(Date.now() / 1000);

	// timestamp is later than 365 days from now
	if (timestamp > now + 60 * 60 * 24 * 365) {
		return ['all', 'year', 'month', 'week', 'day', ''];
	}

	// timestamp is in next 365 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 365) {
		return ['all', 'year', 'month', 'week', 'day', ''];
	}

	// timestamp is in next 30 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 30) {
		return ['all', 'month', 'week', 'day', ''];
	}

	// timestamp is in next 7 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 7) {
		return ['all', 'week', 'day', ''];
	}

	// timestamp is in next 24 hours
	if (timestamp > now && timestamp < now + 60 * 60 * 24) {
		return ['all', 'day', ''];
	}

	// timestamp is in past
	if (timestamp <= now) {
		return ['past'];
	}

	return [''];
}

export function getStrictPeriodFromTimestamp(timestamp: number) {
	const now = Math.floor(Date.now() / 1000);

	// timestamp is in past
	if (timestamp <= now) {
		return 'past';
	}

	// timestamp is in next 24 hours
	if (timestamp > now && timestamp < now + 60 * 60 * 24) {
		return 'day';
	}

	// timestamp is in next 7 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 7) {
		return 'week';
	}

	// timestamp is in next 30 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 30) {
		return 'month';
	}

	// timestamp is in next 365 days
	if (timestamp > now && timestamp < now + 60 * 60 * 24 * 365) {
		return 'year';
	}

	// timestamp is later than 365 days from now
	if (timestamp > now + 60 * 60 * 24 * 365) {
		return 'all';
	}

	return '';
}
