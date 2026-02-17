// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FundLoom (ETH + USDC)
 * @notice Permissionless crowdfunding with ETH and USDC donations.
 *         Creators withdraw raised funds after target is met or deadline passes.
 *         Withdrawal fee is deducted at withdraw time and routed to platform fee receiver.
 */

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FundLoom is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint16 public constant MAX_FEE_BPS = 10_000;

    /// @notice USDC token address set at deployment.
    IERC20 public immutable USDC;

    /// @notice Withdrawal fee in basis points (e.g., 100 = 1%).
    uint16 public immutable withdrawalFeeBps;

    /// @notice Platform fee receiver (deployer by default).
    address payable public immutable platformFeeReceiver;

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidUsdcAddress();
    error InvalidFeeBps();
    error InvalidCampaign();
    error InvalidName();
    error InvalidDuration();
    error CampaignEnded();
    error NoValue();
    error NotCreator();
    error AlreadyWithdrawn();
    error WithdrawNotAllowed();
    error TransferFailed();

    /*//////////////////////////////////////////////////////////////
                                DATA
    //////////////////////////////////////////////////////////////*/

    struct Campaign {
        uint256 id;
        string name;
        address payable creator;
        uint256 targetAmount; // ETH target threshold used for unlock condition.
        uint256 raisedETH;
        uint256 raisedUSDC;
        uint256 deadline;
        uint256 createdAt;
        uint256 totalDonors;
    }

    uint256 public campaignIdCounter;
    mapping(uint256 => Campaign) public campaigns;
    uint256[] private campaignIds;

    /// @notice Tracks campaign IDs by creator.
    mapping(address => uint256[]) private creatorCampaignIds;

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

    event WithdrawnETH(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 creatorAmount,
        uint256 feeAmount
    );
    event WithdrawnUSDC(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 creatorAmount,
        uint256 feeAmount
    );

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @param usdcAddress USDC ERC20 token contract.
    /// @param feeBps Withdrawal fee in basis points.
    constructor(address usdcAddress, uint16 feeBps) {
        if (usdcAddress == address(0)) revert InvalidUsdcAddress();
        if (feeBps > MAX_FEE_BPS) revert InvalidFeeBps();

        USDC = IERC20(usdcAddress);
        withdrawalFeeBps = feeBps;
        platformFeeReceiver = payable(msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                           CAMPAIGN CREATION
    //////////////////////////////////////////////////////////////*/

    function createCampaign(
        string calldata name,
        uint256 targetAmount,
        uint256 durationInSeconds
    ) external returns (uint256 id) {
        if (bytes(name).length == 0) revert InvalidName();
        if (durationInSeconds == 0) revert InvalidDuration();

        id = ++campaignIdCounter;
        uint256 deadline = block.timestamp + durationInSeconds;

        campaigns[id] = Campaign({
            id: id,
            name: name,
            creator: payable(msg.sender),
            targetAmount: targetAmount,
            raisedETH: 0,
            raisedUSDC: 0,
            deadline: deadline,
            createdAt: block.timestamp,
            totalDonors: 0
        });

        campaignIds.push(id);
        creatorCampaignIds[msg.sender].push(id);

        emit CampaignCreated(id, name, msg.sender, targetAmount, deadline);
    }

    /*//////////////////////////////////////////////////////////////
                               DONATIONS
    //////////////////////////////////////////////////////////////*/

    function donateETH(uint256 campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        if (c.id == 0) revert InvalidCampaign();
        if (block.timestamp > c.deadline) revert CampaignEnded();
        if (msg.value == 0) revert NoValue();

        c.raisedETH += msg.value;

        if (!hasDonated[campaignId][msg.sender]) {
            hasDonated[campaignId][msg.sender] = true;
            c.totalDonors += 1;
        }

        emit DonatedETH(campaignId, msg.sender, msg.value);
    }

    function donateUSDC(uint256 campaignId, uint256 amount) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        if (c.id == 0) revert InvalidCampaign();
        if (block.timestamp > c.deadline) revert CampaignEnded();
        if (amount == 0) revert NoValue();

        USDC.safeTransferFrom(msg.sender, address(this), amount);
        c.raisedUSDC += amount;

        if (!hasDonated[campaignId][msg.sender]) {
            hasDonated[campaignId][msg.sender] = true;
            c.totalDonors += 1;
        }

        emit DonatedUSDC(campaignId, msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                              WITHDRAWALS
    //////////////////////////////////////////////////////////////*/

    function withdrawETH(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        if (c.id == 0) revert InvalidCampaign();
        if (msg.sender != c.creator) revert NotCreator();
        if (ethWithdrawn[campaignId]) revert AlreadyWithdrawn();

        bool canWithdraw = c.raisedETH >= c.targetAmount || block.timestamp >= c.deadline;
        if (!canWithdraw) revert WithdrawNotAllowed();
        if (c.raisedETH == 0) revert NoValue();

        ethWithdrawn[campaignId] = true;
        uint256 total = c.raisedETH;
        c.raisedETH = 0;

        uint256 feeAmount = _calculateFee(total);
        uint256 creatorAmount = total - feeAmount;

        if (feeAmount > 0) {
            (bool feeOk,) = platformFeeReceiver.call{value: feeAmount}("");
            if (!feeOk) revert TransferFailed();
        }

        (bool creatorOk,) = c.creator.call{value: creatorAmount}("");
        if (!creatorOk) revert TransferFailed();

        emit WithdrawnETH(campaignId, c.creator, creatorAmount, feeAmount);
    }

    function withdrawUSDC(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        if (c.id == 0) revert InvalidCampaign();
        if (msg.sender != c.creator) revert NotCreator();
        if (usdcWithdrawn[campaignId]) revert AlreadyWithdrawn();

        bool canWithdraw = c.raisedETH >= c.targetAmount || block.timestamp >= c.deadline;
        if (!canWithdraw) revert WithdrawNotAllowed();
        if (c.raisedUSDC == 0) revert NoValue();

        usdcWithdrawn[campaignId] = true;
        uint256 total = c.raisedUSDC;
        c.raisedUSDC = 0;

        uint256 feeAmount = _calculateFee(total);
        uint256 creatorAmount = total - feeAmount;

        if (feeAmount > 0) {
            USDC.safeTransfer(platformFeeReceiver, feeAmount);
        }
        USDC.safeTransfer(c.creator, creatorAmount);

        emit WithdrawnUSDC(campaignId, c.creator, creatorAmount, feeAmount);
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    function getCampaign(uint256 id) external view returns (Campaign memory) {
        if (campaigns[id].id == 0) revert InvalidCampaign();
        return campaigns[id];
    }

    function getAllCampaignIds() external view returns (uint256[] memory) {
        return campaignIds;
    }

    function getCampaignsByCreator(address creator) external view returns (uint256[] memory) {
        return creatorCampaignIds[creator];
    }

    function hasAddressDonated(uint256 campaignId, address donor) external view returns (bool) {
        return hasDonated[campaignId][donor];
    }

    /*//////////////////////////////////////////////////////////////
                                INTERNAL
    //////////////////////////////////////////////////////////////*/

    function _calculateFee(uint256 amount) internal view returns (uint256) {
        if (withdrawalFeeBps == 0 || amount == 0) return 0;
        return (amount * uint256(withdrawalFeeBps)) / MAX_FEE_BPS;
    }

    /*//////////////////////////////////////////////////////////////
                             ETH RECEIVER
    //////////////////////////////////////////////////////////////*/

    receive() external payable {}
}
