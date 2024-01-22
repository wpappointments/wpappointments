import {
	FieldValues,
	FormProvider,
	useForm,
	useFormContext,
} from 'react-hook-form';

type Props<TFields> = {
	children: React.ReactNode;
	onSubmit?: (formData: TFields) => Promise<void>;
	className?: string;
};

type FormProps = {
	children: React.ReactNode;
};

export default function Form({ children }: FormProps) {
	const methods = useForm();

	return <FormProvider {...methods}>{children}</FormProvider>;
}

export function HtmlForm<TFields extends FieldValues>({
	onSubmit,
	children,
	className,
}: Props<TFields>) {
	const { handleSubmit } = useFormContext();

	return (
		<form
			className={className}
			onSubmit={onSubmit && handleSubmit(onSubmit)}
		>
			{children}
		</form>
	);
}

export function withForm<TFields extends FieldValues>(
	Component: (props: TFields) => JSX.Element
) {
	return function FormWrapper(props: TFields) {
		return (
			<Form>
				<Component {...props} />
			</Form>
		);
	};
}
