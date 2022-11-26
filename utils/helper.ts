import { TransparentUpgradeableProxy, TransparentUpgradeableProxy__factory, Staking, Staking__factory } from "../typechain";
import { Signer } from "ethers";
import { Address } from "hardhat-deploy/dist/types";

export default class DeployHelperContracts {
    private _deployerSigner: Signer;

    constructor(deployerSigner: Signer) {
        this._deployerSigner = deployerSigner;
    }

    public async deployTransparentUpgradableProxy(logic: string, admin: string): Promise<TransparentUpgradeableProxy> {
        return await new TransparentUpgradeableProxy__factory(this._deployerSigner).deploy(logic, admin, '0x');
    }

    public async getTransparentUpgradableProxy(proxyAddress: string): Promise<TransparentUpgradeableProxy> {
        return new TransparentUpgradeableProxy__factory(this._deployerSigner).attach(proxyAddress);
    }

    public async deployStaking(): Promise<Staking> {
        return await new Staking__factory(this._deployerSigner).deploy();
    }

    public async getStaking(tokenAddress: Address): Promise<Staking> {
        return new Staking__factory(this._deployerSigner).attach(tokenAddress);
    }
}