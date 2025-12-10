import { getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';



export const client = new SuiJsonRpcClient({
	url: getFullnodeUrl('testnet'),
	network: 'testnet',
}).$extend(walrus({
		uploadRelay: {
			host: 'https://upload-relay.testnet.walrus.space',
			sendTip: {
				max: 1_000,
			},
		},
		
		storageNodeClientOptions: {
			timeout: 60_000,
		}
	}
));
