import {
	Output,
	array,
	boolean,
	date,
	number,
	object,
	optional,
	string,
	union,
} from 'valibot';
import cn from '~/backend/utils/cn';
import BookingFlow from './components/BookingFlow/BookingFlow';
import { BookingFlowContextProvider } from './context/BookingFlowContext';
import styles from './frontend.module.css';
import { BookingFlowBlockAttributes } from '~/blocks/booking-flow/src/booking-flow-block';

export const DaySlotSchema = object({
	available: boolean(),
	inSchedule: boolean(),
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
	status: union([string('success'), string('error')]),
	message: optional(string()),
	data: object({
		availability: array(array(DaySchema)),
	}),
});

export type DaySlot = Output<typeof DaySlotSchema>;
export type DayCalendar = Output<typeof DaySchema>;
export type AvailabilityResponse = Output<typeof AvailabilityResponseSchema>;

export type FrontendAppProps = {
	attributes: BookingFlowBlockAttributes;
};

export default function FrontendApp({ attributes }: FrontendAppProps) {
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
