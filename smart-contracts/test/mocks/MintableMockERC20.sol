// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {MockERC20} from "../../lib/forge-std/src/mocks/MockERC20.sol";

contract MintableMockERC20 is MockERC20 {
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
