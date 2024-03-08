import { CardBody as WpCardBody } from '@wordpress/components';
import styles from './CardBody.module.css';

type Props = {
	children: React.ReactNode;
};

export default function CardBody({ children }: Props) {
	return <WpCardBody className={styles.cardBody}>{children}</WpCardBody>;
}
