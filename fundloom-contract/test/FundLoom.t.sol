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

    uint16 public constant FEE_BPS = 100; // 1%
    uint256 public constant TARGET_AMOUNT = 10 ether;
    uint256 public constant CAMPAIGN_DURATION = 7 days;
    string public constant CAMPAIGN_NAME = "Test Campaign";

    uint256 public campaignId;

    function setUp() public {
        usdc = new MockUSDC();
        usdc.mint(donor1, 1000 * 10 ** usdc.decimals());
        usdc.mint(donor2, 1000 * 10 ** usdc.decimals());

        vm.prank(creator);
        fundLoom = new FundLoom(address(usdc), FEE_BPS);

        vm.prank(creator);
        campaignId = fundLoom.createCampaign(CAMPAIGN_NAME, TARGET_AMOUNT, CAMPAIGN_DURATION);
    }

    function test_CreateCampaign() public view {
        (uint256 id,, address storedCreator, uint256 target,,, uint256 deadline,,) = fundLoom.campaigns(campaignId);
        assertEq(id, campaignId, "Campaign ID mismatch");
        assertEq(storedCreator, creator, "Creator mismatch");
        assertEq(target, TARGET_AMOUNT, "Target amount mismatch");
        assertGt(deadline, block.timestamp, "Deadline should be in the future");
    }

    function test_TracksCampaignIdsByCreator() public view {
        uint256[] memory ids = fundLoom.getCampaignsByCreator(creator);
        assertEq(ids.length, 1, "creator should have one campaign");
        assertEq(ids[0], campaignId, "creator campaign id mismatch");
    }

    function test_DonateETH() public {
        uint256 donationAmount = 1 ether;
        vm.deal(donor1, donationAmount);
        vm.prank(donor1);
        fundLoom.donateETH{value: donationAmount}(campaignId);

        (,,,, uint256 raisedETH,,,,) = fundLoom.campaigns(campaignId);
        assertEq(raisedETH, donationAmount, "ETH donation not recorded");
    }

    function test_DonateUSDC() public {
        uint256 donationAmount = 100 * 10 ** usdc.decimals();
        vm.startPrank(donor1);
        usdc.approve(address(fundLoom), donationAmount);
        fundLoom.donateUSDC(campaignId, donationAmount);
        vm.stopPrank();

        (,,,,, uint256 raisedUSDC,,,) = fundLoom.campaigns(campaignId);
        assertEq(raisedUSDC, donationAmount, "USDC donation not recorded");
    }

    function test_WithdrawETH_AfterTarget_DeductsFee() public {
        uint256 donationAmount = TARGET_AMOUNT;

        vm.deal(donor1, donationAmount);
        vm.prank(donor1);
        fundLoom.donateETH{value: donationAmount}(campaignId);

        uint256 creatorBalanceBefore = creator.balance;
        uint256 platformBalanceBefore = address(this).balance;

        vm.prank(creator);
        fundLoom.withdrawETH(campaignId);

        uint256 fee = (donationAmount * FEE_BPS) / 10_000;
        uint256 creatorAmount = donationAmount - fee;

        assertEq(creator.balance, creatorBalanceBefore + creatorAmount, "ETH creator amount mismatch");
        assertEq(address(this).balance, platformBalanceBefore + fee, "ETH fee amount mismatch");
    }

    function test_WithdrawUSDC_AfterTarget_DeductsFee() public {
        uint256 donationAmount = 100 * 10 ** usdc.decimals();

        vm.startPrank(donor1);
        usdc.approve(address(fundLoom), donationAmount);
        fundLoom.donateUSDC(campaignId, donationAmount);
        vm.stopPrank();

        vm.deal(donor2, TARGET_AMOUNT);
        vm.prank(donor2);
        fundLoom.donateETH{value: TARGET_AMOUNT}(campaignId);

        uint256 creatorBalanceBefore = usdc.balanceOf(creator);
        uint256 platformBalanceBefore = usdc.balanceOf(address(this));

        vm.prank(creator);
        fundLoom.withdrawUSDC(campaignId);

        uint256 fee = (donationAmount * FEE_BPS) / 10_000;
        uint256 creatorAmount = donationAmount - fee;

        assertEq(usdc.balanceOf(creator), creatorBalanceBefore + creatorAmount, "USDC creator amount mismatch");
        assertEq(usdc.balanceOf(address(this)), platformBalanceBefore + fee, "USDC fee amount mismatch");
    }

    function test_WithdrawBeforeDeadline_Reverts() public {
        vm.expectRevert(FundLoom.WithdrawNotAllowed.selector);
        vm.prank(creator);
        fundLoom.withdrawETH(campaignId);
    }

    function test_WithdrawAfterDeadline() public {
        uint256 donationAmount = 1 ether;
        vm.deal(donor1, donationAmount);
        vm.prank(donor1);
        fundLoom.donateETH{value: donationAmount}(campaignId);

        vm.warp(block.timestamp + CAMPAIGN_DURATION + 1);

        uint256 creatorBalanceBefore = creator.balance;
        vm.prank(creator);
        fundLoom.withdrawETH(campaignId);

        uint256 fee = (donationAmount * FEE_BPS) / 10_000;
        assertEq(creator.balance, creatorBalanceBefore + donationAmount - fee, "ETH not withdrawn to creator");
    }

    function test_GetCampaign() public view {
        FundLoom.Campaign memory campaign = fundLoom.getCampaign(campaignId);
        assertEq(campaign.id, campaignId, "Campaign ID mismatch");
        assertEq(campaign.name, CAMPAIGN_NAME, "Campaign name mismatch");
        assertEq(campaign.creator, creator, "Creator address mismatch");
    }

    function test_GetCampaignIds() public view {
        uint256[] memory ids = fundLoom.getAllCampaignIds();
        assertEq(ids.length, 1, "Should have one campaign");
        assertEq(ids[0], campaignId, "Campaign ID in array mismatch");
    }
}
