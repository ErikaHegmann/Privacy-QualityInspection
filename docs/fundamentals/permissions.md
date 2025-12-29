# Permission System

The permission system is crucial to FHEVM security. It ensures that encrypted values can only be accessed and decrypted by authorized parties.

## Overview

FHEVM uses a dual-permission model:

1. **Contract Permission**: Allows the smart contract to process encrypted values
2. **User Permission**: Allows users to decrypt values they're authorized to see

Both permissions must be explicitly granted through special FHE functions.

## Core Concepts

### Contract Permission

Grants the contract (blockchain) itself the ability to compute with the encrypted value:

```solidity
FHE.allowThis(encryptedValue);
```

**Purpose**: Without this, the contract cannot perform operations on the value, even if it's stored in contract state.

**When to use**: After creating or updating any encrypted value that the contract will use.

### User Permission

Grants a specific user the ability to decrypt a value:

```solidity
FHE.allow(encryptedValue, userAddress);
```

**Purpose**: Only the specified user can decrypt this value. Even the contract operator cannot decrypt it.

**When to use**: When you want users to be able to decrypt values they have permission for.

## The Critical Pattern

**ALWAYS grant both permissions:**

```solidity
// Step 1: Create encrypted value
euint32 encryptedValue = FHE.asEuint32(secretAmount);

// Step 2: Grant contract permission
FHE.allowThis(encryptedValue);

// Step 3: Grant user permission
FHE.allow(encryptedValue, msg.sender);

// Now the contract can use it, and msg.sender can decrypt it
```

### What Happens Without Permissions

```solidity
// ❌ WRONG - Missing FHE.allowThis()
euint32 secretValue = FHE.asEuint32(100);
FHE.allow(secretValue, msg.sender);  // User can decrypt, but...

// ...contract can't operate on it
euint32 result = FHE.add(secretValue, FHE.asEuint32(5));  // FAILS!

// ❌ WRONG - Missing FHE.allow()
euint32 secretValue = FHE.asEuint32(100);
FHE.allowThis(secretValue);  // Contract can operate, but...

// ...user can't decrypt it
// (User would need FHE.allow() for decryption)
```

## Practical Examples

### Example 1: Basic Encrypted Storage

```solidity
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedStorage is ZamaEthereumConfig {
    euint32 private storedValue;

    function store(externalEuint32 input, bytes calldata inputProof) external {
        // 1. Receive and verify encrypted input
        euint32 value = FHE.fromExternal(input, inputProof);

        // 2. Store the value
        storedValue = value;

        // 3. CRITICAL: Grant permissions
        FHE.allowThis(value);           // Contract can use it
        FHE.allow(value, msg.sender);   // Caller can decrypt it
    }

    function retrieve() external view returns (euint32) {
        return storedValue;
    }
}
```

### Example 2: Multi-User Encrypted Data

```solidity
contract MultiUserEncryption is ZamaEthereumConfig {
    // Map user to their encrypted balance
    mapping(address => euint64) private balances;

    function deposit(externalEuint64 amount, bytes calldata proof) external {
        euint64 depositAmount = FHE.fromExternal(amount, proof);

        // Get current balance
        euint64 newBalance = FHE.add(balances[msg.sender], depositAmount);

        // Store updated balance
        balances[msg.sender] = newBalance;

        // Grant permissions to THIS user only
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);  // Only this user can decrypt
    }

    function withdraw(externalEuint64 amount, bytes calldata proof) external {
        euint64 withdrawAmount = FHE.fromExternal(amount, proof);

        // Each user can only access their own balance
        euint64 currentBalance = balances[msg.sender];

        euint64 newBalance = FHE.sub(currentBalance, withdrawAmount);

        balances[msg.sender] = newBalance;

        // Grant permissions
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);
    }
}
```

### Example 3: Shared Access Scenarios

