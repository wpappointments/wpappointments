export type SlideoutState = {
	slideouts: Slideout[];
	slideoutsToClose: Slideout[];
};

export type Slideout = {
	id: string;
	parentId?: string | null;
	data?: unknown;
	level?: number;
};
