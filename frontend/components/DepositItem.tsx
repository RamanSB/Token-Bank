"use client";

import { DataContext } from "@/app/contexts/DataContext";
import { roboto } from "@/app/fonts";
import { logTxnReceipt } from "@/app/helper/logs";
import { TokenData } from "@/app/helper/types";
import { Box, Button, CircularProgress, InputAdornment, Modal, TextField } from "@mui/material";
import { ChangeEvent, useContext, useState } from "react";
import { PreparedTransaction, prepareContractCall, resolveMethod, sendTransaction, waitForReceipt } from "thirdweb";
import { useActiveWallet } from "thirdweb/react";
import { Account, Wallet } from "thirdweb/wallets";
import { divideBigInts, multiplyBigInts } from "../app/helper/maths";
import styles from "./DepositItem.module.css";

export type DepositItemProps = {
    icon: any // TODO: Find the correct type
    ticker: string,
    amount: bigint,
    dollarAmount: number,
    decimals: number,
    tokenMetadata: TokenData[]
}

const DepositItem: React.FC<DepositItemProps> = ({ icon, ticker, amount, dollarAmount, decimals, tokenMetadata }) => {

    const { activeDeposits, setActiveDeposits, contract } = useContext(DataContext);
    const wallet: Wallet | undefined = useActiveWallet();
    const [open, setOpen] = useState(false);
    const [isWithdrawEnabled, setIsWithdrawEnabled] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState<string>("")
    const [isTxnPending, setIsTxnPending] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const token = tokenMetadata.find((item: TokenData) => item.ticker === ticker);
    const validWithdrawInput = /^\d+(\.\d+)?$/;
    console.log(amount);
    console.log(BigInt(10 ** decimals));
    const formattedBalance = divideBigInts(amount, BigInt(10 ** decimals), 4);
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: '#111518',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };


    const onWithdraw = async () => {
        console.log(`onWithdraw()`)
        try {
            setIsTxnPending(true);
            if (!token) {
                console.log(`Token is undefined...`);
                return;
            }

            let erc20Address = token.contractAddress;
            const amount: undefined | bigint = multiplyBigInts(withdrawAmount, decimals);
            if (!amount) {
                throw new Error(`Unable to determine amount from ${withdrawAmount} & ${decimals}`);
            }
            console.log(`withdrawAmount: ${amount}`);
            let txn: PreparedTransaction;
            if (erc20Address === "") {
                // Native Token 
                txn = prepareContractCall({ contract, method: resolveMethod("withdrawEther"), params: [amount] });
            } else {
                txn = prepareContractCall({ contract, method: resolveMethod("withdrawToken"), params: [erc20Address, amount] });
            }

            const txnHash = await sendTransaction({ transaction: txn, account: wallet?.getAccount() as Account });
            console.log(`Withdraw Txn Result: ${JSON.stringify(txnHash)}`)
            const receipt = await waitForReceipt(txnHash);
            logTxnReceipt(receipt);
            if (receipt.status === "reverted") {
                // Indicate error to the user...
                return;
            }

            // Indicate success to the user...
            console.log(`Active Deposits: ${JSON.stringify(Array.from(activeDeposits.keys()))}`)
            console.log(activeDeposits.get(erc20Address)?.amount);
            setActiveDeposits((prevState) => {
                const updatedMap = new Map(prevState);
                const initialData = updatedMap.get(erc20Address || "NativeNetworkToken");
                if (!initialData?.amount) {
                    throw new Error(`Unable to withdraw from a ${erc20Address || "NativeNetworkToken"} that has no deposited balance.`);
                }
                const updatedBalance = initialData.amount - amount;
                if (updatedBalance === BigInt(0)) {
                    updatedMap.delete(erc20Address || "NativeNetworkToken");
                    return updatedMap;
                }
                updatedMap.set(erc20Address || "NativeNetworkToken", { ...initialData, amount: updatedBalance });
                return updatedMap;
            })
        } catch (error) {
            console.log(`Error occurred onWithdraw: ${error}`);
        } finally {
            setIsTxnPending(false);
            handleClose();
        }
    }

    const handleWithdrawInput = async (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const inputValue: string = event.currentTarget.value;
        setWithdrawAmount(inputValue);
        if (validWithdrawInput.test(inputValue) && Number(inputValue) <= Number(formattedBalance) && Number(inputValue) !== 0) {
            setIsWithdrawEnabled(true);
        } else {
            setIsWithdrawEnabled(false);
        }
    }

    return (<div style={{ display: "flex", flexDirection: "row", marginTop: 16, alignItems: "center" }}>
        <Box sx={{
            width: 48, height: 48, bgcolor: "#273039",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            {icon}
        </Box>
        <div style={{ marginLeft: 8, flex: "1 1 auto", gap: 8 }}>
            <p>{ticker}</p>
            <p className={styles.subheaderText}>{formattedBalance} {ticker} - ${dollarAmount}</p>
        </div>
        <Button size="medium" color="primary" className={styles.withdrawBtn} onClick={handleOpen}>Withdraw</Button>
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"

            >
                <Box sx={style}>
                    <p id="modal-modal-title" style={{
                        ...roboto.style, ...{
                            fontSize: 16, marginBottom: 16, color: "white",
                        }
                    }} >
                        Withdraw {ticker}
                    </p>
                    {!isTxnPending ?
                        <>

                            <TextField
                                inputMode="numeric"
                                placeholder="0.00"
                                onChange={handleWithdrawInput}
                                inputProps={{ style: { color: "#787e81" } }}
                                InputLabelProps={{ style: { color: "#787e81" } }}
                                className={styles.inputField}
                                id="amount" label="Amount" variant="outlined"
                                value={withdrawAmount}
                                InputProps={{
                                    endAdornment: (<InputAdornment position="end">
                                        <Button onClick={() => {
                                            setWithdrawAmount(formattedBalance);
                                            setIsWithdrawEnabled(true)
                                        }}>Max</Button>
                                    </InputAdornment>)
                                }}
                            />

                            <div style={{ marginTop: 12, display: "flex", flexDirection: "row-reverse", gap: 8 }}>
                                <Button size="medium" className={styles.withdrawBtn + " " + (isWithdrawEnabled ? styles.enabled : "")} disabled={!isWithdrawEnabled} onClick={onWithdraw}>Withdraw</Button>
                                <Button size="medium" className={styles.withdrawBtn} onClick={handleClose}>Cancel</Button>
                            </div>
                        </> : <div style={{ textAlign: "center" }}>
                            <CircularProgress />
                        </div>}
                </Box>
            </Modal></>
    </div >);
}

export default DepositItem;

