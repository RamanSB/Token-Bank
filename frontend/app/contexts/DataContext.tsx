"use client";
import { Dispatch, ReactNode, SetStateAction, createContext, useEffect, useState } from "react"
import { Chain, ThirdwebClient, createThirdwebClient, getContract } from "thirdweb";
import { useActiveWallet, useActiveWalletChain } from "thirdweb/react";
import { SEPOLIA_TOKEN_BANK_CONTRACT_ADDRESS, TOKEN_BANK_ADDRESS_BY_CHAIN_ID } from "../helper/contract";
import { sepolia } from "thirdweb/chains";

// Define shape of state
export interface DataState {
    isConnected: boolean,
    setIsConnected: Dispatch<SetStateAction<boolean>>,
    activeDeposits: Map<string, { amount: bigint, decimals?: number }>,
    setActiveDeposits: Dispatch<SetStateAction<Map<string, { amount: bigint, decimals?: number }>>>
    contract: any,
    setContract: Dispatch<SetStateAction<any>>,
    client: ThirdwebClient
};

const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string
})

// Create Context
export const DataContext = createContext<DataState>({
    isConnected: false,
    setIsConnected: () => false,
    activeDeposits: new Map<string, { amount: bigint, decimals?: number }>([]),
    setActiveDeposits: () => { },
    contract: undefined,
    setContract: () => { },
    client: client
});

// Create Provider wrapper and return underlying provider with the chidlren...
export type ProviderProps = {
    children: ReactNode
}

const DataContextProvider: React.FC<ProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const [activeDeposits, setActiveDeposits]: [Map<string, { amount: bigint, decimals?: number }>, Dispatch<SetStateAction<Map<string, { amount: bigint, decimals?: number }>>>] = useState(new Map<string, { amount: bigint, decimals?: number }>([]));
    const [contract, setContract] = useState(getContract({ client, chain: sepolia, address: SEPOLIA_TOKEN_BANK_CONTRACT_ADDRESS }));
    const chain: Chain | undefined = useActiveWalletChain();

    useEffect(() => {
        if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
            return;
        }

        const contractOnChain = getContract({ client, chain, address: TOKEN_BANK_ADDRESS_BY_CHAIN_ID.get(chain.id) as string });
        setContract(contractOnChain);
    }, [chain?.id, chain])

    return <DataContext.Provider value={{ activeDeposits, setActiveDeposits, isConnected, setIsConnected, contract, setContract, client }}>
        {children}
    </DataContext.Provider>
};

export default DataContextProvider;