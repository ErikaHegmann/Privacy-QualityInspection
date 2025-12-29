# Troubleshooting Guide

Common issues and solutions when working with the Anonymous Quality Testing project.

## Installation Issues

### Issue: npm install fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
npm install
```

2. **Use legacy peer dependency resolution:**
```bash
npm install --legacy-peer-deps
```

3. **Use npm 7+ (recommended):**
```bash
npm --version  # Check version
npm install -g npm@latest  # Upgrade if needed
npm install
```

### Issue: Node version incompatibility

**Symptoms:**
```
This version of npm is incompatible with `node@x.x.x`
```

**Solutions:**

1. **Check required Node version:**
```bash
node --version
# Should be >= 20.0.0
```

2. **Install Node.js 20 or later:**
   - Visit https://nodejs.org/
   - Download LTS version
   - Reinstall all dependencies

### Issue: Missing TypeScript definitions

**Symptoms:**
```
error TS2307: Cannot find module '@fhevm/solidity'
```

**Solutions:**

1. **Regenerate types:**
```bash
npm run typechain
npm run compile
```

2. **Clear and reinstall:**
```bash
npm run clean
npm install
npm run compile
```

## Compilation Issues

### Issue: Contract won't compile

**Symptoms:**
```
Error: EROFS: read-only file system
CompileError: contract.sol:1:1: ParserError: Source "@fhevm/..." not found
```

**Solutions:**

1. **Verify @fhevm/solidity installation:**
```bash
npm list @fhevm/solidity
# Should show a version number
```

2. **Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **Check Solidity version compatibility:**
```solidity
// hardhat.config.ts should match contract
solidity: {
    version: "0.8.24"  // Must be 0.8.24 for FHEVM
}
```

### Issue: Import errors

**Symptoms:**
```
Error: Cannot find module '@fhevm/solidity/lib/FHE.sol'
```

**Solutions:**

1. **Verify import paths:**
```solidity
// ✅ Correct
import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";

// ❌ Wrong
import { FHE } from "@fhevm/solidity/FHE.sol";
```

2. **Check @fhevm/solidity version:**
```bash
npm list @fhevm/solidity
npm update @fhevm/solidity
```

## Testing Issues

### Issue: Tests skip on Sepolia

**Symptoms:**
```
"This hardhat test suite cannot run on Sepolia Testnet"
Tests are being skipped
```

**Explanation:**
Tests with encrypted values require FHEVM mock environment, which is not available on Sepolia.

**Solution:**
Run tests on localhost or hardhat network:
```bash
npm run test          # Uses hardhat network (has FHEVM mock)
# NOT
npx hardhat test --network sepolia  # Will skip all tests
```

### Issue: Permission denied errors

**Symptoms:**
```
"User doesn't have permission to decrypt"
revert Unauthed
```

**Causes:**
- Missing `FHE.allowThis()` on encrypted value
- Missing `FHE.allow(value, user)` on encrypted value
- Encryption signer doesn't match transaction sender

**Solutions:**

1. **Verify permission calls:**
```solidity
// ❌ Wrong - Missing FHE.allowThis()
euint32 secret = FHE.asEuint32(100);
FHE.allow(secret, msg.sender);

// ✅ Correct - Both permissions granted
euint32 secret = FHE.asEuint32(100);
FHE.allowThis(secret);           // Contract permission
FHE.allow(secret, msg.sender);   // User permission
```

2. **Check encryption signer in tests:**
```typescript
// ❌ Wrong - Encryption signer is alice, but bob calls contract
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, alice.address)
  .add32(value)
  .encrypt();
await contract.connect(bob).someFunction(encrypted.handles[0], encrypted.inputProof);

// ✅ Correct - Same signer encrypts and calls
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, alice.address)
  .add32(value)
  .encrypt();
await contract.connect(alice).someFunction(encrypted.handles[0], encrypted.inputProof);
```

### Issue: Proof verification failed

**Symptoms:**
```
"Invalid proof"
revert ProofVerificationFailed
```

**Causes:**
- Incorrect encryption signer
- Proof doesn't match encrypted value
- Contract address mismatch

**Solutions:**

1. **Verify encryption binding:**
```typescript
// Encryption MUST be for THIS contract and THIS user
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, signer.address)  // Must match!
  .add32(secretValue)
  .encrypt();
