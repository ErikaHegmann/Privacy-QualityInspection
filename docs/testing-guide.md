# Testing Guide

Comprehensive testing is essential for secure, privacy-preserving smart contracts. This guide covers testing strategies for FHEVM applications.

## Test Structure

### Basic Test Template

```typescript
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";

describe("ContractName", function () {
  let signers: { deployer: HardhatEthersSigner; user: HardhatEthersSigner };
  let contract: ContractType;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], user: ethSigners[1] };
  });

  beforeEach(async function () {
    // Skip if not running against FHEVM mock
    if (!fhevm.isMock) {
      this.skip();
    }

    // Deploy fresh instance for each test
    const factory = await ethers.getContractFactory("ContractName");
    contract = await factory.deploy();
    contractAddress = await contract.getAddress();
  });

  describe("Feature", function () {
    it("✅ Should handle success case", async function () {
      // Arrange
      const input = 100;

      // Act
      const tx = await contract.someFunction(input);
      await tx.wait();

      // Assert
      const result = await contract.getResult();
      expect(result).to.eq(expectedValue);
    });
  });
});
```

## Testing Categories

### 1. Unit Tests

Test individual functions in isolation:

```typescript
describe("recordInspection", function () {
  it("✅ Should store encrypted inspection data", async function () {
    const qualityScore = 85;
    const defectCount = 2;
    const batch = 1001;
    const category = "Electronics";

    const tx = await contract
      .connect(signers.inspector)
      .recordInspection(qualityScore, defectCount, batch, category);
    await tx.wait();

    const count = await contract.inspectionCount();
    expect(count).to.eq(1);
  });

  it("✅ Should reject invalid quality scores", async function () {
    await expect(
      contract.recordInspection(150, 2, 1001, "Electronics")
    ).to.be.revertedWith("Quality score exceeds maximum");
  });
});
```

### 2. Integration Tests

Test interactions between functions:

```typescript
describe("Inspection Workflow", function () {
  it("✅ Should complete full inspection workflow", async function () {
    // 1. Authorize inspector
    await contract.authorizeInspector(signers.inspector.address);

    // 2. Record inspection
    const tx1 = await contract
      .connect(signers.inspector)
      .recordInspection(85, 2, 1001, "Electronics");
    await tx1.wait();

    // 3. Verify inspection
    const tx2 = await contract
      .connect(signers.verifier)
      .verifyInspection(0);
    await tx2.wait();

    // 4. Check final state
    const info = await contract.getInspectionInfo(0);
    expect(info.isVerified).to.be.true;
  });
});
```

### 3. Access Control Tests

Verify authorization and permissions:

```typescript
describe("Access Control", function () {
  it("✅ Owner can authorize inspectors", async function () {
    await contract.authorizeInspector(signers.inspector.address);
    const isAuthorized = await contract.authorizedInspectors(
      signers.inspector.address
    );
    expect(isAuthorized).to.be.true;
  });

  it("❌ Non-owner cannot authorize inspectors", async function () {
    await expect(
      contract.connect(signers.unauthorized).authorizeInspector(
        signers.user.address
      )
    ).to.be.revertedWith("Not authorized");
  });

  it("❌ Unauthorized user cannot record inspection", async function () {
    await expect(
      contract
        .connect(signers.unauthorized)
        .recordInspection(85, 2, 1001, "Electronics")
    ).to.be.revertedWith("Not authorized inspector");
  });
});
```

### 4. Encrypted Data Tests

Test encrypted operations and permissions:

```typescript
describe("Encrypted Operations", function () {
  it("✅ Should handle encrypted values correctly", async function () {
    // Values remain encrypted throughout
    const result1 = await contract.getValue();

    // Can decrypt for authorized user
    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      result1,
      contractAddress,
      signers.user
    );
    expect(decrypted).to.eq(expectedValue);
  });

  it("✅ Should enforce permission system", async function () {
    // User can decrypt their own value
    const userValue = await contract.getUserValue();
    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      userValue,
      contractAddress,
      signers.user
    );
    expect(decrypted).to.eq(expectedValue);

    // Different user cannot decrypt
    await expect(
      fhevm.userDecryptEuint(
        FhevmType.euint32,
        userValue,
        contractAddress,
        signers.other
      )
    ).to.throw();
  });
});
```

### 5. Edge Case Tests

Test boundary conditions and unusual inputs:

```typescript
describe("Edge Cases", function () {
  it("✅ Should handle minimum values", async function () {
    const tx = await contract.recordInspection(0, 0, 0, "Test");
    await tx.wait();

    const count = await contract.inspectionCount();
    expect(count).to.eq(1);
  });

  it("✅ Should handle maximum values", async function () {
    const tx = await contract.recordInspection(100, 255, 4294967295, "Test");
    await tx.wait();

    const count = await contract.inspectionCount();
    expect(count).to.eq(1);
  });

  it("❌ Should reject overflow", async function () {
    await expect(
      contract.recordInspection(101, 255, 4294967295, "Test")
    ).to.be.revertedWith("Quality score exceeds maximum");
  });

  it("✅ Should handle empty string categories gracefully", async function () {
    await expect(
      contract.recordInspection(85, 2, 1001, "")
    ).to.be.revertedWith("Product category required");
  });
});
```

### 6. Event Tests

Verify correct events are emitted:

