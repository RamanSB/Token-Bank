// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Script} from "../lib/forge-std/src/Script.sol";
import {TokenBank} from "../src/TokenBank.sol";

contract DeployTokenBank is Script {
    function run() external returns (TokenBank) {
        vm.startBroadcast();
        TokenBank tokenBank = new TokenBank();
        vm.stopBroadcast();
        return tokenBank;
    }
}
