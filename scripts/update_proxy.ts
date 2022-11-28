// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from 'hardhat';
import { TransparentUpgradeableProxy, TransparentUpgradeableProxy__factory, Staking } from '../typechain';
import DeployHelperContracts from '../utils/helper';
import { goerli } from './config.json';
async function main() {
    const [proxyAdmin, admin] = await ethers.getSigners();

    let deployHelper: DeployHelperContracts = new DeployHelperContracts(proxyAdmin);
    let stakingContractLogic: Staking = await deployHelper.deployStaking();
    await stakingContractLogic.deployTransaction.wait();    
    const proxy: TransparentUpgradeableProxy = await new TransparentUpgradeableProxy__factory(proxyAdmin).attach(goerli.TTD_Proxy);

    console.log('Proxy address : ', proxy.address);
    await proxy.upgradeTo(stakingContractLogic.address);
    console.log('Initialization finished');
    return 'Done';
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
