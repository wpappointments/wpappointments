import { useEffect, useRef, useState } from 'react';
import { Button, ButtonGroup } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon, arrowDown, arrowUp } from '@wordpress/icons';
import { format, getDaysInMonth } from 'date-fns';
import cn from '~/utils/cn';
import { formatTime24HourFromDate, formatTimeForPicker } from '~/utils/format';
import { store } from '~/store/store';
import {
	head,
	item,
	rows,
	row,
	itemAvailable,
	headRow,
	title,
	titleRow,
	header,
	buttons,
	scrollable,
	daysColumn,
	wrapper,
	headRowWeekend,
} from './TimeFinder.module.css';
import { useStateContext } from '~/admin/context/StateContext';

export default function TimeFinder() {
	const { invalidate, getSelector } = useStateContext();
	const scrollableRef = useRef<HTMLDivElement>(null);
	const isScrolling = useRef(true);

	const [hours, setHours] = useState<
		'earlyMorning' | 'morning' | 'afternoon' | 'evening' | 'allDay'
	>('morning');

	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

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

	const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth, 0));
	const days = [];

	for (let i = 1; i <= daysInMonth; i++) {
		days.push({
			weekday: format(new Date(currentYear, currentMonth, i), 'EEE'),
			number: formatTimeForPicker(i),
		});
	}

	function goToNextMonth() {
		if (currentMonth === 12) {
			setCurrentMonth(1);
			setCurrentYear(currentYear + 1);
		} else {
			setCurrentMonth(currentMonth + 1);
		}

		invalidate('getAvailability');
	}

	function goToPrevMonth() {
		if (currentMonth === 1) {
			setCurrentMonth(12);
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

	if (hours === 'allDay') {
		hourHeadings = hourHeadings.filter((_, i) => i % 4 === 0);
	}

	return (
		<>
			<div className={header}>
				<div className={titleRow}>
					<h2 className={title}>
						{format(
							new Date(currentYear, currentMonth, 0, 0, 0),
							'LLLL'
						)}{' '}
						{currentYear}
					</h2>
					<ButtonGroup>
						<Button
							variant="secondary"
							size="small"
							onClick={goToNextMonth}
						>
							<Icon icon={arrowDown} size={12} />
						</Button>
						<Button
							variant="secondary"
							size="small"
							onClick={goToPrevMonth}
						>
							<Icon icon={arrowUp} size={12} />
						</Button>
					</ButtonGroup>
				</div>
				<div className={buttons}>
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
			</div>
			<div className={wrapper}>
				<div className={daysColumn}>
					<div className={head}>&nbsp;</div>
					{days.map((day) => {
						return (
							<div
								className={cn({
									[headRow]: true,
									[headRowWeekend]:
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
					className={scrollable}
					style={{
						overflow: `${hours === 'allDay' ? 'hidden' : 'auto'}`,
					}}
				>
					<div
						className={rows}
						style={{
							width: `${hours === 'allDay' ? 100 : 400}%`,
						}}
					>
						<div className={row}>
							{hourHeadings.map((date) => (
								<div className={head} key={date + 'head'}>
									{date}
								</div>
							))}
						</div>
						{month.map((day) => {
							return (
								<div className={row} key={day.date.date}>
									{[...day.slots].map((slot) => {
										return (
											<div
												className={cn({
													[item]: true,
													[itemAvailable]:
														slot.available,
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
		</>
	);
}
