export type SettingsState = {
	general: SettingsGeneral;
	schedule: SettingsSchedule;
	appointments: SettingsAppointments;
	calendar: SettingsCalendar;
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
	firstName: string;
	lastName: string;
	phoneNumber: string;
	companyName: string;
	clockType: 12 | 24;
};

export type SettingsAppointments = {
	defaultLength?: number;
	timePickerPrecision?: number;
};

export type Day = keyof SettingsState['schedule'];

export type OpeningHoursSlot = {
	start: {
		hour: string;
		minute: string;
	};
	end: {
		hour: string;
		minute: string;
	};
};

export type DayOpeningHours = {
	day: Day;
	enabled: boolean;
	slots: {
		list: OpeningHoursSlot[];
	};
};

export type SettingsCalendar = {};
