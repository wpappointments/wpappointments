import { FormEventHandler, useRef } from 'react';
import {
	FieldValues,
	FormProvider as RHFProvider,
	SubmitHandler,
	useForm,
	useFormContext,
} from 'react-hook-form';

export type HtmlFormProps<TFields extends FieldValues> = {
	children: React.ReactNode;
	onSubmit?: SubmitHandler<TFields>;
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
	const formRef = useRef<HTMLFormElement>(null);

	const submitForm: FormEventHandler<HTMLFormElement> = (event) => {
		if (!onSubmit) {
			return;
		}

		if (formRef.current?.isSameNode(event.target as HTMLFormElement)) {
			event?.stopPropagation();
			event?.preventDefault();
		}

		handleSubmit(onSubmit)(event);
	};

	return (
		<form ref={formRef} className={className} onSubmit={submitForm}>
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
	Component: (props: TFields) => JSX.Element | null
) {
	return function FormWrapper(props: TFields) {
		return (
			<FormProvider>
				<Component {...props} />
			</FormProvider>
		);
	};
}
