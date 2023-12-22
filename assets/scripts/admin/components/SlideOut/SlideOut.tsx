import cn from '~/utils/cn';
import {
	content,
	header,
	slideOut,
	slideOutIsOpen,
	slideOutOverlay,
} from './SlideOut.module.css';
import { MouseEventHandler } from 'react';

type Props = {
	children: React.ReactNode;
	isOpen: boolean;
	onOverlayClick?: MouseEventHandler<HTMLDivElement>;
	title?: string;
};

export default function SlideOut({
	children,
	title,
	isOpen = false,
	onOverlayClick,
}: Props) {
	return (
		<div
			className={slideOutOverlay}
			style={{
				'--is-open': isOpen ? 1 : 0,
				pointerEvents: isOpen ? 'auto' : 'none',
			}}
			onClick={onOverlayClick}
		>
			<div
				className={cn({
					[slideOut]: true,
					[slideOutIsOpen]: isOpen,
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
