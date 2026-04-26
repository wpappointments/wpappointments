import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close as closeIcon } from '@wordpress/icons';
import { useSlideout } from '@wpappointments/data';
import cn from 'obj-str';
import { SlideoutHeaderActionsSlot } from '../SlotFill/SlideoutHeaderActions';
import styles from './SlideOut.module.css';

type Props = {
	id: string;
	children: ReactNode;
	title?: ReactNode;
	level?: number;
	type?: 'default' | 'full';
	onClose?: (id: string) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>;

export default function SlideOut({
	id,
	children,
	title,
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
			openSlideouts.find(
				(slideout: { parentId?: string | null }) =>
					slideout.parentId === id
			) !== undefined || currentSlideout.id === id
		);
	};

	const [isOpen, setIsOpen] = useState(false);
	const slideOutRef = useRef<HTMLDivElement>(null);
	const showHeader = true;
	const titleId = `slideout-title-${id}`;

	const portalContainer = document.getElementById('slideout-container');

	useEffect(() => {
		setIsOpen(shouldRenderSlideOut());
		if (shouldRenderSlideOut() && slideOutRef.current) {
			slideOutRef.current.focus();
		}
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeCurrentSlideOut(onClose);
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
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
				ref={slideOutRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				tabIndex={-1}
				className={cn({
					[styles.slideOut]: true,
					[styles.slideOutOpen]: isOpen,
					[styles.slideOutWide]: type === 'full',
				})}
				onClick={(e) => e.stopPropagation()}
			>
				{showHeader && (
					<div className={styles.header}>
						<h2 id={titleId}>{title}</h2>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							}}
						>
							<SlideoutHeaderActionsSlot />
							<Button
								icon={closeIcon}
								label={__('Close', 'appointments-booking')}
								onClick={() => closeCurrentSlideOut(onClose)}
							/>
						</div>
					</div>
				)}
				<div className={styles.content}>{children}</div>
			</div>
		</div>,
		portalContainer,
		id
	);
}
