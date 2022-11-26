//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '../library/Errors.sol';

contract Staking is Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 vestingReward;
    }

    uint256 public accRewardPerShare;
    uint256 public tvl;
    uint256 public alreadyAddedReward;
    mapping (address => UserInfo) public userInfos;

    uint256 public constant weightScale = 1e12;

    function initialize(address _admin) external initializer {
        require(_admin != address(0), Errors.SHOULD_BE_NONE_ZERO);
        __Ownable_init();
        transferOwnership(_admin);
        __Pausable_init();
        __ReentrancyGuard_init();
    }

    function addReward() external payable onlyOwner {
        if(tvl == 0) {
            alreadyAddedReward += msg.value;
        }else {
            uint256 rewardAmountToDistribute;
            if(alreadyAddedReward > 0) { 
                rewardAmountToDistribute = alreadyAddedReward;
                alreadyAddedReward = 0;
            }
            rewardAmountToDistribute += msg.value;
            accRewardPerShare += rewardAmountToDistribute * weightScale / tvl;
        }
    }

    function deposit() external payable {
        require(msg.value > 0, Errors.SHOULD_BE_MORE_THAN_ZERO);
        UserInfo storage user = userInfos[msg.sender];
        user.vestingReward += user.amount * accRewardPerShare / weightScale - user.rewardDebt;
        user.amount += msg.value;
        user.rewardDebt = accRewardPerShare * user.amount / weightScale;
        tvl += msg.value;
    }

    function withdarw() external nonReentrant {
        UserInfo storage user = userInfos[msg.sender];
        uint256 vestingReward = user.amount * accRewardPerShare / weightScale - user.rewardDebt;
        uint256 amount = user.amount + vestingReward;

        require(address(this).balance > amount, Errors.BALANCE_ERROR);
        require(tvl > user.amount, Errors.TVL_ERROR);

        payable(msg.sender).transfer(amount);
        tvl -= user.amount;
        user.amount = 0;
        user.vestingReward = 0;
        user.rewardDebt = 0;
    }
}
