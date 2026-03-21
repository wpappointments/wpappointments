import type { ReactNode } from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	setSlideoutContent,
	removeSlideoutContent,
} from '../utils/slideoutContent';

const STORE_NAME = 'wpappointments';

type Slideout = {
	id: string;
	parentId?: string | null;
	data?: unknown;
	level?: number;
};

type UseSlideoutProps = {
	id?: string;
};

export type OpenSlideOutOptions = Slideout & {
	title?: string;
	content?: ReactNode;
};

export function useSlideout(props?: UseSlideoutProps) {
	const { id } = props || {};
	const dispatch = useDispatch(STORE_NAME);
	const {
		openSlideouts,
		currentSlideout,
		closingSlideout,
		closingSlideouts,
	} = useSelect(
		(select) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const storeSelect = select(STORE_NAME) as any;
			return {
				openSlideouts: storeSelect.getSlideouts(),
				currentSlideout: storeSelect.getCurrentSlideout(),
				closingSlideout: storeSelect.getClosingSlideout(id),
				closingSlideouts: storeSelect.getAllClosingSlideouts(),
			};
		},
		[id]
	);

	const openSlideOut = (options: OpenSlideOutOptions) => {
		const { title, content, ...slideout } = options;

		if (title || content) {
			setSlideoutContent(slideout.id, { title, content });
		}

		slideout.level = openSlideouts.length + 1;
		dispatch.openSlideout(slideout);
	};

	const closeSlideOut = (id: string, callback?: (id: string) => void) => {
		dispatch.closeSlideout(id);

		setTimeout(() => {
			dispatch.removeSlideout(id);
			removeSlideoutContent(id);
		}, 200);

		if (id && callback) {
			callback(id);
		}
	};

	const scopedCurrentSlideout = id
		? openSlideouts.find((s: Slideout) => s.id === id)
		: currentSlideout;

	const closeCurrentSlideOut = (callback?: (id: string) => void) => {
		if (!scopedCurrentSlideout) return;
		closeSlideOut(scopedCurrentSlideout.id, callback);
	};

	const isSlideoutOpen = (id: string) => {
		return openSlideouts.find((s: Slideout) => s.id === id) !== undefined;
	};

	return {
		openSlideouts,
		currentSlideout: scopedCurrentSlideout,
		closingSlideout,
		closingSlideouts,
		openSlideOut,
		closeSlideOut,
		closeCurrentSlideOut,
		isSlideoutOpen,
	};
}