```solidity
contract SharedAccess is ZamaEthereumConfig {
    // Authorized observers who can view values
    mapping(address => bool) public observers;

    euint32 private secretMetric;

    function updateMetric(
        externalEuint32 newValue,
        bytes calldata proof
    ) external {
        euint32 value = FHE.fromExternal(newValue, proof);
        secretMetric = value;

        // Grant contract permission
        FHE.allowThis(value);

        // Grant permission to caller (who recorded the value)
        FHE.allow(value, msg.sender);

        // Also grant to all registered observers
        // Note: This requires iterating observers (expensive!)
        // Better approach: Use events and off-chain tracking
    }

    function registerObserver(address observer) external {
        observers[observer] = true;
    }
}
```

## Permission Binding

### Encryption Binding

When a user encrypts data, it's bound to a specific [contract, user] pair:

```typescript
// Encryption is bound to THIS contract and THIS user
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, userAddress)  // Binding!
  .add32(secretValue)
  .encrypt();
```

### Permission Verification

The contract must grant permissions matching the encryption binding:

```solidity
function processEncrypted(
    externalEuint32 input,
    bytes calldata inputProof
) external {
    // inputProof proves that 'input' was encrypted for:
    // - This contract address
    // - msg.sender's address

    // Convert to usable encrypted value
    euint32 value = FHE.fromExternal(input, inputProof);

    // Process the value
    euint32 result = FHE.add(value, FHE.asEuint32(10));

    // Grant permissions matching the encryption binding
    FHE.allowThis(result);          // Contract can use
    FHE.allow(result, msg.sender);  // Original user can decrypt
}
```

## Permission Scope

### Contract-Level Permissions

Once `FHE.allowThis()` is called, the contract can use the value anywhere:

```solidity
euint32 secret = FHE.asEuint32(100);
FHE.allowThis(secret);

function operation1() external {
    // Can use secret here
    euint32 result = FHE.add(secret, FHE.asEuint32(1));
}

function operation2() external {
    // Can also use secret here
    euint32 result = FHE.mul(secret, FHE.asEuint32(2));
}
```

### User-Level Permissions

User permissions are specific to individuals:

```solidity
mapping(address => euint64) private userSecrets;

function setSecret(externalEuint64 secret, bytes calldata proof) external {
    euint64 value = FHE.fromExternal(secret, proof);
    userSecrets[msg.sender] = value;

    FHE.allowThis(value);
    FHE.allow(value, msg.sender);  // Only THIS user
}

// User A can decrypt their own secret
// User B cannot decrypt User A's secret
// Even the contract cannot decrypt either
```

## Permission Revocation

Note: FHEVM does not provide explicit permission revocation. Once a value is decryptable by a user, you must:

1. **Create a new encrypted value** with new permissions
2. **Update references** to point to the new value
3. **Clear the old value** (if security-critical)

```solidity
// Update secret with fresh permissions
function updateSecret(externalEuint32 newSecret, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(newSecret, proof);

    // Create new encrypted value (old one is replaced)
    storedSecret = value;

    // Grant fresh permissions
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);

    // Old value's permissions are no longer accessible to the user
    // (because storedSecret now points to the new value)
}
```

## Transaction Signer Requirement

The user who encrypts data must be the one who calls the contract with that data:

```typescript
// Alice encrypts data
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, alice.address)
  .add32(secretValue)
  .encrypt();

// ✅ Correct: Alice sends transaction
await contract.connect(alice).processData(
  encrypted.handles[0],
  encrypted.inputProof
);

// ❌ Wrong: Bob sends transaction with Alice's encrypted data
await contract.connect(bob).processData(
  encrypted.handles[0],
  encrypted.inputProof
);
// This will fail because Bob is not the encryption signer
```

## Best Practices

### 1. Always Grant Both Permissions

```solidity
// Template for any encrypted value operation
euint32 value = FHE.asEuint32(secret);
FHE.allowThis(value);           // ✅ Contract permission
FHE.allow(value, msg.sender);   // ✅ User permission
```

