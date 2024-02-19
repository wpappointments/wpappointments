import cn from '~/backend/utils/cn';
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
	...rest
}: Props) {
	const { fieldsClassName, ...restProps } = rest;

	return (
		<fieldset
			name={name}
			className={
				cn({
					[styles.fieldset]: true,
					[styles.fieldsetHorizontal]: horizontal,
					[styles.fieldsetHorizontalCenter]: horizontalCenter,
					[styles.fieldsetHasLegend]: !!legend,
					[styles.fieldsetFill]: true,
				}) +
				' ' +
				rest.className
			}
			{...restProps}
		>
			{legend && <legend>{legend}</legend>}
			<div className={styles.fields + ' ' + rest.fieldsClassName}>
				{children}
			</div>
		</fieldset>
	);
}
