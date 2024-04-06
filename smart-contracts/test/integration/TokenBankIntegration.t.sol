// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Test} from "../../lib/forge-std/src/Test.sol";
import {console} from "../../lib/forge-std/src/console.sol";
import {DeployTokenBank} from "../../script/DeployTokenBank.s.sol";
import {TokenBank} from "../../src/TokenBank.sol";
import {MintableMockERC20} from "../mocks/MintableMockERC20.sol";

contract TestTokenBank is Test {
    uint160 private constant TEST_ADDRESS_VALUE = 18924;
    uint256 private constant INITIAL_MOCK_ERC20_BALANCE = 5000;
    DeployTokenBank deployTokenBank;
    TokenBank tokenBank;
    MintableMockERC20 tokenB;
    MintableMockERC20 tokenC;
    address testAddress;

    function setUp() external {
        testAddress = address(uint160(TEST_ADDRESS_VALUE));
        deployTokenBank = new DeployTokenBank();
        tokenBank = deployTokenBank.run();
    }

    modifier fundTwoTokensToUser() {
        tokenB = new MintableMockERC20();
        tokenC = new MintableMockERC20();
        tokenB.initialize("TestTokenB", "T20B", 4);
        tokenC.initialize("TestTokenC", "T20C", 4);
        tokenB.mint(testAddress, 5000);
        tokenC.mint(testAddress, 5000);
        _;
    }

    modifier depositTwoTokens() {
        vm.startPrank(testAddress);
        tokenB.approve(address(tokenBank), 5000);
        tokenC.approve(address(tokenBank), 5000);
        tokenBank.depositToken(address(tokenB), 5000);
        tokenBank.depositToken(address(tokenC), 5000);
        _;
    }

    /**
        This test demonstrates a user depositing two ERC20 Tokens in varying amounts
        and withdrawing a sufficient amount of each from both their deposits.
     */
    function testDepositAndWithdraw() public fundTwoTokensToUser {
        // given - tokens are approved & deposited.
        vm.startPrank(testAddress);
        tokenB.approve(address(tokenBank), 5000);
        tokenC.approve(address(tokenBank), 5000);
        tokenBank.depositToken(address(tokenB), 1000);
        tokenBank.depositToken(address(tokenC), 2000);

        // Reflect decrease in users balance
        assertEq(tokenB.balanceOf(testAddress), 4000);
        assertEq(tokenC.balanceOf(testAddress), 3000);

        // Confirm deposit has been received in contract.
        assertEq(tokenB.balanceOf(address(tokenBank)), 1000);
        assertEq(tokenC.balanceOf(address(tokenBank)), 2000);

        // Confirm state is appropriately updated.
        address[] memory depositedTokenAddresses = tokenBank
            .getDepositedTokenAddressesByUser(testAddress);
        address[2] memory expectedTokenAddresses = [
            address(tokenB),
            address(tokenC)
        ];
        uint256 depositedTokens = depositedTokenAddresses.length;
        assertEq(depositedTokens, expectedTokenAddresses.length);
        for (uint i = 0; i < depositedTokens; i++) {
            assertEq(depositedTokenAddresses[i], expectedTokenAddresses[i]);
        }
        assertEq(
            tokenBank.getTokenBalanceByAddress(testAddress, address(tokenB)),
            1000
        );
        assertEq(
            tokenBank.getTokenBalanceByAddress(testAddress, address(tokenC)),
            2000
        );

        // when - withdrawing all of tokenB's deposited amount and a partial withdrawl of tokenC.
        tokenBank.withdrawToken(address(tokenB), 1000);
        tokenBank.withdrawToken(address(tokenC), 500);

        // then
        address[1] memory expectedTokenAddressesPostWithdrawl = [
            address(tokenC)
        ];
        depositedTokenAddresses = tokenBank.getDepositedTokenAddressesByUser(
            testAddress
        );
        assertEq(
            depositedTokenAddresses.length,
            expectedTokenAddressesPostWithdrawl.length
        );
        assertEq(
            depositedTokenAddresses[0],
            expectedTokenAddressesPostWithdrawl[0]
        );
    }

    function testWithdrawAll() public fundTwoTokensToUser depositTwoTokens {
        // given - user has deposited two tokens
        address[] memory depositedTokens = tokenBank
            .getDepositedTokenAddressesByUser(testAddress);
        address[2] memory expectedDepositedTokens = [
            address(tokenB),
            address(tokenC)
        ];

        assertEq(depositedTokens.length, expectedDepositedTokens.length);
        for (uint256 i = 0; i < depositedTokens.length; i++) {
            assertEq(depositedTokens[i], expectedDepositedTokens[i]);
        }
        // when - attempting to withdraw all
        tokenBank.withdrawAll();

        // then
        depositedTokens = tokenBank.getDepositedTokenAddressesByUser(
            testAddress
        );
        assertEq(depositedTokens.length, 0);

        for (uint i = 0; i < expectedDepositedTokens.length; i++) {
            assertEq(
                tokenBank.getTokenBalanceByAddress(
                    testAddress,
                    expectedDepositedTokens[i]
                ),
                0
            );
        }
    }
}
