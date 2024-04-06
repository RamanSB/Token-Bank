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
    MintableMockERC20 tokenA;
    MintableMockERC20 tokenB;
    MintableMockERC20 tokenC;
    address testAddress;

    function setUp() external {
        // Create MintableMockERC20 Token
        tokenA = new MintableMockERC20();
        tokenA.initialize("TestERC20", "T20A", 4);

        // Assign tokens to test address
        testAddress = address(uint160(TEST_ADDRESS_VALUE));
        tokenA.mint(testAddress, INITIAL_MOCK_ERC20_BALANCE);

        deployTokenBank = new DeployTokenBank();
        tokenBank = deployTokenBank.run();
        console.log(
            address(deployTokenBank),
            "[DeployScript] Deploy Token Bank Address"
        );
        console.log(address(tokenBank), "Token Bank Address");
    }

    modifier depositOfTokenAPerformed() {
        vm.startPrank(testAddress);
        tokenA.approve(address(tokenBank), 2000);
        tokenBank.depositToken(address(tokenA), 2000);
        _;
    }

    function testShouldRevertWhenUserHasInvalidTokenBalance() public {
        vm.expectRevert();
        // given - testAddress (depositor) has an initial amount of tokens
        // TODO: Add a vm.startPrank to perform txn on behalf of depositor
        // when - attempting to deposit more than they have.
        tokenBank.depositToken(address(tokenA), INITIAL_MOCK_ERC20_BALANCE * 2);

        // then - revert (as per top line of function)
    }

    function testDepositToken() public {
        // given - user has initial balance
        // when - user deposits ERC token
        vm.startPrank(testAddress);
        // TODO: Listen or assert on the approval event.
        tokenA.approve(address(tokenBank), 200);
        console.log(
            tokenA.allowance(testAddress, address(tokenBank)),
            "Test Address allowance..."
        );
        tokenBank.depositToken(address(tokenA), 200);

        // then - update user balance, update contract balance
        assertEq(tokenA.balanceOf(address(tokenBank)), 200);
        assertEq(
            tokenA.balanceOf(testAddress),
            INITIAL_MOCK_ERC20_BALANCE - 200
        );
        assertEq(
            tokenBank.getTokenBalanceByAddress(testAddress, address(tokenA)),
            200
        );
        address[1] memory expectedTokenAddresses = [address(tokenA)];
        assertEq(
            tokenBank.getDepositedTokenAddressesByUser(testAddress).length,
            expectedTokenAddresses.length
        );
        assertEq(
            tokenBank.getDepositedTokenAddressesByUser(testAddress)[0],
            expectedTokenAddresses[0]
        );
    }

    function testShouldRevertIfInsufficientAllowance() public {
        // given - user has initial balance
        // when - approved allowance amount < deposit amount
        vm.startPrank(testAddress);
        tokenA.approve(address(tokenBank), 100);
        vm.expectRevert();
        tokenBank.depositToken(address(tokenA), 200);
    }

    function testShouldRevertWhenWithdrawingMoreThanDepositAmount()
        public
        depositOfTokenAPerformed
    {
        // given - deposit has occurred.
        // when - attempting to withdraw amount > deposit, then - revert
        vm.expectRevert();
        tokenBank.withdrawToken(address(tokenA), 5000);
    }

    function testShouldWithdrawUserFunds() public depositOfTokenAPerformed {
        // given - deposit has occurred.
        address[] memory depositedTokenAddresses = tokenBank
            .getDepositedTokenAddressesByUser(testAddress);
        address[1] memory expectedTokenDepositAddress = [address(tokenA)];
        assertEq(
            depositedTokenAddresses.length,
            expectedTokenDepositAddress.length
        );
        assertEq(depositedTokenAddresses[0], expectedTokenDepositAddress[0]);
        // when - attempting to withdraw amount < deposit
        uint256 contractTokenBalanceBeforeWithdrawl = tokenA.balanceOf(
            address(tokenBank)
        );
        tokenBank.withdrawToken(address(tokenA), 100);
        // then
        depositedTokenAddresses = tokenBank.getDepositedTokenAddressesByUser(
            testAddress
        );
        assertEq(depositedTokenAddresses.length, 1);
        assertEq(depositedTokenAddresses[0], expectedTokenDepositAddress[0]);
        // ensure user balance updated
        assertEq(tokenA.balanceOf(testAddress), 5000 - 2000 + 100);
        // ensure TokenBank contract balance of tokenA reduced.
        assertEq(
            tokenA.balanceOf(address(tokenBank)),
            contractTokenBalanceBeforeWithdrawl - 100
        );
        // ensure state is updated.
        assertEq(
            tokenBank.getTokenBalanceByAddress(testAddress, address(tokenA)),
            2000 - 100
        );
    }

    function testDepositEther() public {
        // given - user has ether
        vm.deal(testAddress, 100 ether);

        // when - depositng ether.
        vm.prank(testAddress);
        (bool success, bytes memory data) = address(tokenBank).call{
            value: 2.5 ether
        }("This is a message");
        console.logBytes(data);
        console.log(success);

        // then
        assertEq(address(tokenBank).balance, 2.5 ether);
        assertEq(tokenBank.getEtherBalanceByAddress(testAddress), 2.5 ether);
    }

    modifier etherDeposited(uint256 amount) {
        vm.deal(testAddress, 100 ether);
        vm.prank(testAddress);
        (bool success, ) = address(tokenBank).call{value: amount}("");
        console.log(success, "Is ETH Deposit Valid");
        _;
    }

    function testPartialWithrawOfEther() public etherDeposited(2.5 ether) {
        // given - 2.5 ether has been deposited.
        assertEq(address(tokenBank).balance, 2.5 ether);
        assertEq(tokenBank.getEtherBalanceByAddress(testAddress), 2.5 ether);
        // when - we attempt to withdraw 2 ether.
        vm.startPrank(testAddress);
        bool success = tokenBank.withdrawEther(2 ether);
        // then
        assertEq(success, true);
        assertEq(tokenBank.getEtherBalanceByAddress(testAddress), 0.5 ether);
    }
}
