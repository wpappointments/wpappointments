import cn from '~/utils/cn';
import { useState } from '@wordpress/element';
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction } from 'react';
import { Appointment } from '~/types';
import {
	content,
	header,
	slideOut,
	slideOutOpen,
	slideOutOverlay,
} from './SlideOut.module.css';

type Props = {
	children: ReactNode;
	isOpen: boolean;
	onOverlayClick?: MouseEventHandler<HTMLDivElement>;
	title?: string;
};

export default function SlideOut({
	children,
}: {
	children: ({
		slideOutIsOpen,
		openSlideOut,
		closeSlideOut,
		selectedAppointment,
		setSelectedAppointment,
		mode,
		setMode,
	}: {
		slideOutIsOpen: boolean;
		openSlideOut: () => void;
		closeSlideOut: () => void;
		selectedAppointment?: Appointment;
		setSelectedAppointment: Dispatch<
			SetStateAction<Appointment | undefined>
		>;
		mode: 'view' | 'edit' | 'create';
		setMode: Dispatch<SetStateAction<'view' | 'edit' | 'create'>>;
	}) => React.ReactNode;
}) {
	const [slideOutIsOpen, setSlideOutIsOpen] = useState(false);
	const [mode, setMode] = useState<'view' | 'edit' | 'create'>('create');
	const [selectedAppointment, setSelectedAppointment] = useState<
		Appointment | undefined
	>();

	const openSlideOut = () => {
		setSlideOutIsOpen(true);
	};

	const closeSlideOut = () => {
		setSlideOutIsOpen(false);
	};

	return children({
		slideOutIsOpen,
		openSlideOut,
		closeSlideOut,
		selectedAppointment,
		setSelectedAppointment,
		mode,
		setMode,
	});
}

export function SlideOutBody({
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
