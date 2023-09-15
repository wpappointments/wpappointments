import { useForm } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import apiFetch from '../../../../utils/fetch';
import { store } from '../../../../../redux/store';
import Input from '../../../components/FormField/Input/Input';

type Fields = {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	companyName: string;
};

export default function GeneralSettings() {
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm< Fields >();

	const dispatch = useDispatch( store );

	useSelect( () => {
		const appStore = select( store );
		const settings = appStore.getSettings( 'general' );

		if ( 'firstName' in settings ) {
			const { firstName, lastName, phoneNumber } = settings;

			setValue( 'firstName', firstName );
			setValue( 'lastName', lastName );
			setValue( 'phoneNumber', phoneNumber );
		}

		return settings;
	}, [] );

	const onSubmit = async ( data: Fields ) => {
		await apiFetch( {
			path: 'settings/general',
			method: 'PATCH',
			data,
		} );

		dispatch.setPluginSettings( { general: data } );
	};

	return (
		<div className="settings-page-content">
			<h2>Profile and company details</h2>
			<hr />
			<br />
			<form onSubmit={ handleSubmit( onSubmit ) }>
				<Input
					control={ control }
					errors={ errors }
					name="firstName"
					label="First name"
					placeholder="Eg. John"
					rules={ {
						required: true,
					} }
				/>

				<Input
					control={ control }
					errors={ errors }
					name="lastName"
					label="Last name"
					placeholder="Eg. Doe"
					rules={ {
						required: true,
					} }
				/>

				<Input
					control={ control }
					errors={ errors }
					name="phoneNumber"
					label="Phone number"
					placeholder="Eg. +1992334211"
				/>

				<div className="wpappointments-form-actions">
					<Button type="submit" variant="primary">
						Save changes
					</Button>
				</div>
			</form>
		</div>
	);
}
