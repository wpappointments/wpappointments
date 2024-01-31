import { useSelect } from '@wordpress/data';
import cn from '~/utils/cn';
import { parseDateFromString } from '~/utils/datetime';
import { formatTime24HourFromDate } from '~/utils/format';
import { store } from '~/store/store';
import {
	head,
	item,
	rows,
	row,
	itemAvailable,
	headRow,
	title,
} from './TimeFinder.module.css';

export default function TimeFinder() {
	const availability = useSelect((select) => {
		return select(store).getAvailability();
	}, []);

	const { today } = availability;

	if (!today) {
		return <div>Loading...</div>;
	}

	console.log(availability);

	for (const slot of today) {
		console.log(slot);
		console.log(parseDateFromString(slot.start.date));
	}

	const daysInMonth = new Array(31).fill(0).map((_, i) => i + 1);
	const todaySlots = today.map((slot) => {
		return {
			date: parseDateFromString(slot.start.date),
			available: slot.available,
		};
	});

	return (
		<>
			<h2 className={title}>January 2024</h2>
			<div className={rows}>
				<div className={row}>
					<div className={head}></div>
					{todaySlots.map((slot) => {
						return (
							<div
								className={head}
								key={slot.date.toDateString()}
							>
								{formatTime24HourFromDate(slot.date)}
							</div>
						);
					})}
				</div>
				{daysInMonth.map((i) => {
					return (
						<div className={row}>
							<div className={headRow}>{i}</div>
							{todaySlots.map((slot) => {
								return (
									<div
										className={cn({
											[item]: true,
											[itemAvailable]: slot.available,
										})}
										key={slot.date.toDateString()}
									></div>
								);
							})}
						</div>
					);
				})}
			</div>
		</>
	);
}
