# What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) is a revolutionary technology that enables smart contracts to perform computations on encrypted data without decrypting it.

## Overview

FHEVM by Zama brings the power of Fully Homomorphic Encryption (FHE) to Ethereum-compatible blockchains, allowing developers to build privacy-preserving decentralized applications.

### Key Innovation

Traditional blockchain smart contracts operate on plain, unencrypted data visible to everyone on the network. FHEVM changes this paradigm by:

- **Encrypted State**: Store sensitive data encrypted on-chain
- **Encrypted Computation**: Perform operations on encrypted values
- **Privacy Preservation**: Keep data confidential while maintaining verifiability

## How FHEVM Works

### 1. Encryption

Users encrypt data locally before sending it to the blockchain:

```typescript
// User side: Encrypt value locally
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(secretValue)
  .encrypt();
```

### 2. Encrypted Storage

Smart contracts store encrypted values using special types:

```solidity
// Contract side: Store encrypted value
euint32 private encryptedBalance;

function store(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    encryptedBalance = value;
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);
}
```

### 3. Encrypted Operations

Contracts can perform computations without decryption:

```solidity
// Add two encrypted numbers
euint32 sum = FHE.add(encryptedValue1, encryptedValue2);

// Compare encrypted numbers
ebool isGreater = FHE.gt(encryptedValue1, encryptedValue2);

// Select based on encrypted condition
euint32 result = FHE.select(condition, valueA, valueB);
```

### 4. Decryption (When Needed)

Only authorized users can decrypt values they have permission for:

```typescript
// User side: Decrypt authorized value
const decrypted = await fhevm.userDecryptEuint(
  FhevmType.euint32,
  encryptedValue,
  contractAddress,
  signer
);
```

## Core Concepts

### Encrypted Types

FHEVM provides encrypted versions of common Solidity types:

| Encrypted Type | Plaintext Equivalent | Size | Range |
|----------------|---------------------|------|-------|
| `euint8` | `uint8` | 8 bits | 0 to 255 |
| `euint16` | `uint16` | 16 bits | 0 to 65,535 |
| `euint32` | `uint32` | 32 bits | 0 to 4,294,967,295 |
| `euint64` | `uint64` | 64 bits | 0 to 2^64-1 |
| `ebool` | `bool` | 1 bit | true/false |
| `eaddress` | `address` | 160 bits | Ethereum address |

### Permission System

FHEVM uses a dual-permission model:

1. **Contract Permission**: `FHE.allowThis(value)`
   - Allows the contract to use the encrypted value
   - Required for any subsequent operations

2. **User Permission**: `FHE.allow(value, user)`
   - Allows specific user to decrypt the value
   - Required for user-side decryption

```solidity
// Always grant both permissions
FHE.allowThis(encryptedValue);        // Contract can use
FHE.allow(encryptedValue, msg.sender); // User can decrypt
```

### Input Proofs

When users submit encrypted values, they must provide a proof:

```typescript
// Generate encrypted input with proof
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, signerAddress)
  .add32(123)
  .encrypt();

// Submit to contract with proof
await contract.operate(
  encrypted.handles[0],  // Encrypted value
  encrypted.inputProof    // Zero-knowledge proof
);
```

The proof ensures:
- Value was encrypted correctly
- Encryption is bound to specific [contract, user] pair
- No tampering occurred during transmission

## Use Cases

### Financial Privacy

```solidity
// Private token balances
mapping(address => euint64) private balances;

// Transfer without revealing amounts
function transfer(address to, externalEuint64 amount, bytes calldata proof) external {
    euint64 transferAmount = FHE.fromExternal(amount, proof);
    balances[msg.sender] = FHE.sub(balances[msg.sender], transferAmount);
    balances[to] = FHE.add(balances[to], transferAmount);
}
```

### Confidential Voting

```solidity
// Hidden vote counts
euint32 private yesVotes;
euint32 private noVotes;

function vote(externalEuint8 choice, bytes calldata proof) external {
    euint8 vote = FHE.fromExternal(choice, proof);
    ebool isYes = FHE.eq(vote, FHE.asEuint8(1));

    yesVotes = FHE.add(yesVotes, FHE.select(isYes, FHE.asEuint32(1), FHE.asEuint32(0)));
    noVotes = FHE.add(noVotes, FHE.select(isYes, FHE.asEuint32(0), FHE.asEuint32(1)));
}
```

### Sealed-Bid Auctions

```solidity
// Hidden bids
mapping(address => euint64) private bids;

function placeBid(externalEuint64 bidAmount, bytes calldata proof) external {
    euint64 bid = FHE.fromExternal(bidAmount, proof);
    bids[msg.sender] = bid;
    FHE.allowThis(bid);
    FHE.allow(bid, msg.sender);
}
```

## Benefits

### Privacy by Design

- Sensitive data never exposed on-chain
- Computations remain confidential
- Privacy preserved end-to-end

### Compliance Friendly

- GDPR-compliant data handling
- Regulatory privacy requirements met
- Audit trails without exposure

### Composability

- Works with existing Ethereum tooling
- Compatible with Solidity
- Integrates with DeFi protocols

### Verifiability

- Cryptographic guarantees
- Blockchain immutability
- Transparent rules, private data

## Limitations

### Computational Overhead

FHE operations are more expensive than plaintext:
- Higher gas costs
- Slower execution
- Larger contract sizes

### Limited Operations

Not all operations are available:
- Division is approximated
- Floating-point not supported
- Some bit operations restricted

### Design Patterns

Requires different thinking:
- Can't use view functions for user decryption
- Must manage permissions explicitly
- Need to handle encrypted conditionals differently

## Architecture

### FHEVM Stack

```
┌─────────────────────────────────┐
│   DApp Frontend (Web3.js)       │
├─────────────────────────────────┤
│   FHEVM SDK (encrypt/decrypt)   │
├─────────────────────────────────┤
│   Smart Contract (Solidity)     │
├─────────────────────────────────┤
│   FHEVM Precompiles (FHE ops)   │
├─────────────────────────────────┤
│   Blockchain (Ethereum/L2)      │
└─────────────────────────────────┘
```

### Workflow

1. **Client Encryption**: User encrypts data locally
2. **Submit Transaction**: Send encrypted data + proof
3. **Contract Execution**: Perform operations on encrypted values
4. **Store Encrypted**: Save results on-chain
5. **Authorized Decryption**: Users decrypt their permitted values

## Getting Started

### Prerequisites

```bash
npm install @fhevm/solidity @fhevm/hardhat-plugin
```

### Basic Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SimplePrivacy is ZamaEthereumConfig {
    euint32 private secretValue;

    function store(externalEuint32 input, bytes calldata proof) external {
        secretValue = FHE.fromExternal(input, proof);
        FHE.allowThis(secretValue);
        FHE.allow(secretValue, msg.sender);
    }

    function getValue() external view returns (euint32) {
        return secretValue;
    }
}
```

## Resources

- **Official Docs**: https://docs.zama.ai/fhevm
- **GitHub**: https://github.com/zama-ai/fhevm
- **Examples**: https://github.com/zama-ai/dapps
- **Community**: https://community.zama.ai/

## Next Steps

- Learn about [Encrypted Types](encrypted-types.md)
- Understand the [Permission System](permissions.md)
- Explore [FHE Operations](operations.md)
- Build your first [Privacy-Preserving Application](../examples/privacy-quality-inspection.md)

---

**FHEVM enables a new generation of privacy-preserving blockchain applications. Start building today!** 🚀
