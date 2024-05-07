"use client";
import { roboto } from "@/app/fonts";
import Image from "next/image";

import { Chain, base, baseSepolia, getChainMetadata, sepolia } from "thirdweb/chains";

import { ArrowDropDown } from "@mui/icons-material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BlockIcon from '@mui/icons-material/Block';
import { Chip, Divider, List, Menu, MenuItem } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";
import { useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react";

const NetworkMenu = () => {
    const switchChain = useSwitchActiveWalletChain();
    const activeChain = useActiveWalletChain();
    const chains: Chain[] = [sepolia, base]; /* arbitrumNova */;
    const [chainMetadata, setChainMetdata] = useState<any>(undefined);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);


    useEffect(() => {
        (async function () {
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
    }, [activeChain, chains])

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

        switchChain(chains[index]);
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
                    deleteIcon={<ArrowDropDown style={{ color: "white" }} />}
                    onDelete={handleClickListItem}
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
                            onClick={(event) => {
                                handleMenuItemClick(event, index)
                            }}
                            value={option.name}
                        >
                            {option.icon?.url && <Image src={_generateIpfsHash(option.icon.url)} width={24} height={24} alt={option.name} style={{ marginRight: 8 }} />}
                            <p style={{ color: "darkgray" }} className={roboto.className}>{option.name}</p>
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

export default NetworkMenu;