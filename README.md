# Anonymous Quality Testing - FHEVM Example Hub

A complete, production-ready FHEVM example repository demonstrating privacy-preserving quality inspection using Fully Homomorphic Encryption (FHE). Featuring advanced smart contracts, comprehensive automation tools, and extensive educational documentation.

## Overview

This project is a complete **FHEVM Example Hub** submission for the Zama Bounty Track December 2025. It includes:

- **4 Smart Contract Examples** - From basic to advanced FHE patterns
- **3 Automation Scripts** - CLI tools for generating example repositories and documentation
- **Comprehensive Documentation** - 4,500+ lines of GitBook-compatible guides
- **30+ Test Cases** - Full test coverage with best practices
- **9 Example Templates** - Ready-to-use standalone example repositories
- **4 Learning Categories** - Organized by difficulty level and concepts

## Key Features

### Complete Automation System
- **create-fhevm-example.ts** (330+ lines) - Generate standalone example repositories from templates
- **create-fhevm-category.ts** (300+ lines) - Create multi-example learning projects by category
- **generate-docs.ts** (350+ lines) - Auto-generate GitBook-compatible documentation
- CLI-based scaffolding with full TypeScript support

### Privacy-Preserving Quality Inspection
- Anonymous quality detection that protects sensitive manufacturing and inspection data
- Encrypted quality scores, defect counts, and batch numbers remain confidential
- Complete anonymity maintained for inspector identities while preserving accountability
- Real-world use case demonstrating practical FHE applications

### Smart Contract Architecture
- **Owner-based Access Control**: Centralized authorization system
- **Inspector Management**: Dynamic authorization and revocation of inspectors
- **Encrypted Data Storage**: All sensitive metrics encrypted on-chain
- **Privacy-Preserving Calculations**: Statistical analysis without exposing raw data
- **Multi-example Support**: 4 distinct contract implementations from basic to advanced

### Core FHE Concepts Demonstrated
- **Encrypted Type Handling**: euint8, euint16, euint32, euint64, ebool operations
- **Permission Management**: FHE.allowThis() and FHE.allow() patterns
- **Input Proofs**: Binding encrypted values to users and contracts
- **Conditional Operations**: FHE comparison, equality, and selection (FHE.lt, FHE.ge, FHE.eq, FHE.select)
- **Arithmetic Operations**: Addition, subtraction, multiplication on encrypted values

## Project Structure

```
AnonymousQualityTesting/
├── contracts/                       # Smart contracts (4 files)
│   ├── PrivacyQualityInspection.sol   # Advanced example (293 lines)
│   ├── FHECounter.sol                 # Basic counter (43 lines)
│   ├── EncryptSingleValue.sol         # Single encryption (48 lines)
│   └── AccessControl.sol              # Access control (48 lines)
├── test/
│   └── PrivacyQualityInspection.ts    # 30+ test cases (600+ lines)
├── deploy/
│   └── deploy.ts                       # Automated deployment
├── tasks/                            # 8 Hardhat CLI commands
│   ├── accounts.ts
│   └── PrivacyQualityInspection.ts
├── scripts/                          # 3 Automation tools (1,000+ lines)
│   ├── create-fhevm-example.ts        # Single example generator (330+ lines)
│   ├── create-fhevm-category.ts       # Multi-example category generator (300+ lines)
│   ├── generate-docs.ts               # GitBook documentation generator (350+ lines)
│   └── README.md                      # Automation tools documentation
├── docs/                             # 12 documentation files (4,500+ lines)
│   ├── SUMMARY.md                     # GitBook navigation
│   ├── getting-started.md             # Quick start guide
│   ├── api-reference.md               # Complete API reference
│   ├── testing-guide.md               # Testing strategies
│   ├── deployment-guide.md            # Deployment instructions
│   ├── troubleshooting.md             # Common issues and solutions
│   └── fundamentals/
│       ├── what-is-fhevm.md
│       ├── encrypted-types.md
│       └── permissions.md
├── Configuration Files (11 total)
│   ├── hardhat.config.ts              # Hardhat setup for FHEVM
│   ├── package.json                   # Dependencies and npm scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── .eslintrc.yml                  # Linting rules
│   ├── .prettierrc.yml                # Code formatting
│   ├── .solhint.json                  # Solidity linting
│   ├── .solcover.js                   # Coverage configuration
│   └── README, DEVELOPMENT, CONTRIBUTING guides
```

