export type SlideoutState = {
	slideouts: Slideout[];
};

export type Slideout = {
	parentId: string | null;
	id: string;
	title: string;
	content: string;
};
