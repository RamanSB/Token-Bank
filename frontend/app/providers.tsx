"use client";
import "react";
import { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import DataContextProvider, { DataContext } from "./contexts/DataContext";


/**
 * May not need this as per the documentation:
 * ThirdwebProvider is a light-weight component that sets up React Query context for thirdweb SDK hooks.
 */

type ProviderProps = {
    children: ReactNode;
    activeChainId?: number
}

const Providers: React.FC<ProviderProps> = ({ children, activeChainId }) => {
    return (
        <ThirdwebProvider >
            <DataContextProvider>
                {children}
            </DataContextProvider>
        </ThirdwebProvider>
    )
}


export default Providers;




