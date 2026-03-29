/**
 * DataViews wrapper
 *
 * Wraps the official @wordpress/dataviews component using composition mode
 * (children) to render a minimal UI — just the table layout and footer
 * pagination, no settings panel or search bar.
 *
 * Based on the upstream "Minimal UI" pattern:
 * https://github.com/WordPress/gutenberg/blob/trunk/packages/dataviews/src/dataviews/stories/minimal-ui.tsx
 *
 * All DataViews usage in the project should import from this package
 * to maintain a single integration point.
 *
 * @package WPAppointments
 */
import { DataViews as WPDataViews } from '@wordpress/dataviews';
import '@wordpress/dataviews/build-style/style.css';
import styles from './DataViews.module.css';

export { DataForm, useFormValidity } from '@wordpress/dataviews';
export type {
	Action,
	DataFormControlProps,
	Field,
	FieldValidity,
	Form,
	FormValidity,
	View,
} from '@wordpress/dataviews';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataViews(props: any) {
	return (
		<div className={styles.wrapper}>
			<WPDataViews {...props}>
				<WPDataViews.Layout />
				<WPDataViews.Footer />
			</WPDataViews>
		</div>
	);
}
