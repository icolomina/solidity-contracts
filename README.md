![tests status](https://github.com/icolomina/solidity-contracts/actions/workflows/test.yml/badge.svg)

# Solidity Contracts
==========================

## Overview
This repository contains a set of solidity smart contracts. Each of the contracts represents a specific situation and they can serve as a basis for developing more complex contracts or a decentralized application based on them.

> **Important**: This contracts have not been audited and should not be used directly in a production environment. 

## Compile the contracts

```shell
npm install
npx hardhat compile
```

## Testing the contracts

```shell
npx hardhat test
```

## Deploying the contracts
You can deploy the contracts using the hardhat local node. The **scripts** folder contains a deploy script for each contract. You can execute them as shown bellow:

```shell
 npx hardhat run scripts/house_swap/deploy.ts
 npx hardhat run scripts/mortgage/deploy.ts
 npx hardhat run scripts/pay_order/deploy.ts
 npx hardhat run scripts/pledge_loan/deploy.ts
```

## Contracts information
1. [House Swap](/docs/house_swap.md)
2. [Payment Orders](/docs/payment_order.md)
3. [Mortgage Token](/docs/mortgage.md)
4. [Event entrances](/docs/event_entrances.md)