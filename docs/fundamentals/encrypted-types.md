# Encrypted Types

Encrypted types are the foundation of FHEVM smart contracts. They allow you to work with confidential data while maintaining cryptographic security.

## Available Types

### Unsigned Integer Types

| Type | Bits | Max Value | Use Case |
|------|------|-----------|----------|
| `euint8` | 8 | 255 | Small counts, scores |
| `euint16` | 16 | 65,535 | IDs, percentages |
| `euint32` | 32 | 4,294,967,295 | Balances, timestamps |
| `euint64` | 64 | 18,446,744,073,709,551,615 | Large balances, amounts |

### Boolean Type

| Type | Values | Use Case |
|------|--------|----------|
| `ebool` | true/false | Encrypted conditions |

### Address Type

| Type | Size | Use Case |
|------|------|----------|
| `eaddress` | 160-bit | Encrypted addresses |

## Type Casting

### From Plaintext to Encrypted

```solidity
// Using FHE.asEuintX functions
euint8 encrypted8 = FHE.asEuint8(42);
euint16 encrypted16 = FHE.asEuint16(10000);
euint32 encrypted32 = FHE.asEuint32(1000000);
euint64 encrypted64 = FHE.asEuint64(9999999999);
ebool encryptedBool = FHE.asBool(true);
eaddress encryptedAddr = FHE.asEaddress(msg.sender);
```

### From External Input to Encrypted

When receiving encrypted input from users:

```solidity
function receiveEncrypted(
    externalEuint32 input,
    bytes calldata inputProof
) external {
    // Verify proof and convert to euint32
    euint32 value = FHE.fromExternal(input, inputProof);

    // Now you can use 'value' in encrypted operations
    storedValue = value;

    // Don't forget to set permissions!
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);
}
```

## Operations by Type

### Arithmetic Operations (euint8, euint16, euint32, euint64)

```solidity
euint32 a = FHE.asEuint32(10);
euint32 b = FHE.asEuint32(5);

// Addition
euint32 sum = FHE.add(a, b);        // 10 + 5 = 15

// Subtraction
euint32 diff = FHE.sub(a, b);       // 10 - 5 = 5

// Multiplication
euint32 product = FHE.mul(a, b);    // 10 * 5 = 50

// Division (returns quotient)
euint32 quotient = FHE.div(a, b);   // 10 / 5 = 2

// Remainder
euint32 remainder = FHE.rem(a, b);  // 10 % 5 = 0

// Bitwise AND
euint32 andResult = FHE.and(a, b);

// Bitwise OR
euint32 orResult = FHE.or(a, b);

// Bitwise XOR
euint32 xorResult = FHE.xor(a, b);
```

### Comparison Operations (return ebool)

```solidity
euint32 a = FHE.asEuint32(10);
euint32 b = FHE.asEuint32(5);

// Equal
ebool isEqual = FHE.eq(a, b);       // false

// Not equal
ebool isNotEqual = FHE.ne(a, b);    // true

// Less than
ebool isLess = FHE.lt(a, b);        // false (10 < 5)

// Less than or equal
ebool isLessEq = FHE.le(a, b);      // false (10 <= 5)

// Greater than
ebool isGreater = FHE.gt(a, b);     // true (10 > 5)

// Greater than or equal
ebool isGreaterEq = FHE.ge(a, b);   // true (10 >= 5)
```

### Logical Operations (ebool)

```solidity
ebool cond1 = FHE.asBool(true);
ebool cond2 = FHE.asBool(false);

// Logical AND
ebool andResult = FHE.and(cond1, cond2);    // false

// Logical OR
ebool orResult = FHE.or(cond1, cond2);      // true

// Logical NOT (logical negation)
ebool notResult = FHE.not(cond1);           // false
```

### Conditional Operations (if-then-else)

```solidity
euint32 value1 = FHE.asEuint32(100);
euint32 value2 = FHE.asEuint32(50);
ebool condition = FHE.gt(value1, value2);   // true

// Select based on encrypted condition
// If condition is true, return value1; otherwise value2
euint32 result = FHE.select(condition, value1, value2);  // 100
```

### Bit Shift Operations

```solidity
euint32 value = FHE.asEuint32(8);

// Left shift
euint32 shifted_left = FHE.shl(value, 2);   // 8 << 2 = 32

// Right shift
euint32 shifted_right = FHE.shr(value, 1);  // 8 >> 1 = 4
```

## Type Safety

### Overflow/Underflow

Encrypted arithmetic behaves like normal Solidity:

```solidity
euint8 max = FHE.asEuint8(255);
euint8 one = FHE.asEuint8(1);

// Adding 1 to max euint8 causes overflow
euint8 overflow = FHE.add(max, one);  // wraps to 0
```

**Best Practice**: Use larger types when overflow is possible:

```solidity
// Safer: Use euint32 instead of euint8
euint32 safeSum = FHE.add(
    FHE.asEuint32(255),
    FHE.asEuint32(1)
);  // 256
```

