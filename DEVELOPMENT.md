# Development Guide

This guide provides comprehensive instructions for developers who want to work with, extend, or modify the Anonymous Quality Testing smart contract system.

## Project Architecture Overview

### Smart Contract Layer

The `PrivacyQualityInspection.sol` contract is the core component that:
- Manages inspector authorization and access control
- Records encrypted inspection data using FHE
- Verifies recorded inspections
- Calculates privacy-preserving quality metrics
- Maintains inspection history and statistics

### Testing Infrastructure

The test suite (`test/PrivacyQualityInspection.ts`) provides:
- Comprehensive coverage of all contract functions
- Validation of access control mechanisms
- Encrypted data handling demonstrations
- Error handling and edge case testing

### Automation & Deployment

Scripts in `deploy/` and `tasks/` enable:
- Automated contract deployment via Hardhat Deploy
- Interactive contract management through CLI tasks
- Network-specific configuration (localhost, Sepolia)

## Development Workflow

### 1. Setting Up Development Environment

```bash
# Install dependencies
npm install

# Verify installation
npm run compile
npm run test
```

### 2. Understanding FHEVM Concepts

Before modifying the contract, understand these critical FHE patterns:

#### Encrypted Type Creation
```solidity
euint8 encryptedValue = FHE.asEuint8(plainValue);
euint32 largeValue = FHE.asEuint32(plainValue);
```

#### Permission Binding (Critical Pattern)
```solidity
// ALWAYS grant both permissions for encrypted values
FHE.allowThis(encryptedValue);           // Contract can use this value
FHE.allow(encryptedValue, msg.sender);   // User can decrypt this value
```

#### Encrypted Operations
```solidity
// Arithmetic operations
euint32 sum = FHE.add(value1, value2);
euint32 difference = FHE.sub(value1, value2);

// Comparisons (return ebool)
ebool isGreater = FHE.gt(value1, value2);
ebool isEqual = FHE.eq(value1, value2);

// Conditional selection
euint32 result = FHE.select(condition, ifTrue, ifFalse);
```

### 3. Adding New Features

#### Example: Adding a New Inspection Metric

1. **Add Storage Variable**
```solidity
struct InspectionData {
    // ... existing fields ...
    euint16 temperature;  // New encrypted field
}
```

2. **Add Function**
```solidity
function recordInspectionWithTemperature(
    uint8 _qualityScore,
    uint8 _defectCount,
    uint32 _productBatch,
    string memory _productCategory,
    uint16 _temperature  // New parameter
) external onlyAuthorizedInspector {
    // Existing validation code...

    // Encrypt new field
    euint16 encryptedTemp = FHE.asEuint16(_temperature);

    // Store in inspection data
    inspections[inspectionCount].temperature = encryptedTemp;

    // Grant permissions
    FHE.allowThis(encryptedTemp);
    FHE.allow(encryptedTemp, msg.sender);

    // ... rest of function ...
}
```

3. **Add Tests**
```typescript
it("✅ Should record inspection with temperature", async function () {
    const tx = await contract
        .connect(signers.inspector1)
        .recordInspectionWithTemperature(85, 2, 1001, "Electronics", 25);
    await tx.wait();

    const count = await contract.inspectionCount();
    expect(count).to.eq(1);
});
```

4. **Add Task for CLI Interaction**
```typescript
task("task:record-with-temp", "Records inspection with temperature")
    .addParam("quality", "Quality score")
    .addParam("defects", "Defect count")
    .addParam("batch", "Batch number")
    .addParam("category", "Product category")
    .addParam("temperature", "Temperature value")
    .setAction(async function (taskArguments, hre) {
        // Task implementation...
    });
```

### 4. Modifying Access Control

The contract uses a simple owner-based model with inspector roles:

```solidity
// Current roles
owner                  // Full authority
authorizedInspectors   // Can record and verify inspections
```

To add granular roles:

```solidity
enum InspectorRole {
    NONE,
    VIEWER,      // Can view only
    RECORDER,    // Can record
    VERIFIER,    // Can verify
    ADMIN        // Full access
}

mapping(address => InspectorRole) public inspectorRoles;

modifier hasRole(InspectorRole required) {
    require(inspectorRoles[msg.sender] >= required, "Insufficient role");
    _;
}
```

### 5. Enhancing Metrics Calculation

The current `calculateCategoryMetrics` function iterates through all inspections. For production:

```solidity
// Add indexed storage for better performance
mapping(string => uint256[]) private categoryInspectionIndices;

function recordInspection(/*params*/) external {
    // ... existing code ...

    // Add index for faster metrics calculation
    categoryInspectionIndices[_productCategory].push(inspectionCount);

    // ... rest of function ...
}

function calculateCategoryMetrics(string memory _category) external onlyOwner {
    // Now iterate only relevant inspections
    uint256[] storage indices = categoryInspectionIndices[_category];
    for (uint256 i = 0; i < indices.length; i++) {
        // Process only this category's inspections
    }
}
```

## Testing Best Practices

### Comprehensive Test Structure

