import cn from 'obj-str';
import styles from './FormFieldSet.module.css';

type Props = {
	children: React.ReactNode;
	name?: string;
	legend?: string;
	horizontal?: boolean;
	horizontalCenter?: boolean;
	fieldsClassName?: string;
} & React.HTMLAttributes<HTMLFieldSetElement>;

export default function FormFieldSet({
	children,
	name,
	legend,
	horizontal = false,
	horizontalCenter = false,
	fieldsClassName,
	className,
	...rest
}: Props) {
	return (
		<fieldset
			name={name}
			className={[
				cn({
					[styles.fieldset]: true,
					[styles.fieldsetHorizontal]: horizontal,
					[styles.fieldsetHorizontalCenter]: horizontalCenter,
					[styles.fieldsetHasLegend]: !!legend,
					[styles.fieldsetFill]: true,
				}),
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...rest}
		>
			{legend && <legend>{legend}</legend>}
			<div
				className={[styles.fields, fieldsClassName]
					.filter(Boolean)
					.join(' ')}
			>
				{children}
			</div>
		</fieldset>
	);
}
