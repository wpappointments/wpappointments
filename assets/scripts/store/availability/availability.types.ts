export type AvailabilityState = {
	today: {
		available: boolean;
		start: {
			date: string;
			timezone_type: number;
			timezone: string;
		};
	}[];
};