**Total: 37 files | 6,550+ lines of code and documentation**

## Contract Details

### PrivacyQualityInspection.sol

**Main Functions:**
- `authorizeInspector(address)` - Authorize quality inspectors
- `revokeInspector(address)` - Remove inspector authorization
- `recordInspection(...)` - Record encrypted inspection data
- `verifyInspection(uint256)` - Verify recorded inspections
- `calculateCategoryMetrics(string)` - Compute privacy-preserving metrics
- `getInspectionInfo(uint256)` - Retrieve inspection details
- `getInspectorHistoryCount(address)` - Get inspector statistics

**Key Features:**
- Encrypted storage of quality scores (0-100 scale)
- Anonymous defect tracking
- Category-based metrics calculation
- Timestamp-based inspection history
- Data integrity through hashing

## Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 7.0.0
- Hardhat environment

### Installation & Compilation

```bash
npm install
npm run compile
```

## Automation Tools - Generate Examples & Documentation

This project includes three powerful automation scripts for creating FHEVM examples:

### 1. Generate Standalone Example

Create a complete, ready-to-use example repository:

```bash
npm run create-example <example-name> <output-path>

# Examples:
npm run create-example fhe-counter ./my-counter
npm run create-example privacy-quality-inspection ./my-qc
npm run create-example access-control ./access-demo
npm run create-example blind-auction ./sealed-bid-auction
```

**Available Examples (9 templates):**
- `fhe-counter` - Simple encrypted counter
- `encrypt-single` - Single value encryption
- `encrypt-multiple` - Multiple value encryption
- `user-decrypt-single` - User decryption (single)
- `user-decrypt-multiple` - User decryption (multiple)
- `public-decrypt` - Public decryption pattern
- `access-control` - Access control with FHE
- `blind-auction` - Sealed-bid auction
- `privacy-quality-inspection` - Complete quality control system

Each generated example includes compiled contracts, tests, deployment scripts, and documentation.

### 2. Generate Category Projects

Create a learning project with multiple related examples:

```bash
npm run create-category <category> <output-path>

# Examples:
npm run create-category basic ./basic-examples
npm run create-category encryption ./encryption-examples
npm run create-category advanced ./advanced-examples
```

**Available Categories (4 levels):**
- `basic` - 5 fundamental examples
- `encryption` - 2 encryption pattern examples
- `decryption` - 3 decryption pattern examples
- `advanced` - 3 complex implementation examples

### 3. Generate Documentation

Auto-generate GitBook-compatible documentation:

```bash
npm run generate-docs
```

Generates documentation structure in `docs/` directory with automatic API references and getting started guides.

## Testing

### Run Full Test Suite

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run coverage
```

### Test Coverage

The test suite includes comprehensive coverage of:
- ✅ Deployment validation
- ✅ Inspector authorization and revocation
- ✅ Inspection recording with encrypted data
- ✅ Inspection verification workflows
- ✅ Inspector history tracking
- ✅ Quality metrics calculation
- ✅ Contract pause functionality
- ✅ Access control enforcement
- ✅ Data integrity verification
- ✅ Error handling and edge cases

## Usage Examples

### Working with Generated Examples

After creating a standalone example:

```bash
# 1. Create example
npm run create-example fhe-counter ./my-counter

# 2. Navigate to generated project
cd my-counter
npm install

# 3. Test and run
npm run compile
npm run test

# 4. Deploy to localhost
npx hardhat --network localhost deploy

