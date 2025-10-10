# AfroFinance Contracts

Smart contracts for the AfroFinance RWA (Real World Assets) platform built on Ethereum with Hardhat.

## Overview

This project contains three main contract modules:

- **AfroFinance**: Core trading and market data contracts for asset management and automated order execution
- **ERC3643**: Compliant tokenization framework for real-world assets with built-in compliance and identity verification  
- **OnChain-ID**: Decentralized identity management system for KYC/AML compliance

## Quick Start

```shell
npm install
npx hardhat compile
npx hardhat test
npx hardhat node
```

## Project Structure

- `contracts/` - Smart contract source files
- `scripts/` - Deployment and utility scripts
- `test/` - Contract test suites
- `abi/` - Contract ABIs for frontend integration
- `constants/` - Deployment configurations and addresses
