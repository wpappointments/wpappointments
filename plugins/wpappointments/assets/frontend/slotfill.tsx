import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
	Fragment,
	type ReactNode,
} from 'react';

type FillEntry = { id: number; content: ReactNode };
type SlotFillRegistry = Record<string, FillEntry[]>;

type SlotFillContextValue = {
	fills: SlotFillRegistry;
	registerFill: (name: string, fillId: number, content: ReactNode) => void;
	unregisterFill: (name: string, fillId: number) => void;
};

const SlotFillContext = createContext<SlotFillContextValue>({
	fills: {},
	registerFill: () => {},
	unregisterFill: () => {},
});

let nextFillId = 0;

export function SlotFillProvider({ children }: { children: ReactNode }) {
	const [fills, setFills] = useState<SlotFillRegistry>({});

	const registerFill = useCallback(
		(name: string, fillId: number, content: ReactNode) => {
			setFills((prev) => {
				const slot = prev[name] || [];
				const idx = slot.findIndex((e) => e.id === fillId);
				const next =
					idx >= 0
						? slot.map((e) =>
								e.id === fillId ? { id: fillId, content } : e
							)
						: [...slot, { id: fillId, content }];
				return { ...prev, [name]: next };
			});
		},
		[]
	);

	const unregisterFill = useCallback((name: string, fillId: number) => {
		setFills((prev) => {
			const slot = prev[name] || [];
			return { ...prev, [name]: slot.filter((e) => e.id !== fillId) };
		});
	}, []);

	return (
		<SlotFillContext.Provider
			value={{ fills, registerFill, unregisterFill }}
		>
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
		return (
			<>
				{slotFills.map((entry) => (
					<Fragment key={entry.id}>{entry.content}</Fragment>
				))}
			</>
		);
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
	const { registerFill, unregisterFill } = useContext(SlotFillContext);
	const idRef = useRef(nextFillId++);

	useEffect(() => {
		registerFill(name, idRef.current, children);
	}, [name, children, registerFill]);

	useEffect(() => {
		const id = idRef.current;
		return () => unregisterFill(name, id);
	}, [name, unregisterFill]);

	return null;
}