```

2. **Use correct contract address:**
```typescript
// Ensure contractAddress matches where contract is deployed
const encrypted = await fhevm
  .createEncryptedInput(deployedContractAddress, signer.address)
  .add32(value)
  .encrypt();
```

### Issue: Test timeout

**Symptoms:**
```
Error: timeout of 40000ms exceeded
```

**Solutions:**

1. **Increase timeout for specific test:**
```typescript
it("should complete task", async function () {
  this.timeout(60000);  // 60 seconds
  // test code
});
```

2. **Increase global timeout in hardhat.config.ts:**
```typescript
mocha: {
  timeout: 60000  // 60 seconds
}
```

3. **Reduce test workload:**
   - Run fewer tests in parallel
   - Optimize contract logic
   - Use test fixtures more efficiently

## Deployment Issues

### Issue: Contract deployment fails

**Symptoms:**
```
Error: insufficient funds for gas * price + value
```

**Solutions:**

1. **For localhost (hardhat node):**
   - Not a real issue, accounts start with 10000 ETH
   - Verify hardhat node is running: `npx hardhat node`

2. **For Sepolia testnet:**
   - Get test ETH from faucet (see [Deployment Guide](deployment-guide.md))
   - Check account balance:
```bash
npx hardhat --network sepolia accounts
```

### Issue: Cannot connect to network

**Symptoms:**
```
Error: Could not connect to the network. Please make sure you have set up the network connection properly.
```

**Solutions:**

1. **Check network configuration:**
```bash
cat hardhat.config.ts | grep -A 10 "networks:"
```

2. **Verify RPC endpoint:**
```bash
npx hardhat --network sepolia accounts
# If fails, RPC endpoint is wrong
```

3. **Test network connection:**
```bash
curl https://sepolia.infura.io/v3/YOUR_API_KEY
# Should return 200 if key is valid
```

### Issue: Etherscan verification fails

**Symptoms:**
```
Error: The contract source code does not match the compiled code
```

**Solutions:**

1. **Ensure code hasn't changed:**
```bash
git status  # Check for uncommitted changes
npm run compile  # Recompile to verify
```

2. **Use correct file list:**
```bash
npx hardhat verify --network sepolia <ADDRESS> --contract-name ContractName <ARGS>
```

3. **Wait for transaction confirmation:**
   - Sometimes verification needs more blocks
   - Try again after a few minutes

### Issue: Private key errors

**Symptoms:**
```
Error: invalid privateKey
Error: privateKey length must be 32 bytes
```

**Solutions:**

1. **Check MNEMONIC format:**
```bash
# MNEMONIC should be 12 words
npx hardhat vars get MNEMONIC
```

2. **Set variables correctly:**
```bash
npx hardhat vars set MNEMONIC "word1 word2 word3 ... word12"
npx hardhat vars set INFURA_API_KEY "your-key-here"
npx hardhat vars set ETHERSCAN_API_KEY "your-key-here"
```

3. **Verify variables are set:**
```bash
npx hardhat vars list
```

## Script Issues

### Issue: create-fhevm-example fails

**Symptoms:**
```
Error: Example 'invalid-name' not found
```

**Solutions:**

1. **List available examples:**
```bash
npm run create-example
# Shows available examples
```

2. **Use correct example name:**
```bash
npm run create-example fhe-counter ./my-counter
# NOT
npm run create-example fhe_counter ./my-counter  # Wrong syntax
```

### Issue: create-fhevm-category fails

**Symptoms:**
```
Error: Category 'basic' not found
```

**Solutions:**

1. **List available categories:**
```bash
npm run create-category
# Shows available categories
```

2. **Use correct category name:**
```bash
npm run create-category basic ./basic-examples
# NOT
npm run create-category BASIC ./basic-examples  # Case-sensitive
```

### Issue: Documentation generation fails

**Symptoms:**
```
Error: ENOENT: no such file or directory
```

**Solutions:**

1. **Ensure files exist:**
```bash
ls -la contracts/
ls -la test/
```

2. **Run from project root:**
```bash
cd /path/to/project
npm run generate-docs
# NOT
npm run generate-docs  # from wrong directory
```

## Local Development Issues

### Issue: hardhat node crashes

**Symptoms:**
```
Error: Cannot find module 'express'
Server crashed
```

**Solutions:**

1. **Reinstall dependencies:**
```bash
npm run clean
npm install
```

2. **Restart node:**
```bash
pkill -f "hardhat node"  # Kill existing process
npx hardhat node  # Start fresh
```

3. **Check port conflicts:**
```bash
# Default port is 8545
lsof -i :8545  # See what's using port 8545
npx hardhat node --port 8546  # Use different port
```

### Issue: State not persisting

**Symptoms:**
```
Contract state is reset after restart
Deployments disappear
```

**Explanation:**
This is normal behavior. By default, hardhat node doesn't persist state between restarts.

**Solutions:**

1. **Use persistent node (if needed):**
```bash
npx hardhat node --save hardhat_state.json
npx hardhat node --load hardhat_state.json
```

2. **Redeploy after restart:**
```bash
npx hardhat --network localhost deploy
```

### Issue: Gas estimation too high

**Symptoms:**
```
Gas estimation reverted with the following reason: Unknown Error
```

**Solutions:**

1. **Check contract logic:**
   - Ensure no infinite loops
   - Verify all operations are valid

2. **Increase gas limit:**
```bash
npx hardhat --network localhost test --network-args-gas-limit 3000000
```

3. **Profile gas usage:**
```bash
REPORT_GAS=true npm run test
```

## Code Quality Issues

### Issue: Linting fails

**Symptoms:**
```
ESLint/Solhint errors prevent deployment
```

**Solutions:**

1. **Fix linting issues:**
```bash
npm run lint  # See all issues
npm run prettier:write  # Auto-fix most issues
```

2. **Check specific linter:**
```bash
npm run lint:sol  # Solidity
npm run lint:ts   # TypeScript
```

3. **Review and fix manually:**
```bash
# Edit files as needed
npm run lint  # Verify fixes
```

## Performance Issues

### Issue: Tests run slowly

**Symptoms:**
```
Test suite takes >5 minutes to complete
```

**Solutions:**

1. **Run specific tests:**
```bash
npx hardhat test test/PrivacyQualityInspection.ts --grep "specific test"
```

2. **Optimize test setup:**
```typescript
// Share contract instance between tests instead of redeploying
let contract: ContractType;

