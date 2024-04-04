// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;
import {IERC20} from "../lib/forge-std/src/interfaces/IERC20.sol";

contract TokenBank {
    event TokenBank__TokenDeposited(
        address indexed depositer,
        address indexed erc20TokenAddress,
        uint256 amount
    );

    error TokenBank__InvalidERC20Token();
    error TokenBank__WithdrawerIsNotOwner();
    error TokenBank__DepositorHasInsufficientBalance();
    error TokenBank__DepositorHasInsufficientAllowance();
    error TokenBank__WithdrawlAmountExceedsDepositAmount();

    address immutable bankOwner;

    // Track users address to (tokens stored: token address - balance stored).
    mapping(address => mapping(address => uint256)) s_tokenBalanceByAddress;
    mapping(address => address[]) s_depositedTokensByAddress;

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
        // Checks
        if (
            IERC20(erc20TokenAddress).allowance(msg.sender, address(this)) <
            amount
        ) {
            revert TokenBank__DepositorHasInsufficientAllowance();
        }
        if (IERC20(erc20TokenAddress).balanceOf(msg.sender) < amount) {
            revert TokenBank__DepositorHasInsufficientBalance();
        }
        // Effects
        // First deposit.
        if (s_tokenBalanceByAddress[msg.sender][erc20TokenAddress] == 0) {
            s_depositedTokensByAddress[msg.sender].push(erc20TokenAddress);
        }
        s_tokenBalanceByAddress[msg.sender][erc20TokenAddress] += amount;

        // Interactions
        // Note: Must approve token before transferring them.
        bool success = IERC20(erc20TokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "Transfer failed");
        return true;
    }

    /**
        @dev allows user to withdraw a given amount of a specific ERC20 token 
     */
    function withdrawToken(
        address erc20TokenAddress,
        uint256 amount
    ) external returns (bool) {
        // Checks
        if (s_tokenBalanceByAddress[msg.sender][erc20TokenAddress] < amount) {
            revert TokenBank__WithdrawlAmountExceedsDepositAmount();
        }
        // Effects
        s_tokenBalanceByAddress[msg.sender][erc20TokenAddress] -= amount;
        if (s_tokenBalanceByAddress[msg.sender][erc20TokenAddress] == 0) {
            uint256 length = s_depositedTokensByAddress[msg.sender].length;
            for (uint256 i = 0; i < length; i++) {
                if (
                    s_depositedTokensByAddress[msg.sender][i] ==
                    erc20TokenAddress
                ) {
                    if (i != length - 1) {
                        s_depositedTokensByAddress[msg.sender][
                            i
                        ] = s_depositedTokensByAddress[msg.sender][length - 1];
                    }
                    s_depositedTokensByAddress[msg.sender].pop();
                    break;
                }
            }
        }

        // Interactions
        bool success = IERC20(erc20TokenAddress).transfer(msg.sender, amount);
        require(success, "Transaction Failed");
        return true;
    }

    function withdrawAll() external returns (bool) {
        uint256 depositedTokenCount = s_depositedTokensByAddress[msg.sender]
            .length;
        for (uint256 i = 0; i < depositedTokenCount; i++) {
            address tokenAddress = s_depositedTokensByAddress[msg.sender][i];
            uint256 maxWithdrawlAmount = s_tokenBalanceByAddress[msg.sender][
                tokenAddress
            ];
            // TODO: Come up with a smarter way to reset the state in for loop
            s_tokenBalanceByAddress[msg.sender][tokenAddress] = 0;
            s_depositedTokensByAddress[msg.sender][i] = address(0);
            bool success = IERC20(tokenAddress).transfer(
                msg.sender,
                maxWithdrawlAmount
            );
            require(success, "Transaction Failed");
        }
        return true;
    }

    function getTokenBalanceByAddress(
        address user,
        address erc20TokenAddress
    ) external view returns (uint256) {
        return s_tokenBalanceByAddress[user][erc20TokenAddress];
    }

    function getDepositedTokenAddressesByUser(
        address user
    ) public view returns (address[] memory) {
        return s_depositedTokensByAddress[user];
    }
}
