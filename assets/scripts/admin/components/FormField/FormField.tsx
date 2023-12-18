import { field } from './FormField.module.css';

type Props = {
	children: React.ReactNode;
};

export default function FormField({ children }: Props) {
	return <div className={field}>{children}</div>;
}
