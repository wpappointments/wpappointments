import { formFieldStyles } from '../FormField/FormField';

export default function FieldMessages({
	error,
	help,
}: {
	error?: string | false;
	help?: string;
}) {
	if (!error && !help) return null;

	return (
		<>
			{help && (
				<p
					className={`${formFieldStyles.fieldMessage} ${formFieldStyles.fieldHelp}`}
				>
					{help}
				</p>
			)}
			{error && (
				<p
					className={`${formFieldStyles.fieldMessage} ${formFieldStyles.fieldError}`}
				>
					{error}
				</p>
			)}
		</>
	);
}
