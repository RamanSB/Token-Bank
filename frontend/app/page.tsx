"use client";
import type { Abi } from "abitype";
import { useEffect } from "react";
import { roboto } from "./fonts";
import { createThirdwebClient, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import "./globals.css";
import { ABI, ADDRESS } from "./helper/contract";

import DepositItem from "@/components/DepositItem";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import styles from "./page.module.css";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string
})

const chain = sepolia;

const contract = getContract({
  client,
  chain,
  address: ADDRESS,
  abi: ABI as Abi // Optional, comment it - if it breaks.
});

export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("app.phantom"),
];


const Page = () => {

  useEffect(() => {
    const connectWallet = async () => {
      try {
        console.log(`Attempting to create & connect wallet...`);
        const wallet = createWallet("io.metamask");
        const account = await wallet.connect({
          client
        });
      } catch (error) {
        console.log(`Error while attempting to connect MM wallet: ${error}`);
      }
    };

    // connectWallet();
  }, [])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      padding: 16
    }}>
      {/* NavBar in Layout.tsx or Template.tsx */}
      {/* TokenBank w/Intro */}
      <div className={styles.section} style={{ marginTop: 16 }}>
        <h2 className={roboto.className} style={{ marginBottom: 8 }}>Token Bank</h2>
        <p className={styles.subheaderText}>Token Bank allows you to deposit any ERC20 tokens, including Ether and only you have the ability to withdraw them.</p>
      </div>
      {/* Perform Deposit Section */}
      <div className={styles.section}>
        <h2 style={{ ...roboto.style, ...{} }}>Deposit</h2>
        <p style={{ margin: "8px 0 16px 0" }} className={styles.subheaderText}>Connect a wallet to deposit tokens</p>
        <div style={{ textAlign: "center", marginBlock: 32 }}>
          <ConnectButton
            // appMetadata={}
            connectButton={{ style: { background: "#1a81e4", color: "white" } }}
            client={client}
            wallets={wallets}
            theme={"dark"}
            connectModal={{ size: "compact" }}
            chain={sepolia}
          />
        </div>
        <div>
          <FormControl fullWidth>
            <InputLabel id="token-select-label" style={{ color: 'white' }}>
              Select a token
            </InputLabel>
            <Select
              labelId="token-select-label"
              id="token-select"
              style={{ backgroundColor: "#283039", color: "white", width: "100%", borderRadius: 12 }}
              label="Select a token" // Make sure this matches the InputLabel
              displayEmpty // This will ensure the first empty item is shown
            // value={selectedToken}
            // onChange={handleChange}
            >
              <MenuItem value={10}>Ethereum</MenuItem>
              <MenuItem value={20}>USDC</MenuItem>
              <MenuItem value={30}>BTC</MenuItem>
            </Select>
            <div style={{ display: "flex", flexDirection: "row", marginTop: 16, gap: 16 }}>
              <TextField
                inputMode="numeric"
                placeholder="0.00"
                inputProps={{ style: { color: "#787e81" } }}
                InputLabelProps={{ style: { color: "white" } }}
                style={{ backgroundColor: "#283039", color: "white", borderRadius: 12 }}
                id="amount" label="Amount" variant="outlined" />
              <TextField
                InputLabelProps={{ style: { color: "white" } }}
                InputProps={{ readOnly: true, style: { color: "#787e81" } }}
                style={{ backgroundColor: "#283039", color: "white", borderRadius: 12 }}
                id="usd-value" label="USD Value" variant="outlined" />
            </div>
            <Button size="medium" color="primary" className={styles.depositBtn}>Deposit</Button>
          </FormControl>
        </div>
      </div>
      {/* Current Deposits & Withdraw Section */}
      <div className={styles.section}>
        <h2>Your deposits</h2>
        {/* Scroll View (Deposit Items) */}
        <DepositItem icon={<AcUnitIcon />} ticker="ETH" amount={1.22} dollarAmount={4213.31} />
        <DepositItem icon={<AcUnitIcon />} ticker="ETH" amount={1.22} dollarAmount={4213.31} />
        <Button className={styles.withdrawAllBtn}>Withdraw All Funds</Button>
      </div>



    </div>
  );
}

export default Page;

{/*   <ConnectButton
          client={client}
          wallets={wallets}
          theme={"dark"}
          connectModal={{ size: "compact" }}
          chain={sepolia}
        /> */}