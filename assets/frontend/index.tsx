import { createRoot } from 'react-dom/client';

function Checkout() {
	return 'Tu bydzie czekałt';
}

const el = document.getElementById('wpappointments-checkout');

if (!el) {
	throw new Error('No checkout element found');
}

createRoot(el).render(<Checkout />);
