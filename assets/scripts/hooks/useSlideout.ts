import { select, useDispatch, useSelect } from '@wordpress/data';
import { store } from '~/store/store';

export default function useSlideout() {
	const dispatch = useDispatch(store);
	const { openSlideouts, currentSlideout } = useSelect(() => {
		return {
			openSlideouts: select(store).getSlideouts(),
			currentSlideout: select(store).getCurrentSlideout(),
		};
	}, []);

	const openSlideOut = (parentId: string | null, id: string) => {
		dispatch.openSlideout({
			parentId,
			id,
			title: 'Test',
			content: 'Test',
		});
	};

	const closeSlideOut = (id: string) => {
		dispatch.closeSlideout(id);
	};

	const closeCurrentSlideOut = () => {
		closeSlideOut(currentSlideout.id);
	};

	return {
		openSlideouts,
		currentSlideout,
		openSlideOut,
		closeSlideOut,
		closeCurrentSlideOut,
	};
}
