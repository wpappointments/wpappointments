import {
	FieldValues,
	FormProvider as RHFProvider,
	useForm,
	useFormContext,
} from 'react-hook-form';

export type HtmlFormProps<TFields> = {
	children: React.ReactNode;
	onSubmit?: (formData: TFields) => Promise<void>;
	className?: string;
};

export type FormProviderProps = {
	children: React.ReactNode;
};

export function HtmlForm<TFields extends FieldValues>({
	onSubmit,
	children,
	className,
}: HtmlFormProps<TFields>) {
	const { handleSubmit } = useFormContext<TFields>();

	return (
		<form
			className={className}
			onSubmit={onSubmit && handleSubmit(onSubmit)}
		>
			{children}
		</form>
	);
}

export function FormProvider({ children }: FormProviderProps) {
	// TODO: Add a type for the form fields (generic)
	const methods = useForm();

	return <RHFProvider {...methods}>{children}</RHFProvider>;
}

export function withForm<TFields extends FieldValues>(
	Component: (props: TFields) => JSX.Element
) {
	return function FormWrapper(props: TFields) {
		return (
			<FormProvider>
				<Component {...props} />
			</FormProvider>
		);
	};
}
