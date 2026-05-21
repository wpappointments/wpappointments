import { SlotFillProvider } from '@wordpress/components';
import {
	HeaderActionsSlot,
	SlideoutRenderer,
	Toaster,
} from '@wpappointments/components';
import cn from 'obj-str';
import styles from './LayoutDefault.module.css';

type Props = {
	title: string;
	fullWidth?: boolean;
	children?: React.ReactNode;
};

export default function LayoutDefault({ title, fullWidth, children }: Props) {
	return (
		<SlotFillProvider>
			<div className={styles.layout}>
				<div className={styles.layoutHeader}>
					<h1>{title}</h1>
					<div className={styles.layoutHeaderActions}>
						<HeaderActionsSlot />
					</div>
				</div>
				<div
					className={cn({
						[styles.layoutContent]: true,
						[styles.fullWidth]: !!fullWidth,
					})}
				>
					{children}
				</div>
				<Toaster />
				<div id="slideout-container"></div>
				<SlideoutRenderer />
			</div>
		</SlotFillProvider>
	);
}
