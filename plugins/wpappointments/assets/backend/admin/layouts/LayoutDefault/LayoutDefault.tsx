import styles from './LayoutDefault.module.css';
import SlideoutRenderer from '~/backend/admin/components/SlideOut/SlideoutRenderer';
import Toaster from '~/backend/admin/components/Toaster/Toaster';

type Props = {
	title: string;
	children?: React.ReactNode;
};

export default function LayoutDefault({ title, children }: Props) {
	return (
		<div className={styles.layout}>
			<div className={styles.layoutHeader}>
				<h1>{title}</h1>
			</div>
			<div className={styles.layoutContent}>{children}</div>
			<Toaster />
			<div id="slideout-container"></div>
			<SlideoutRenderer />
		</div>
	);
}
