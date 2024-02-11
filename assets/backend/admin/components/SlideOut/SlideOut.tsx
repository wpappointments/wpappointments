import { MouseEventHandler, ReactNode } from 'react';
import cn from '~/utils/cn';
import useSlideout from '~/hooks/useSlideout';
import styles from './SlideOut.module.css';

type Props = {
	id: string;
	children: ReactNode;
	onOverlayClick?: MouseEventHandler<HTMLDivElement>;
	title?: string;
	headerRightSlot?: ReactNode;
	level?: number;
	type?: 'default' | 'full';
} & React.HTMLAttributes<HTMLDivElement>;

export default function SlideOut({
	id,
	children,
	title,
	headerRightSlot,
	onOverlayClick,
	type,
	...rest
}: Props) {
	const {
		openSlideouts,
		currentSlideout,
		closeCurrentSlideOut,
		closingSlideout,
	} = useSlideout(id);

	let nestingLevel = 1;

	if (currentSlideout) {
		nestingLevel = currentSlideout.level || 1;
	}

	if (closingSlideout?.id === id) {
		nestingLevel = closingSlideout.level || 1;
	}

	const shouldRenderSlideOut = () => {
		if (!currentSlideout) {
			return false;
		}

		if (currentSlideout.parentId === null) {
			return currentSlideout.id === id;
		}

		return (
			openSlideouts.find((slideout) => slideout.parentId === id) !==
				undefined || currentSlideout.id === id
		);
	};

	const isOpen = shouldRenderSlideOut();
	const showHeader = title || headerRightSlot;

	return (
		<div
			className={cn({
				[styles.slideOutOverlay]: true,
				[styles.slideOutOverlayOpen]: isOpen,
			})}
			onClick={onOverlayClick || closeCurrentSlideOut}
			{...rest}
			style={{
				'--nesting-level': nestingLevel,
				'--total-levels': openSlideouts.length,
				...rest.style,
			}}
		>
			<div
				className={cn({
					[styles.slideOut]: true,
					[styles.slideOutOpen]: isOpen,
					[styles.slideOutWide]: type === 'full',
				})}
				onClick={(e) => e.stopPropagation()}
			>
				{showHeader && (
					<div className={styles.header}>
						<h2>{title}</h2>
						{headerRightSlot}
					</div>
				)}
				<div className={styles.content}>{children}</div>
			</div>
		</div>
	);
}