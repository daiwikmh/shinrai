"use client";

import { http, WagmiProvider, createConfig } from 'wagmi'
import { mantleSepoliaTestnet} from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'



export const connectors = [metaMask()];

export const wagmiConfig = createConfig({
    chains:[mantleSepoliaTestnet],
    connectors,
    multiInjectedProviderDiscovery:false,
    ssr:true,
    transports: {
        [mantleSepoliaTestnet.id]: http(),
    },
}); 


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={wagmiConfig}>
            {children}
        </WagmiProvider>
    );
};