### 2. Grant Permissions Immediately

```solidity
// ✅ Grant permissions right after creation
euint32 value = FHE.asEuint32(100);
FHE.allowThis(value);
FHE.allow(value, msg.sender);
// Now safe to use

// ❌ Don't delay permission granting
euint32 value = FHE.asEuint32(100);
// ... some other code ...
FHE.allowThis(value);  // Permission granted late
```

### 3. Clear Comments for Permissions

```solidity
function recordData(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    encryptedData = value;

    // Grant permissions:
    // - Contract can compute with this value
    // - User can decrypt to verify their input
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);
}
```

### 4. Understand Permission Boundaries

```solidity
contract PermissionBoundaries {
    euint32 private publicSecret;  // Everyone deposits to this
    mapping(address => euint32) private userSecrets;  // Individual data

    function updatePublicSecret(externalEuint32 input, bytes calldata proof) external {
        euint32 value = FHE.fromExternal(input, proof);
        publicSecret = value;

        FHE.allowThis(value);
        // Note: Only granting permission to msg.sender
        // Other users cannot decrypt, only contract can use
        FHE.allow(value, msg.sender);
    }

    function updatePrivateSecret(externalEuint32 input, bytes calldata proof) external {
        euint32 value = FHE.fromExternal(input, proof);
        userSecrets[msg.sender] = value;

        FHE.allowThis(value);
        FHE.allow(value, msg.sender);  // Only this user for their data
    }
}
```

### 5. Plan Permission Strategy Early

Before writing contract code:

- [ ] Who should be able to decrypt each value?
- [ ] How long should permissions last?
- [ ] What happens if user permissions need to change?
- [ ] Are there off-chain components managing permissions?

## Common Mistakes

### ❌ Mistake 1: Forgetting FHE.allowThis()

```solidity
// This contract cannot operate on the value!
euint32 secret = FHE.asEuint32(100);
FHE.allow(secret, msg.sender);

euint32 result = FHE.add(secret, FHE.asEuint32(5));  // FAILS!
```

### ❌ Mistake 2: Forgetting FHE.allow()

```solidity
// User cannot decrypt this value!
euint32 secret = FHE.asEuint32(100);
FHE.allowThis(secret);

// Later, user tries to decrypt... cannot!
```

### ❌ Mistake 3: Granting Permissions to Wrong User

```solidity
function recordOtherUserData(
    address targetUser,
    externalEuint32 data,
    bytes calldata proof
) external {
    euint32 value = FHE.fromExternal(data, proof);

    FHE.allowThis(value);
    FHE.allow(value, targetUser);  // ❌ targetUser is NOT the signer!
    // This fails because data was encrypted for msg.sender
}
```

### ❌ Mistake 4: Not Renewing Permissions When Needed

```solidity
euint32 oldValue = FHE.asEuint32(100);
FHE.allowThis(oldValue);
FHE.allow(oldValue, msg.sender);

// ... later ...

// Creating new value but forgetting new permissions
euint32 newValue = FHE.add(oldValue, FHE.asEuint32(10));
// User cannot decrypt newValue!  Forgot to grant permissions!
```

## Testing Permissions

```typescript
it("should grant proper permissions", async function () {
    const value = FHE.asEuint32(100);
    FHE.allowThis(value);
    FHE.allow(value, alice.address);

    // Verify Alice can decrypt
    const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        value,
        contractAddress,
        alice
    );
    expect(decrypted).to.eq(100);

    // Verify Bob cannot decrypt
    expect(async () => {
        await fhevm.userDecryptEuint(
            FhevmType.euint32,
            value,
            contractAddress,
            bob
        );
    }).to.throw();
});
```

## Next Steps

- Learn about [FHE Operations](operations.md)
- See practical examples in [Quality Inspection](../examples/privacy-quality-inspection.md)
- Explore [Encrypted Types](encrypted-types.md)

---

**Master permissions to build truly private and secure FHEVM applications!** 🔐
