import BookingFlowMultiStep from './BookingFlowMultStep/BookingFlowMultiStep';
import BookingFlowSingleStep from './BookingFlowSingleStep/BookingFlowSingleStep';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlow() {
	const { attributes } = useBookingFlowContext();
	const { flowType } = attributes;

	if (flowType === 'OneStep') {
		return <BookingFlowSingleStep />;
	}

	return <BookingFlowMultiStep />;
}
