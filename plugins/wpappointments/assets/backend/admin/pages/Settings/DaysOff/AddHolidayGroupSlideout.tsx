import { useState } from 'react';
import { Button, TextControl } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { getGroupName } from '@wpappointments/holidays';
import type { AvailableSet } from '~/backend/store/holidays/holidays.types';
import { store } from '~/backend/store/store';
import styles from './DaysOff.module.css';
import { addHolidayGroup } from '~/backend/api/holidays';

export default function AddHolidayGroupSlideout() {
	const [search, setSearch] = useState('');
	const [addingId, setAddingId] = useState<string | null>(null);

	const { countries, religious, groups } = useSelect(() => {
		return {
			countries: select(store).getAvailableCountries(),
			religious: select(store).getAvailableReligious(),
			groups: select(store).getHolidayGroups(),
		};
	}, []);

	const addedIds = new Set(groups.map((g) => g.id));

	const filteredCountries = countries.filter(
		(c) =>
			getGroupName(c.id).toLowerCase().includes(search.toLowerCase()) &&
			!addedIds.has(`country_${c.id}`)
	);

	const filteredReligious = religious.filter(
		(r) => !addedIds.has(`religious_${r.id}`)
	);

	const handleAdd = async (type: 'country' | 'religious', fileId: string) => {
		setAddingId(`${type}_${fileId}`);
		await addHolidayGroup(type, fileId);
		setAddingId(null);
	};

	return (
		<div className={styles.addSlideoutContent}>
			<div className={styles.addSection}>
				<h3 className={styles.addSectionTitle}>
					{__('Religious holidays', 'wpappointments')}
				</h3>
				<div className={styles.countryList}>
					{filteredReligious.map((set) => (
						<SetItem
							key={set.id}
							set={set}
							adding={addingId === `religious_${set.id}`}
							onAdd={() => handleAdd('religious', set.id)}
						/>
					))}
					{filteredReligious.length === 0 && (
						<p className={styles.noResults}>
							{__(
								'All available religious holidays have been added.',
								'wpappointments'
							)}
						</p>
					)}
				</div>
			</div>

			<div className={styles.addSection}>
				<h3 className={styles.addSectionTitle}>
					{__('Country holidays', 'wpappointments')}
				</h3>
				<TextControl
					__nextHasNoMarginBottom
					placeholder={__('Search countries…', 'wpappointments')}
					value={search}
					onChange={setSearch}
					className={styles.searchInput}
				/>
				<div className={styles.countryList}>
					{filteredCountries.map((country) => (
						<SetItem
							key={country.id}
							set={country}
							adding={addingId === `country_${country.id}`}
							onAdd={() => handleAdd('country', country.id)}
						/>
					))}
					{filteredCountries.length === 0 && (
						<p className={styles.noResults}>
							{search
								? __(
										'No matching countries found.',
										'wpappointments'
									)
								: __(
										'All available countries have been added.',
										'wpappointments'
									)}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

function SetItem({
	set,
	adding,
	onAdd,
}: {
	set: AvailableSet;
	adding: boolean;
	onAdd: () => void;
}) {
	return (
		<div className={styles.countryItem}>
			<span>{getGroupName(set.id)}</span>
			<Button
				variant="secondary"
				size="small"
				onClick={onAdd}
				isBusy={adding}
			>
				{__('Add', 'wpappointments')}
			</Button>
		</div>
	);
}
