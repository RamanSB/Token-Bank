"use client";
import { DataContext } from "@/app/contexts/DataContext";
import { NETWORK_TO_NATIVE_TOKEN, THIRDWEB_CHAIN_ID_TO_ALCHEMY_NETWORK_NAMES, TOKEN_BANK_ADDRESS_BY_CHAIN_ID } from "@/app/helper/contract";
import { logTxnReceipt } from "@/app/helper/logs";
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Image from "next/image";
import { MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { ADDRESS_ZERO, PreparedTransaction, getContract, hexToBigInt, prepareContractCall, readContract, resolveMethod, sendAndConfirmTransaction, sendTransaction, waitForReceipt } from "thirdweb";
import { Chain } from "thirdweb/chains";
import { useActiveWallet, useContractEvents } from "thirdweb/react";
import { Account, Wallet } from "thirdweb/wallets";
import styles from "./DepositForm.module.css";
import { ApiClient } from "@/app/helper/api";
import { TokenData } from "@/app/helper/types";


// TODO: Write logic for depositing Ethereum (doesn't require ERC20 approval, as token is not an ERC20 token.)
// TODO: Write logic for detecting Deposit / Transfer of ERC20 tokens and show user notification of successful / failed Deposit / Approval.
// When selectedToken is ETH do not show approve, initiate a direct transfer.

const DepositForm = () => {

    const { client, setActiveDeposits, contract } = useContext(DataContext);
    const [isDepositEnabled, setIsDepositEnabled] = useState<undefined | boolean>(true);
    const [selectedToken, setSelectedToken] = useState<undefined | string>("Ethereum");
    const [amount, setAmount] = useState<bigint>(BigInt(0));
    const [menuTokenItems, setMenuTokenItems] = useState<TokenData[]>([]);
    const address = useActiveWallet()?.getAccount()?.address
    const [allowanceAmount, setAllowanceAmount] = useState<bigint>(BigInt(0));
    const [showApproval, setShowApproval] = useState(false);
    const decimalsRef = useRef<number>();
    const erc20TokenBalanceRef = useRef<bigint>(BigInt(0));
    const wallet: Wallet | undefined = useActiveWallet();
    const [isTxnPending, setIsTxnPending] = useState(false);
    // TODO: Understand how events can be retreived when we are changing the contract...
    const contractEvents = useContractEvents({ contract })

    const eventCountRef: MutableRefObject<number> = useRef(-1);
    const apiClient = new ApiClient();


    useEffect(() => {
        const fetchAllowance = async (erc20Address: string) => {
            try {
                console.log(`fetchAllowance(${erc20Address})`);
                if (!wallet) {
                    return;
                }
                const chain: Chain | undefined = wallet.getChain();
                if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                    return;
                }
                const allowance = await readContract({
                    contract: getContract({ client, chain, address: erc20Address }),
                    method: "function allowance(address owner, address spender) returns (uint256)",
                    params: [address as string, contract.address]
                });
                console.log(`Allowance amount: ${allowance}`); // TODO: Why is KTK returned with greater than 18 decimals worth of digits.
                setShowApproval(BigInt(0) === allowance);
                setAllowanceAmount(allowance);
                return allowance;
            } catch (error) {
                console.log(`Error while attempting to fetch allowance: ${error}`);
            }
        };

        const fetchDecimals = async (erc20Address: string): Promise<void> => {
            try {
                console.log(`fetchDecimals(${erc20Address})`);
                if (!wallet) {
                    return;
                }
                const chain: Chain | undefined = wallet.getChain();
                if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                    return;
                }
                const decimals = await readContract({
                    contract: getContract({ client, chain, address: erc20Address }),
                    method: resolveMethod("decimals"),
                    params: []
                });
                decimalsRef.current = Number(decimals);
            } catch (error) {
                console.log(`Error occurred while attempting to fetch decimals for ${erc20Address}`);
            }
        };

        const fetchBalance = async (erc20Address: string): Promise<void> => {
            try {
                console.log(`fetchBalance(${erc20Address})`);
                if (!wallet) {
                    return;
                }
                const chain: Chain | undefined = wallet.getChain();
                if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                    return;
                }
                const balance = await readContract({
                    contract: getContract({ client, chain, address: erc20Address }),
                    method: resolveMethod("balanceOf"),
                    params: [address]
                })

                erc20TokenBalanceRef.current = BigInt(balance as unknown as bigint);
            } catch (error) {
                console.log(`Error attempting to fetch balance for ${erc20Address}: ${error}`);
            }
        }

        // TODO: Write Logic here to take care of ETH transfers
        if (selectedToken === undefined || address === undefined) {
            return;
        }
        const erc20Address: undefined | string = menuTokenItems.find((item) => item.name == selectedToken)?.contractAddress;
        if (!erc20Address) {
            return;
        }
        fetchAllowance(erc20Address);
        fetchDecimals(erc20Address);
        fetchBalance(erc20Address);
    }, [selectedToken]);

    useEffect(() => {
        const fetchUserTokenData = async (chainId: number) => {
            try {
                console.log(`fetchUserTokenData(${chainId})`);
                let tokenData: TokenData[] = [];
                if (NETWORK_TO_NATIVE_TOKEN.has(chainId)) {
                    tokenData.push(NETWORK_TO_NATIVE_TOKEN.get(chainId) as TokenData);
                }

                const tokens = await apiClient.getTokenBalances(wallet?.getAccount()?.address as string, THIRDWEB_CHAIN_ID_TO_ALCHEMY_NETWORK_NAMES.get(chainId), true)
                tokenData.push(...tokens);
                if (tokenData) {
                    setMenuTokenItems(tokenData);
                }
            } catch (error) {
                console.log(`Error occurred while attempting to fetch token data on ${chain} for ${wallet?.getAccount()?.address}`)
            }
        }

        if (!wallet) {
            return;
        }
        const chain: Chain | undefined = wallet.getChain();
        if (!chain) {
            return;
        }

        fetchUserTokenData(chain.id);

    }, [wallet?.getChain()?.id])

    useEffect(() => {
        if (wallet) {
            if (eventCountRef.current !== -1) {
                const eventData = contractEvents.data?.slice(eventCountRef.current);
                console.log(eventData)
                console.log(eventData?.length)
                console.log(typeof eventData);
                const event: any = eventData?.findLast((event: any) => event.eventName === "TokenBank__Deposit" && event.args.depositor === wallet.getAccount()?.address);
                console.log(event);
                console.log(typeof event);
                if (event) {
                    const { depositor, amount }: { depositor: string, amount: bigint } = event.args;
                    let { erc20TokenAddress }: { erc20TokenAddress: string } = event.args;
                    if (erc20TokenAddress === ADDRESS_ZERO) {
                        erc20TokenAddress = "NativeNetworkToken"
                    }
                    setActiveDeposits((prevState) => {
                        const updatedMap = new Map(prevState);
                        let depositAmount: bigint = amount;
                        let decimals;
                        if (updatedMap.has(erc20TokenAddress)) {
                            const previousValue = updatedMap.get(erc20TokenAddress);
                            console.log(`Existing deposit of ${erc20TokenAddress} existed:`)
                            console.log(previousValue);
                            depositAmount += (previousValue?.amount || BigInt(0));
                            decimals = previousValue?.decimals;
                        }
                        console.log(`Creating or updating deposit ${erc20TokenAddress}: ${amount}`);
                        updatedMap.set(erc20TokenAddress, { amount: depositAmount, decimals: decimals || 18 })
                        return updatedMap;
                    });
                }
            }
            eventCountRef.current = contractEvents.data?.length as number;
        }
    }, [contractEvents.dataUpdatedAt])

    const handleTokenChange = async (event: SelectChangeEvent<any>) => {
        console.log(`handleTokenChange(${JSON.stringify(event.target)})`);
        const token = event.target.value;
        setSelectedToken(event.target.value);
        if (token === "Ethereum") {
            setIsDepositEnabled(true);
            setShowApproval(false);
        } else {
            setIsDepositEnabled(Boolean(!showApproval && token && amount));
        }
    };

    function convertToSmallestUnit(amount: string, decimals: number): bigint {
        console.log(`convertToSmallestUnit(${amount}, ${decimals})`);
        const [integerPart, fractionalPart] = amount.split('.');
        const fractionalAdjusted = (fractionalPart || '').padEnd(decimals, '0').substring(0, decimals);
        const fullAmount = `${integerPart}${fractionalAdjusted}`;
        return BigInt(fullAmount);
    }

    // TODO: Fix bug regarding approve / deposit being shown (related to allowance amount I believe...)
    const handleAmountChange = async (event: any) => {
        if (!selectedToken) {
            return;
        }
        console.log(`handleAmountChange(${JSON.stringify(event.target.value)}) - ${selectedToken}`);
        if (selectedToken !== "Ethereum") {
            const convertedAmount = convertToSmallestUnit(event.target.value, decimalsRef.current as number);
            setAmount(convertedAmount);
            setShowApproval(allowanceAmount < convertedAmount);
            console.log(`Allowance Amount: ${allowanceAmount}`);
            console.log(`Converted Amount: ${convertedAmount}`);
            setIsDepositEnabled(selectedToken !== undefined && !showApproval && convertedAmount !== BigInt(0));
        } else {
            const convertedAmount = convertToSmallestUnit(event.target.value, 18);
            console.log(`Converted Amount: ${convertedAmount}`);
            setAmount(convertedAmount);
            setShowApproval(false);
        }
    }

    const onDeposit = async () => {
        try {
            setIsTxnPending(true);
            console.log(`onDeposit(): ${selectedToken} | ${amount}`);
            if (!wallet) {
                return;
            }
            const chain: Chain | undefined = wallet.getChain();
            if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                return;
            }
            // Handle all ERC20 tokens
            if (selectedToken !== "Ethereum") {
                const erc20Address = menuTokenItems.find((item) => item.name === selectedToken)?.contractAddress as string;
                const txnAmount = amount;
                const txn: PreparedTransaction = prepareContractCall({
                    contract,
                    method: resolveMethod("depositToken"), //"function depositToken(address erc20TokenAddress, uint256 amount) returns (bool)",
                    params: [erc20Address, txnAmount],

                });
                const transactionResult = await sendTransaction({ transaction: txn, account: wallet?.getAccount() as Account });
                console.log(`Txn Result: ${JSON.stringify(transactionResult)}`);
                const receipt = await waitForReceipt(transactionResult);
                logTxnReceipt(receipt);
            } else {
                // Handle Ethereums case seperately (Ether does not have a contract address).
                console.log(`${wallet?.getAccount()?.address} is sending ETH...`);
                const txnResult = await wallet?.getAccount()?.sendTransaction({ chainId: chain.id, to: TOKEN_BANK_ADDRESS_BY_CHAIN_ID.get(chain.id), value: amount });
                console.log(typeof txnResult);
                console.log(txnResult);

                if (txnResult?.transactionHash) {
                    let receipt = await waitForReceipt({ chain, client, transactionHash: txnResult.transactionHash });
                    if (receipt.status !== "reverted") {
                        // TODO: Indicate failure to the user...
                        return;
                    }
                    // TODO: Indicate success to the user...
                    console.log(typeof receipt);
                    console.log(receipt);
                };
            }
        } catch (error) {
            console.log(`Error while attempting to perform a deposit: ${error}`)
        } finally {
            setIsTxnPending(false);
        }
    }


    const onApproval = async () => {
        try {
            console.log(`onApproval(): ${selectedToken}`);
            setIsTxnPending(true);
            if (!wallet) {
                return;
            }
            const chain: Chain | undefined = wallet.getChain();
            if (!chain || !TOKEN_BANK_ADDRESS_BY_CHAIN_ID.has(chain.id)) {
                return;
            }
            const erc20Address = menuTokenItems.find((item) => item.name === selectedToken)?.contractAddress as string
            const approvalAmount: bigint = BigInt(erc20TokenBalanceRef.current) * BigInt(10 ** (decimalsRef.current as number));
            console.log([address, contract.address, erc20Address])

            const txn: PreparedTransaction = prepareContractCall({
                contract: getContract({ client, chain, address: erc20Address }),
                method: resolveMethod("approve"),
                params: [contract.address, approvalAmount]
            });
            const receipt = await sendAndConfirmTransaction({ transaction: txn, account: wallet?.getAccount() as Account });

            if (receipt.status === "reverted") {
                return;
            }
            const approvalAmountFromLogEvent: bigint = hexToBigInt(receipt.logs[0].data);
            setAllowanceAmount(approvalAmountFromLogEvent);
            // TODO: Ideally should be setting if the deposit is enabled here too.
            // logTxnReceipt(receipt);
        } catch (error) {
            console.log(`Error while attempting to approve ERC20 Token: ${error}`);
        } finally {
            setIsTxnPending(false);
        }
    }



    return (<FormControl fullWidth>
        <InputLabel id="token-select-label" style={{ color: 'white' }}>
            Select a token
        </InputLabel>
        <Select
            labelId="token-select-label"
            id="token-select"
            style={{ backgroundColor: "#283039", color: "white", width: "100%", borderRadius: 12, overflow: "scroll" }}
            label="Select a token"
            displayEmpty
            value={selectedToken}
            onChange={handleTokenChange}
            MenuProps={{ style: { maxHeight: 400 } }}
        >
            {menuTokenItems.map((item, idx) => {
                return <MenuItem key={idx} value={item.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Image src={item.icon || "https://etherscan.io/images/svg/brands/ethereum-original.svg"} width={18} height={18} alt={item.name || ""} />
                        {item.ticker} | {item.name}
                    </div>
                </MenuItem>
            })}

        </Select>
        <div style={{ display: "flex", flexDirection: "row", marginTop: 16, gap: 8, justifyContent: "space-between" }}>
            <TextField
                inputMode="numeric"
                placeholder="0.00"
                onChange={handleAmountChange}
                inputProps={{ style: { color: "#787e81" } }}
                InputLabelProps={{ style: { color: "white" } }}
                className={styles.inputField}
                id="amount" label="Amount" variant="outlined" />
            <TextField
                InputLabelProps={{ style: { color: "white" } }}
                InputProps={{ readOnly: true, style: { color: "#787e81" } }}
                className={styles.inputField}
                id="usd-value" label="USD Value" variant="outlined" />
        </div>
        {isTxnPending ? (<Button size="medium" style={{ color: "white" }} className={styles.depositBtn + " " + (styles.enabled)} startIcon={<CircularProgress size={28} />}>Pending</Button>) : (showApproval ? (<Button size="medium" style={{ color: "white" }} className={styles.depositBtn + " " + (styles.disabled)} onClick={onApproval}>Approve</Button>) :
            (<Button disabled={!isDepositEnabled} size="medium" style={{ color: "white" }} className={styles.depositBtn + " " + (isDepositEnabled && styles.enabled)} onClick={onDeposit}>Deposit</Button>))}
    </FormControl>);
}

export default DepositForm;
