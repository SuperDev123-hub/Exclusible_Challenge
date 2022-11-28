//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '../library/Errors.sol';

import 'hardhat/console.sol';
contract Staking is Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 vestedReward;
    }

    uint256 public accRewardPerShare;
    uint256 public tvl;
    uint256 public alreadyAddedReward;
    mapping (address => UserInfo) public userInfos;

    uint256 public constant weightScale = 1e12;

    event WithdrawEvent(address user, uint256 amount);
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
        // console.log(accRewardPerShare, "reward per share");
    }

    function deposit() external payable {
        require(msg.value > 0, Errors.SHOULD_BE_MORE_THAN_ZERO);
        UserInfo storage user = userInfos[msg.sender];

        // console.log(user.amount, "amount");
        // console.log(accRewardPerShare, "reward per share");
        user.vestedReward += user.amount * accRewardPerShare / weightScale - user.rewardDebt;
        // console.log(user.vestedReward, "vestedReward");


        user.amount += msg.value;
        user.rewardDebt = accRewardPerShare * user.amount / weightScale;
        // console.log(user.rewardDebt, "rewardDebt");
        tvl += msg.value;
    }

    function withdarw() external nonReentrant {
        UserInfo storage user = userInfos[msg.sender];
        require(user.amount > 0, Errors.SHOULD_BE_MORE_THAN_ZERO);
        uint256 reward = user.amount * accRewardPerShare / weightScale - user.rewardDebt;
        uint256 amount = user.amount + user.vestedReward + reward;

        require(address(this).balance >= amount, Errors.BALANCE_ERROR);
        require(tvl >= user.amount, Errors.TVL_ERROR);

        tvl -= user.amount;
        user.amount = 0;
        user.vestedReward = 0;
        user.rewardDebt = 0;
        
        payable(msg.sender).transfer(amount);
        emit WithdrawEvent(msg.sender, amount);
        
    }
}
