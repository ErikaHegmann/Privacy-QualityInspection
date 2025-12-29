# Deployment Guide

This guide covers deploying the Anonymous Quality Testing contract to different networks.

## Networks Supported

### Local Development (Hardhat)

- **Chain ID**: 31337
- **Type**: Local mock environment with FHEVM support
- **Best for**: Development and testing

### Sepolia Testnet

- **Chain ID**: 11155111
- **Type**: Ethereum testnet without native FHEVM
- **Note**: FHEVM operations will fail on Sepolia live network
- **Best for**: Testing contract structure without encrypted operations

## Local Development Deployment

### 1. Start Local Blockchain

```bash
npx hardhat node
```

This starts a local blockchain with:
- 10 pre-funded accounts
- FHEVM mock environment
- Persistent state

### 2. Deploy Contract

In another terminal:

```bash
npx hardhat --network localhost deploy
```

Output:
```
deploying "PrivacyQualityInspection" (tx: 0x...)
PrivacyQualityInspection contract:  0x5FbDB2315678afccb333f8a9c...
```

### 3. Verify Deployment

```bash
npx hardhat --network localhost task:address
```

Output:
```
PrivacyQualityInspection address is 0x5FbDB2315678afccb333f8a9c...
```

### 4. Test Contract

```bash
npm run test
```

### 5. Interact with Contract

```bash
# Authorize inspector
npx hardhat --network localhost task:authorize \
  --inspector 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# Record inspection
npx hardhat --network localhost task:record \
  --quality 85 --defects 2 --batch 1001 --category "Electronics"

# Get inspection info
npx hardhat --network localhost task:info --id 0
```

## Sepolia Testnet Deployment

### 1. Set Environment Variables

```bash
# Set mnemonic (12-word seed phrase)
npx hardhat vars set MNEMONIC
# Enter your mnemonic

# Set Infura API key
npx hardhat vars set INFURA_API_KEY
# Get key from https://infura.io

# Set Etherscan API key (for verification)
npx hardhat vars set ETHERSCAN_API_KEY
# Get key from https://etherscan.io
```

Variables are stored in `.env.local` (git-ignored).

### 2. Fund Your Account

Get Sepolia ETH from a faucet:

- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [Quicknode Sepolia Faucet](https://faucet.quicknode.com/ethereum/sepolia)
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum)

**Minimum amounts needed:**
- Deployment: ~0.01 ETH
- Testing: ~0.05 ETH
- Buffer: ~0.05 ETH

### 3. Deploy to Sepolia

```bash
npx hardhat --network sepolia deploy
```

Output:
```
deploying "PrivacyQualityInspection" (tx: 0x...)
PrivacyQualityInspection contract:  0x5FbDB2315678afccb333f8a9c...
```

### 4. Verify Contract

```bash
npx hardhat verify --network sepolia 0x5FbDB2315678afccb333f8a9c...
```

This uploads the contract source to Etherscan for verification.

### 5. Check Transaction

