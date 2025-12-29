# Automation Scripts

This directory contains TypeScript-based automation tools for managing FHEVM examples and generating documentation.

## Overview

Three powerful scripts help manage FHEVM examples and documentation:

1. **generate-docs.ts** - GitBook documentation generation
2. **create-fhevm-example.ts** - Standalone example generator
3. **create-fhevm-category.ts** - Category project generator

## generate-docs.ts

Generates GitBook-compatible documentation from contract and test files.

### Usage

```bash
# Using npm script
npm run generate-docs

# Or directly with ts-node
ts-node scripts/generate-docs.ts
```

### What it does

- Extracts documentation from contract annotations
- Generates markdown pages for examples
- Creates SUMMARY.md for GitBook navigation
- Produces Getting Started guide
- Generates API reference documentation
- Organizes docs by category

### Configuration

Edit the `EXAMPLE_CONFIG` object to customize:

```typescript
const EXAMPLE_CONFIG: ExampleConfig = {
  name: 'example-name',
  title: 'Example Title',
  description: 'Example description',
  category: 'Category Name',
  contractPath: 'contracts/Example.sol',
  testPath: 'test/Example.ts',
  concepts: ['Concept1', 'Concept2']
};
```

### Output

Generated files in `docs/examples/`:
- Individual example markdown files
- SUMMARY.md for navigation
- getting-started.md guide
- Organized by category

## create-fhevm-example.ts

Creates standalone, complete FHEVM example repositories.

### Usage

```bash
# Using npm script
npm run create-example <example-name> <output-path>

# Or directly with ts-node
ts-node scripts/create-fhevm-example.ts <example-name> <output-path>

# Examples:
npm run create-example fhe-counter ./my-fhe-counter
npm run create-example privacy-quality-inspection ./my-qc-system
npm run create-example access-control ./access-control-demo
npm run create-example blind-auction ./sealed-bid-auction
```

### Available Examples

| Name | Title | Description |
|------|-------|-------------|
| `fhe-counter` | FHE Counter | Simple encrypted counter |
| `encrypt-single` | Single Value Encryption | Basic encryption mechanism |
| `encrypt-multiple` | Multiple Value Encryption | Handling multiple encrypted values |
| `user-decrypt-single` | User Decryption (Single) | Single value user decryption |
| `user-decrypt-multiple` | User Decryption (Multiple) | Multiple value user decryption |
| `public-decrypt` | Public Decryption | Public decryption pattern |
| `access-control` | Access Control with FHE | FHE.allow and permission management |
| `blind-auction` | Blind Auction | Sealed-bid auction implementation |
| `privacy-quality-inspection` | Quality Inspection | Complete privacy-preserving system |

### What it does

1. **Validates example name** - Checks if example exists
2. **Clones base template** - Copies Hardhat project template
3. **Copies contract file** - Inserts specified Solidity contract
4. **Copies test file** - Adds corresponding test suite
5. **Generates README** - Creates example-specific documentation
6. **Creates metadata** - Generates example-metadata.json
7. **Sets up deployment** - Configures deployment scripts
8. **Produces runnable project** - Complete standalone repository

### Example Output Structure

```
my-fhe-counter/
├── contracts/
│   └── FHECounter.sol
├── test/
│   └── FHECounter.ts
├── deploy/
│   └── deploy.ts
├── package.json
├── hardhat.config.ts
├── README.md
├── example-metadata.json
└── ... other config files
```

### Quick Start with Generated Example

```bash
# Create example
npm run create-example fhe-counter ./my-counter

# Use generated project
cd my-counter
npm install
npm run compile
npm run test
```

## create-fhevm-category.ts

Creates complete projects with multiple related examples from a category.

### Usage

```bash
# Using npm script
npm run create-category <category> <output-path>

# Or directly with ts-node
ts-node scripts/create-fhevm-category.ts <category> <output-path>

# Examples:
npm run create-category basic ./basic-examples
npm run create-category advanced ./advanced-examples
npm run create-category encryption ./encryption-examples
npm run create-category decryption ./decryption-examples
```

### Available Categories

| Category | Examples | Description |
|----------|----------|-------------|
| `basic` | 5 | Fundamental FHE concepts |
| `encryption` | 2 | Encryption mechanisms |
| `decryption` | 3 | Decryption patterns |
| `advanced` | 3 | Complex implementations |

### Basic Category Contents

