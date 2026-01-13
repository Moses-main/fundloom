// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/FundLoom.sol";
import "./mocks/MockUSDC.sol";

contract FundLoomTest is Test {
    FundLoom public fundLoom;
    MockUSDC public usdc;
    
    address public creator = address(0x1);
    address public donor1 = address(0x2);
    address public donor2 = address(0x3);
    
    uint256 public constant TARGET_AMOUNT = 10 ether;
    uint256 public constant CAMPAIGN_DURATION = 7 days;
    string public constant CAMPAIGN_NAME = "Test Campaign";
    
    uint256 public campaignId;
    
    function setUp() public {
        // Set up test environment
        vm.startPrank(creator);
        usdc = new MockUSDC();
        usdc.mint(donor1, 1000 * 10 ** usdc.decimals());
        usdc.mint(donor2, 1000 * 10 ** usdc.decimals());
        fundLoom = new FundLoom(address(usdc));
        
        // Create a test campaign
        campaignId = fundLoom.createCampaign(
            CAMPAIGN_NAME,
            TARGET_AMOUNT,
            CAMPAIGN_DURATION
        );
        vm.stopPrank();
    }
    
    // Test campaign creation
    function test_CreateCampaign() public {
        // Check if campaign was created successfully
        (uint256 id, , , uint256 target, , , uint256 deadline, , ) = fundLoom.campaigns(campaignId);
        
        assertEq(id, campaignId, "Campaign ID mismatch");
        assertEq(target, TARGET_AMOUNT, "Target amount mismatch");
        assertGt(deadline, block.timestamp, "Deadline should be in the future");
    }
    
    // Test ETH donation
    function test_DonateETH() public {
        uint256 donationAmount = 1 ether;
        
        // Donate ETH to the campaign
        vm.deal(donor1, donationAmount);
        vm.prank(donor1);
        fundLoom.donateETH{value: donationAmount}(campaignId);
        
        // Check if donation was recorded
        (, , , , uint256 raisedETH, , , , ) = fundLoom.campaigns(campaignId);
        assertEq(raisedETH, donationAmount, "ETH donation not recorded");
    }
    
    // Test USDC donation
    function test_DonateUSDC() public {
        uint256 donationAmount = 100 * 10 ** usdc.decimals();
        
        // Approve and donate USDC
        vm.startPrank(donor1);
        usdc.approve(address(fundLoom), donationAmount);
        fundLoom.donateUSDC(campaignId, donationAmount);
        vm.stopPrank();
        
        // Check if donation was recorded
        (, , , , , uint256 raisedUSDC, , , ) = fundLoom.campaigns(campaignId);
        assertEq(raisedUSDC, donationAmount, "USDC donation not recorded");
    }
    
    // Test ETH withdrawal after target reached
    function test_WithdrawETH_AfterTarget() public {
        uint256 donationAmount = TARGET_AMOUNT;
        
        // Donate enough ETH to reach target
        vm.deal(donor1, donationAmount);
        vm.prank(donor1);
        fundLoom.donateETH{value: donationAmount}(campaignId);
        
        // Withdraw ETH as creator
        uint256 creatorBalanceBefore = creator.balance;
        vm.prank(creator);
        fundLoom.withdrawETH(campaignId);
        
        // Check if ETH was withdrawn
        assertEq(creator.balance, creatorBalanceBefore + donationAmount, "ETH not withdrawn to creator");
    }
    
    // Test USDC withdrawal after target reached
    function test_WithdrawUSDC_AfterTarget() public {
        uint256 donationAmount = 100 * 10 ** usdc.decimals();
        
        // Donate USDC
        vm.startPrank(donor1);
        usdc.approve(address(fundLoom), donationAmount);
        fundLoom.donateUSDC(campaignId, donationAmount);
        vm.stopPrank();
        
        // Donate enough ETH to reach target
        vm.deal(donor2, TARGET_AMOUNT);
        vm.prank(donor2);
        fundLoom.donateETH{value: TARGET_AMOUNT}(campaignId);
        
        // Withdraw USDC as creator
        uint256 creatorBalanceBefore = usdc.balanceOf(creator);
        vm.prank(creator);
        fundLoom.withdrawUSDC(campaignId);
        
        // Check if USDC was withdrawn
        assertEq(usdc.balanceOf(creator), creatorBalanceBefore + donationAmount, "USDC not withdrawn to creator");
    }
    
    // Test withdrawal before target reached and deadline not passed
    function test_WithdrawBeforeDeadline_Reverts() public {
        // Expect revert when trying to withdraw before deadline without reaching target
        vm.expectRevert("WITHDRAW_NOT_ALLOWED");
        vm.prank(creator);
        fundLoom.withdrawETH(campaignId);
    }
    
    // Test withdrawal after deadline
    function test_WithdrawAfterDeadline() public {
        // Make a small ETH donation
        uint256 donationAmount = 1 ether;
        vm.deal(donor1, donationAmount);
        vm.prank(donor1);
        fundLoom.donateETH{value: donationAmount}(campaignId);
        
        // Fast forward time to after deadline
        vm.warp(block.timestamp + CAMPAIGN_DURATION + 1);
        
        // Should be able to withdraw even if target not reached
        uint256 creatorBalanceBefore = creator.balance;
        vm.prank(creator);
        fundLoom.withdrawETH(campaignId);
        
        // Check if ETH was withdrawn
        assertEq(creator.balance, creatorBalanceBefore + donationAmount, "ETH not withdrawn to creator");
    }
    
    // Test getCampaign function
    function test_GetCampaign() public {
        FundLoom.Campaign memory campaign = fundLoom.getCampaign(campaignId);
        
        assertEq(campaign.id, campaignId, "Campaign ID mismatch");
        assertEq(campaign.name, CAMPAIGN_NAME, "Campaign name mismatch");
        assertEq(campaign.creator, creator, "Creator address mismatch");
    }
    
    // Test getCampaignIds function
    function test_GetCampaignIds() public {
        uint256[] memory ids = fundLoom.getAllCampaignIds();
        
        assertEq(ids.length, 1, "Should have one campaign");
        assertEq(ids[0], campaignId, "Campaign ID in array mismatch");
    }
}