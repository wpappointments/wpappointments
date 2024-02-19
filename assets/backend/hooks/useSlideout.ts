import { select, useDispatch, useSelect } from '@wordpress/data';
import { Slideout } from '~/backend/store/slideout/slideout.types';
import { store } from '~/backend/store/store';

type UseSlideoutProps = {
	id?: string;
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

	const openSlideOut = (slideout: Slideout) => {
		slideout.level = openSlideouts.length + 1;
		dispatch.openSlideout(slideout);
	};

	const closeSlideOut = (id: string, callback?: (id: string) => void) => {
		dispatch.closeSlideout(id);

		setTimeout(() => {
			dispatch.removeSlideout();
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