before(async function () {
  const factory = await ethers.getContractFactory("ContractName");
  contract = await factory.deploy();  // Deploy once
});
```

3. **Reduce gas reporter overhead:**
```bash
# Only enable gas reporter when needed
REPORT_GAS=true npm run test
```

### Issue: Large file operations slow

**Symptoms:**
```
Compilation takes >30 seconds
Coverage generation is very slow
```

**Solutions:**

1. **Clean build artifacts:**
```bash
npm run clean
npm run compile
```

2. **Skip coverage for quick tests:**
```bash
npm run test  # Regular tests
# NOT
npm run coverage  # Only when needed
```

## Getting Help

If your issue isn't resolved:

1. **Check documentation:**
   - [Development Guide](../DEVELOPMENT.md)
   - [API Reference](api-reference.md)
   - [Testing Guide](testing-guide.md)

2. **Review code examples:**
   - Check test files for correct usage
   - Review contract implementation
   - Look at automation scripts

3. **Search for similar issues:**
   - GitHub Issues
   - Stack Overflow
   - FHEVM Documentation

4. **Ask for help:**
   - Zama Community Forum: https://community.zama.ai/
   - Zama Discord: https://discord.com/invite/zama
   - GitHub Issues: Create detailed bug report

## Common Error Messages Quick Reference

| Error | Likely Cause | Quick Fix |
|-------|-----|----------|
| "Not authorized" | Non-owner calling owner-only function | Use owner account |
| "Invalid proof" | Encryption signer mismatch | Ensure signer matches caller |
| "Permission denied" | Missing FHE.allow() | Add both FHE.allowThis() and FHE.allow() |
| "File not found" | Wrong path | Check hardhat config paths |
| "ERESOLVE" | Dependency conflict | Use `--legacy-peer-deps` |
| "Cannot find module" | Missing install | Run `npm install` |
| "Timeout" | Test taking too long | Increase timeout or optimize code |
| "Insufficient funds" | Not enough ETH for gas | Use faucet or check account |
| "RPC error" | Network connection issue | Verify RPC endpoint |
| "Contract reverted" | Contract logic error | Check transaction inputs |

---

**Still stuck? Please check the [Documentation](README.md) or reach out to the community!** 💬
