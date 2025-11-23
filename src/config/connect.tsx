import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';

// Create extended SuiClient with walrus capabilities for browser wallet usage
export const client = new SuiClient({
	url: getFullnodeUrl('testnet'),
}).$extend(
	walrus({
		network: 'testnet',
	})
);