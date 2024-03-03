import { Button } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { useSchedule } from '~/backend/hooks/useSchedule';
import { store } from '~/backend/store/store';
import OpeningHoursDayOfWeek from '../../Settings/Schedule/OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import styles from '../OnboardingWizard.module.css';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';

type Fields = {
	defaultLength: number;
	timePickerPrecision: number;
	serviceName: string;
};

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

function ScheduleSettings({ onSuccess }: { onSuccess: () => void }) {
	const dispatch = useDispatch(store);

	const settings = useSelect(() => {
		return select(store).getScheduleSettings();
	}, []);

	useFillFormValues(settings);

	const onSubmit = async (data: Fields) => {
		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'settings/schedule',
				method: 'PATCH',
				data,
			});

			return response;
		});

		if (error) {
			// displayErrorToast(error?.message);
			return;
		}

		if (response === null) {
			// displayErrorToast('Error saving settings');
			return;
		}

		if (response.data.message) {
			dispatch.setPluginSettings({ appointments: data });
      onSuccess();
		}
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			<FormFields />
		</HtmlForm>
	);
}

function FormFields() {
  const { schedule, timePickerPrecision } = useSchedule();

	return (
		<div>
      <div style={{ marginBottom: 25 }}>
        {Object.values(schedule).map((daySettings, index) => (
          <OpeningHoursDayOfWeek
            key={daySettings.day}
            showCopyToAllDays={index === 0}
            values={daySettings}
            timePickerPrecision={timePickerPrecision}
          />
        ))}
      </div>
			<Button className={styles.stepButton} type="submit" variant="primary">
				{__('Continue', 'wpappointments')}
			</Button>
		</div>
	);
}

export default withForm(ScheduleSettings);