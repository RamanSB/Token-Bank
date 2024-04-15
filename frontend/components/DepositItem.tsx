"use client";

import { Box, Button } from "@mui/material";
import styles from "./DepositItem.module.css";
import { divideBigInts } from "../app/helper/maths";

export type DepositItemProps = {
    icon: any // TODO: Find the correct type
    ticker: string,
    amount: bigint,
    dollarAmount: number,
    decimals: number
}

const DepositItem: React.FC<DepositItemProps> = ({ icon, ticker, amount, dollarAmount, decimals }) => {
    console.log(amount);
    console.log(BigInt(10 ** decimals));
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
            <p className={styles.subheaderText}>{divideBigInts(amount, BigInt(10 ** decimals), 4)} {ticker} - ${dollarAmount}</p>
        </div>
        <Button size="medium" color="primary" className={styles.withdrawBtn}>Withdraw</Button>
    </div>);
}

export default DepositItem;

