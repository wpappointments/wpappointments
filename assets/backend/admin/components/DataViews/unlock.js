import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/components/src/private-apis';

export const { lock, unlock } =
	__dangerousOptInToUnstableAPIsOnlyForCoreModules(
		'I know using unstable features means my theme or plugin will inevitably break in the next version of WordPress.',
		'@wordpress/components'
	);
