import { run } from 'hardhat';
import { goerli } from './config.json';
async function main() {
    await run('verify:verify', {
        address: goerli.Staking_Impl,
        contract: 'contracts/staking/Staking.sol:Staking',
    }).catch(console.log);

    return 'Done';
}

main().then(console.log).catch(console.log);
