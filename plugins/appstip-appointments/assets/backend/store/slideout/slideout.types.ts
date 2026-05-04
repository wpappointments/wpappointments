import {
	Output,
	is,
	nullable,
	number,
	object,
	optional,
	string,
	unknown,
} from 'valibot';

export type SlideoutState = {
	slideouts: Slideout[];
	slideoutsToClose: Slideout[];
};

export const SlideoutSchema = object({
	id: string(),
	parentId: optional(nullable(string())),
	data: optional(unknown()),
	level: optional(number()),
});

export function isSlideout(slideout: unknown) {
	if (!is(SlideoutSchema, slideout)) {
		return false;
	}

	return slideout;
}

export type Slideout = Output<typeof SlideoutSchema>;
