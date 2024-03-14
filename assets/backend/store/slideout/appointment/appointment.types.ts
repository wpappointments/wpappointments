import { Customer } from '~/backend/types';


export type AppointmentSlideoutState = {
	curentMonth: MonthIndex;
	currentYear: number;
	selectedCustomer: Customer | null;
};

export type Month =
	| 'January'
	| 'February'
	| 'March'
	| 'April'
	| 'May'
	| 'June'
	| 'July'
	| 'August'
	| 'September'
	| 'October'
	| 'November'
	| 'December';
export type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type Year = number;
export type Day = number;
