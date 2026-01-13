// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FundLoom} from "../src/FundLoom.sol";

contract DeployFundLoom is Script {
    function run() external {
        // USDC address on Base Sepolia
        address usdcAddress = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
        
        // Use the private key directly (for testing only - in production, use environment variables)
        uint256 privateKey = 0xcb601f9647fa12dea8081b5bfed574f40f4f41996401ea5901bcb314392e90e9;
        
        // Get deployer address
        address deployer = vm.addr(privateKey);
        console.log("Deploying from:", deployer);
        
        // Deploy the contract
        vm.startBroadcast(privateKey);
        FundLoom fundLoom = new FundLoom(usdcAddress);
        vm.stopBroadcast();
        
        console.log("FundLoom deployed to:", address(fundLoom));
        console.log("USDC Address:", usdcAddress);
        console.log("Deployer Address:", deployer);
    }
}