import { SlotFillProvider } from '@wordpress/components';
import {
	HeaderActionsSlot,
	SlideoutRenderer,
	Toaster,
} from '@wpappointments/components';
import styles from './LayoutDefault.module.css';

type Props = {
	title: string;
	children?: React.ReactNode;
};

export default function LayoutDefault({ title, children }: Props) {
	return (
		<SlotFillProvider>
			<div className={styles.layout}>
				<div className={styles.layoutHeader}>
					<h1>{title}</h1>
					<div className={styles.layoutHeaderActions}>
						<HeaderActionsSlot />
					</div>
				</div>
				<div className={styles.layoutContent}>{children}</div>
				<Toaster />
				<div id="slideout-container"></div>
				<SlideoutRenderer />
			</div>
		</SlotFillProvider>
	);
}