```
basic-examples/
├── contracts/
│   ├── FHECounter.sol
│   ├── EncryptSingleValue.sol
│   ├── EncryptMultipleValues.sol
│   ├── UserDecryptSingleValue.sol
│   └── UserDecryptMultipleValues.sol
├── test/
│   └── [corresponding test files]
├── deploy/
│   └── deploy.ts (unified deployment)
├── package.json
├── README.md
├── category-metadata.json
└── ... other config files
```

### What it does

1. **Validates category** - Checks if category exists
2. **Creates structure** - Sets up project directories
3. **Copies examples** - Copies all contracts and tests for category
4. **Unified deployment** - Generates single deploy script for all examples
5. **Generates README** - Creates category documentation
6. **Creates metadata** - Generates category-metadata.json
7. **Full configuration** - Copies all config files
8. **Produces learning project** - Complete multi-example repository

### Example Output Structure

```
basic-examples/
├── contracts/
│   ├── FHECounter.sol
│   ├── EncryptSingleValue.sol
│   └── ... (all category examples)
├── test/
│   └── (all test files)
├── deploy/
│   └── deploy.ts (unified)
├── package.json
├── hardhat.config.ts
├── README.md
├── category-metadata.json
└── ... other config files
```

### Quick Start with Generated Category

```bash
# Create category
npm run create-category basic ./basic-examples

# Use generated project
cd basic-examples
npm install
npm run compile
npm run test  # Tests all examples
```

## npm Scripts Summary

```bash
# Generate documentation
npm run generate-docs

# Create standalone example
npm run create-example fhe-counter ./output

# Create category project
npm run create-category basic ./output

# Show help
npm run help:create-example
npm run help:create-category
```

## Configuration Files

### Example Metadata (example-metadata.json)

```json
{
  "name": "fhe-counter",
  "title": "FHE Counter",
  "description": "Simple encrypted counter demonstrating FHE basics",
  "concepts": ["Encrypted Types", "Arithmetic Operations", "Permissions"],
  "category": "Basic",
  "createdAt": "2025-12-23T12:00:00Z"
}
```

### Category Metadata (category-metadata.json)

```json
{
  "name": "basic",
  "title": "Basic FHEVM Examples",
  "description": "Fundamental FHE concepts and operations",
  "exampleCount": 5,
  "examples": ["fhe-counter", "encrypt-single", ...],
  "createdAt": "2025-12-23T12:00:00Z"
}
```

## Development

### Adding New Examples

1. **Create contract file** in `contracts/` directory
2. **Create test file** in `test/` directory
3. **Add to EXAMPLES_MAP** in `create-fhevm-example.ts`
4. **Update CATEGORIES** in `create-fhevm-category.ts` if needed
5. **Test script:**
   ```bash
   npm run create-example my-example ./test-output
   ```

### Adding New Categories

1. **Define category** in `CATEGORIES` object
2. **List example names** that belong to category
3. **Test script:**
   ```bash
   npm run create-category my-category ./test-output
   ```

## Best Practices

### Script Organization

- Keep example metadata in maps
- Use consistent naming conventions
- Document all configuration options
- Include metadata files in output

### Generated Projects

- Copy minimal files needed
- Generate readable documentation
- Create working deploy scripts
- Include all config files

### Documentation

- Use clear, concise descriptions
- Include code examples
- Document prerequisites
- Provide troubleshooting tips

## Troubleshooting

### Script Fails to Find Files

```bash
# Verify file paths
ls -la contracts/
ls -la test/

# Run from project root
cd /path/to/project
npm run create-example ...
```

### Output Directory Exists

```bash
# Script will remove and recreate
# Or use different output path
npm run create-example fhe-counter ./new-output-path
```

### Example Not Found

```bash
# List available examples
npm run create-example
# Shows all available examples
```

### Category Not Found

```bash
# List available categories
npm run create-category
# Shows all available categories
```

## Performance Notes

- Script execution: < 5 seconds for example
- Script execution: < 5 seconds for category
- Documentation generation: < 10 seconds
- Network operations: None (local file operations)

## Security Considerations

- Scripts only perform file operations
- No external API calls
- No network access
- File operations limited to specified paths
- Validates all user input (example/category names)

## Resources

- [Automation Tools Guide](../DEVELOPMENT.md#scripts)
- [API Reference](../docs/api-reference.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Example Implementation](../../contracts/)

---

**These automation tools make it easy to create, manage, and share FHEVM examples!** 🚀
