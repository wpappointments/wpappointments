import { __ } from '@wordpress/i18n';

// Unique translatable strings — scanned by wp i18n make-pot.
// prettier-ignore
// @ts-ignore: intentionally unused, exists for string extraction only
const translations = [ // eslint-disable-line @typescript-eslint/no-unused-vars
	__('All Saints\' Day', 'wpappointments'),
	__('Armistice Day', 'wpappointments'),
	__('Ascension Day', 'wpappointments'),
	__('Ash Wednesday', 'wpappointments'),
	__('Assumption of Mary', 'wpappointments'),
	__('Bastille Day', 'wpappointments'),
	__('Boxing Day', 'wpappointments'),
	__('Christian Holidays', 'wpappointments'),
	__('Christmas Eve', 'wpappointments'),
	__('Christmas Day', 'wpappointments'),
	__('Columbus Day', 'wpappointments'),
	__('Constitution Day', 'wpappointments'),
	__('Corpus Christi', 'wpappointments'),
	__('Early May Bank Holiday', 'wpappointments'),
	__('Easter Monday', 'wpappointments'),
	__('Easter Sunday', 'wpappointments'),
	__('Epiphany', 'wpappointments'),
	__('France', 'wpappointments'),
	__('German Unity Day', 'wpappointments'),
	__('Germany', 'wpappointments'),
	__('Good Friday', 'wpappointments'),
	__('Independence Day', 'wpappointments'),
	__('Juneteenth', 'wpappointments'),
	__('Labor Day', 'wpappointments'),
	__('Labour Day', 'wpappointments'),
	__('Martin Luther King Jr. Day', 'wpappointments'),
	__('Memorial Day', 'wpappointments'),
	__('New Year\'s Day', 'wpappointments'),
	__('Palm Sunday', 'wpappointments'),
	__('Pentecost', 'wpappointments'),
	__('Poland', 'wpappointments'),
	__('Presidents\' Day', 'wpappointments'),
	__('Second Day of Christmas', 'wpappointments'),
	__('Spring Bank Holiday', 'wpappointments'),
	__('Summer Bank Holiday', 'wpappointments'),
	__('Thanksgiving', 'wpappointments'),
	__('United Kingdom', 'wpappointments'),
	__('United States', 'wpappointments'),
	__('Veterans Day', 'wpappointments'),
	__('Victory in Europe Day', 'wpappointments'),
	__('Whit Monday', 'wpappointments'),
];

const holidayNames: Record<string, string> = {
	newYear: "New Year's Day",
	epiphany: 'Epiphany',
	mlkDay: 'Martin Luther King Jr. Day',
	presidentsDay: "Presidents' Day",
	ashWednesday: 'Ash Wednesday',
	palmSunday: 'Palm Sunday',
	goodFriday: 'Good Friday',
	easter: 'Easter Sunday',
	easterMonday: 'Easter Monday',
	labourDay: 'Labour Day',
	constitutionPL: 'Constitution Day',
	earlyMayBank: 'Early May Bank Holiday',
	victoryEurope: 'Victory in Europe Day',
	springBank: 'Spring Bank Holiday',
	memorialDay: 'Memorial Day',
	ascension: 'Ascension Day',
	juneteenth: 'Juneteenth',
	pentecost: 'Pentecost',
	whitMonday: 'Whit Monday',
	corpusChristi: 'Corpus Christi',
	independenceDayUS: 'Independence Day',
	bastilleDay: 'Bastille Day',
	assumptionOfMary: 'Assumption of Mary',
	summerBank: 'Summer Bank Holiday',
	laborDayUS: 'Labor Day',
	germanUnity: 'German Unity Day',
	columbusDay: 'Columbus Day',
	allSaints: "All Saints' Day",
	veteransDay: 'Veterans Day',
	independenceDayPL: 'Independence Day',
	armistice: 'Armistice Day',
	thanksgiving: 'Thanksgiving',
	christmas: 'Christmas Day',
	christmasEve: 'Christmas Eve',
	christmas2: 'Second Day of Christmas',
	boxingDay: 'Boxing Day',
};

const groupNames: Record<string, string> = {
	PL: 'Poland',
	US: 'United States',
	GB: 'United Kingdom',
	DE: 'Germany',
	FR: 'France',
	christian: 'Christian Holidays',
};

export function getHolidayName(ref: string): string {
	const name = holidayNames[ref];
	return name ? __(name, 'wpappointments') : ref;
}

export function getGroupName(id: string): string {
	const name = groupNames[id];
	return name ? __(name, 'wpappointments') : id;
}
