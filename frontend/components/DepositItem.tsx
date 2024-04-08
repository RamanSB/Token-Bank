"use client";

import { Box, Button } from "@mui/material";
import styles from "./DepositItem.module.css";

export type DepositItemProps = {
    icon: any // TODO: Find the correct type
    ticker: string,
    amount: number,
    dollarAmount: number
}

const DepositItem: React.FC<DepositItemProps> = ({ icon, ticker, amount, dollarAmount }) => {
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
            <p className={styles.subheaderText}>{amount} {ticker} - ${dollarAmount}</p>
        </div>
        <Button size="medium" color="primary" className={styles.withdrawBtn}>Withdraw</Button>
    </div>);
}

export default DepositItem;