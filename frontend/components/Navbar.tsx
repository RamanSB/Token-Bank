"use client";
import Image from "next/image";
import styles from "./Navbar.module.css";
import { roboto } from "@/app/fonts";
import logo from "../public/db-btc.webp";

import { sepolia, baseSepolia, base, arbitrumNova, Chain, getChainMetadata } from "thirdweb/chains";

import { useState, MouseEvent, useEffect, useRef, MutableRefObject } from "react";
import { Chip, Divider, List, ListItemButton, ListItemText, Menu, MenuItem } from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BlockIcon from '@mui/icons-material/Block';
import { useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react";

const Navbar = () => {
    return <div className={styles.navbar}>
        <div className={styles.titleIconContainer}>
            <Image src={logo} width={36} height={36} alt="Token Bank Logo" objectFit="contain" />
            <h2 style={{ ...roboto.style }}>Token Bank</h2>
        </div>
        <NetworkMenu />
    </div>
}

/**
 * Detect network user is already connected to and set that as the active network.
 * Support Base, Arbitrum Nova, Degen, StarkNet, ETH Mainnet
 * @returns 
 */


// TODO: Remove padding from Network / Chains Menu
// TODO: Understand why Menuitem onClick and selectedIndex is not updating to the correct chain...
const NetworkMenu = () => {
    const switchChain = useSwitchActiveWalletChain();
    const activeChain = useActiveWalletChain();
    console.log(`Active chain: ${JSON.stringify(activeChain)}`)
    console.log(activeChain);
    console.log(typeof activeChain);
    const chains: Chain[] = [sepolia, baseSepolia, base, /* arbitrumNova */];

    const [chainMetadata, setChainMetdata] = useState<any>(undefined);
    console.log(`ChainMetadata: ${JSON.stringify(chainMetadata)}`);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    console.log(`Selected Index: ${selectedIndex}`);


    useEffect(() => {
        (async function () {
            console.log(`Fetching chain data...`)
            const metadata = await Promise.all(chains.map((chain) => getChainMetadata(chain)));
            setChainMetdata(metadata);
        })()
    }, [])

    useEffect(() => {
        const index = chains.findIndex((chain: Chain) => chain.id === activeChain?.id);
        if (index !== -1) { // Active chain which is found.
            setSelectedIndex(index);
        } else if (activeChain === undefined) { // No active chain
            setSelectedIndex(-1);
        } else { // Active chain but it can't be found.
            setSelectedIndex(-2);
        }
    }, [activeChain])

    const open = Boolean(anchorEl)
    const handleClickListItem = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuItemClick = (event: MouseEvent<HTMLElement>, index: number) => {
        if (index === selectedIndex) {
            setAnchorEl(null);
            return;
        }
        setSelectedIndex(index);
        setAnchorEl(null);
        switchChain(chains[selectedIndex])
        console.log(chains[selectedIndex]);

    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    return (
        <div>
            <List
                component="nav"
                aria-label="Network Settings"
                sx={{ bgcolor: 'bg.transparent' }}
            >
                <Chip
                    aria-haspopup="listbox"
                    aria-controls="network-menu"
                    aria-label="Network"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClickListItem}
                    icon={[-1, -2].includes(selectedIndex) ? (selectedIndex == -1 ? <AccountBalanceWalletIcon /> : <BlockIcon />) : (chainMetadata && <Image src={_generateIpfsHash(chainMetadata[selectedIndex].icon.url)} width={20} height={20} alt={chainMetadata[selectedIndex].name} />)}
                    label={[-1, -2].includes(selectedIndex) ? (selectedIndex == -1 ? "Select Network" : "Unsupported Network") : (chainMetadata && chainMetadata[selectedIndex].name)}
                    id="lock-button"
                    style={{ color: "white", ...roboto.style, fontSize: 16, background: "#283039", padding: 8 }}
                />
            </List>
            <Menu
                id="network-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'lock-button',
                    role: 'listbox',
                }}
            >
                {chainMetadata?.map((option: any, index: number) => {
                    return <div key={index}>
                        <MenuItem
                            key={index}
                            style={{ background: "#283039" }}
                            selected={index === selectedIndex}
                            onClick={(event) => handleMenuItemClick(event, index)}
                            value={option.name}
                        >
                            {option.icon?.url && <Image src={_generateIpfsHash(option.icon.url)} width={24} height={24} alt={option.name} style={{ marginRight: 8 }} />}
                            <p style={{ color: "white" }} className={roboto.className}>{option.name}</p>
                        </MenuItem>
                        <Divider style={{ height: 0.5, margin: 0 }} color={"black"} />
                    </div>
                })}
            </Menu>
        </div>
    );


    function _generateIpfsHash(ipfs: string) {
        const hash = ipfs.split("//")[1]
        return `https://ipfs.io/ipfs/${hash}`;
    }
}

export default Navbar