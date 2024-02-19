import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { dispatch } from '@wordpress/data';
import cn from '~/backend/utils/cn';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import styles from './SlideOut.module.css';

type Props = {
	id: string;
	children: ReactNode;
	title?: string;
	headerRightSlot?: ReactNode;
	level?: number;
	type?: 'default' | 'full';
	onClose?: (id: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export default function SlideOut({
	id,
	children,
	title,
	headerRightSlot,
	type,
	onClose,
	...rest
}: Props) {
	const {
		openSlideouts,
		currentSlideout,
		closeCurrentSlideOut,
		closingSlideout,
		closingSlideouts,
	} = useSlideout({ id });

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

	const [isOpen, setIsOpen] = useState(false);
	const showHeader = title || headerRightSlot;

	const portalContainer = document.getElementById('slideout-container');

	useEffect(() => {
		setIsOpen(shouldRenderSlideOut());
	}, []);

	useEffect(() => {
		if (closingSlideout) {
			setIsOpen(false);
		}
	}, [closingSlideout]);

	if (!portalContainer) {
		return null;
	}

	return createPortal(
		<div
			className={cn({
				[styles.slideOutOverlay]: true,
				[styles.slideOutOverlayOpen]: isOpen,
			})}
			onClick={() => closeCurrentSlideOut(onClose)}
			{...rest}
			style={{
				'--nesting-level': nestingLevel,
				'--total-levels':
					openSlideouts.length - closingSlideouts.length,
				...rest.style,
			}}
			data-id={id}
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
		</div>,
		portalContainer,
		id
	);
}
