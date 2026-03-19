/**
 * Slideout renderer
 *
 * Renders all slideouts that were opened via the call-based API
 * (openSlideOut with title/content). Reads open slideout IDs from
 * the Redux store and looks up content from the slideout content
 * registry.
 *
 * Place this component once in LayoutDefault. Slideouts opened
 * with inline <SlideOut> components continue to work alongside this.
 *
 * @package WPAppointments
 * @since 0.4.0
 */
import { select, useSelect } from '@wordpress/data';
import { getSlideoutContent } from '~/backend/store/slideout/slideout-content';
import { store } from '~/backend/store/store';
import SlideOut from './SlideOut';

export default function SlideoutRenderer() {
	const openSlideouts = useSelect(() => {
		return select(store).getSlideouts();
	}, []);

	return (
		<>
			{openSlideouts.map((slideout) => {
				const entry = getSlideoutContent(slideout.id);

				if (!entry) {
					return null;
				}

				return (
					<SlideOut
						key={slideout.id}
						id={slideout.id}
						title={entry.title}
					>
						{entry.content}
					</SlideOut>
				);
			})}
		</>
	);
}
