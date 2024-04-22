import {
	__experimentalHStack as HStack,
	Button,
	SelectControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _x, sprintf } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import type { Field, PaginationInfo, View } from './types';

type DataViewFooterProps = {
	view: View;
	onChangeView: (view: View) => void;
	fields: Field[];
	paginationInfo: PaginationInfo;
};

export default function DataViewFooterProps({
	view,
	onChangeView,
	fields,
	paginationInfo,
}: DataViewFooterProps) {
	if (!paginationInfo) {
		return null;
	}

	const { totalPages } = paginationInfo;

	if (totalPages === 1) {
		return null;
	}

	return (
		<tfoot>
			<tr>
				<td colSpan={fields.length + 1}>
					<HStack>
						<HStack expanded={false} spacing={1}>
							<label htmlFor="posts-per-page">
								{__('Items per page', 'wpappointments')}
							</label>
							<select
								id="posts-per-page"
								onChange={(event) => {
									onChangeView({
										...view,
										page: 1,
										perPage: +event.target.value,
									});
								}}
							>
								<option value="10">10</option>
								<option value="20">20</option>
								<option value="30">30</option>
								<option value="50">50</option>
								<option value="100">100</option>
							</select>
						</HStack>
						{paginationInfo && (
							<HStack expanded={false} spacing={6} justify="end">
								<HStack
									justify="flex-start"
									expanded={false}
									spacing={2}
								>
									{createInterpolateElement(
										sprintf(
											// translators: %s: Total number of pages.
											_x(
												'Page <CurrenPageControl /> of %s',
												'paging'
											),
											totalPages
										),
										{
											CurrenPageControl: (
												<SelectControl
													aria-label={__(
														'Current page'
													)}
													value={view.page.toString()}
													options={Array.from(
														Array(totalPages)
													).map((_, i) => {
														const page = i + 1;
														return {
															value: page.toString(),
															label: page.toString(),
														};
													})}
													onChange={(newValue) => {
														onChangeView({
															...view,
															page: +newValue,
														});
													}}
													size={'compact'}
													__nextHasNoMarginBottom
												/>
											),
										}
									)}
								</HStack>
								<HStack expanded={false} spacing={1}>
									<Button
										onClick={() =>
											onChangeView({
												...view,
												page: view.page - 1,
											})
										}
										disabled={view.page === 1}
										__experimentalIsFocusable
										label={__(
											'Previous page',
											'wpappointments'
										)}
										icon={chevronLeft}
										showTooltip
										size="compact"
										tooltipPosition="top"
									/>
									<Button
										onClick={() =>
											onChangeView({
												...view,
												page: view.page + 1,
											})
										}
										disabled={view.page >= totalPages}
										__experimentalIsFocusable
										label={__(
											'Next page',
											'wpappointments'
										)}
										icon={chevronRight}
										showTooltip
										size="compact"
										tooltipPosition="top"
									/>
								</HStack>
							</HStack>
						)}
					</HStack>
				</td>
			</tr>
		</tfoot>
	);
}
