import { applyFilters } from '~/backend/utils/hooks';
import BookingFlowMultiStep from './BookingFlowMultStep/BookingFlowMultiStep';
import BookingFlowSingleStep from './BookingFlowSingleStep/BookingFlowSingleStep';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlow() {
	const { attributes } = useBookingFlowContext();
	const { flowType } = attributes;

	const FlowComponent = applyFilters<React.ComponentType>(
		'wpappointments.bookingFlow.component',
		flowType === 'OneStep' ? BookingFlowSingleStep : BookingFlowMultiStep,
		flowType,
		attributes
	);

	return <FlowComponent />;
}