```typescript
describe("Events", function () {
  it("✅ Should emit InspectionRecorded event", async function () {
    await contract.authorizeInspector(signers.inspector.address);

    await expect(
      contract
        .connect(signers.inspector)
        .recordInspection(85, 2, 1001, "Electronics")
    )
      .to.emit(contract, "InspectionRecorded")
      .withArgs(
        0,
        signers.inspector.address,
        "Electronics",
        expect.any(BigInt)
      );
  });

  it("✅ Should emit InspectorAuthorized event", async function () {
    await expect(contract.authorizeInspector(signers.inspector.address))
      .to.emit(contract, "InspectorAuthorized")
      .withArgs(signers.inspector.address, signers.deployer.address);
  });
});
```

## Testing Patterns

### Arrange-Act-Assert

```typescript
it("✅ Should update balance correctly", async function () {
  // Arrange
  const initialBalance = await contract.getBalance(signers.user.address);
  const depositAmount = 100;

  // Act
  const tx = await contract
    .connect(signers.user)
    .deposit(depositAmount);
  await tx.wait();

  // Assert
  const finalBalance = await contract.getBalance(signers.user.address);
  expect(finalBalance).to.eq(initialBalance + depositAmount);
});
```

### Test Grouping

```typescript
describe("Authorization System", function () {
  describe("authorizeInspector", function () {
    it("✅ Should authorize new inspector", function () {});
    it("❌ Should reject invalid address", function () {});
    it("❌ Should reject already authorized", function () {});
  });

  describe("revokeInspector", function () {
    it("✅ Should revoke authorized inspector", function () {});
    it("❌ Should reject non-authorized", function () {});
  });
});
```

## Running Tests

### All Tests

```bash
npm run test
```

### Specific Test File

```bash
npx hardhat test test/PrivacyQualityInspection.ts
```

### Specific Test Suite

```bash
npx hardhat test --grep "Authorization System"
```

### With Coverage

```bash
npm run coverage
```

### With Gas Reporting

```bash
REPORT_GAS=true npm run test
```

## Coverage Requirements

### Target Coverage

Aim for minimum 80% code coverage:

```bash
npm run coverage
```

### Coverage Report

The report shows:
- Line coverage: Percentage of lines executed
- Statement coverage: Percentage of statements executed
- Branch coverage: Percentage of conditional branches taken
- Function coverage: Percentage of functions called

### Improving Coverage

```typescript
// Add missing test cases for low-coverage areas
it("✅ Should handle rare edge case", async function () {
  // Test scenario not currently covered
});

// Test all branches of conditionals
it("✅ Should handle true condition", async function () {
  // Test when condition = true
});

it("✅ Should handle false condition", async function () {
  // Test when condition = false
});
```

## Debugging Tests

### Enable Logging

```typescript
it("✅ Should work correctly", async function () {
  console.log("Starting test...");

  const result = await contract.someFunction();
  console.log("Result:", result);

  expect(result).to.eq(expectedValue);
});
```

### Inspect Encrypted Values

```typescript
it("✅ Should decrypt correctly", async function () {
  const encrypted = await contract.getSecret();
  console.log("Encrypted value:", encrypted);

  const decrypted = await fhevm.userDecryptEuint(
    FhevmType.euint32,
    encrypted,
    contractAddress,
    signers.user
  );
  console.log("Decrypted value:", decrypted);

  expect(decrypted).to.eq(expectedValue);
});
```

### Debug Transactions

```typescript
it("✅ Should succeed", async function () {
  try {
    const tx = await contract.someFunction();
    const receipt = await tx.wait();
    console.log("Gas used:", receipt?.gasUsed.toString());
    console.log("Block number:", receipt?.blockNumber);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
});
```

## Best Practices

### 1. Use Descriptive Test Names

```typescript
// ❌ Bad
it("works", async function () {});

// ✅ Good
it("✅ Should record inspection with all encrypted fields", async function () {});
```

### 2. Use ✅/❌ Markers

```typescript
it("✅ Should succeed when authorized", async function () {});
it("❌ Should revert when unauthorized", async function () {});
```

### 3. Isolate Tests

```typescript
// Each test gets fresh contract instance
beforeEach(async function () {
  const factory = await ethers.getContractFactory("ContractName");
  contract = await factory.deploy();
});
```

### 4. Mock FHEVM Environment

```typescript
beforeEach(async function () {
  // Skip on Sepolia (requires FHEVM mock)
  if (!fhevm.isMock) {
    this.skip();
  }
});
```

### 5. Test Both Paths

```typescript
describe("Feature", function () {
  it("✅ Should work with valid input", async function () {});
  it("❌ Should revert with invalid input", async function () {});
});
```

## Common Issues

### Test Skipped on Sepolia

**Issue**: Tests skip when running on Sepolia testnet

**Solution**: Tests with encrypted values require FHEVM mock. Only run on localhost or hardhat:

```bash
npx hardhat test  # Uses hardhat network by default
```

### Permission Denied Errors

**Issue**: "User doesn't have permission to decrypt"

**Solution**: Ensure FHE.allow() was called:

```solidity
FHE.allowThis(value);
FHE.allow(value, msg.sender);  // Don't forget this!
```

### Proof Verification Failed

**Issue**: "Invalid proof"

**Solution**: Ensure encryption signer matches transaction sender:

```typescript
// Encrypt for this user
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, alice.address)
  .add32(value)
  .encrypt();

// Same user must send transaction
await contract.connect(alice).operate(encrypted.handles[0], encrypted.inputProof);
```

## Resources

- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Chai Assertion Library](https://www.chaijs.com/)
- [FHEVM Testing](https://docs.zama.ai/fhevm/tutorials/hardhat)

---

**Write comprehensive tests to ensure your privacy-preserving contracts work correctly and securely!** 🧪