```typescript
describe("NewFeature", function () {
    // Setup
    beforeEach(async function () {
        // Deploy and initialize
        ({ contract, contractAddress } = await deployFixture());
    });

    describe("Positive Cases", function () {
        it("✅ Should work correctly", async function () {
            // Test successful execution
        });

        it("✅ Should emit correct event", async function () {
            // Test event emission
        });
    });

    describe("Negative Cases", function () {
        it("❌ Should revert with proper message", async function () {
            // Test error handling
        });

        it("❌ Should prevent unauthorized access", async function () {
            // Test access control
        });
    });

    describe("Edge Cases", function () {
        it("Should handle boundary values", async function () {
            // Test limits
        });
    });
});
```

### Running Tests

```bash
# All tests
npm run test

# Specific test file
npx hardhat test test/PrivacyQualityInspection.ts

# With coverage
npm run coverage

# With gas reporting
REPORT_GAS=true npm run test
```

## Deployment Process

### Local Testing

1. Start local node:
```bash
npx hardhat node
```

2. Deploy in another terminal:
```bash
npx hardhat --network localhost deploy
```

3. Verify deployment:
```bash
npx hardhat --network localhost task:address
```

### Sepolia Testnet Deployment

1. Set environment variables:
```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

2. Deploy:
```bash
npx hardhat --network sepolia deploy
```

3. Verify:
```bash
npx hardhat verify --network sepolia <ADDRESS>
```

## Code Style & Linting

### Solidity Style

```solidity
// Use clear naming
// State variables: camelCase with prefix
uint256 public inspectionCount;
mapping(uint256 => InspectionData) public inspections;

// Functions: descriptive names
function recordInspection(...) external { ... }
function getInspectionInfo(...) external view { ... }

// Comments: explain WHY, not WHAT
// WHY: Need allowThis because contract must process encrypted value
FHE.allowThis(encryptedValue);
```

### Running Linters

```bash
# Solidity linting
npm run lint:sol

# TypeScript linting
npm run lint:ts

# Auto-format
npm run prettier:write
```

## Managing Dependencies

### Updating FHEVM

When Zama releases a new FHEVM version:

1. Update package.json:
```bash
npm install @fhevm/solidity@latest
npm install @fhevm/hardhat-plugin@latest
```

2. Test compilation:
```bash
npm run compile
npm run test
```

3. Check for breaking changes in contract ABI
4. Update deployment scripts if needed
5. Regenerate type-chain types:
```bash
npm run typechain
```

### Adding New Dependencies

```bash
# Add with npm
npm install package-name

# Update package-lock.json
npm install
```

## Common Development Tasks

### Debugging Failed Tests

```typescript
// Enable logging
console.log("Debug info:", value);

// Use ethers utilities
console.log("Address:", ethers.toBeHex(number));

// Inspect encrypted values
const decrypted = await fhevm.userDecryptEuint(
    FhevmType.euint8,
    encryptedValue,
    contractAddress,
    signer
);
console.log("Decrypted:", decrypted);
```

### Gas Optimization

```solidity
// Use unchecked for known-safe arithmetic
unchecked {
    totalInspections++;
}

// Avoid unnecessary storage operations
if (newValue != oldValue) {
    mappingValue = newValue;
}

// Use events instead of storage
emit MetricsUpdated(_category, totalCount);
```

### Viewing Contract State

```bash
# Get all accounts
npx hardhat --network localhost accounts

# Call view function
npx hardhat --network localhost task:inspection-count

# Get specific inspection
npx hardhat --network localhost task:info --id 0
```

## Troubleshooting

### Compilation Errors

**Error: "Member not found in FHE"**
- Ensure correct version of @fhevm/solidity
- Check Solidity version matches FHE library requirements
- Verify import statements

### Test Failures

**Error: "This hardhat test suite cannot run on Sepolia Testnet"**
- Tests with encrypted values require FHEVM mock
- Running on Sepolia will skip tests
- Use localhost or hardhat for testing

**Error: "Invalid proof"**
- Ensure encryption signer matches caller
- Check input proof matches encrypted value
- Verify contract address in encryption

### Deployment Issues

**Error: "Insufficient funds"**
- Check account has sufficient balance
- Use testnet faucet for Sepolia
- Verify network configuration

## Performance Considerations

### Gas Usage

- Encrypted operations are more expensive than plain ops
- Use cached values when possible
- Batch operations together
- Avoid unnecessary storage writes

### Scaling

- Current implementation iterates through all inspections
- For large datasets, use indexed storage or off-chain calculation
- Consider privacy-preserving aggregation schemes

## Security Audit Checklist

Before deploying to production:

- [ ] All encrypted values have both permissions set
- [ ] Access control modifiers on all state-changing functions
- [ ] Input validation on all user parameters
- [ ] No unencrypted sensitive data in events
- [ ] Proper error messages without revealing secrets
- [ ] Test coverage > 80%
- [ ] No known security vulnerabilities in dependencies
- [ ] Gas limits considered for critical operations

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/getting-started)
- [Ethers.js Documentation](https://docs.ethers.org/)

## Support & Contributions

For questions or improvements:
1. Check documentation
2. Review existing test cases
3. Post to Zama Community Forum
4. Submit pull requests with clear descriptions

---

**Last Updated**: December 2025
**Maintained By**: FHEVM Community
