import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import apiFetch from '../../../../utils/fetch';
import {
	DEFAULT_STATE,
	DayOpeningHours,
	store,
} from '../../../../../redux/store';
import OpeningHoursDayOfWeek from './OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';

type Fields = {
	monday: DayOpeningHours;
	tuesday: DayOpeningHours;
	wednesday: DayOpeningHours;
	thursday: DayOpeningHours;
	friday: DayOpeningHours;
	saturday: DayOpeningHours;
	sunday: DayOpeningHours;
};

export default function ScheduleSettings() {
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm< Fields >( {
		defaultValues: DEFAULT_STATE.settings.schedule,
	} );

	const settings = useSelect( () => {
		const appStore = select( store );
		const settings = appStore.getSettings( 'schedule' );

		if ( 'monday' in settings ) {
			const days = Object.keys( settings ) as Array<
				keyof typeof settings
			>;

			for ( const day of days ) {
				setValue( day, settings[ day ] );
			}

			return settings;
		}

		return settings;
	}, [] );

	console.log( settings );

	// console.log( Object.values( settings ) );

	const onSubmit = async ( data: Fields ) => {
		console.log( data );
		await apiFetch( {
			path: 'settings/schedule',
			method: 'PATCH',
			data,
		} );

		// dispatch.setPluginSettings( { schedule: data } );
	};

	const enableCheckboxes = Object.keys( settings ).map(
		( day: keyof Fields ) => {
			if ( 'monday' in settings ) {
				return settings[ day ];
			}

			return false;
		}
	);

	console.log( Object.values( settings ) );

	const fields = useMemo( () => {
		return Object.values( settings ).map( ( daySettings, index ) => (
			<OpeningHoursDayOfWeek
				key={ daySettings.day }
				showCopyToAllDays={ index === 0 }
				values={ daySettings }
				control={ control }
				errors={ errors }
			/>
		) );
	}, enableCheckboxes );

	return (
		<div className="settings-page-content">
			<h2>Working hours</h2>
			<hr />
			<br />
			<form onSubmit={ handleSubmit( onSubmit ) }>
				{ fields }
				{ /* <OpeningHoursDayOfWeek
					key="monday"
					showCopyToAllDays={ true }
					values={ settings.monday }
					control={ control }
					errors={ errors }
				/> */ }
				{ /* { Object.values( settings ).map( ( daySettings, index ) => (
					<OpeningHoursDayOfWeek
						key={ daySettings.day }
						showCopyToAllDays={ index === 0 }
						values={ daySettings }
						control={ control }
						errors={ errors }
					/>
				) ) } */ }

				<div className="wpappointments-form-actions">
					<Button type="submit" variant="primary">
						Save changes
					</Button>
				</div>
			</form>
		</div>
	);
}
