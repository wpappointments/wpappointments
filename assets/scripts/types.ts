export type ApiAction = {
	name: string;
	label: string;
	method: string;
	uri: string;
	isDangerous: boolean;
};

export type Appointment = {
	id: number;
	title: string;
	date: string;
	time: string;
	timeFromTo: string;
	timestamp: string;
	status: 'active' | 'cancelled' | 'completed' | 'no-show';
	actions: {
		[key: string]: ApiAction;
	};
};
