# Exclusible_Challenge
Exclusible Staking Challenge
This is the contract source for Staking Test.
I implemented staking contract by using Proxy contract

At contract folder you can see contracts for staking and at script folder you can see scripts for deploy, update implementaton and verify script by using the addresses at config.json file
And at test folder there is a typescript file for testing contract


# Command Lines
Install npm packages by using yarn command

```
yarn compile
```
Compile sol files and check errors

```
yarn build
```
Build typechain files for web3 integration
```
yarn test
```
Test usecases at usecase.test.ts of test folder on hardhat environment
```
yarn deploy
```
Deploy contracts to goerli network and verify the contracts

Contract addresses 
Implementation address
```
https://goerli.etherscan.io/address/0x22Decf34415efc973Ca2E6B40Fa405B88DA0A204#code
```
Proxy address
```
https://goerli.etherscan.io/address/0x767f339BFbbD7DB0efE8E1f5D88033d55efD9150
```
