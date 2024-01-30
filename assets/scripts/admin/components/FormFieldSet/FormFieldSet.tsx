import cn from '~/utils/cn';
import {
	fields,
	fieldset,
	fieldsetFill,
	fieldsetHasLegend,
	fieldsetHorizontal,
	fieldsetHorizontalCenter,
} from './FormFieldSet.module.css';

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
				[fieldset]: true,
				[fieldsetHorizontal]: horizontal,
				[fieldsetHorizontalCenter]: horizontalCenter,
				[fieldsetHasLegend]: !!legend,
				[fieldsetFill]: true,
			})}
			name={name}
			{...rest}
		>
			{legend && <legend>{legend}</legend>}
			<div className={fields}>{children}</div>
		</fieldset>
	);
}
