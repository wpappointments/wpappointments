import type { ReactNode, CSSProperties } from 'react';
import { CardBody as WpCardBody } from '@wordpress/components';
import styles from './CardBody.module.css';

type Props = {
	style?: CSSProperties;
	children: ReactNode;
};

export default function CardBody({ style, children }: Props) {
	return (
		<WpCardBody className={styles.cardBody} style={style}>
			{children}
		</WpCardBody>
	);
}
