"use client"
import { getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';


export const client = new SuiJsonRpcClient({
	url: getFullnodeUrl('testnet'),
	network: 'testnet',
}).$extend(walrus());