# 5. Run tasks
npx hardhat --network localhost task:address
```

### Local Development with Main Repository

1. **Start Local Node**
```bash
npx hardhat node
```

2. **Deploy Contract** (in another terminal)
```bash
npx hardhat --network localhost deploy
```

3. **Run Hardhat Tasks** (8 available commands)
```bash
# Get contract address
npx hardhat --network localhost task:address

# Authorize inspector
npx hardhat --network localhost task:authorize \
  --inspector 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# Record inspection
npx hardhat --network localhost task:record \
  --quality 85 --defects 2 --batch 1001 --category "Electronics"

# Verify inspection
npx hardhat --network localhost task:verify --id 0

# Get inspection info
npx hardhat --network localhost task:info --id 0

# Calculate metrics
npx hardhat --network localhost task:calculate-metrics --category "Electronics"
```

### Sepolia Testnet

Deploy to Sepolia testnet:
```bash
npx hardhat --network sepolia deploy
npx hardhat --network sepolia task:address
```

## FHE Concepts Explained

### 1. Encrypted Values
The contract uses encrypted types (euint8, euint32) to store sensitive quality data:
```solidity
euint8 encryptedQuality = FHE.asEuint8(_qualityScore);
```

### 2. Permission Binding
Critical pattern for accessing encrypted values:
```solidity
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, msg.sender); // User permission
```

### 3. Encrypted Comparisons
Privacy-preserving quality threshold validation:
```solidity
ebool isLowQuality = FHE.lt(encryptedQuality, FHE.asEuint8(QUALITY_THRESHOLD));
```

### 4. Conditional Operations
Statistics calculation on encrypted data:
```solidity
euint32 passedIncrement = FHE.select(passed, FHE.asEuint32(1), FHE.asEuint32(0));
```

## Common Patterns & Anti-Patterns

### ✅ DO: Grant Both Permissions
Always set both contract and user permissions:
```solidity
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);
```

### ❌ DON'T: Forget allowThis
Incomplete permission setup will cause runtime failures:
```solidity
// This will fail!
FHE.allow(encryptedValue, msg.sender);
```

### ✅ DO: Match Encryption Signer
Ensure the caller matches the encryption signer:
```typescript
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
  .add32(value).encrypt();
await contract.connect(alice).recordInspection(...); // Alice calls
```

### ❌ DON'T: Mismatch Signers
Different signers will cause permission failures:
```typescript
// This will fail!
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
  .add32(value).encrypt();
await contract.connect(bob).recordInspection(...); // Bob calls
```

## Build & Linting

### Build TypeScript
```bash
npm run build:ts
```

### Lint Solidity
```bash
npm run lint:sol
```

### Lint TypeScript
```bash
npm run lint:ts
```

### Format Code
```bash
npm run prettier:write
```

## Deployment on Sepolia

### Set Environment Variables
```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

### Deploy
```bash
npx hardhat --network sepolia deploy
```

### Verify Contract
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Competition Submission

This is a complete submission for the **Zama Bounty Track December 2025: Build The FHEVM Example Hub**.

### What Makes This Submission Complete

✅ **Scaffolding/Automation** - 3 CLI tools for generating examples and documentation
✅ **Example Types** - 4 smart contracts covering basic to advanced FHEVM patterns
✅ **Documentation Strategy** - 4,500+ lines organized for learners at all levels
✅ **Example Organization** - 9 individual examples + 4 learning categories
✅ **Maintenance Tools** - Automated documentation generation and project scaffolding

### Deliverables Summary

- **37 Files Created** - Contracts, tests, scripts, docs, configuration
- **6,550+ Lines** - Code, tests, documentation, configuration
- **30+ Test Cases** - Comprehensive coverage with unit, integration, and edge case tests
- **100+ Code Examples** - Throughout documentation and test files
- **4,500+ Documentation Lines** - Getting started, API reference, troubleshooting, fundamentals

See `COMPETITION_SUBMISSION.md` for detailed mapping of all requirements.

## Live Demo & Documentation

