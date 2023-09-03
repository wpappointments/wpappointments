import { createRoot } from 'react-dom/client';

export function render( elements: Map< string, React.JSX.Element > ): void {
	const domElement = document.getElementById( 'wpappointments-admin' );

	if ( ! domElement ) {
		throw new Error(
			'Could not find element with id "wpappointments-admin"'
		);
	}

	const page = domElement.dataset.page;

	if ( ! page ) {
		throw new Error( 'Could not find page name (data-page="page-id")' );
	}

	const component = elements.get( page );

	if ( ! component ) {
		throw new Error( `Could not find component for page "${ page }"` );
	}

	createRoot( domElement ).render( component );
}
