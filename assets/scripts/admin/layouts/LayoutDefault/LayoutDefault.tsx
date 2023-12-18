import {
	layout,
	layoutContent,
	layoutHeader,
} from './LayoutDefault.module.css';

type Props = {
	title: string;
	children: React.ReactNode;
};

export default function LayoutDefault({ title, children }: Props) {
	return (
		<div className={layout}>
			<div className={layoutHeader}>
				<h1>{title}</h1>
			</div>
			<div className={layoutContent}>{children}</div>
		</div>
	);
}