**GitHub Repository**: [ImmanuelHickle/AnonymousQualityTesting](https://github.com/ImmanuelHickle/AnonymousQualityTesting)

**Video Demonstration**: See `PrivacyQualityInspection.mp4` for a complete walkthrough of:
- Contract deployment and initialization
- Inspector authorization workflow
- Encrypted inspection recording
- Verification process and metrics calculation

**Complete Documentation**:
- `docs/` - GitBook-compatible guides (fundamentals, testing, deployment)
- `README.md` - This file
- `DEVELOPMENT.md` - Developer guide and architecture
- `CONTRIBUTING.md` - Contribution guidelines
- `scripts/README.md` - Automation tools documentation

## Use Cases

### Manufacturing Quality Control
- Anonymous defect reporting without compromising inspector privacy
- Confidential batch quality tracking across production lines
- Privacy-preserving supplier assessments and comparisons

### Regulatory Compliance
- GDPR-compliant quality documentation with full anonymity
- Anonymous audit trails maintaining data confidentiality
- Confidential compliance reporting for regulatory bodies

### Supply Chain Management
- Private quality scores across multi-tier supply chains
- Anonymous vendor performance tracking and evaluation
- Confidential quality benchmarking without exposing raw scores

## Technology Stack

- **Smart Contract**: Solidity 0.8.24
- **FHE Framework**: FHEVM v0.9.1
- **Development**: Hardhat with TypeScript
- **Testing**: Mocha + Chai
- **Network**: Ethereum/Sepolia Testnet
- **Encryption**: Fully Homomorphic Encryption (Zama)

## Dependencies

### Core FHE Dependencies
- `@fhevm/solidity` (^0.9.1) - Core FHEVM Solidity library
- `@fhevm/hardhat-plugin` (^0.3.0-1) - FHEVM testing integration
- `@zama-fhe/relayer-sdk` (^0.3.0-5) - Decryption relayer

### Development Dependencies
- `hardhat` (^2.26.0) - Development framework
- `ethers` (^6.15.0) - Ethereum interactions
- `typescript` (^5.8.3) - TypeScript support
- `chai` (^4.5.0) - Testing assertions
- `mocha` (^11.7.1) - Test runner

## Security Considerations

### Access Control
- Owner-based authorization system for inspector management
- Role-based permissions for inspection operations
- Verified inspection workflow to prevent self-verification

### Data Protection
- All sensitive data encrypted with FHE
- Tamper-proof record storage via blockchain immutability
- Encrypted comparisons prevent intermediate value exposure

### Operational Security
- Emergency pause functionality for contract management
- Input validation on all user-provided parameters
- Comprehensive audit trail of all operations

## Developer Guide

### Adding New Inspector Functions
1. Add function with appropriate access modifiers
2. Include FHE.allowThis() and FHE.allow() for encrypted values
3. Write comprehensive tests covering success and failure paths
4. Document FHE-specific patterns and requirements

### Extending Metrics Calculation
1. Update calculateCategoryMetrics() logic
2. Add new encrypted intermediate values as needed
3. Ensure proper permission binding for all encrypted types
4. Test with various data distributions

### Deploying Custom Categories
1. Use recordInspection() with desired category string
2. Categories are arbitrary strings (e.g., "Aerospace", "Healthcare")
3. Calculate metrics per category as needed
4. All computations remain encrypted end-to-end

## Maintenance

### Updating Dependencies
```bash
npm update @fhevm/solidity
npm update @fhevm/hardhat-plugin
npm run compile
npm run test
```

### Gas Optimization
The contract includes optimized gas usage:
- Efficient encrypted type operations
- Minimal storage operations for metrics
- Reasonable loop bounds for category iteration

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch
3. Submit comprehensive tests
4. Ensure linting passes
5. Document FHE-specific patterns

## License

BSD-3-Clause-Clear License - See LICENSE file for details.

---

**Built with ❤️ using [FHEVM](https://github.com/zama-ai/fhevm) by Zama**

For more information on FHEVM, visit [Zama Documentation](https://docs.zama.ai/fhevm).
