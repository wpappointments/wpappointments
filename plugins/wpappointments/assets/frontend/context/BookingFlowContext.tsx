import { createContext, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { addQueryArgs } from '@wordpress/url';
import { useLilius } from 'use-lilius';
import { safeParse } from 'valibot';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { formatTime, getWeekDays } from '~/backend/utils/i18n';
import resolve from '~/backend/utils/resolve';
import { Appointment, Customer } from '~/backend/types';
import {
	AvailabilityResponse,
	AvailabilityResponseSchema,
	DayCalendar,
} from '../frontend';
import { BookingFlowBlockAttributes } from '~/blocks/booking-flow/src/booking-flow-block';

type Response = APIResponse<{
	appointment: Appointment;
	message: string;
}>;

export type BookingFlowCalendarFields = {
	datetime: string;
};

export type BookingFlowCustomerFields = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	account: boolean;
	password?: string;
};

export type BookingFlowFormFields = BookingFlowCalendarFields &
	BookingFlowCustomerFields;

export type BookingFlowContext = {
	attributes: BookingFlowBlockAttributes;
	calendarWithAvailability:
		| [AvailabilityResponse['data']['availability']]
		| [];
	dayAvailability: DayCalendar['day'] | [];
	lilius: ReturnType<typeof useLilius>;
	form: ReturnType<typeof useForm<BookingFlowFormFields>>;
	formError: string | null;
	formSuccess: boolean;
	onSubmit: (data: BookingFlowFormFields) => Promise<void>;
	weekDays: ReturnType<typeof getWeekDays>;
	availabilityLoading: boolean;
};

export type BookingFlowContextProviderProps = {
	children: React.ReactNode;
	attributes: BookingFlowBlockAttributes;
};

export function BookingFlowContextProvider({
	children,
	attributes,
}: BookingFlowContextProviderProps) {
	const form = useForm<BookingFlowFormFields>();
	const lilius = useLilius({
		weekStartsOn: window.wpappointments.date.startOfWeek,
	});

	const { calendar, selected, viewing } = lilius;

	const [calendarWithAvailability, setCalendarWithAvailability] = useState<
		BookingFlowContext['calendarWithAvailability']
	>([]);
	const [dayAvailability, setDayAvailability] = useState<
		BookingFlowContext['dayAvailability']
	>([]);
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<boolean>(false);
	const [availabilityLoading, setAvailabilityLoading] =
		useState<boolean>(true);

	useEffect(() => {
		if (
			!calendarWithAvailability ||
			calendarWithAvailability.length === 0
		) {
			return;
		}

		const availability = findDayAvailability(
			selected[0],
			calendarWithAvailability
		);

		setDayAvailability(availability);
	}, [selected, calendarWithAvailability]);

	useEffect(() => {
		apiFetch({
			path: addQueryArgs('calendar-availability', {
				calendar: JSON.stringify(calendar[0]),
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				trim: attributes.trimUnavailable,
			}),
		})
			.then((data) => {
				const parsed = safeParse(AvailabilityResponseSchema, data);
				const { output, success } = parsed;

				if (!success) {
					console.error(
						'Failed to parse availability response',
						parsed
					);
					setAvailabilityLoading(false);
					return;
				}

				const { data: response } = output;
				const { availability } = response;

				setCalendarWithAvailability([availability]);
				setAvailabilityLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch availability', error);
			});
	}, [viewing.getMonth(), attributes.trimUnavailable]);

	const onSubmit = async (data: BookingFlowFormFields) => {
		const customer: Pick<Customer, 'name' | 'email' | 'phone'> = {
			name: `${data.firstName} ${data.lastName}`,
			email: data.email,
			phone: data.phone,
		};

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'public/appointments',
				method: 'POST',
				data: {
					customer,
					date: data.datetime,
					createAccount: data.account,
					password: data.password,
				},
			});

			return response;
		});

		if (error) {
			setFormError('Error creating appointment');
		}

		if (response) {
			if (response.status === 'success') {
				setFormSuccess(true);
			}

			if (response.status === 'error' && response.message) {
				setFormError(response.message);
			}
		}
	};

	const weekDays = getWeekDays();

	const value = {
		attributes,
		dayAvailability,
		calendarWithAvailability,
		availabilityLoading,
		lilius,
		form,
		formError,
		formSuccess,
		onSubmit,
		weekDays,
	};

	return (
		<BookingFlowContext.Provider value={value}>
			{children}
		</BookingFlowContext.Provider>
	);
}

function findDayAvailability(
	dayDate: Date,
	months: [AvailabilityResponse['data']['availability']]
) {
	if (!months || !months.length || !dayDate) {
		return [];
	}

	for (const month of months) {
		for (const week of month) {
			for (const day of week) {
				const d = new Date(day.date);

				if (d.getTime() === dayDate.getTime()) {
					return day.day.map((slot) => {
						return {
							date: new Date(slot.timestamp),
							time: formatTime(new Date(slot.timestamp)),
							available: slot.available,
							inSchedule: slot.inSchedule,
							timestamp: slot.timestamp,
							dateString: slot.dateString,
						};
					});
				}
			}
		}
	}

	return [];
}

export function useBookingFlowContext() {
	return { ...useContext(BookingFlowContext) };
}

const BookingFlowContext = createContext<BookingFlowContext>(
	{} as BookingFlowContext
);

export default BookingFlowContext;
