import { useEffect, useRef, useState } from 'react';
import { Button, ButtonGroup } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import { format, getDaysInMonth } from 'date-fns';
import cn from '~/backend/utils/cn';
import {
	formatTime24HourFromDate,
	formatTimeForPicker,
} from '~/backend/utils/format';
import { MonthIndex } from '~/backend/store/slideout/appointment/appointment.types';
import { store } from '~/backend/store/store';
import SlideOut from '../SlideOut/SlideOut';
import styles from './TimeFinder.module.css';
import { useStateContext } from '~/backend/admin/context/StateContext';

type TimeFinderProps = {
	mode: 'edit' | 'create';
};

export default function TimeFinder({ mode }: TimeFinderProps) {
	const { invalidate, getSelector } = useStateContext();
	const scrollableRef = useRef<HTMLDivElement>(null);
	const isScrolling = useRef(true);

	const [hours, setHours] = useState<
		'earlyMorning' | 'morning' | 'afternoon' | 'evening' | 'allDay' | 'auto'
	>('morning');

	const dispatch = useDispatch(store);
	const { currentMonth, currentYear } = useSelect((select) => {
		return {
			currentMonth: select(store).getCurrentMonth(),
			currentYear: select(store).getCurrentYear(),
		};
	}, []);

	function setCurrentMonth(month: number) {
		dispatch.setCurrentMonth(month as MonthIndex);
	}

	function setCurrentYear(year: number) {
		dispatch.setCurrentYear(year);
	}

	const availability = useSelect(
		(select) => {
			return select(store).getAvailability(
				currentMonth,
				currentYear,
				getSelector('getAvailability')
			);
		},
		[currentMonth, currentYear]
	);

	const { month } = availability;

	useEffect(() => {
		if (!scrollableRef.current) {
			return;
		}

		scrollableRef.current.scroll({
			left: scrollableRef.current.scrollWidth / 4,
		});
	}, []);

	function setDayTime(time: typeof hours) {
		if (time === 'allDay') {
			return () => {
				setHours('allDay');
			};
		}

		let index = 0;

		if (time === 'morning') {
			index = 1;
		}

		if (time === 'afternoon') {
			index = 2;
		}

		if (time === 'evening') {
			index = 3;
		}

		return () => {
			if (!scrollableRef.current) {
				return;
			}

			isScrolling.current = false;

			setTimeout(() => {
				if (!scrollableRef.current) {
					return;
				}

				scrollableRef.current.scroll({
					left: (scrollableRef.current.scrollWidth / 4) * index,
				});

				isScrolling.current = true;
			}, 100);

			setHours(time);
		};
	}

	useEffect(() => {
		function handleScroll(e: MouseEvent) {
			const target = e.target as HTMLDivElement;
			const scrollLeft = target.scrollLeft;
			const scrollWidth = target.scrollWidth;

			if (!isScrolling.current) {
				return;
			}

			if (scrollLeft >= (scrollWidth / 4) * 3 - 1) {
				setHours('evening');
				return;
			}

			if (
				scrollLeft >= (scrollWidth / 4) * 2 - 1 &&
				scrollLeft < (scrollWidth / 4) * 3
			) {
				setHours('afternoon');
				return;
			}

			if (
				scrollLeft >= scrollWidth / 4 - 1 &&
				scrollLeft < (scrollWidth / 4) * 2
			) {
				setHours('morning');
				return;
			}

			if (scrollLeft > 1 && scrollLeft < scrollWidth / 4) {
				setHours('earlyMorning');
			}
		}

		scrollableRef.current?.addEventListener('scroll', handleScroll);

		return () => {
			scrollableRef.current?.removeEventListener('scroll', handleScroll);
		};
	}, [scrollableRef]);

	if (!month) {
		return <div>Loading...</div>;
	}

	const daysInMonth = getDaysInMonth(
		new Date(currentYear, currentMonth + 1, 0)
	);
	const days = [];

	for (let i = 1; i <= daysInMonth; i++) {
		days.push({
			weekday: format(new Date(currentYear, currentMonth, i), 'EEE'),
			number: formatTimeForPicker(i),
		});
	}

	function goToNextMonth() {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear(currentYear + 1);
		} else {
			setCurrentMonth(currentMonth + 1);
		}

		invalidate('getAvailability');
	}

	function goToPrevMonth() {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear(currentYear - 1);
		} else {
			setCurrentMonth(currentMonth - 1);
		}

		invalidate('getAvailability');
	}

	let hourHeadings = [];

	if (month[0]?.slots) {
		for (const slot of month[0].slots) {
			hourHeadings.push(
				formatTime24HourFromDate(new Date(slot.start.date))
			);
		}
	}

	function calculateWidth() {
		if (hours === 'allDay') {
			return 100;
		}

		const multiplier = hourHeadings.length / 24;
		return multiplier < 1 ? 100 : 200 * multiplier;
	}

	if (hours === 'allDay') {
		const precision = hourHeadings.length / 12;
		hourHeadings = hourHeadings.filter((_, i) => i % precision === 0);
	}

	return (
		<SlideOut
			title={__('Find time', 'wpappointments')}
			id={`find-time-${mode}`}
		>
			<div className={styles.header}>
				<div className={styles.buttons}>
					<ButtonGroup>
						<Button
							variant={
								hours === 'allDay' ? 'primary' : 'secondary'
							}
							size="small"
							onClick={setDayTime('allDay')}
						>
							All day
						</Button>
						<Button
							variant={
								hours === 'earlyMorning'
									? 'primary'
									: 'secondary'
							}
							size="small"
							onClick={setDayTime('earlyMorning')}
						>
							Early Morning
						</Button>
						<Button
							variant={
								hours === 'morning' ? 'primary' : 'secondary'
							}
							size="small"
							onClick={setDayTime('morning')}
						>
							Morning
						</Button>
						<Button
							variant={
								hours === 'afternoon' ? 'primary' : 'secondary'
							}
							size="small"
							onClick={setDayTime('afternoon')}
						>
							Afternoon
						</Button>
						<Button
							variant={
								hours === 'evening' ? 'primary' : 'secondary'
							}
							size="small"
							onClick={setDayTime('evening')}
						>
							Evening
						</Button>
					</ButtonGroup>
				</div>
				<div className={styles.titleRow}>
					<h2 className={styles.title}>
						{format(
							new Date(currentYear, currentMonth + 1, 0, 0, 0),
							'LLLL'
						)}{' '}
						{currentYear}
					</h2>
					<ButtonGroup>
						<Button
							variant="secondary"
							size="small"
							onClick={goToPrevMonth}
						>
							<Icon icon={arrowLeft} size={12} />
						</Button>
						<Button
							variant="secondary"
							size="small"
							onClick={goToNextMonth}
						>
							<Icon icon={arrowRight} size={12} />
						</Button>
					</ButtonGroup>
				</div>
			</div>
			<div className={styles.wrapper}>
				<div className={styles.daysColumn}>
					<div className={styles.head}>&nbsp;</div>
					{days.map((day) => {
						return (
							<div
								className={cn({
									[styles.headRow]: true,
									[styles.headRowWeekend]:
										day.weekday === 'Sat' ||
										day.weekday === 'Sun',
								})}
								key={day.number}
							>
								<span>{day.weekday},</span> {day.number}
							</div>
						);
					})}
				</div>
				<div
					ref={scrollableRef}
					className={styles.scrollable}
					style={{
						overflow: `${hours === 'allDay' ? 'hidden' : 'auto'}`,
					}}
				>
					<div
						className={styles.rows}
						style={{
							width: `${calculateWidth()}%`,
						}}
					>
						<div className={styles.row}>
							{hourHeadings.map((date) => (
								<div
									className={styles.head}
									key={date + 'head'}
								>
									{date}
								</div>
							))}
						</div>
						{month.map((day) => {
							return (
								<div className={styles.row} key={day.date.date}>
									{[...day.slots].map((slot) => {
										return (
											<div
												className={cn({
													[styles.item]: true,
													[styles.itemAvailable]:
														slot.available,
													[styles.itemBooked]:
														slot.booked,
												})}
												key={slot.start.date + 'cell'}
											></div>
										);
									})}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</SlideOut>
	);
}
