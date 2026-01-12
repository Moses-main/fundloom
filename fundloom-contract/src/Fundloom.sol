// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FundLoom
 * @notice A crowdfunding platform supporting ETH and USDC donations
 * @dev Supports campaign creation, ETH/USDC donations, and secure withdrawals
 */

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FundLoom is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------
    // Data
    // ---------------------------------------------------------------------
    struct Campaign {
        uint256 id;                 // incremental id
        string name;                // campaign name/title
        address payable creator;     // campaign creator (has withdraw rights)
        address payable charity;     // withdrawal destination
        uint256 targetAmount;        // goal in wei (informational)
        uint256 raisedAmount;        // ETH raised (net of withdrawals)
        uint256 deadline;            // unix seconds
        uint256 createdAt;           // unix seconds
        uint256 totalDonors;         // unique donors count
        bool isFundsTransferred;     // flag to track if funds were transferred
    }

    uint256 public campaignIdCounter;
    mapping(uint256 => Campaign) public campaigns;
    uint256[] public campaignIds;

    // USDC token address (set in constructor)
    address public immutable USDC;

    // Unique donors per campaign
    mapping(uint256 => mapping(address => bool)) private hasDonated;

    // USDC raised per campaign
    mapping(uint256 => uint256) public usdcRaised;

    // Optional global donor leaderboard (ETH-only aggregate)
    mapping(address => uint256) public donorTotalETH;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------
    event CampaignCreated(uint256 indexed id, string name, address indexed creator, address indexed charity);
    event DonatedETH(uint256 indexed campaignId, address indexed donor, uint256 amountETH);
    event WithdrawnETH(uint256 indexed campaignId, address indexed to, uint256 amountETH);
    event DonatedUSDC(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event WithdrawnUSDC(uint256 indexed campaignId, address indexed to, uint256 amount);

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    constructor(address usdcAddress) {
        require(usdcAddress != address(0), "INVALID_USDC_ADDRESS");
        USDC = usdcAddress;
        campaignIdCounter = 0;
    }

    // ---------------------------------------------------------------------
    // Campaigns
    // ---------------------------------------------------------------------
    function createCampaign(
        string memory name,
        address payable charity,
        uint256 targetAmount,
        uint256 durationInSeconds
    ) external returns (uint256 id) {
        require(bytes(name).length > 0, "NO_NAME");
        require(charity != address(0), "BAD_CHARITY");
        require(durationInSeconds > 0, "BAD_DURATION");

        id = ++campaignIdCounter;
        campaigns[id] = Campaign({
            id: id,
            name: name,
            creator: payable(msg.sender),
            charity: charity,
            targetAmount: targetAmount,
            raisedAmount: 0,
            deadline: block.timestamp + durationInSeconds,
            createdAt: block.timestamp,
            totalDonors: 0,
            isFundsTransferred: false
        });
        campaignIds.push(id);
        emit CampaignCreated(id, name, msg.sender, charity);
    }

    // ---------------------------------------------------------------------
    // Donations (ETH)
    // ---------------------------------------------------------------------
    function donate(uint256 campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(block.timestamp <= c.deadline, "CAMPAIGN_ENDED");
        require(msg.value > 0, "NO_VALUE");

        c.raisedAmount += msg.value;
        if (!hasDonated[campaignId][msg.sender]) {
            hasDonated[campaignId][msg.sender] = true;
            c.totalDonors += 1;
        }
        donorTotalETH[msg.sender] += msg.value;

        emit DonatedETH(campaignId, msg.sender, msg.value);
    }

    // ---------------------------------------------------------------------
    // Donations (USDC)
    // ---------------------------------------------------------------------
    function donateUSDC(uint256 campaignId, uint256 amount) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(block.timestamp <= c.deadline, "CAMPAIGN_ENDED");
        require(amount > 0, "NO_VALUE");

        IERC20(USDC).safeTransferFrom(msg.sender, address(this), amount);

        usdcRaised[campaignId] += amount;
        if (!hasDonated[campaignId][msg.sender]) {
            hasDonated[campaignId][msg.sender] = true;
            c.totalDonors += 1;
        }

        emit DonatedUSDC(campaignId, msg.sender, amount);
    }

    // ---------------------------------------------------------------------
    // Withdrawals
    // ---------------------------------------------------------------------
    function withdrawETH(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.creator == msg.sender, "NOT_CREATOR");
        require(block.timestamp > c.deadline, "CAMPAIGN_NOT_ENDED");
        require(c.raisedAmount > 0, "NO_FUNDS");
        require(!c.isFundsTransferred, "FUNDS_ALREADY_TRANSFERRED");

        uint256 amount = c.raisedAmount;
        c.raisedAmount = 0;
        c.isFundsTransferred = true;

        (bool success, ) = c.creator.call{value: amount}("");
        require(success, "TRANSFER_FAILED");
    
    /**
     * @dev Transfer ERC20 tokens to another address (can only be called by the creator after campaign ends)
     * @param campaignId ID of the campaign
     * @param token Address of the ERC20 token
     * @param to Address to transfer the tokens to
     */
    function transferTokenFunds(uint256 campaignId, address token, address to) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.creator == msg.sender, "NOT_CREATOR");
        require(block.timestamp > c.deadline, "CAMPAIGN_NOT_ENDED");
        require(isAllowedToken[token], "TOKEN_NOT_ALLOWED");
        require(to != address(0), "INVALID_RECIPIENT");
        
        uint256 amount = tokenRaised[campaignId][token];
        require(amount > 0, "NO_TOKEN_BALANCE");
        
        tokenRaised[campaignId][token] = 0;
        IERC20(token).safeTransfer(to, amount);
        
        emit TokenFundsTransferred(campaignId, token, to, amount);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------
    function getCampaign(uint256 id) external view returns (Campaign memory) {
        require(campaigns[id].id != 0, "NO_CAMPAIGN");
        return campaigns[id];
    }

    /// @notice Get live balance for ETH (token=0) or ERC20
    function getCampaignBalance(uint256 id, address token) external view returns (uint256) {
        require(campaigns[id].id != 0, "NO_CAMPAIGN");
        if (token == address(0)) {
            return campaigns[id].raisedAmount;
        } else {
            return tokenRaised[id][token];
        }
    }

    function getAllCampaignIds() external view returns (uint256[] memory) {
        return campaignIds;
    }

    // ---------------------------------------------------------------------
    // ETH acceptance (default)
    // ---------------------------------------------------------------------
    receive() external payable {}
    fallback() external payable {}
}
