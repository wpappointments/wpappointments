export type OooReason =
	| 'unspecified'
	| 'vacation'
	| 'travel'
	| 'sick_leave'
	| 'holiday';

export type OooEntry = {
	id: number;
	userId: number;
	startDate: string;
	endDate: string;
	reason: OooReason;
	notes: string;
	notePublic: boolean;
};

export type OooState = {
	entries: OooEntry[];
	loaded: boolean;
};
