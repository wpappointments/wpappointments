import { useCallback, useMemo } from 'react';
import { produce } from 'immer';
import { Button, Dashicon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import Toggle from '../../../../components/FormField/Toggle/Toggle';
import Number from '../../../../components/FormField/Number/Number';
import { DayOpeningHours, store } from '../../../../../../redux/store';
import styles from './OpeningHoursDayOfWeek.module.css';

export default function OpeningHoursDayOfWeek( {
	values,
	showCopyToAllDays = false,
	control,
	errors,
}: {
	values: DayOpeningHours;
	showCopyToAllDays?: boolean;
	control: any;
	errors: any;
} ) {
	const {
		updateWorkingHours,
		addWorkingHoursSlot,
		removeWorkingHoursSlot,
		copyWorkingHoursToAllDays,
	} = useDispatch( store );

	const {
		day,
		enabled,
		slots: { list: slots },
	} = values;

	const updateWorkingHoursTime = useCallback(
		( {
			values,
			value,
			index,
		}: {
			values: DayOpeningHours;
			value: string;
			index: number;
		} ) => {
			updateWorkingHours(
				produce( values, ( draft ) => {
					if ( ! value ) {
						return;
					}

					draft.slots.list[ index ].start.hour = value;
				} )
			);
		},
		[ updateWorkingHours ]
	);

	const slotTimePicker = useMemo( () => {
		return slots.map( ( slot, index ) => (
			<div
				key={ `${ index }-${ day }-${ slot.start.hour }-${ slot.start.minute }-${ slot.end.hour }-${ slot.end.minute }` }
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: '10px',
					marginBottom: '10px',
				} }
			>
				<div className="wpappointments-time-picker">
					<span className="wpappointments-time-picker__label">
						from
					</span>
					<Number
						control={ control }
						errors={ errors }
						key={ `${ day }.slots.list.${ index }.start.hour` }
						name={ `${ day }.slots.list.${ index }.start.hour` }
						placeholder="00"
						min={ 0 }
						max={ 23 }
						spinControls="none"
						disabled={ ! enabled }
						onChange={ ( value ) => {
							if ( ! value ) {
								return;
							}

							updateWorkingHoursTime( {
								values,
								value,
								index,
							} );
						} }
					/>
					<span className="wpappointments-time-picker__separator">
						:
					</span>
					<Number
						control={ control }
						errors={ errors }
						key={ `${ day }.slots.list.${ index }.start.minute` }
						name={ `${ day }.slots.list.${ index }.start.minute` }
						placeholder="00"
						min={ 0 }
						max={ 59 }
						spinControls="none"
						disabled={ ! enabled }
					/>
				</div>
				<div className="wpappointments-time-picker">
					<span className="wpappointments-time-picker__label">
						to
					</span>
					<Number
						control={ control }
						errors={ errors }
						name={ `${ day }.slots.list.${ index }.end.hour` }
						placeholder="00"
						min={ 0 }
						max={ 23 }
						spinControls="none"
						disabled={ ! enabled }
					/>
					<span className="wpappointments-time-picker__separator">
						:
					</span>
					<Number
						control={ control }
						errors={ errors }
						name={ `${ day }.slots.list.${ index }.end.minute` }
						placeholder="00"
						min={ 0 }
						max={ 59 }
						spinControls="none"
						disabled={ ! enabled }
					/>
				</div>
				{ enabled && index > 0 && (
					<Button
						type="submit"
						size="small"
						variant="tertiary"
						isDestructive={ true }
						onClick={ () => {
							removeWorkingHoursSlot( day, index );
						} }
					>
						<Dashicon icon="remove" size={ 14 } />
					</Button>
				) }
				{ enabled && index === slots.length - 1 && (
					<Button
						type="submit"
						size="small"
						variant="tertiary"
						onClick={ () => {
							addWorkingHoursSlot( day );
						} }
					>
						<Dashicon icon="plus-alt" size={ 15 } />
					</Button>
				) }
			</div>
		) );
	}, [ slots.length, enabled ] );

	return (
		<div className="wpappointments-form-field-group wpappointments-form-field-group--row">
			<div className={ styles.day_label }>
				<span>{ day }:</span>
				<Toggle
					control={ control }
					errors={ errors }
					name={ `${ day }.enabled` }
					onChange={ ( enabled ) => {
						updateWorkingHours( {
							...values,
							enabled,
						} );
					} }
				/>
			</div>
			<div>
				{ slots && slotTimePicker }
				{ showCopyToAllDays && (
					<Button
						type="submit"
						size="small"
						variant="tertiary"
						className={ styles.copy_to_all_days }
						onClick={ () => {
							copyWorkingHoursToAllDays( values );
						} }
					>
						Copy to all days
					</Button>
				) }
			</div>
		</div>
	);
}
