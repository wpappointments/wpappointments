import { __ } from '@wordpress/i18n';
import { Output, array, boolean, date, number, object, optional, string, union } from 'valibot';
import cn from '~/backend/utils/cn';
import BookingFlow from './components/BookingFlow/BookingFlow';
import { BookingFlowContextProvider } from './context/BookingFlowContext';
import styles from './frontend.module.css';
import { BookingFlowBlockAttributes } from '~/blocks/booking-flow/src/booking-flow-block';


export const DaySlotSchema = object({
	available: boolean(),
	dateString: string(),
	timestamp: number(),
	date: optional(date()),
	time: optional(string()),
});

export const DaySchema = object({
	available: boolean(),
	date: string(),
	day: array(DaySlotSchema),
	totalAvailable: optional(number()),
	totalSlots: optional(number()),
});

export const AvailabilityResponseSchema = object({
	type: union([string('success'), string('error')]),
	data: object({
		availability: array(array(DaySchema)),
	}),
});

export type DaySlot = Output<typeof DaySlotSchema>;
export type DayCalendar = Output<typeof DaySchema>;
export type AvailabilityResponse = Output<typeof AvailabilityResponseSchema>;

export type FronendAppProps = {
	attributes: BookingFlowBlockAttributes;
};

export default function FrontendApp({ attributes }: FronendAppProps) {
	const { alignment, width } = attributes;

	return (
		<BookingFlowContextProvider attributes={attributes}>
			<div
				className={cn({
					[styles.bookingFlow]: true,
					[styles[`align${alignment}`]]: true,
					[styles[`width${width}`]]: true,
				})}
			>
				<BookingFlow />
			</div>
		</BookingFlowContextProvider>
	);
}