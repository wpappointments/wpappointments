import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	type ReactNode,
} from 'react';

type SlotFillRegistry = Record<string, ReactNode[]>;

type SlotFillContextValue = {
	fills: SlotFillRegistry;
	registerFill: (name: string, content: ReactNode) => () => void;
};

const SlotFillContext = createContext<SlotFillContextValue>({
	fills: {},
	registerFill: () => () => {},
});

export function SlotFillProvider({ children }: { children: ReactNode }) {
	const [fills, setFills] = useState<SlotFillRegistry>({});

	const registerFill = useCallback((name: string, content: ReactNode) => {
		setFills((prev) => ({
			...prev,
			[name]: [...(prev[name] || []), content],
		}));

		return () => {
			setFills((prev) => {
				const slot = prev[name] || [];
				const next = slot.filter((c) => c !== content);
				return { ...prev, [name]: next };
			});
		};
	}, []);

	return (
		<SlotFillContext.Provider value={{ fills, registerFill }}>
			{children}
		</SlotFillContext.Provider>
	);
}

export function Slot({
	name,
	children: fallback,
}: {
	name: string;
	children?: ReactNode;
}) {
	const { fills } = useContext(SlotFillContext);
	const slotFills = fills[name];

	if (slotFills && slotFills.length > 0) {
		return <>{slotFills}</>;
	}

	return <>{fallback}</>;
}

export function Fill({
	name,
	children,
}: {
	name: string;
	children: ReactNode;
}) {
	const { registerFill } = useContext(SlotFillContext);

	useEffect(() => {
		return registerFill(name, children);
	}, [name, children, registerFill]);

	return null;
}
