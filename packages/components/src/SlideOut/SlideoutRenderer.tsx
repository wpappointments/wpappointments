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
import { useSelect } from '@wordpress/data';
import { getSlideoutContent } from '@wpappointments/data';
import SlideOut from './SlideOut';

const STORE_NAME = 'appointments-booking';

export default function SlideoutRenderer() {
	const openSlideouts = useSelect((select) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (select(STORE_NAME) as any).getSlideouts();
	}, []);

	return (
		<>
			{openSlideouts.map((slideout: { id: string; title?: string }) => {
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