View on [Sepolia Etherscan](https://sepolia.etherscan.io/):

1. Paste your contract address
2. View deployment details
3. Read contract ABI

## Deployment Script Details

The deployment script (`deploy/deploy.ts`) handles:

1. **Account Setup**: Uses first account from mnemonic
2. **Contract Deployment**: Deploys PrivacyQualityInspection
3. **Logging**: Prints contract address for reference
4. **Storage**: Saves deployment data to `deployments/` directory

### Customizing Deployment

Edit `deploy/deploy.ts` to customize:

```typescript
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Customize deployment options
  const deployment = await deploy("PrivacyQualityInspection", {
    from: deployer,
    log: true,
    // Add constructor arguments if needed
    // args: [arg1, arg2],
    // Set gas limit if needed
    // gasLimit: 2000000,
  });

  console.log(`PrivacyQualityInspection deployed to ${deployment.address}`);
};

export default func;
func.id = "deploy_privacy_quality_inspection";
func.tags = ["PrivacyQualityInspection"];
```

## Post-Deployment Steps

### 1. Save Contract Address

```bash
# Get deployed address
CONTRACT_ADDRESS=$(npx hardhat --network localhost task:address | grep -oP '0x\w+')
echo "Contract Address: $CONTRACT_ADDRESS"
```

### 2. Authorize Initial Inspectors

```bash
# Authorize first inspector
npx hardhat --network localhost task:authorize \
  --inspector 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# Authorize additional inspectors
npx hardhat --network localhost task:authorize \
  --inspector 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
```

### 3. Test Basic Operations

```bash
# Record a test inspection
npx hardhat --network localhost task:record \
  --quality 90 --defects 1 --batch 2001 --category "Test"

# Verify recording
npx hardhat --network localhost task:inspection-count
```

### 4. Monitor Gas Usage

```bash
# Enable gas reporting
REPORT_GAS=true npm run test
```

## Troubleshooting

### Deployment Fails with "Insufficient funds"

**Problem**: Account doesn't have enough ETH

**Solution**:
```bash
# For Sepolia: Use faucet to get more ETH
# Links above

# For localhost: No issue, accounts start with 10000 ETH
```

### Contract Already Deployed

**Problem**: "Contract already deployed at..."

**Solution**:
```bash
# Force new deployment
npx hardhat clean  # Clears artifacts and deployments

npx hardhat --network localhost deploy
```

### Verification Fails

**Problem**: "Contract source code does not match compiled code"

**Solution**:
```bash
# Ensure no local changes since deployment
git status

# Re-compile
npm run compile

# Try verification again
npx hardhat verify --network sepolia <ADDRESS>
```

### Cannot Connect to Network

**Problem**: "Could not connect to the network"

**Solution**:
```bash
# Check RPC endpoint
npx hardhat config  # Verify network settings

# Check API keys
npx hardhat vars list

# Test connection
npx hardhat --network sepolia accounts
```

## Network Configuration

### Update hardhat.config.ts

To add custom networks:

```typescript
const config: HardhatUserConfig = {
  networks: {
    // ... existing networks ...
    customNetwork: {
      url: "https://your-rpc-endpoint",
      accounts: {
        mnemonic: MNEMONIC,
        count: 10
      },
      chainId: 12345
    }
  }
};
```

## Deployment Checklist

Before deploying to production:

- [ ] Tests pass: `npm run test`
- [ ] Code compiles: `npm run compile`
- [ ] Linting passes: `npm run lint`
- [ ] Gas costs reasonable: `REPORT_GAS=true npm run test`
- [ ] Contract logic reviewed: Manual code review
- [ ] Security considerations: No obvious vulnerabilities
- [ ] Environment variables set: API keys, mnemonics
- [ ] Sufficient funds: For gas and operations

## Monitoring Deployed Contract

### Watch Transactions

On Sepolia:
- Visit [Sepolia Etherscan](https://sepolia.etherscan.io/)
- Paste contract address
- View transactions in real-time

### Check Contract State

```bash
# Get inspection count
npx hardhat --network sepolia task:inspection-count --address <CONTRACT_ADDRESS>

# Get specific inspection
npx hardhat --network sepolia task:info --address <CONTRACT_ADDRESS> --id 0
```

### View Events

On Etherscan:
1. Go to contract page
2. Click "Logs" tab
3. View all emitted events

## Maintenance

### Pause/Unpause Contract

```bash
# Pause contract for emergency
# (Owner only)

# Via task (implement if needed)
npx hardhat --network localhost task:pause

# Unpause when ready
npx hardhat --network localhost task:unpause
```

### Update Contract (if using proxy)

For production deployments using upgradeable proxies:

1. Deploy new implementation
2. Update proxy to point to new implementation
3. Emit upgrade event

See [OpenZeppelin Upgrades](https://docs.openzeppelin.com/upgrades-plugins/1.x/) for details.

## Resources

- [Hardhat Deployment Docs](https://hardhat.org/hardhat-deploy/docs)
- [Etherscan Verification](https://hardhat.org/hardhat-verify/docs)
- [Sepolia Testnet Faucets](https://sepoliafaucet.com/)
- [FHEVM Network Support](https://docs.zama.ai/fhevm/getting_started/networks)

---

**Deploy with confidence using this comprehensive guide!** 🚀
