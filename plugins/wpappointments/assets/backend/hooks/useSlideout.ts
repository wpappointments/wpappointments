import type { ReactNode } from 'react';
import { select, useDispatch, useSelect } from '@wordpress/data';
import {
	setSlideoutContent,
	removeSlideoutContent,
} from '~/backend/store/slideout/slideout-content';
import { Slideout } from '~/backend/store/slideout/slideout.types';
import { store } from '~/backend/store/store';

type UseSlideoutProps = {
	id?: string;
};

export type OpenSlideOutOptions = Slideout & {
	title?: string;
	content?: ReactNode;
};

export default function useSlideout(props?: UseSlideoutProps) {
	const { id } = props || {};
	const dispatch = useDispatch(store);
	const {
		openSlideouts,
		currentSlideout,
		closingSlideout,
		closingSlideouts,
	} = useSelect(() => {
		return {
			openSlideouts: select(store).getSlideouts(),
			currentSlideout: select(store).getCurrentSlideout(),
			closingSlideout: select(store).getClosingSlideout(id),
			closingSlideouts: select(store).getAllClosingSlideouts(),
		};
	}, []);

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
			dispatch.removeSlideout();
			removeSlideoutContent(id);
		}, 200);

		if (id && callback) {
			callback(id);
		}
	};

	const closeCurrentSlideOut = (callback?: (id: string) => void) => {
		closeSlideOut(currentSlideout.id, callback);
	};

	const isSlideoutOpen = (id: string) => {
		return openSlideouts.find((s) => s.id === id) !== undefined;
	};

	return {
		openSlideouts,
		currentSlideout: id
			? openSlideouts.find((s) => s.id === id)
			: currentSlideout,
		closingSlideout,
		closingSlideouts,
		openSlideOut,
		closeSlideOut,
		closeCurrentSlideOut,
		isSlideoutOpen,
	};
}
