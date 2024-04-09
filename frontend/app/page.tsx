"use client";
import type { Abi } from "abitype";
import { useEffect } from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { roboto } from "./fonts";
import "./globals.css";
import { ABI, ADDRESS } from "./helper/contract";

import DepositForm from "@/components/DepositForm";
import DepositItem from "@/components/DepositItem";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { Button } from "@mui/material";
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


      <div className={styles.section}>
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
          <DepositForm />
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