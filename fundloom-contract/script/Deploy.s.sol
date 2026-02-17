// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FundLoom} from "../src/FundLoom.sol";

contract DeployFundLoom is Script {
    function run() external {
        // USDC address on Base Sepolia
        address usdcAddress = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
        uint16 withdrawalFeeBps = 100; // 1%

        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(privateKey);
        console.log("Deploying from:", deployer);

        vm.startBroadcast(privateKey);
        FundLoom fundLoom = new FundLoom(usdcAddress, withdrawalFeeBps);
        vm.stopBroadcast();

        console.log("FundLoom deployed to:", address(fundLoom));
        console.log("USDC Address:", usdcAddress);
        console.log("Withdrawal Fee (bps):", withdrawalFeeBps);
        console.log("Platform Fee Receiver:", deployer);
    }
}
