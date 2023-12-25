import { MouseEventHandler, ReactNode } from 'react';
import { select, useSelect } from '@wordpress/data';
import cn from '~/utils/cn';
import { store } from '~/store/store';
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
};

export function SlideOutBody({ id, children, title, onOverlayClick }: Props) {
	const { slideouts, current } = useSelect(() => {
		return {
			slideouts: select(store).getSlideouts(),
			current: select(store).getCurrentSlideout(),
		};
	}, []);

	const shouldRenderSlideOut = () => {
		if (!current) {
			return false;
		}

		if (current.parentId === null) {
			return current.id === id;
		}

		return (
			slideouts.find((slideout) => slideout.parentId === id) !==
				undefined || current.id === id
		);
	};

	const nestingLevel = slideouts.findIndex((slideout) => slideout.id === id);
	const isOpen = shouldRenderSlideOut();

	return (
		<div
			className={slideOutOverlay}
			style={{
				'--is-open': isOpen ? 1 : 0,
				'--nesting-level': nestingLevel,
				pointerEvents: isOpen ? 'auto' : 'none',
			}}
			onClick={onOverlayClick}
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
