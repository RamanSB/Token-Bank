"use client";
import { useEffect } from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";

import { ConnectButton, useActiveWallet } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { roboto } from "./fonts";
import "./globals.css";
import { TOKEN_BANK_CONTRACT_ADDRESS } from "./helper/contract";

import DepositForm from "@/components/DepositForm";
import WithdrawPane from "@/components/WithdrawPane";
import styles from "./page.module.css";


const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string
})

const chain = sepolia; // sepolia;

const contract = getContract({
  client,
  chain,
  address: TOKEN_BANK_CONTRACT_ADDRESS,
  // abi: ABI as Abi // Optional, comment it - if it breaks.
});

export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("app.phantom"),
];





const Page = () => {

  const activeWallet = useActiveWallet();

  useEffect(() => {
    console.log(`Active Wallet: ${JSON.stringify(activeWallet)}`);
  }, [activeWallet])

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
            chain={chain}
          />
        </div>
        <div>
          <DepositForm />
        </div>
      </div>
      {/* Current Deposits & Withdraw Section */}
      <div className={styles.section}>
        <WithdrawPane />
      </div>
    </div>
  );
}

export default Page;