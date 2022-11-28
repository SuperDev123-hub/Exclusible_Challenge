import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Staking, TransparentUpgradeableProxy } from '../typechain';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import DeployHelperContracts from '../utils/helper';
import { BigNumber } from 'ethers';

describe('Staking', function () {
    let proxyAdmin: SignerWithAddress;
    let admin: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;
    let staking: Staking;
    beforeEach(async () => {
        [proxyAdmin, admin, user1, user2, user3] = await ethers.getSigners();
        let deployHelper: DeployHelperContracts = new DeployHelperContracts(proxyAdmin);

        let stakingContractLogic: Staking = await deployHelper.deployStaking();
        await stakingContractLogic.deployTransaction.wait();
        let proxy: TransparentUpgradeableProxy = await deployHelper.deployTransparentUpgradableProxy(
            stakingContractLogic.address,
            proxyAdmin.address
        );
        staking = await deployHelper.getStaking(proxy.address);
        await (await staking.connect(admin).initialize(admin.address)).wait();
    });

    it('deposit eth', async function () {
        const amount = BigNumber.from(10).pow(18); // 1 eth;
        const provider = waffle.provider;
        await (await staking.connect(user1).deposit({ value: amount })).wait();
        await expect(await provider.getBalance(staking.address)).to.be.equal(amount);
    });

    it('admin add reward', async function () {
        const amount = BigNumber.from(10).pow(20); // 100 eth;
        const provider = waffle.provider;
        await (await staking.connect(admin).addReward({ value: amount })).wait();
        await expect(await provider.getBalance(staking.address)).to.be.equal(amount);
    });

    it("normal user can't add reward", async function () {
        await expect(staking.connect(user1).addReward({ value: BigNumber.from(10).pow(18) })).to.be.revertedWith(
            'Ownable: caller is not the owner'
        );
    });

      it('check reward amount usecase-1', async function () {
          const aAmount = BigNumber.from(10).pow(20); //100 eth
          const bAmount = BigNumber.from(3).mul(BigNumber.from(10).pow(20)); //300 eth
          const rewardAmount = BigNumber.from(2).mul(BigNumber.from(10).pow(20)); //200 eth

          await (await staking.connect(user1).deposit({ value: aAmount })).wait();
          await (await staking.connect(user2).deposit({ value: bAmount })).wait();
          await (await staking.connect(admin).addReward({ value: rewardAmount })).wait();

          await expect(staking.connect(user1).withdarw()).to.emit(staking, 'WithdrawEvent').withArgs(user1.address, aAmount.add(rewardAmount.div(4).mul(1)));
          await expect(staking.connect(user2).withdarw()).to.emit(staking, 'WithdrawEvent').withArgs(user2.address, bAmount.add(rewardAmount.div(4).mul(3)));
      });

      it('check reward amount usecase-2', async function () {
        const aAmount = BigNumber.from(10).pow(20); //100 eth
        const bAmount = BigNumber.from(3).mul(BigNumber.from(10).pow(20)); //300 eth
        const rewardAmount = BigNumber.from(2).mul(BigNumber.from(10).pow(20)); //200 eth

        await (await staking.connect(user1).deposit({ value: aAmount })).wait();
        await (await staking.connect(admin).addReward({ value: rewardAmount })).wait();
        await (await staking.connect(user2).deposit({ value: bAmount })).wait();

        await expect(staking.connect(user1).withdarw()).to.emit(staking, 'WithdrawEvent').withArgs(user1.address, aAmount.add(rewardAmount));
        await expect(staking.connect(user2).withdarw()).to.emit(staking, 'WithdrawEvent').withArgs(user2.address, bAmount);
    });

    it('check reward amount usecase-3', async function () {
        const aAmount       = BigNumber.from(10).pow(20); //100 eth
        const bAmount       = BigNumber.from(2).mul(BigNumber.from(10).pow(20)); //200 eth
        const rewardAmount  = BigNumber.from(3).mul(BigNumber.from(10).pow(20)); //300 eth
        const a1Amount      = BigNumber.from(1).mul(BigNumber.from(10).pow(20)); //100 eth
        const reward1Amount = BigNumber.from(4).mul(BigNumber.from(10).pow(20)); //400 eth

        await (await staking.connect(user1).deposit({ value: aAmount })).wait();
        await (await staking.connect(user2).deposit({ value: bAmount })).wait();
        await (await staking.connect(admin).addReward({ value: rewardAmount })).wait();
        await (await staking.connect(user1).deposit({ value: a1Amount })).wait();
        await (await staking.connect(admin).addReward({ value: reward1Amount })).wait();

        await expect(staking.connect(user1).withdarw())
            .to.emit(staking, 'WithdrawEvent')
            .withArgs(user1.address, BigNumber.from(5).mul(BigNumber.from(10).pow(20)));
        await expect(staking.connect(user2).withdarw())
            .to.emit(staking, 'WithdrawEvent')
            .withArgs(user2.address, BigNumber.from(6).mul(BigNumber.from(10).pow(20)));
    });

    it('check reward amount usecase-4', async function () {
      const aAmount       = BigNumber.from(10).pow(20); //100 eth
      const bAmount       = BigNumber.from(2).mul(BigNumber.from(10).pow(20)); //200 eth
      const rewardAmount  = BigNumber.from(3).mul(BigNumber.from(10).pow(20)); //300 eth
      const a1Amount      = BigNumber.from(1).mul(BigNumber.from(10).pow(20)); //100 eth
      const reward1Amount = BigNumber.from(4).mul(BigNumber.from(10).pow(20)); //400 eth
      const a2Amount      = BigNumber.from(1).mul(BigNumber.from(10).pow(20)); //100 eth
      const reward2Amount = BigNumber.from(5).mul(BigNumber.from(10).pow(20)); //500 eth

      await (await staking.connect(user1).deposit({ value: aAmount })).wait();
      await (await staking.connect(user2).deposit({ value: bAmount })).wait();
      await (await staking.connect(admin).addReward({ value: rewardAmount })).wait();
      await (await staking.connect(user1).deposit({ value: a1Amount })).wait();
      await (await staking.connect(admin).addReward({ value: reward1Amount })).wait();
      await (await staking.connect(user1).deposit({ value: a2Amount })).wait();
      await (await staking.connect(admin).addReward({ value: reward2Amount })).wait();

      await expect(staking.connect(user1).withdarw())
          .to.emit(staking, 'WithdrawEvent')
          .withArgs(user1.address, BigNumber.from(9).mul(BigNumber.from(10).pow(20)));
      await expect(staking.connect(user2).withdarw())
          .to.emit(staking, 'WithdrawEvent')
          .withArgs(user2.address, BigNumber.from(8).mul(BigNumber.from(10).pow(20)));
  });
});
