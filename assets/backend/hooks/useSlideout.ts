import { select, useDispatch, useSelect } from '@wordpress/data';
import { Slideout } from '~/store/slideout/slideout.types';
import { store } from '~/store/store';

export default function useSlideout(id?: string) {
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
		dispatch.openSlideout(slideout);
	};

	const closeSlideOut = (id: string) => {
		dispatch.closeSlideout(id);
	};

	const closeCurrentSlideOut = () => {
		closeSlideOut(currentSlideout.id);
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
	};
}
