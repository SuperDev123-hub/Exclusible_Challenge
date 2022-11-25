import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ganache';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';

import 'hardhat-typechain';
import 'solidity-coverage';
import 'hardhat-deploy';
import 'hardhat-tracer';
import 'hardhat-log-remover';

import 'hardhat-gas-reporter';
import dotenv from 'dotenv';
dotenv.config();
import { HardhatUserConfig } from 'hardhat/types';

const config: HardhatUserConfig = {
    defaultNetwork: 'hardhat',
    networks: {
        goerli: {
            chainId: 5,
            url: 'https://eth-goerli.g.alchemy.com/v2/PZCZO88tVEx5q4CGfbdyuqTdUIDJausg',
            accounts: [`${process.env.GOERLI_PRIVATE_KEY}`, `${process.env.GOERLI_PRIVATE_KEY1}`, `${process.env.GOERLI_PRIVATE_KEY2}`],
            saveDeployments: process.env.SAVE_DEPLOYMENT && process.env.SAVE_DEPLOYMENT.toLowerCase() === 'true' ? true : false,
            loggingEnabled: process.env.LOGGING && process.env.LOGGING.toLowerCase() === 'true' ? true : false,
            tags: ['goerli'],
        },
    },
    typechain: {
        outDir: 'typechain',
        target: 'ethers-v5',
    },
    solidity: {
        version: '0.8.7',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    mocha: {
        timeout: 20000000,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN,
    },
    gasReporter: {
        gasPrice: 30,
        enabled: true,
        currency: 'USD',
        coinmarketcap: 'c40041ca-81fa-4564-8f95-175e388534c1',
        outputFile: 'gasReport.md',
        noColors: true,
    },
};

export default config;
