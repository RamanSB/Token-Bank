"use client";
import "react";
import { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";


/**
 * May not need this as per the documentation:
 * ThirdwebProvider is a light-weight component that sets up React Query context for thirdweb SDK hooks.
 */

type ProviderProps = {
    children: ReactNode;
}

const Providers: React.FC<ProviderProps> = ({children}) => {
    return (
        <ThirdwebProvider>
            {children}  
        </ThirdwebProvider>
    )
}


export default Providers;
  
  
  
  
  