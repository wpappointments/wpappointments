import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useLilius } from 'use-lilius';
import { safeParse } from 'valibot';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { applyFilters, doAction } from '~/backend/utils/hooks';
import { formatTime, getWeekDays } from '~/backend/utils/i18n';
import resolve from '~/backend/utils/resolve';
import { Appointment, Customer } from '~/backend/types';
import {
	AvailabilityResponse,
	AvailabilityResponseSchema,
	ButtonHtml,
	DayCalendar,
	DayNotices,
} from '../frontend';
import { SlotFillProvider } from '../slotfill';
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

const initialFormData: BookingFlowFormFields = {
	datetime: '',
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	account: false,
	password: '',
};

export type BookingFlowContext = {
	attributes: BookingFlowBlockAttributes;
	calendarWithAvailability:
		| [AvailabilityResponse['data']['availability']]
		| [];
	dayAvailability: DayCalendar['day'] | [];
	dayNotices: DayNotices;
	lilius: ReturnType<typeof useLilius>;
	formData: BookingFlowFormFields;
	setField: <K extends keyof BookingFlowFormFields>(
		key: K,
		value: BookingFlowFormFields[K]
	) => void;
	formError: string | null;
	formSuccess: boolean;
	onSubmit: () => Promise<void>;
	weekDays: ReturnType<typeof getWeekDays>;
	availabilityLoading: boolean;
	buttonHtml?: ButtonHtml;
	goBack?: () => void;
	setGoBack: (fn: () => void) => void;
	editorStep?: number;
	isEditor?: boolean;
};

export type BookingFlowContextProviderProps = {
	children: React.ReactNode;
	attributes: BookingFlowBlockAttributes;
	buttonHtml?: ButtonHtml;
	editorStep?: number;
	isEditor?: boolean;
};

export function BookingFlowContextProvider({
	children,
	attributes,
	buttonHtml,
	editorStep,
	isEditor,
}: BookingFlowContextProviderProps) {
	const [formData, setFormData] =
		useState<BookingFlowFormFields>(initialFormData);
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
	const [dayNotices, setDayNotices] = useState<DayNotices>({});
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<boolean>(false);
	const [availabilityLoading, setAvailabilityLoading] =
		useState<boolean>(true);
	const [goBack, setGoBackState] = useState<(() => void) | undefined>();
	const setGoBack = useCallback((fn: () => void) => {
		setGoBackState(() => fn);
	}, []);

	const setField = useCallback(
		<K extends keyof BookingFlowFormFields>(
			key: K,
			value: BookingFlowFormFields[K]
		) => {
			setFormData((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

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

	const viewingMonth = viewing.getMonth();

	useEffect(() => {
		async function fetchAvailability() {
			const entityId =
				attributes.entityId ||
				window.wpappointments?.entity?.coreEntityId;

			if (!entityId) {
				setDayNotices({});
				setAvailabilityLoading(false);
				return;
			}

			try {
				const data = await apiFetch({
					path: addQueryArgs(`bookables/${entityId}/calendar-slots`, {
						calendar: JSON.stringify(calendar[0]),
						timezone:
							Intl.DateTimeFormat().resolvedOptions().timeZone,
						trim: attributes.trimUnavailable,
					}),
				});

				const parsed = safeParse(AvailabilityResponseSchema, data);
				const { output, success } = parsed;

				if (!success) {
					console.error(
						'Failed to parse availability response',
						parsed
					);
					return;
				}

				const { data: response } = output;
				const { availability } = response;

				setCalendarWithAvailability([availability]);

				// Fetch OOO dates with public notes.
				const allDates = availability.flat().map((d) => d.date);
				const sortedDates = allDates.filter(Boolean).sort();

				setDayNotices({});

				if (sortedDates.length > 0) {
					const startDate = sortedDates[0].split('T')[0];
					const endDate =
						sortedDates[sortedDates.length - 1].split('T')[0];

					try {
						const oooData = await apiFetch<
							APIResponse<{
								dates: {
									date: string;
									reason?: string;
									note?: string;
								}[];
							}>
						>({
							path: addQueryArgs('ooo/dates', {
								entity_id: entityId,
								start_date: startDate,
								end_date: endDate,
							}),
						});

						if (oooData?.data?.dates) {
							const notices: DayNotices = {};

							for (const entry of oooData.data.dates) {
								if (!entry.note) continue;

								const key = entry.date;

								if (!notices[key]) {
									notices[key] = [];
								}

								notices[key].push({
									type: 'ooo',
									reason: entry.reason,
									note: entry.note,
								});
							}

							setDayNotices(notices);
						}
					} catch {
						// OOO dates are non-critical — don't block the calendar.
					}
				}
			} finally {
				setAvailabilityLoading(false);
			}
		}

		fetchAvailability();
	}, [viewingMonth, attributes.trimUnavailable]);

	const onSubmit = async () => {
		if (!formData.datetime) {
			setFormError(__('Please select a date and time', 'wpappointments'));
			return;
		}

		const customer: Pick<Customer, 'name' | 'email' | 'phone'> = {
			name: `${formData.firstName} ${formData.lastName}`,
			email: formData.email,
			phone: formData.phone,
		};

		const appointmentData = applyFilters(
			'wpappointments.bookingFlow.appointmentData',
			{
				customer,
				date: formData.datetime,
				createAccount: formData.account,
				password: formData.password,
			},
			formData
		);

		doAction('wpappointments.bookingFlow.beforeSubmit', appointmentData);

		const [error, response] = await resolve<Response>(async () => {
			return await apiFetch<Response>({
				path: 'public/appointments',
				method: 'POST',
				data: appointmentData,
			});
		});

		if (error) {
			setFormError(__('Error creating appointment', 'wpappointments'));
			doAction('wpappointments.bookingFlow.submitError', error);
		}

		if (response) {
			if (response.status === 'success') {
				setFormSuccess(true);
				doAction('wpappointments.bookingFlow.submitSuccess', response);
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
		dayNotices,
		calendarWithAvailability,
		availabilityLoading,
		lilius,
		formData,
		setField,
		formError,
		formSuccess,
		onSubmit,
		weekDays,
		buttonHtml,
		goBack,
		setGoBack,
		editorStep,
		isEditor,
	};

	return (
		<SlotFillProvider>
			<BookingFlowContext.Provider value={value}>
				{children}
			</BookingFlowContext.Provider>
		</SlotFillProvider>
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
