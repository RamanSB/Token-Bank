"use client";
import Image from "next/image";
import styles from "./Navbar.module.css";
import { roboto } from "@/app/fonts";
import logo from "../public/db-btc.webp";

import { sepolia, baseSepolia, base, arbitrumNova, Chain, getChainMetadata } from "thirdweb/chains";

import { useState, MouseEvent, useEffect, useRef, MutableRefObject } from "react";
import { Chip, List, ListItemButton, ListItemText, Menu, MenuItem } from "@mui/material";

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


const NetworkMenu = () => {
    const chains: Chain[] = [sepolia, baseSepolia, base, /* arbitrumNova */];
    const metadataRef = useRef<any>(undefined); // Should be ChainMetadata but not sure why it's not being imported from thirdweb/chains? 

    useEffect(() => {
        (async function () {
            metadataRef.current = await Promise.all(chains.map((chain) => getChainMetadata(chain)));
            console.log(metadataRef.current);
        })()
    }, [])

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const open = Boolean(anchorEl)
    const handleClickListItem = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuItemClick = (event: MouseEvent<HTMLElement>, index: number) => {
        setSelectedIndex(index);
        setAnchorEl(null);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    return (
        <div>
            <List
                component="nav"
                aria-label="Device settings"
                sx={{ bgcolor: 'transparent' }}
            >
                <Chip
                    aria-haspopup="listbox"
                    aria-controls="lock-menu"
                    aria-label="Network"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClickListItem}

                    icon={<Image src={_generateIpfsHash(metadataRef.current[selectedIndex].icon.url)} width={20} height={20} alt={metadataRef.current[selectedIndex].name} />} label={metadataRef.current ? metadataRef.current[selectedIndex].name : "Select Network"} id="lock-button"
                    style={{ color: "white", ...roboto.style, fontSize: 16, background: "#283039", padding: 8 }}
                />
            </List>
            <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'lock-button',
                    role: 'listbox',
                }}
            >
                {metadataRef.current?.map((option: any, index: number) => (
                    <MenuItem
                        key={index}

                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                        value={option.name}
                    >
                        {option.icon?.url && <Image src={_generateIpfsHash(option.icon.url)} width={24} height={24} alt={option.name} style={{ marginRight: 8 }} />}
                        <p className={roboto.className}>{option.name}</p>
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );


    function _generateIpfsHash(ipfs: string) {
        const hash = ipfs.split("//")[1]
        return `https://ipfs.io/ipfs/${hash}`;
    }
}

export default Navbar