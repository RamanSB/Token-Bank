"use client";
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import styles from "./DepositForm.module.css";


const DepositForm = () => {
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
        // value={selectedToken}
        // onChange={handleChange}
        >
            <MenuItem value={10}>Ethereum</MenuItem>
            <MenuItem value={20}>USDC</MenuItem>
            <MenuItem value={30}>BTC</MenuItem>
        </Select>
        <div style={{ display: "flex", flexDirection: "row", marginTop: 16, gap: 8, justifyContent: "space-between" }}>
            <TextField
                inputMode="numeric"
                placeholder="0.00"
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
        <Button size="medium" color="primary" className={styles.depositBtn}>Deposit</Button>
    </FormControl>);
}

export default DepositForm;