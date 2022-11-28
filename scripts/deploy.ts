// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from 'hardhat';
import { TransparentUpgradeableProxy, Staking } from '../typechain';
import { run } from 'hardhat';
import DeployHelperContracts from '../utils/helper';

async function main() {
    const [proxyAdmin, admin] = await ethers.getSigners();
    let staking: Staking;

    let deployHelper: DeployHelperContracts = new DeployHelperContracts(proxyAdmin);
    console.log("Deploy Staking...");
    let stakingContractLogic: Staking = await deployHelper.deployStaking();
    await stakingContractLogic.deployTransaction.wait();

    console.log("Deploy Proxy...");
    let proxy: TransparentUpgradeableProxy = await deployHelper.deployTransparentUpgradableProxy(
        stakingContractLogic.address,
        proxyAdmin.address
    );
    staking = await deployHelper.getStaking(proxy.address);
    
    await induceDelay(5000);
    console.log("Initialize...");
    await (await staking.connect(admin).initialize(admin.address)).wait();
    
    console.log('Logic address : ', stakingContractLogic.address);
    console.log('Proxy address : ', proxy.address);
    
    await induceDelay(5000);
    console.log("Verify...");
    await run('verify:verify', {
        address: stakingContractLogic.address,
        contract: 'contracts/staking/Staking.sol:Staking',
    }).catch(console.log);

    return 'Done';
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


async function induceDelay(ts: number) {
    console.log(`Inducing delay of ${ts} ms`);
    return new Promise((resolve) => {
        setTimeout(resolve, ts);
    });
}
