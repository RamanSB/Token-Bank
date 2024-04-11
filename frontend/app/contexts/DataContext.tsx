import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react"

// Define shape of state
export interface DataState {
    isConnected: boolean,
    setIsConnected: Dispatch<SetStateAction<boolean>>,
    activeDeposits: Map<string, number>,
    setActiveDeposits: Dispatch<SetStateAction<Map<string, number>>>
};


// Create Context
export const DataContext = createContext<DataState>({
    isConnected: false,
    setIsConnected: () => false,
    activeDeposits: new Map<string, number>([]),
    setActiveDeposits: () => { },
});

// Create Provider wrapper and return underlying provider with the chidlren...
export type ProviderProps = {
    children: ReactNode
}

const DataContextProvider: React.FC<ProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const [activeDeposits, setActiveDeposits]: [Map<string, number>, Dispatch<SetStateAction<Map<string, number>>>] = useState(new Map<string, number>([]));
    return <DataContext.Provider value={{ activeDeposits, setActiveDeposits, isConnected, setIsConnected }}>
        {children}
    </DataContext.Provider>
};

export default DataContextProvider;