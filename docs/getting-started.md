# Getting Started

This guide will help you set up your development environment and run your first FHEVM example.

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- Git
- Code editor (VS Code recommended)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ImmanuelHickle/AnonymousQualityTesting.git
cd AnonymousQualityTesting
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm run test
```

## Quick Start

### Local Development

1. Start a local Hardhat node:
```bash
npx hardhat node
```

2. In another terminal, deploy the contract:
```bash
npx hardhat --network localhost deploy
```

3. Interact with the contract:
```bash
npx hardhat --network localhost task:address
```

## Project Structure

```
AnonymousQualityTesting/
├── contracts/              # Solidity smart contracts
├── test/                   # Test files
├── deploy/                 # Deployment scripts
├── tasks/                  # Hardhat tasks
├── scripts/                # Automation scripts
├── docs/                   # Documentation
├── hardhat.config.ts       # Hardhat configuration
└── package.json            # Dependencies
```

## Key npm Scripts

```bash
# Compilation & Building
npm run compile            # Compile Solidity contracts
npm run build:ts          # Build TypeScript code
npm run clean             # Clean build artifacts

# Testing
npm run test              # Run all tests
npm run test:sepolia      # Run tests on Sepolia
npm run coverage          # Generate test coverage report

# Code Quality
npm run lint              # Run all linters
npm run lint:sol          # Lint Solidity code
npm run lint:ts           # Lint TypeScript code
npm run prettier:check    # Check code formatting
npm run prettier:write    # Auto-format code

# Deployment
npm run deploy:localhost  # Deploy to local network
npm run deploy:sepolia    # Deploy to Sepolia testnet

# Documentation
npm run generate-docs     # Generate GitBook documentation

# Development
npm run chain             # Start local hardhat node
npm run typechain         # Generate TypeScript types
```

## Common Tasks

### Set Up Local Development

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat --network localhost deploy

# Terminal 3: Interact with contract
npx hardhat --network localhost task:address
```

### Authorize an Inspector

```bash
npx hardhat --network localhost task:authorize \
  --inspector 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### Record an Inspection

```bash
npx hardhat --network localhost task:record \
  --quality 85 --defects 2 --batch 1001 --category "Electronics"
```

### Get Inspection Information

```bash
npx hardhat --network localhost task:info --id 0
```

### Run Full Test Suite

```bash
npm run test
```

### Check Test Coverage

```bash
npm run coverage
```

## Environment Setup for Sepolia

### 1. Set Environment Variables

```bash
# Set mnemonic for account generation
npx hardhat vars set MNEMONIC

# Set Infura API key for Sepolia RPC
npx hardhat vars set INFURA_API_KEY

# Set Etherscan API key for verification
npx hardhat vars set ETHERSCAN_API_KEY
```

### 2. Get Sepolia ETH

Visit a Sepolia faucet:
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [Quicknode Sepolia Faucet](https://faucet.quicknode.com/ethereum/sepolia)
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum)

### 3. Deploy to Sepolia

```bash
npx hardhat --network sepolia deploy
```

### 4. Verify Contract

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Troubleshooting

### Installation Issues

**Problem**: npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Try installation again
npm install
```

**Problem**: Node version mismatch
```bash
# Check Node version
node --version

# If < 20, upgrade Node.js
# Visit https://nodejs.org/ and install Node.js 20+
```

### Compilation Errors

**Problem**: Contract won't compile
```bash
# Check Solidity version
npm run compile

# Check for syntax errors
npm run lint:sol
```

### Test Failures

**Problem**: Tests fail with "not FHEVM mock"
```bash
# This is expected on Sepolia - tests require FHEVM mock environment
# To test, use localhost or hardhat network
npx hardhat test  # Uses hardhat network by default
```

### Deployment Issues

**Problem**: "Insufficient funds"
```bash
# Ensure account has enough ETH for:
# - Gas fees for deployment
# - Gas fees for test transactions

# For Sepolia, use faucet (see above)
# For localhost, accounts start with 10000 ETH
```

## Next Steps

After getting everything set up:

1. **Explore Examples**: Read the [Privacy-Preserving Quality Inspection](examples/privacy-quality-inspection.md) example
2. **Learn FHEVM**: Study [FHEVM Fundamentals](fundamentals/what-is-fhevm.md)
3. **Modify Code**: Try editing the contract and running tests
4. **Deploy**: Deploy to Sepolia testnet
5. **Contribute**: Submit improvements to the project

## Getting Help

- 📚 [Read the Documentation](README.md)
- 🔍 [Check Troubleshooting Guide](troubleshooting.md)
- 💬 [Join Zama Community](https://community.zama.ai/)
- 🐛 [Report Issues](https://github.com/ImmanuelHickle/AnonymousQualityTesting/issues)

---

**Happy coding! 🚀**
