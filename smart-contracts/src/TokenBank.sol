// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;
import {IERC20} from "../lib/forge-std/src/interfaces/IERC20.sol";

// TODO: Remove this as forge-std library has an IERC20 interface.
// Keep this for now so I can ingrain the ERC20 Interface in my head.
/* interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address addr) external view returns (uint256);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
} */

contract TokenBank {
    event TokenBank__TokenDeposited(
        address indexed depositer,
        address indexed erc20TokenAddress,
        uint256 amount
    );

    error TokenBank__InvalidERC20Token();
    error TokenBank__WithdrawerIsNotOwner();
    error TokenBank__DepositorHasInsufficientBalance();

    address immutable bankOwner;
    address[] s_users;
    // Track users address to (tokens stored: token address - balance stored).
    mapping(address => mapping(address => uint256)) s_tokenBalanceByAddress;
    // Tracks the existing tokens a user has a balance deposited for.
    mapping(address => string[]) s_tokenByAddress;

    constructor() {
        bankOwner = msg.sender;
    }

    /**
        @dev handles deposit of ERC20 tokens only, ether will have it's own special function
     */
    function depositToken(
        address erc20TokenAddress,
        uint256 amount
    ) external payable returns (bool) {
        if (IERC20(erc20TokenAddress).balanceOf(msg.sender) < amount) {
            revert TokenBank__DepositorHasInsufficientBalance();
        }

        return true;
    }

    function withdrawToken(
        address erc20TokenAddress,
        uint256 amount
    ) external {}

    function withdrawAll() external {}

    /**
        @dev fetches the users token balance for a given ERC20 token (their own balance not that of which they have deposited).
     */
    function getTokenBalance(
        address erc20TokenAddress
    ) internal view returns (uint256) {
        IERC20 token = IERC20(erc20TokenAddress);
        return token.balanceOf(msg.sender);
    }

    function getTokenBalanceByAddress(
        address user,
        address erc20TokenAddress
    ) external view returns (uint256) {
        return s_tokenBalanceByAddress[user][erc20TokenAddress];
    }
}
