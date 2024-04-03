// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Test} from "../lib/forge-std/src/Test.sol";
import {DeployTokenBank} from "../script/DeployTokenBank.s.sol";
import {TokenBank} from "../src/TokenBank.sol";
import {MintableMockERC20} from "./mocks/MintableMockERC20.sol";

contract TestTokenBank is Test {
    uint160 private constant TEST_ADDRESS_VALUE = 18924;
    DeployTokenBank deployTokenBank;
    TokenBank tokenBank;
    MintableMockERC20 token;
    address testAddress;

    function setUp() external {
        // Create MintableMockERC20 Token
        token = new MintableMockERC20();
        token.initialize("TestERC20", "TB", 4);

        // Assign tokens to test address
        testAddress = address(uint160(TEST_ADDRESS_VALUE));
        token.mint(testAddress, 250);

        deployTokenBank = new DeployTokenBank();
        tokenBank = deployTokenBank.run();
    }

    function testShouldRevertWhenUserHasInvalidTokenBalance() public {
        vm.expectRevert();
        // given - testAddress (depositor) has an initial amount of tokens

        // when - attempting to deposit more than they have.
        tokenBank.depositToken(address(token), 500);

        // then - revert (as per top line of function)
    }
}
