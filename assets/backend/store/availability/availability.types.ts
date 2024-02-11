export type AvailabilityState = {
	today: {
		available: boolean;
		start: {
			date: string;
			timezone_type: number;
			timezone: string;
		};
	}[];
	month: {
		date: {
			date: string;
			timezone_type: number;
			timezone: string;
		};
		slots: {
			available: boolean;
			booked: boolean;
			start: {
				date: string;
				timezone_type: number;
				timezone: string;
			};
		}[];
	}[];
};