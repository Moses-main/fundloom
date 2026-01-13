// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FundLoom (ETH + USDC Only)
 * @notice Decentralized crowdfunding with ETH and USDC.
 *         Campaigns are permissionless, no admin controls.
 *         Creator can withdraw when target is reached OR deadline passes.
 */

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FundLoom is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice USDC token address (set once at deployment)
    IERC20 public immutable USDC;

    /*//////////////////////////////////////////////////////////////
                                DATA
    //////////////////////////////////////////////////////////////*/

    struct Campaign {
        uint256 id;
        string name;
        address payable creator;
        uint256 targetAmount;        // ETH target (informational for ETH)
        uint256 raisedETH;
        uint256 raisedUSDC;
        uint256 deadline;
        uint256 createdAt;
        uint256 totalDonors;
    }

    uint256 public campaignIdCounter;
    mapping(uint256 => Campaign) public campaigns;
    uint256[] public campaignIds;

    mapping(uint256 => mapping(address => bool)) private hasDonated;

    mapping(uint256 => bool) public ethWithdrawn;
    mapping(uint256 => bool) public usdcWithdrawn;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event CampaignCreated(
        uint256 indexed id,
        string name,
        address indexed creator,
        uint256 targetAmount,
        uint256 deadline
    );

    event DonatedETH(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event DonatedUSDC(uint256 indexed campaignId, address indexed donor, uint256 amount);

    event WithdrawnETH(uint256 indexed campaignId, address indexed to, uint256 amount);
    event WithdrawnUSDC(uint256 indexed campaignId, address indexed to, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address usdcAddress) {
        require(usdcAddress != address(0), "INVALID_USDC");
        USDC = IERC20(usdcAddress);
    }

    /*//////////////////////////////////////////////////////////////
                           CAMPAIGN CREATION
    //////////////////////////////////////////////////////////////*/

    function createCampaign(
        string memory name,
        uint256 targetAmount,
        uint256 durationInSeconds
    ) external returns (uint256 id) {
        require(bytes(name).length > 0, "NO_NAME");
        require(durationInSeconds > 0, "BAD_DURATION");

        id = ++campaignIdCounter;

        campaigns[id] = Campaign({
            id: id,
            name: name,
            creator: payable(msg.sender),
            targetAmount: targetAmount,
            raisedETH: 0,
            raisedUSDC: 0,
            deadline: block.timestamp + durationInSeconds,
            createdAt: block.timestamp,
            totalDonors: 0
        });

        campaignIds.push(id);

        emit CampaignCreated(
            id,
            name,
            msg.sender,
            targetAmount,
            block.timestamp + durationInSeconds
        );
    }

    /*//////////////////////////////////////////////////////////////
                               DONATIONS
    //////////////////////////////////////////////////////////////*/

    function donateETH(uint256 campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(block.timestamp <= c.deadline, "CAMPAIGN_ENDED");
        require(msg.value > 0, "NO_VALUE");

        c.raisedETH += msg.value;

        if (!hasDonated[campaignId][msg.sender]) {
            hasDonated[campaignId][msg.sender] = true;
            c.totalDonors++;
        }

        emit DonatedETH(campaignId, msg.sender, msg.value);
    }

    function donateUSDC(uint256 campaignId, uint256 amount) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(block.timestamp <= c.deadline, "CAMPAIGN_ENDED");
        require(amount > 0, "NO_VALUE");

        USDC.safeTransferFrom(msg.sender, address(this), amount);
        c.raisedUSDC += amount;

        if (!hasDonated[campaignId][msg.sender]) {
            hasDonated[campaignId][msg.sender] = true;
            c.totalDonors++;
        }

        emit DonatedUSDC(campaignId, msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                              WITHDRAWALS
    //////////////////////////////////////////////////////////////*/

    function withdrawETH(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(msg.sender == c.creator, "NOT_CREATOR");
        require(!ethWithdrawn[campaignId], "ETH_ALREADY_WITHDRAWN");

        bool canWithdraw =
            c.raisedETH >= c.targetAmount ||
            block.timestamp >= c.deadline;

        require(canWithdraw, "WITHDRAW_NOT_ALLOWED");
        require(c.raisedETH > 0, "NO_ETH");

        ethWithdrawn[campaignId] = true;
        uint256 amount = c.raisedETH;
        c.raisedETH = 0;

        (bool success, ) = c.creator.call{value: amount}("");
        require(success, "ETH_TRANSFER_FAILED");

        emit WithdrawnETH(campaignId, c.creator, amount);
    }

    function withdrawUSDC(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(msg.sender == c.creator, "NOT_CREATOR");
        require(!usdcWithdrawn[campaignId], "USDC_ALREADY_WITHDRAWN");

        bool canWithdraw =
            c.raisedETH >= c.targetAmount ||
            block.timestamp >= c.deadline;

        require(canWithdraw, "WITHDRAW_NOT_ALLOWED");
        require(c.raisedUSDC > 0, "NO_USDC");

        usdcWithdrawn[campaignId] = true;
        uint256 amount = c.raisedUSDC;
        c.raisedUSDC = 0;

        USDC.safeTransfer(c.creator, amount);

        emit WithdrawnUSDC(campaignId, c.creator, amount);
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    function getCampaign(uint256 id) external view returns (Campaign memory) {
        require(campaigns[id].id != 0, "NO_CAMPAIGN");
        return campaigns[id];
    }

    function getAllCampaignIds() external view returns (uint256[] memory) {
        return campaignIds;
    }

    /*//////////////////////////////////////////////////////////////
                             ETH RECEIVER
    //////////////////////////////////////////////////////////////*/

    receive() external payable {}
}
