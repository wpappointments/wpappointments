import { MouseEventHandler, ReactNode } from 'react';
import cn from '~/utils/cn';
import useSlideout from '~/hooks/useSlideout';
import {
	content,
	header,
	slideOut,
	slideOutOpen,
	slideOutOverlay,
} from './SlideOut.module.css';

type Props = {
	id: string;
	children: ReactNode;
	onOverlayClick?: MouseEventHandler<HTMLDivElement>;
	title?: string;
	level?: number;
};

export default function SlideOut({
	id,
	level = 1,
	children,
	title,
	onOverlayClick,
}: Props) {
	const {
		openSlideouts,
		currentSlideout,
		closeCurrentSlideOut,
		closingSlideout,
	} = useSlideout(id);

	let nestingLevel = level;

	if (currentSlideout) {
		nestingLevel = currentSlideout.level || level;
	}

	if (closingSlideout?.id === id) {
		nestingLevel = closingSlideout.level || level;
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

	return (
		<div
			className={slideOutOverlay}
			style={{
				'--is-open': isOpen ? 1 : 0,
				'--nesting-level': nestingLevel,
				pointerEvents: isOpen ? 'auto' : 'none',
			}}
			onClick={onOverlayClick || closeCurrentSlideOut}
		>
			<div
				className={cn({
					[slideOut]: true,
					[slideOutOpen]: isOpen,
				})}
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<div className={header}>
						<h2>{title}</h2>
					</div>
				)}
				<div className={content}>{children}</div>
			</div>
		</div>
	);
}
