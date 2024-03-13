import {
	Icon,
	info,
	edit,
	cancelCircleFilled,
	check,
	trash,
} from '@wordpress/icons';

const colors = {
	primary: '#2e7cb7',
	positive: '#6ac33d',
	negative: '#be3422',
};

export function Info() {
	return <Icon icon={info} color={colors.primary} />;
}

export function Edit() {
	return <Icon icon={edit} color={colors.primary} />;
}

export function Cancel() {
	return <Icon icon={cancelCircleFilled} color={colors.negative} />;
}

export function Confirm() {
	return <Icon icon={check} color={colors.positive} />;
}

export function Delete() {
	return <Icon icon={trash} color={colors.negative} />;
}
