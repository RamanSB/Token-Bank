"use client";

import "../app/globals.css";

import { DataContext } from "@/app/contexts/DataContext";
import { ApiClient } from "@/app/helper/api";
import { NETWORK_TO_NATIVE_TOKEN, THIRDWEB_CHAIN_ID_TO_ALCHEMY_NETWORK_NAMES, TOKEN_BANK_ADDRESS_BY_CHAIN_ID } from "@/app/helper/contract";
import { TokenData } from "@/app/helper/types";
import DepositItem from "@/components/DepositItem";
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import { Button, List } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { NATIVE_TOKEN_ADDRESS, PreparedTransaction, getContract, prepareContractCall, readContract, resolveMethod, sendAndConfirmTransaction } from "thirdweb";
import { Chain } from "thirdweb/chains";
import { useActiveWallet, useActiveWalletChain } from "thirdweb/react";
import { Account, Wallet } from "thirdweb/wallets";
import styles from "./WithdrawPane.module.css";

/* TODO:
    1) Ensure Decimals are considered when displaying amount of tokens in Withdraw Pane 
    2) Ensure withdraw button opens up modal to withdraw coin, ensure withdrawl works appropriately.
*/
const WithdrawPane = () => {

    const activeWallet: undefined | Wallet = useActiveWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [isWithdrawAllTxnLoading, setIsWithdrawAllTxnLoading] = useState(false);
    const { client, activeDeposits, setActiveDeposits, isConnected, setIsConnected } = useContext(DataContext);
    const [tokenMetadata, setTokenMetadata] = useState<TokenData[]>()
    const apiClient = new ApiClient();


    useEffect(() => {
        const fetchTokenAddressesOfActiveDeposits = async (): Promise<string[] | undefined> => {
            try {
                console.log(`fetchActiveDeposits`);
                if (!activeWallet) {
                    console.log(`No active wallet detected.`);
                    return undefined;
                }
                const chain: Chain | undefined = activeWallet.getChain();
                if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                    return;
                }
                const depositedTokenAddresses = await readContract({
                    contract: getContract({
                        client,
                        chain,
                        address: TOKEN_BANK_ADDRESS_BY_CHAIN_ID.get(chain.id) as string,
                    }), method: resolveMethod("getDepositedTokenAddressesByUser"), params: [activeWallet.getAccount()?.address]
                });
                console.log(`DepositedTokenAddresses: ${JSON.stringify(depositedTokenAddresses)}`);
                return depositedTokenAddresses as string[];
            } catch (error) {
                console.log(`An error occurred whilst fetching active deposit: ${error}`);
            }
        }

        const fetchTokenDataForAddress = async (erc20Address: string): Promise<{ amount: bigint, decimals?: number } | undefined> => {
            try {
                console.log(`fetchTokenBalanceForAddress(${erc20Address})`);
                if (!activeWallet) {
                    console.log(`No active wallet detected.`);
                    return undefined;
                }
                const chain: Chain | undefined = activeWallet.getChain();
                if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                    return;
                }
                const balance = await readContract({
                    contract: getContract({
                        client,
                        chain,
                        address: TOKEN_BANK_ADDRESS_BY_CHAIN_ID.get(chain.id) as string,
                    }), method: resolveMethod("getTokenBalanceByAddress"), params: [activeWallet.getAccount()?.address, erc20Address]
                });
                const decimals = await fetchDecimals(erc20Address);
                return {
                    amount: BigInt(balance as unknown as bigint),
                    decimals
                }
            } catch (error) {
                console.log(`Error fetching token (${erc20Address}) balance: ${error}`);
            }
        }

        const fetchDecimals = async (erc20Address: string): Promise<number | undefined> => {
            try {
                console.log(`fetchDecimals(${erc20Address})`);
                if (!activeWallet) {
                    console.log(`No active wallet detected.`);
                    return undefined;
                }
                const chain: Chain | undefined = activeWallet.getChain();
                if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                    return;
                }
                const decimals = await readContract({
                    contract: getContract({ client, chain, address: erc20Address }),
                    method: resolveMethod("decimals"),
                    params: []
                });
                console.log(`Decimals: ${decimals} for ${erc20Address}`);
                return Number(decimals);
            } catch (error) {
                console.log(`Error fetching decimals for ${erc20Address}: ${error}`);
            }
        };

        const fetchEtherDepositData = async (): Promise<bigint | undefined> => {
            try {
                console.log(`fetchEtherDepositData()`);
                if (!activeWallet) {
                    console.log(`No active wallet detected.`);
                    return undefined;
                }
                const chain: Chain | undefined = activeWallet.getChain();
                if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                    return;
                }
                const userEthBalance = await readContract({
                    contract: getContract({
                        client,
                        chain,
                        address: TOKEN_BANK_ADDRESS_BY_CHAIN_ID.get(chain.id) as string,
                    }),
                    method: resolveMethod("getEtherBalanceByAddress"),
                    params: [activeWallet?.getAccount()?.address],
                });
                return BigInt(userEthBalance as unknown as bigint);
            } catch (error) {
                console.log(`Error fetching ether deposit data for address (${activeWallet?.getAccount()?.address}) ${error}`);
            }
        };

        const fetchAndSetActiveDeposits = async () => {
            try {
                console.log(`setActiveDeposits()`);
                setIsLoading(true);
                // Get all ERC20 token addresses that a user has an active deposit for.
                const tokenAddresses: undefined | string[] = await fetchTokenAddressesOfActiveDeposits();
                if (!tokenAddresses) {
                    console.log(`No token addresses found: ${JSON.stringify(tokenAddresses)}`);
                    return;
                }
                const tempMap = new Map<string, { amount: bigint, decimals?: number }>([]);
                let tokenMetadata = [];
                for (let i = 0; i < tokenAddresses.length; i++) {
                    const tokenData = await fetchTokenDataForAddress(tokenAddresses[i]);
                    if (!tokenData) {
                        continue;
                    }
                    console.log(`Token balance for ${tokenAddresses[i]}: ${tokenData['amount']} - ${tokenData['decimals']}`);
                    tempMap.set(tokenAddresses[i], tokenData);
                    const { decimals, logo, name, symbol } = await apiClient.getTokenMetadata(tokenAddresses[i], THIRDWEB_CHAIN_ID_TO_ALCHEMY_NETWORK_NAMES.get(activeWallet?.getChain()?.id as number));
                    tokenMetadata.push({ decimals, icon: logo, name, ticker: symbol, contractAddress: tokenAddresses[i] });
                }
                const networkNativeToken: TokenData | undefined = NETWORK_TO_NATIVE_TOKEN.get(activeWallet?.getChain()?.id as number);
                if (networkNativeToken) {
                    tokenMetadata.push(networkNativeToken);
                }
                setTokenMetadata(tokenMetadata);
                const ethBalance: bigint | undefined = await fetchEtherDepositData();
                if (ethBalance) {
                    tempMap.set("NativeNetworkToken", { amount: ethBalance, decimals: 18 });
                }
                setActiveDeposits(tempMap);
            } catch (error) {
                console.log(`Error setting active deposits: ${error}`);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAndSetActiveDeposits();
        setIsConnected(Boolean(activeWallet)); // TODO: Remove this? If wallet is connected should be true otherwise should be false.

    }, [activeWallet, activeWallet?.getChain()?.id]);


    const onWithdrawAll = async () => {
        try {
            console.log(`onWithdrawAll()`);
            setIsWithdrawAllTxnLoading(true);
            if (!activeWallet) {
                console.log(`No active wallet detected.`);
                return undefined;
            }
            const chain: Chain | undefined = activeWallet.getChain();
            if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                return;
            }
            if (!isConnected) {
                console.warn(`User must be connect wallet before attempting to withdraw funds`);
            }
            const txn: PreparedTransaction<any> = prepareContractCall({
                contract: getContract({
                    client,
                    chain,
                    address: TOKEN_BANK_ADDRESS_BY_CHAIN_ID.get(chain.id) as string,
                }),
                method: resolveMethod("withdrawAll"),
                params: []
            });

            const txnReceipt = await sendAndConfirmTransaction({ transaction: txn, account: activeWallet?.getAccount() as Account });
            // Clear the state once everything has been withdrawn
            console.log(txnReceipt)
            if (txnReceipt.status === "success") {
                setActiveDeposits(new Map([]));
            }
        } catch (error) {
            console.log(`An error occurred while attempting to withdraw all funds for user (${activeWallet?.getAccount()?.address}): ${error}`);
        } finally {
            setIsWithdrawAllTxnLoading(false);
        }
    }

    return (
        <>
            <h2>Your deposits</h2>
            {/* Scroll View (Deposit Items) */}
            {isLoading ? <div style={{
                display: "grid", gridTemplateRows: "1fr", gridTemplateColumns: "1fr", marginTop: 8
            }}><CircularProgress style={{ margin: "auto" }} /></div> : activeWallet ?
                (
                    <>
                        {
                            activeDeposits.size === 0 ?
                                <p className={styles.subheaderText} style={{ marginTop: 8 }}>You have 0 active deposits.{"\n"}Begin by depositing a token using the form above.</p>
                                :
                                <>
                                    <List style={{ marginTop: 0, maxHeight: 200, overflow: "scroll" }}>
                                        {Array.from(activeDeposits.entries()).map((item: [string, { amount: bigint, decimals?: number }], index: number) => {
                                            if (item[0] === "NativeNetworkToken") {
                                                // TODO: Leverage current network as the NativeNetworkToken will change amongst different networks.
                                                console.log(`Item - Name: ${JSON.stringify(item[0])}`);
                                                const networkNativeToken: TokenData | undefined = NETWORK_TO_NATIVE_TOKEN.get(activeWallet.getChain()?.id as number);
                                                return <DepositItem key={index} amount={item[1]['amount']} ticker={networkNativeToken?.ticker || ""} dollarAmount={0} decimals={18} icon={<Image src={"https://etherscan.io/images/svg/brands/ethereum-original.svg"} height={32} width={32} alt="" />} tokenMetadata={tokenMetadata as TokenData[]} />
                                            }
                                            const token = tokenMetadata?.find((token: TokenData) => token.contractAddress == item[0]);
                                            if (!token) {
                                                console.log(`Unable to find token: ${item[0]}`);
                                            }
                                            const decimals: number | undefined = item[1]['decimals']
                                            if (!decimals) {
                                                console.log(`Unable to determine decimals for ${item[0]}: ${decimals}`);
                                            }
                                            return <DepositItem key={index} amount={item[1]['amount']} ticker={token?.ticker || ""} dollarAmount={0} decimals={decimals as number} icon={<CurrencyBitcoinIcon />} tokenMetadata={tokenMetadata as TokenData[]} />
                                        })}
                                    </List>
                                </>
                        }
                    </>
                )
                :
                (
                    <>
                        <p className={styles.subheaderText} style={{ marginTop: 8 }}>Connect your wallet to view your active deposits.</p>
                    </>
                )
            }
            <Button disabled={!activeWallet || activeDeposits.size === 0} className={styles.withdrawAllBtn} onClick={onWithdrawAll}>
                {isWithdrawAllTxnLoading ? <CircularProgress /> : "Withdraw All Funds"}
            </Button>
        </>)
}

export default WithdrawPane;