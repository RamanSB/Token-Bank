"use client";
import tokens from "@/app/data/tokens";
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { PreparedTransaction, createThirdwebClient, getContract, prepareContractCall, prepareTransaction, readContract, resolveMethod, sendAndConfirmTransaction, sendTransaction, waitForReceipt } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useActiveWallet } from "thirdweb/react";
import { Account, Wallet } from "thirdweb/wallets";
import styles from "./DepositForm.module.css";
import { DataContext } from "@/app/contexts/DataContext";
import { TOKEN_BANK_CONTRACT_ADDRESS } from "@/app/helper/contract";


// TODO: Write logic for depositing Ethereum (doesn't require ERC20 approval, as token is not an ERC20 token.)
// TODO: Write logic for detecting Deposit / Transfer of ERC20 tokens and show user notification of successful / failed Deposit / Approval.
// When selectedToken is ETH do not show approve, initiate a direct transfer.



const DepositForm = () => {

    const { client } = useContext(DataContext);
    const chain = sepolia;

    const contract = getContract({
        client,
        chain,
        address: TOKEN_BANK_CONTRACT_ADDRESS,
        //  abi: ABI as Abi // Optional, comment it - if it breaks.
    });

    const [isDepositEnabled, setIsDepositEnabled] = useState<undefined | boolean>(true);
    const [selectedToken, setSelectedToken] = useState<undefined | string>("Ethereum");
    const [amount, setAmount] = useState<bigint>(BigInt(0));
    const address = useActiveWallet()?.getAccount()?.address
    const [allowanceAmount, setAllowanceAmount] = useState<bigint>(BigInt(0));
    const [showApproval, setShowApproval] = useState(false);
    const decimalsRef = useRef<number>();
    const erc20TokenBalanceRef = useRef<bigint>(BigInt(0));
    const wallet: Wallet | undefined = useActiveWallet();
    const [isTxnPending, setIsTxnPending] = useState(false);

    useEffect(() => {
        const fetchAllowance = async (erc20Address: string) => {
            try {
                console.log(`fetchAllowance(${erc20Address})`);
                console.log([address, contract.address, erc20Address])
                const allowance = await readContract({
                    contract: getContract({ client, chain, address: erc20Address }),
                    method: "function allowance(address owner, address spender) returns (uint256)",
                    params: [address as string, contract.address]
                });
                setShowApproval(BigInt(0) === allowance);
                setAllowanceAmount(allowance);
                return allowance;
            } catch (error) {
                console.log(`Error while attempting to fetch aloowance: ${error}`);
            }
        };

        const fetchDecimals = async (erc20Address: string): Promise<void> => {
            console.log(`fetchDecimals(${erc20Address})`);
            const decimals = await readContract({
                contract: getContract({ client, chain, address: erc20Address }),
                method: resolveMethod("decimals"),
                params: []
            });
            decimalsRef.current = Number(decimals);
        };

        const fetchBalance = async (erc20Address: string): Promise<void> => {
            console.log(`fetchBalance(${erc20Address})`);
            const balance = await readContract({
                contract: getContract({ client, chain, address: erc20Address }),
                method: resolveMethod("balanceOf"),
                params: [address]
            })

            erc20TokenBalanceRef.current = BigInt(balance as unknown as bigint);
        }

        // TODO: Write Logic here to take care of ETH transfers
        if (selectedToken === undefined || address === undefined) {
            return;
        }
        const erc20Address: undefined | string = tokens.find((item) => item.name == selectedToken)?.address;
        if (!erc20Address) {
            return;
        }
        fetchAllowance(erc20Address);
        fetchDecimals(erc20Address);
        fetchBalance(erc20Address);
    }, [selectedToken]);

    useEffect(() => {
        console.log(`isDepositEnabled: ${isDepositEnabled}`);
    }, [isDepositEnabled])

    const handleTokenChange = async (event: SelectChangeEvent<any>) => {
        console.log(`handleChange(${JSON.stringify(event.target)})`);
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
        const [integerPart, fractionalPart] = amount.split('.');
        const fractionalAdjusted = (fractionalPart || '').padEnd(decimals, '0').substring(0, decimals);
        const fullAmount = `${integerPart}${fractionalAdjusted}`;
        return BigInt(fullAmount);
    }


    const handleAmountChange = async (event: any) => {
        if (!selectedToken) {
            return;
        }
        console.log(`handleAmountChange(${JSON.stringify(event.target.value)}) - ${selectedToken}`);
        if (selectedToken !== "Ethereum") {
            const convertedAmount = convertToSmallestUnit(event.target.value, decimalsRef.current as number);
            setAmount(convertedAmount);
            setShowApproval(allowanceAmount < convertedAmount);
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
            // Handle all ERC20 tokens
            if (selectedToken !== "Ethereum") {
                const erc20Address = tokens.find((item) => item.name === selectedToken)?.address as string;
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
                const txnHash = await wallet?.getAccount()?.sendTransaction({ chainId: chain.id, to: TOKEN_BANK_CONTRACT_ADDRESS, value: amount })
                console.log(typeof txnHash);
                console.log(txnHash);
            }
        } catch (error) {
            console.log(`Error while attempting to perform a deposit: ${error}`)
        } finally {
            setIsTxnPending(false);
        }
    }

    const onApproval = async () => {
        try {
            setIsTxnPending(true);
            console.log(`onApproval(): ${selectedToken}`);
            const erc20Address = tokens.find((item) => item.name === selectedToken)?.address as string
            const approvalAmount: bigint = BigInt(erc20TokenBalanceRef.current) * BigInt(10 ** (decimalsRef.current as number));
            console.log([address, contract.address, erc20Address])

            const txn: PreparedTransaction = prepareContractCall({
                contract: getContract({ client, chain, address: erc20Address }),
                method: resolveMethod("approve"),
                params: [contract.address, approvalAmount]
            });
            const receipt = await sendAndConfirmTransaction({ transaction: txn, account: wallet?.getAccount() as Account });
            logTxnReceipt(receipt);
        } catch (error) {
            console.log(`Error while attempting to approve ERC20 Token: ${error}`);
        } finally {
            setIsTxnPending(false);
        }
    }

    function logTxnReceipt(receipt: any) {
        console.log(`TxnReceipt: ${receipt}`)
        console.log(`TxnReceipt - Status: ${receipt.status}`)
        console.log(`TxnReceipt - Hash: ${receipt.transactionHash}`)
        console.log(`TxnReceipt - Index: ${receipt.transactionIndex}`)
        console.log(`TxnReceipt - gasUsed: ${receipt.gasUsed}`)
        console.log(`TxnReceipt - From: ${receipt.from}`)
        console.log(`TxnReceipt - To: ${receipt.to}`)
        console.log(`TxnReceipt - Type: ${receipt.type}`)
        console.log(`TxnReceipt - logsBloom: ${receipt.logsBloom}`)
        console.log(`TxnReceipt - logs: ${receipt.logs}`)
    }

    return (<FormControl fullWidth>
        <InputLabel id="token-select-label" style={{ color: 'white' }}>
            Select a token
        </InputLabel>
        <Select
            labelId="token-select-label"
            id="token-select"
            style={{ backgroundColor: "#283039", color: "white", width: "100%", borderRadius: 12 }}
            label="Select a token"
            displayEmpty
            value={selectedToken}
            onChange={handleTokenChange}
        >
            {tokens.map((item, idx) => {
                return <MenuItem key={idx} value={item.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Image src={item.icon} width={18} height={18} alt={item.icon} />
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
