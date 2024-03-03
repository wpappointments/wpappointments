import { useSelect, select } from "@wordpress/data";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ScheduleFormFields } from "../admin/pages/Settings/Schedule/Schedule";
import { store } from "../store/store";


export function useSchedule() {
  const { setValue } = useFormContext<ScheduleFormFields>();

  const settings = useSelect(() => {
		return select(store).getAllSettings();
  }, []);

  const { schedule, appointments } = settings;
  const { timePickerPrecision } = appointments;

  useEffect(() => {
		const days = Object.keys(schedule) as Array<keyof typeof schedule>;

		for (const day of days) {
			const daySchedule = schedule[day];
			const slotList = daySchedule.slots.list;

			for (let i = 0; i < (slotList?.length || 0); i++) {
				setValue(`${day}.day`, day);
				setValue(`${day}.enabled`, daySchedule.enabled ?? false);
			}
		}
  }, [schedule]);

  return {
    schedule,
    timePickerPrecision,
    setValue
  }
}