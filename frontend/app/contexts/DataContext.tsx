"use client";
import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react"
import { ThirdwebClient, createThirdwebClient } from "thirdweb";

// Define shape of state
export interface DataState {
    isConnected: boolean,
    setIsConnected: Dispatch<SetStateAction<boolean>>,
    activeDeposits: Map<string, { amount: bigint, decimals?: number }>,
    setActiveDeposits: Dispatch<SetStateAction<Map<string, { amount: bigint, decimals?: number }>>>
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
    client: client
});

// Create Provider wrapper and return underlying provider with the chidlren...
export type ProviderProps = {
    children: ReactNode
}

const DataContextProvider: React.FC<ProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const [activeDeposits, setActiveDeposits]: [Map<string, { amount: bigint, decimals?: number }>, Dispatch<SetStateAction<Map<string, { amount: bigint, decimals?: number }>>>] = useState(new Map<string, { amount: bigint, decimals?: number }>([]));
    // TODO: Detect when connected
    return <DataContext.Provider value={{ activeDeposits, setActiveDeposits, isConnected, setIsConnected, client }}>
        {children}
    </DataContext.Provider>
};

export default DataContextProvider;