### Underflow

```solidity
euint8 zero = FHE.asEuint8(0);
euint8 one = FHE.asEuint8(1);

// Subtracting from zero causes underflow
euint8 underflow = FHE.sub(zero, one);  // wraps to 255
```

**Best Practice**: Check before subtracting:

```solidity
euint8 balance = FHE.asEuint8(10);
euint8 withdraw = FHE.asEuint8(15);

// Check if balance >= withdraw
ebool canWithdraw = FHE.ge(balance, withdraw);

// Conditionally execute
euint8 newBalance = FHE.select(
    canWithdraw,
    FHE.sub(balance, withdraw),
    balance
);
```

## Type Conversion

### Casting Between Encrypted Types

**Important**: Cannot directly cast between encrypted types. Must decrypt and re-encrypt.

```solidity
euint8 small = FHE.asEuint8(10);

// ❌ This doesn't work:
// euint32 large = euint32(small);

// ✅ Workaround for known constants:
euint32 large = FHE.asEuint32(10);

// ✅ For stored values, use operations that return different types
euint32 summedValue = FHE.add(
    FHE.asEuint32(value8),  // Treat as euint32
    FHE.asEuint32(otherValue)
);
```

### Plaintext Integration

Mix encrypted and plaintext values:

```solidity
euint32 encryptedValue = FHE.asEuint32(100);
uint256 plainValue = 50;

// ❌ Can't mix directly in operations:
// euint32 result = FHE.add(encryptedValue, plainValue);

// ✅ Convert plaintext first:
euint32 result = FHE.add(
    encryptedValue,
    FHE.asEuint32(uint32(plainValue))
);
```

## Best Practices

### Choose Appropriate Types

```solidity
// ❌ Wasteful: Using euint64 for small value
euint64 score = FHE.asEuint64(100);  // 0-100 fits in euint8

// ✅ Efficient: Use appropriate size
euint8 score = FHE.asEuint8(100);
```

### Prevent Overflow/Underflow

```solidity
// For quality score 0-100
euint8 score = FHE.asEuint8(85);
euint8 maxScore = FHE.asEuint8(100);

// Safe increment
euint8 newScore = FHE.select(
    FHE.lt(score, maxScore),
    FHE.add(score, FHE.asEuint8(1)),
    maxScore
);
```

### Consistent Type Usage

```solidity
// ❌ Mixing types inconsistently
euint32 total = FHE.asEuint32(100);
total = FHE.add(total, FHE.asEuint8(5));  // Type mismatch

// ✅ Keep types consistent
euint32 total = FHE.asEuint32(100);
total = FHE.add(total, FHE.asEuint32(5));
```

## Performance Considerations

### Gas Costs by Type

Operations on larger types cost more gas:

```solidity
// euint8 operations: ~500 gas
euint8 a = FHE.asEuint8(10);
euint8 result = FHE.add(a, FHE.asEuint8(5));

// euint32 operations: ~1000 gas
euint32 b = FHE.asEuint32(10);
euint32 result = FHE.add(b, FHE.asEuint32(5));

// euint64 operations: ~2000 gas
euint64 c = FHE.asEuint64(10);
euint64 result = FHE.add(c, FHE.asEuint64(5));
```

### Optimization Strategy

```solidity
// ✅ Use smaller types for frequent operations
euint8 counter = FHE.asEuint8(0);  // Cheaper than euint32

// ✅ Batch operations where possible
euint32 sum = FHE.add(
    FHE.add(val1, val2),
    FHE.add(val3, val4)
);  // More efficient than separate additions
```

## Examples

### Quality Score with Range Check

```solidity
euint8 qualityScore = FHE.asEuint8(85);

// Check if quality is in valid range (0-100)
ebool isValid = FHE.and(
    FHE.le(qualityScore, FHE.asEuint8(100)),
    FHE.ge(qualityScore, FHE.asEuint8(0))
);

// Clamp to range
euint8 clamped = FHE.select(
    isValid,
    qualityScore,
    FHE.asEuint8(100)
);
```

### Batch Update with Overflow Protection

```solidity
euint32 balance = FHE.asEuint32(1000);
euint32 amount = FHE.asEuint32(2000);

// Check for overflow before adding
euint32 maxValue = FHE.asEuint32(2**32 - 1);
ebool wouldOverflow = FHE.gt(
    FHE.add(balance, amount),
    maxValue
);

// Safely update
euint32 newBalance = FHE.select(
    wouldOverflow,
    maxValue,
    FHE.add(balance, amount)
);
```

## Next Steps

- Learn about [FHE Operations](operations.md) in detail
- Understand the [Permission System](permissions.md)
- See practical examples in [Quality Inspection](../examples/privacy-quality-inspection.md)

---

**Master encrypted types to build secure, privacy-preserving smart contracts!** 🔐
