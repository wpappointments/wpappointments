import styles from './DataViews.module.css';
import DataViewsBody from './DataViewsBody';
import DataViewsFooter from './DataViewsFooter';
import DataViewsHeader from './DataViewsHeader';
import { CollectionItem, View, Field, Action, PaginationInfo } from './types';

export type DataViewsProps = {
	view: View;
	onChangeView: (view: View) => void;
	fields: Field[];
	actions: Action[];
	data: CollectionItem[];
	paginationInfo: PaginationInfo;
};

export function DataViews({
	view,
	onChangeView,
	fields,
	actions,
	data,
	paginationInfo,
}: DataViewsProps) {
	return (
		<table className={styles.dataViews}>
			<DataViewsHeader fields={fields} />
			<DataViewsBody fields={fields} data={data} actions={actions} />
			<DataViewsFooter
				view={view}
				onChangeView={onChangeView}
				fields={fields}
				paginationInfo={paginationInfo}
			/>
		</table>
	);
}
