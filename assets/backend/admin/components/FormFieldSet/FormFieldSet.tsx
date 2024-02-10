import cn from '~/utils/cn';
import styles from './FormFieldSet.module.css';

type Props = {
	children: React.ReactNode;
	name?: string;
	legend?: string;
	horizontal?: boolean;
	horizontalCenter?: boolean;
} & React.HTMLAttributes<HTMLFieldSetElement>;

export default function FormFieldSet({
	children,
	name,
	legend,
	horizontal = false,
	horizontalCenter = false,
	...rest
}: Props) {
	return (
		<fieldset
			className={cn({
				[styles.fieldset]: true,
				[styles.fieldsetHorizontal]: horizontal,
				[styles.fieldsetHorizontalCenter]: horizontalCenter,
				[styles.fieldsetHasLegend]: !!legend,
				[styles.fieldsetFill]: true,
			})}
			name={name}
			{...rest}
		>
			{legend && <legend>{legend}</legend>}
			<div className={styles.fields}>{children}</div>
		</fieldset>
	);
}
