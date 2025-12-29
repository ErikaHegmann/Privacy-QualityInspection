# Contributing to Anonymous Quality Testing

Thank you for your interest in contributing to the Anonymous Quality Testing project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project adheres to the Zama community standards. By participating, you are expected to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Prioritize the project's long-term health

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js >= 20
- npm >= 7.0.0
- Git
- Basic understanding of Solidity and TypeScript
- Familiarity with FHEVM concepts

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/AnonymousQualityTesting.git
cd AnonymousQualityTesting
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/ImmanuelHickle/AnonymousQualityTesting.git
```

4. Install dependencies:
```bash
npm install
```

### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation improvements
- `test/` - Test additions or fixes
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

## Development Workflow

### 1. Make Changes

- Write clear, focused commits
- Follow coding standards (see below)
- Add tests for new functionality
- Update documentation as needed

### 2. Test Your Changes

```bash
# Run all tests
npm run test

# Check test coverage
npm run coverage

# Lint code
npm run lint

# Format code
npm run prettier:write
```

### 3. Commit Changes

Use conventional commit messages:

```bash
# Feature
git commit -m "feat: add new inspector role management"

# Bug fix
git commit -m "fix: resolve permission issue in recordInspection"

# Documentation
git commit -m "docs: update README with deployment instructions"

# Tests
git commit -m "test: add edge cases for verification workflow"

# Refactor
git commit -m "refactor: optimize metric calculation loop"
```

Commit message format:
```
<type>: <short description>

[optional detailed description]

[optional footer: references to issues, breaking changes, etc.]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or updates
- `refactor`: Code refactoring
- `chore`: Build process or tooling changes
- `style`: Code style/formatting changes

### 4. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

## Pull Request Process

### Before Submitting

Ensure your PR:
- [ ] Passes all tests (`npm run test`)
- [ ] Passes linting (`npm run lint`)
- [ ] Has proper test coverage
- [ ] Updates documentation if needed
- [ ] Follows coding standards
- [ ] Includes clear commit messages

### Submitting a PR

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:

```markdown
## Description
[Clear description of changes]

## Related Issues
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
[Describe tests you've added or run]

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, maintainers will merge

## Coding Standards

### Solidity

Follow the Solidity style guide with FHEVM-specific patterns:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";

/// @title Contract Title
/// @notice What this contract does
contract ContractName {
    // State variables
    euint32 private encryptedValue;

    /// @notice Function description
    /// @param param1 Parameter description
    /// @return Return value description
    function functionName(uint256 param1) external returns (uint256) {
        // CRITICAL: Always grant both permissions for encrypted values
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);

        return someValue;
    }
}
```

**Key Requirements**:
- Clear comments explaining WHY, not just WHAT
- Always grant both `FHE.allowThis()` and `FHE.allow()` permissions
- Proper access modifiers (`external` for external calls, `public` only when needed)
- Emit events for important state changes
- Input validation on all user-provided data

### TypeScript

Follow TypeScript best practices:

```typescript
// Clear type definitions
interface TestFixture {
  contract: ContractType;
  contractAddress: string;
}

// Descriptive test names with ✅/❌ markers
describe("Feature Name", function () {
  it("✅ Should work correctly", async function () {
    // Test implementation
  });

  it("❌ Should revert with proper error", async function () {
    await expect(
      contract.someFunction()
    ).to.be.revertedWith("Expected error message");
  });
});
```

**Key Requirements**:
- Type everything explicitly
- Use async/await consistently
- Clear test descriptions
- Group related tests with `describe` blocks

### Code Style

```bash
# Auto-format before committing
npm run prettier:write

# Check formatting
npm run prettier:check

# Lint Solidity
npm run lint:sol

# Lint TypeScript
npm run lint:ts
```

## Testing Requirements

### Test Coverage

Aim for >80% coverage:

```bash
npm run coverage
```

### Test Structure

```typescript
describe("ContractName", function () {
  let contract: ContractType;

  beforeEach(async function () {
    // Deploy fresh contract for each test
    ({ contract } = await deployFixture());
  });

  describe("Feature Group", function () {
    it("✅ Should handle success case", async function () {
      // Arrange
      const input = 123;

      // Act
      const tx = await contract.someFunction(input);
      await tx.wait();

      // Assert
      const result = await contract.getResult();
      expect(result).to.eq(expectedValue);
    });

    it("❌ Should handle error case", async function () {
      await expect(
        contract.invalidOperation()
      ).to.be.revertedWith("Error message");
    });
  });
});
```

### Testing Checklist

For new features, include:
- [ ] Success cases
- [ ] Error cases
- [ ] Edge cases
- [ ] Permission checks
- [ ] Access control
- [ ] Event emissions
- [ ] Gas optimization (if relevant)

## Documentation

### Code Comments

```solidity
// ❌ Bad: States the obvious
uint256 count = 0; // Set count to 0

// ✅ Good: Explains WHY
// Initialize count to 0 because FHE operations require a known starting point
uint256 count = 0;

// ✅ Good: Explains complex logic
// Use FHE.select() instead of if/else because encrypted booleans
// cannot be used in control flow
euint32 result = FHE.select(condition, valueA, valueB);
```

### Documentation Updates

When changing functionality, update:
- [ ] README.md (if user-facing)
- [ ] DEVELOPMENT.md (if developer-facing)
- [ ] Code comments
- [ ] GitBook docs (in `docs/`)
- [ ] Test documentation

### Generating Documentation

```bash
npm run generate-docs
```

## Issue Reporting

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Error messages/stack traces

Template:
```markdown
**Description**
[Clear, concise description]

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
[What should happen]

**Actual Behavior**
[What actually happens]

**Environment**
- OS: [e.g., Windows 11]
- Node: [e.g., v20.10.0]
- npm: [e.g., 10.2.3]

**Error Messages**
```
[Paste error messages here]
```
```

### Feature Requests

Include:
- Clear description of the feature
- Use case/motivation
- Proposed solution (if you have one)
- Alternatives considered

## Community

### Getting Help

- 📚 Read the [documentation](README.md)
- 🔍 Check existing [issues](https://github.com/ImmanuelHickle/AnonymousQualityTesting/issues)
- 💬 Ask on [Zama Community Forum](https://community.zama.ai/)
- 💭 Join [Zama Discord](https://discord.com/invite/zama)

### Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Shoutouts in community channels

## License

By contributing, you agree that your contributions will be licensed under the BSD-3-Clause-Clear License.

---

**Thank you for contributing to Anonymous Quality Testing! Your efforts help advance privacy-preserving blockchain technology.** 🚀
