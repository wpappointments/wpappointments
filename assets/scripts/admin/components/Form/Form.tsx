import { form } from './Form.module.css';

type Props = {
	children: React.ReactNode;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function Form({ children, onSubmit }: Props) {
	return (
		<form className={form} onSubmit={onSubmit}>
			{children}
		</form>
	);
}
