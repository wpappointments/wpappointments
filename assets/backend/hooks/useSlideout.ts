import { select, useDispatch, useSelect } from '@wordpress/data';
import { Slideout } from '~/backend/store/slideout/slideout.types';
import { store } from '~/backend/store/store';

type UseSlideoutProps = {
	id?: string;
};

export default function useSlideout(props?: UseSlideoutProps) {
	const { id } = props || {};
	const dispatch = useDispatch(store);
	const { openSlideouts, currentSlideout, closingSlideout } =
		useSelect(() => {
			return {
				openSlideouts: select(store).getSlideouts(),
				currentSlideout: select(store).getCurrentSlideout(),
				closingSlideout: select(store).getClosingSlideout(id),
			};
		}, []);

	const openSlideOut = (slideout: Slideout) => {
		slideout.level = openSlideouts.length + 1;
		dispatch.openSlideout(slideout);
	};

	const closeSlideOut = (id: string, callback?: (id: string) => void) => {
		dispatch.closeSlideout(id);

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
		openSlideOut,
		closeSlideOut,
		closeCurrentSlideOut,
		isSlideoutOpen,
	};
}
