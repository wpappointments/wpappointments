export type SettingsState = {
	general: SettingsGeneral;
	schedule: SettingsSchedule;
	appointments: SettingsAppointments;
	calendar: SettingsCalendar;
	notifications: Partial<SettingsNotifications>;
};

export type SettingsSchedule = {
	monday: DayOpeningHours;
	tuesday: DayOpeningHours;
	wednesday: DayOpeningHours;
	thursday: DayOpeningHours;
	friday: DayOpeningHours;
	saturday: DayOpeningHours;
	sunday: DayOpeningHours;
};

export type SettingsGeneral = {
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	companyName?: string;
	clockType?: '12' | '24';
	startOfWeek?: number;
	timezoneSiteDefault?: boolean;
	timezone?: string;
	dateFormat?: string;
	customDateFormat?: string;
	timeFormat?: string;
	customTimeFormat?: string;
};

export type SettingsAppointments = {
	defaultStatus: 'confirmed' | 'pending';
	defaultLength?: number;
	timePickerPrecision?: number;
	serviceId?: number;
	serviceName?: string;
	defaultBufferBefore?: number;
	defaultBufferAfter?: number;
};

export type Day = keyof SettingsSchedule;

export type OpeningHoursSlot = {
	start: {
		hour: string | null;
		minute: string | null;
	};
	end: {
		hour: string | null;
		minute: string | null;
	};
};

export type DayOpeningHours = {
	day: Day;
	enabled: boolean;
	allDay: boolean;
	slots: {
		list: OpeningHoursSlot[];
	};
};

export type SettingsCalendar = any;

export type NotificationEvent = {
	enabled: boolean;
	sendToAdmin: boolean;
	sendToCustomer: boolean;
	customRecipients: string;
	subject: string;
	body: string;
};

export type SettingsNotifications = {
	created: NotificationEvent;
	updated: NotificationEvent;
	confirmed: NotificationEvent;
	cancelled: NotificationEvent;
};
