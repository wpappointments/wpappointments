import { createContext, useContext } from 'react';


export type StateContext = {
	resolvableSelectors: Map<string, number>;
	invalidate: (selector: string) => void;
	getSelector: (selector: string) => any;
};

export type StateContextProviderProps = {
	children: React.ReactNode;
};

export function StateContextProvider({ children }: StateContextProviderProps) {
	const resolvableSelectors = new Map<string, any>([
		['getUpcomingAppointments', 0],
		['getAppointments', 0],
		['getAvailability', 0],
		['getAllCustomers', 0],
	]);

	const getSelector = (selector: string) => {
		return resolvableSelectors.get(selector);
	};

	const invalidate = (selector: string) => {
		resolvableSelectors.set(
			selector,
			resolvableSelectors.get(selector) + 1
		);
	};

	const value = {
		resolvableSelectors,
		invalidate,
		getSelector,
	};

	return (
		<StateContext.Provider value={value}>{children}</StateContext.Provider>
	);
}

export function useStateContext() {
	return { ...useContext(StateContext) };
}

const StateContext = createContext<StateContext>({} as StateContext);

export default StateContext;
