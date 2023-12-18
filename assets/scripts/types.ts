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
	actions: {
		[key: string]: ApiAction;
	};
};
