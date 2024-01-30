import { createContext, useContext } from 'react';

type StateContextType = {
	resolvableSelectors: Map<string, number>;
	invalidate: (selector: string) => void;
	getSelector: (selector: string) => any;
};

const StateContext = createContext<StateContextType>({} as StateContextType);

export default StateContext;

export function StateContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const resolvableSelectors = new Map<string, any>([
		['getUpcomingAppointments', 0],
		['getAppointments', 0],
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

	return (
		<StateContext.Provider
			value={{ resolvableSelectors, invalidate, getSelector }}
		>
			{children}
		</StateContext.Provider>
	);
}

export function useStateContext() {
	const { resolvableSelectors, invalidate, getSelector } =
		useContext(StateContext);

	return { resolvableSelectors, invalidate, getSelector };
}
