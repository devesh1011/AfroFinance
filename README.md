# Afro Finance 🌍

> **Confidential RWA Trading on Hedera** - Institutional-grade tokenized bond trading with privacy-preserving order execution

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-00B4D8?style=flat&logo=hedera)](https://hedera.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[Certificate Link](https://drive.google.com/file/d/14LPhhwAEviJjblIYe-7N54QOL9cMjlgW/view?usp=drive_link)
[Pitch Deck](https://drive.google.com/file/d/19W_owE1yruzQKH0JMganyelbBaoxuWrE/view?usp=drive_link)

## Overview

Afro Finance is a decentralized RWA (Real-World Asset) trading platform built on Hedera that enables institutions to trade tokenized corporate bonds with complete transaction privacy. Users can buy tokenized versions of investment-grade bonds (like iShares LQD ETF) using USDC, with all order details encrypted and settled through Hedera Consensus Service (HCS).

### Key Features

- 🔐 **Confidential Orders** - Client-side AES-GCM encryption with HCS-based private routing
- 🏦 **Institutional Privacy** - TEE-signed settlements keep order details confidential
- 📊 **Tokenized Bonds** - Trade RWA tokens backed 1:1 by investment-grade corporate bonds
- ⚡ **Hedera Infrastructure** - Low-cost, energy-efficient, instant finality
- 🔒 **ERC-3643 Compliance** - Built-in KYC/AML with on-chain identity contracts

## Architecture

```
User Wallet → Deposit USDC → Encrypt Order → HCS Topic
                                                   ↓
Backend TEE ← Decrypt Order ← HCS Listener ← HCS Topic
     ↓
Sign Settlement → Reserve Contract → Mint RWA Tokens → User Wallet
```

### Smart Contracts (Hedera Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **ConfidentialOrders** | `0xF4a8A472A1bB39B72ACd5bfd59896B678b6b75Ad` | Handles USDC deposits and order commitments |
| **Reserve** | `0x0a15179c67aa929DE2E12da428b5d860b06e4962` | Settlement verification and token minting |
| **LQD Token** | `0x2fD841C454EeEd0a4E2a3474dFCadafEe52E8342` | ERC-20 RWA token (Afro Finance LQD) |
| **HUSDC** | `0x7f4a1138bc9a86C8E75e4745C96062625A30029b` | Test USDC token (6 decimals) |

### HCS Topic

- **Orders Topic**: `0.0.7166619` - Encrypted order routing on Hedera Consensus Service

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **Hedera SDK** - HCS listener and message publishing
- **ethers.js v6** - Contract interactions and ECDSA signing
- **AES-GCM** - Order encryption/decryption (TEE-ready)

### Smart Contracts
- **Solidity 0.8.17** - Contract language
- **Hardhat** - Development and deployment
- **OpenZeppelin** - Secure contract libraries
- **ERC-3643** - Compliant RWA token standard

## Getting Started

### Prerequisites

```bash
Node.js >= 18
npm or pnpm
MetaMask wallet
Hedera testnet account
```

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/devesh1011/AfroFinance.git
```

#### 2. Install dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd rwa-deploy-backend
npm install
```

**Contracts:**
```bash
cd Contracts
npm install
```

#### 3. Configure environment variables

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_ORDERS_ADDRESS=0xF4a8A472A1bB39B72ACd5bfd59896B678b6b75Ad
NEXT_PUBLIC_RESERVE_ADDRESS=0x0a15179c67aa929DE2E12da428b5d860b06e4962
NEXT_PUBLIC_HUSDC_ADDRESS=0x7f4a1138bc9a86C8E75e4745C96062625A30029b
NEXT_PUBLIC_RWA_TOKEN_ADDRESS=0x2fD841C454EeEd0a4E2a3474dFCadafEe52E8342
NEXT_PUBLIC_BACKEND_URL=http://localhost:4200
NEXT_PUBLIC_BACKEND_API_KEY=your-api-key
```

**Backend (`.env`):**
```env
RPC_HTTP=https://testnet.hashio.io/api
HCS_ORDERS_TOPIC_ID=0.0.7166619
HEDERA_MIRROR_NODE=testnet.mirrornode.hedera.com:443
RESERVE_ADDRESS=0x0a15179c67aa929DE2E12da428b5d860b06e4962
RWA_TOKEN_ADDRESS=0x2fD841C454EeEd0a4E2a3474dFCadafEe52E8342
PRIVATE_KEY=<wallet-private-key>
ENCLAVE_PRIVATE_KEY=<enclave-signer-private-key>
BACKEND_API_KEY=your-api-key
```

#### 4. Start the services

**Backend:**
```bash
cd rwa-deploy-backend
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## How It Works

### Buy Flow

1. **Connect Wallet** - User connects MetaMask to Hedera Testnet (chainId 296)
2. **Approve USDC** - User approves HUSDC spending to ConfidentialOrders contract
3. **Deposit USDC** - User deposits USDC to escrow (`ConfidentialOrders.deposit()`)
4. **Encrypt Order** - Frontend encrypts order details with AES-GCM
5. **Generate Commitment** - Compute `keccak256(ciphertext || iv || user)`
6. **Publish to HCS** - Send encrypted order to Hedera Consensus Service topic
7. **Backend Processes** - HCS listener receives message, validates, signs settlement
8. **Settlement** - Backend calls `Reserve.settle()` with signature
9. **Mint Tokens** - Contract verifies signature and mints RWA tokens to user

### Security Features

- **Client-Side Encryption** - Order amounts never exposed on public chain
- **Commitment Replay Protection** - Each order commitment can only be used once
- **ECDSA Signature Verification** - Settlement must be signed by trusted enclave
- **TEE-Ready Architecture** - Backend designed for Trusted Execution Environment deployment
- **HCS Private Routing** - Orders routed through encrypted Hedera topic


### Verify on HashScan

Visit [HashScan Testnet](https://hashscan.io/testnet) and search for contract addresses


## Team

Built with ❤️ by the Afro Finance team

