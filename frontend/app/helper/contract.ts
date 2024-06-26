import { base, baseSepolia, ethereum, sepolia } from "thirdweb/chains";
import { TokenData } from "./types";

export const SEPOLIA_TOKEN_BANK_CONTRACT_ADDRESS = "0x155B79d1Aa17e021bD495f99305aC2DeDEe958de";
export const BASE_TOKEN_BANK_CONTRACT_ADDRESS = "0x3e01A0F684c0B3Af7b5a151cb0958b01B082BeF8";

export const TOKEN_BANK_ADDRESS_BY_CHAIN_ID = new Map<number, string>([[base.id, BASE_TOKEN_BANK_CONTRACT_ADDRESS], [sepolia.id, SEPOLIA_TOKEN_BANK_CONTRACT_ADDRESS]]);

export const NETWORK_TO_NATIVE_TOKEN = new Map<number, TokenData>([
    [ethereum.id, { name: "Ethereum", ticker: "ETH", contractAddress: "", icon: "https://etherscan.io/images/svg/brands/ethereum-original.svg", decimals: 18 }],
    [sepolia.id, { name: "Ethereum", ticker: "ETH", contractAddress: "", icon: "https://etherscan.io/images/svg/brands/ethereum-original.svg", decimals: 18 }],
    [base.id, { name: "Ethereum", ticker: "ETH", contractAddress: "", icon: "https://etherscan.io/images/svg/brands/ethereum-original.svg", decimals: 18 }],
    [baseSepolia.id, { name: "Ethereum", ticker: "ETH", contractAddress: "", icon: "https://etherscan.io/images/svg/brands/ethereum-original.svg", decimals: 18 }]
]);

export const THIRDWEB_CHAIN_ID_TO_ALCHEMY_NETWORK_NAMES = new Map<number, string>([[ethereum.id, "eth-mainnet"], [sepolia.id, "eth-sepolia"], [base.id, "base-mainnet"]]);

export const ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "TokenBank__DepositorHasInsufficientAllowance",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TokenBank__DepositorHasInsufficientBalance",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TokenBank__InvalidERC20Token",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TokenBank__WithdrawerIsNotOwner",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TokenBank__WithdrawlAmountExceedsDepositAmount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "depositer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "erc20TokenAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "TokenBank__TokenDeposited",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "erc20TokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "depositToken",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getDepositedTokenAddressesByUser",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getEtherBalanceByAddress",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "erc20TokenAddress",
                "type": "address"
            }
        ],
        "name": "getTokenBalanceByAddress",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawAll",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawEther",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "erc20TokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawToken",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];