/**
 * Documentation Generator for FHEVM Examples
 *
 * This script generates GitBook-compatible documentation from contract
 * and test files with embedded annotations.
 *
 * Usage:
 *   ts-node scripts/generate-docs.ts
 *   npm run generate-docs
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExampleConfig {
  name: string;
  title: string;
  description: string;
  category: string;
  contractPath: string;
  testPath: string;
  concepts: string[];
}

const EXAMPLE_CONFIG: ExampleConfig = {
  name: 'privacy-quality-inspection',
  title: 'Privacy-Preserving Quality Inspection',
  description: 'Anonymous quality control system using encrypted data',
  category: 'Advanced Examples',
  contractPath: 'contracts/PrivacyQualityInspection.sol',
  testPath: 'test/PrivacyQualityInspection.ts',
  concepts: [
    'Encrypted Type Handling (euint8, euint32)',
    'Permission Management (FHE.allowThis, FHE.allow)',
    'Access Control Patterns',
    'Encrypted Comparisons (FHE.lt, FHE.ge)',
    'Conditional Operations (FHE.select)',
    'Privacy-Preserving Statistics'
  ]
};

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const EXAMPLES_DIR = path.join(DOCS_DIR, 'examples');

/**
 * Ensure directory exists
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Read file content
 */
function readFile(filePath: string): string {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Generate markdown documentation for the example
 */
function generateExampleDoc(config: ExampleConfig): string {
  const contractCode = readFile(config.contractPath);
  const testCode = readFile(config.testPath);

  let markdown = `# ${config.title}\n\n`;
  markdown += `> **Category**: ${config.category}\n\n`;
  markdown += `${config.description}\n\n`;

  // Overview section
  markdown += `## Overview\n\n`;
  markdown += `This example demonstrates how to build a privacy-preserving quality inspection system using FHEVM. `;
  markdown += `It showcases advanced FHE concepts including encrypted data storage, permission management, `;
  markdown += `and privacy-preserving statistics calculation.\n\n`;

  // Key Concepts
  markdown += `## Key FHEVM Concepts\n\n`;
  markdown += `This example covers the following FHE concepts:\n\n`;
  config.concepts.forEach(concept => {
    markdown += `- **${concept}**\n`;
  });
  markdown += `\n`;

  // Use Case
  markdown += `## Use Case: Anonymous Quality Control\n\n`;
  markdown += `In manufacturing and regulatory environments, quality inspection data is highly sensitive:\n\n`;
  markdown += `- **Inspector Privacy**: Inspectors need anonymity to report defects honestly\n`;
  markdown += `- **Data Confidentiality**: Quality scores and defect counts are trade secrets\n`;
  markdown += `- **Regulatory Compliance**: GDPR and privacy regulations require data protection\n`;
  markdown += `- **Audit Trail**: Blockchain provides immutable records for compliance\n\n`;

  // Contract Implementation
  markdown += `## Contract Implementation\n\n`;
  markdown += `### Core Structure\n\n`;
  markdown += `The contract uses encrypted types to store sensitive inspection data:\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `struct InspectionData {\n`;
  markdown += `    euint8 qualityScore;        // Encrypted quality score (0-100)\n`;
  markdown += `    euint8 defectCount;         // Encrypted defect count\n`;
  markdown += `    euint32 productBatch;       // Encrypted batch number\n`;
  markdown += `    address inspector;          // Inspector address (public for verification)\n`;
  markdown += `    uint256 timestamp;          // Inspection timestamp\n`;
  markdown += `    bool isVerified;            // Verification status\n`;
  markdown += `    string productCategory;     // Product category (public)\n`;
  markdown += `}\n`;
  markdown += `\`\`\`\n\n`;

  // Key Functions
  markdown += `### Key Functions\n\n`;
  markdown += `#### 1. Inspector Authorization\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `function authorizeInspector(address _inspector) external onlyOwner {\n`;
  markdown += `    require(_inspector != address(0), "Invalid inspector address");\n`;
  markdown += `    require(!authorizedInspectors[_inspector], "Inspector already authorized");\n`;
  markdown += `    authorizedInspectors[_inspector] = true;\n`;
  markdown += `    emit InspectorAuthorized(_inspector, msg.sender);\n`;
  markdown += `}\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `**Purpose**: Allows the contract owner to authorize quality inspectors.\n\n`;
  markdown += `**Access Control**: Only owner can authorize inspectors.\n\n`;

  markdown += `#### 2. Recording Encrypted Inspections\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `function recordInspection(\n`;
  markdown += `    uint8 _qualityScore,\n`;
  markdown += `    uint8 _defectCount,\n`;
  markdown += `    uint32 _productBatch,\n`;
  markdown += `    string memory _productCategory\n`;
  markdown += `) external onlyAuthorizedInspector {\n`;
  markdown += `    // Encrypt sensitive data\n`;
  markdown += `    euint8 encryptedQuality = FHE.asEuint8(_qualityScore);\n`;
  markdown += `    euint8 encryptedDefects = FHE.asEuint8(_defectCount);\n`;
  markdown += `    euint32 encryptedBatch = FHE.asEuint32(_productBatch);\n\n`;
  markdown += `    // Set access permissions - CRITICAL PATTERN\n`;
  markdown += `    FHE.allowThis(encryptedQuality);\n`;
  markdown += `    FHE.allowThis(encryptedDefects);\n`;
  markdown += `    FHE.allowThis(encryptedBatch);\n`;
  markdown += `    FHE.allow(encryptedQuality, msg.sender);\n`;
  markdown += `    FHE.allow(encryptedDefects, msg.sender);\n`;
  markdown += `    FHE.allow(encryptedBatch, msg.sender);\n`;
  markdown += `}\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `**Critical Pattern**: Always call both \`FHE.allowThis()\` and \`FHE.allow(user)\` for encrypted values:\n`;
  markdown += `- \`FHE.allowThis()\`: Grants the contract permission to use the encrypted value\n`;
  markdown += `- \`FHE.allow(user)\`: Grants the user permission to decrypt the value\n\n`;

  markdown += `#### 3. Privacy-Preserving Quality Metrics\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `function calculateCategoryMetrics(string memory _category) external onlyOwner {\n`;
  markdown += `    euint32 totalInspections = FHE.asEuint32(0);\n`;
  markdown += `    euint32 passedCount = FHE.asEuint32(0);\n\n`;
  markdown += `    for (uint256 i = 0; i < inspectionCount; i++) {\n`;
  markdown += `        if (keccak256(bytes(inspections[i].productCategory)) == keccak256(bytes(_category))) {\n`;
  markdown += `            totalInspections = FHE.add(totalInspections, FHE.asEuint32(1));\n\n`;
  markdown += `            // Encrypted comparison\n`;
  markdown += `            ebool passed = FHE.ge(inspections[i].qualityScore, FHE.asEuint8(QUALITY_THRESHOLD));\n`;
  markdown += `            // Conditional selection\n`;
  markdown += `            euint32 passedIncrement = FHE.select(passed, FHE.asEuint32(1), FHE.asEuint32(0));\n`;
  markdown += `            passedCount = FHE.add(passedCount, passedIncrement);\n`;
  markdown += `        }\n`;
  markdown += `    }\n`;
  markdown += `}\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `**Key Techniques**:\n`;
  markdown += `- \`FHE.ge()\`: Encrypted greater-than-or-equal comparison returning \`ebool\`\n`;
  markdown += `- \`FHE.select()\`: Conditional selection based on encrypted boolean\n`;
  markdown += `- All calculations remain encrypted throughout\n\n`;

  // Testing section
  markdown += `## Testing\n\n`;
  markdown += `### Comprehensive Test Suite\n\n`;
  markdown += `The test suite demonstrates both correct usage and common pitfalls:\n\n`;

  markdown += `#### ✅ Correct Pattern: Recording Inspection\n\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += `it("✅ Should record an inspection with encrypted data", async function () {\n`;
  markdown += `    const qualityScore = 85;\n`;
  markdown += `    const defectCount = 2;\n`;
  markdown += `    const productBatch = 1001;\n`;
  markdown += `    const productCategory = "Electronics";\n\n`;
  markdown += `    const tx = await contract\n`;
  markdown += `        .connect(signers.inspector1)\n`;
  markdown += `        .recordInspection(qualityScore, defectCount, productBatch, productCategory);\n`;
  markdown += `    await tx.wait();\n\n`;
  markdown += `    const inspectionCount = await contract.inspectionCount();\n`;
  markdown += `    expect(inspectionCount).to.eq(1);\n`;
  markdown += `});\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `#### ❌ Anti-Pattern: Unauthorized Access\n\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += `it("❌ Should revert when unauthorized user tries to record inspection", async function () {\n`;
  markdown += `    await expect(\n`;
  markdown += `        contract.connect(signers.unauthorized)\n`;
  markdown += `            .recordInspection(85, 2, 1001, "Electronics")\n`;
  markdown += `    ).to.be.revertedWith("Not authorized inspector");\n`;
  markdown += `});\n`;
  markdown += `\`\`\`\n\n`;

  // Common Patterns
  markdown += `## Common Patterns & Best Practices\n\n`;

  markdown += `### ✅ DO: Grant Both Permissions\n\n`;
  markdown += `Always set both contract and user permissions:\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `FHE.allowThis(encryptedValue);        // Contract permission\n`;
  markdown += `FHE.allow(encryptedValue, msg.sender); // User permission\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### ❌ DON'T: Forget allowThis\n\n`;
  markdown += `Incomplete permission setup will cause runtime failures:\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `// This will fail!\n`;
  markdown += `FHE.allow(encryptedValue, msg.sender);\n`;
  markdown += `// Missing: FHE.allowThis(encryptedValue);\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### ✅ DO: Use Encrypted Comparisons\n\n`;
  markdown += `For privacy-preserving logic, use FHE comparison operators:\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `ebool isLowQuality = FHE.lt(encryptedQuality, FHE.asEuint8(THRESHOLD));\n`;
  markdown += `euint8 result = FHE.select(isLowQuality, fallbackValue, normalValue);\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### ❌ DON'T: Use View Functions with Encrypted Returns\n\n`;
  markdown += `View functions cannot return encrypted values for user decryption:\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `// This pattern won't work as expected\n`;
  markdown += `function getQualityScore(uint256 id) external view returns (euint8) {\n`;
  markdown += `    return inspections[id].qualityScore; // User can't decrypt in view context\n`;
  markdown += `}\n`;
  markdown += `\`\`\`\n\n`;

  // Running the example
  markdown += `## Running This Example\n\n`;

  markdown += `### 1. Installation\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm install\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### 2. Compile Contracts\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm run compile\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### 3. Run Tests\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm run test\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### 4. Deploy Locally\n\n`;
  markdown += `Start a local node:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npx hardhat node\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `Deploy the contract:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npx hardhat --network localhost deploy\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### 5. Interact via CLI Tasks\n\n`;

  markdown += `Authorize an inspector:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npx hardhat --network localhost task:authorize \\\n`;
  markdown += `  --inspector 0x70997970C51812dc3A010C7d01b50e0d17dc79C8\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `Record an inspection:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npx hardhat --network localhost task:record \\\n`;
  markdown += `  --quality 85 --defects 2 --batch 1001 --category "Electronics"\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `Get inspection info:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npx hardhat --network localhost task:info --id 0\n`;
  markdown += `\`\`\`\n\n`;

  // Learning Outcomes
  markdown += `## Learning Outcomes\n\n`;
  markdown += `After working through this example, you will understand:\n\n`;
  markdown += `1. **Encrypted Type Management**: How to create and manage euint8, euint32 encrypted types\n`;
  markdown += `2. **Permission System**: The critical importance of FHE.allowThis() and FHE.allow()\n`;
  markdown += `3. **Access Control**: Implementing role-based access with encrypted data\n`;
  markdown += `4. **Encrypted Operations**: Using FHE.add, FHE.sub, FHE.lt, FHE.ge, FHE.select\n`;
  markdown += `5. **Privacy-Preserving Logic**: Building complex workflows without exposing sensitive data\n`;
  markdown += `6. **Testing Strategies**: Writing comprehensive tests for encrypted smart contracts\n\n`;

  // Related Examples
  markdown += `## Related Examples\n\n`;
  markdown += `To deepen your understanding, explore these related examples:\n\n`;
  markdown += `- **FHE Counter**: Basic encrypted counter demonstrating FHE fundamentals\n`;
  markdown += `- **Blind Auction**: Sealed-bid auction with confidential bids\n`;
  markdown += `- **Encrypted ERC20**: Confidential token transfers using FHE\n\n`;

  // Resources
  markdown += `## Additional Resources\n\n`;
  markdown += `- [FHEVM Documentation](https://docs.zama.ai/fhevm)\n`;
  markdown += `- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm)\n`;
  markdown += `- [Zama Community Forum](https://community.zama.ai/)\n`;
  markdown += `- [FHE Fundamentals](https://docs.zama.ai/fhevm/fundamentals)\n\n`;

  markdown += `---\n\n`;
  markdown += `**Next Steps**: Try modifying the contract to add additional encrypted metrics, or implement a decryption flow for authorized users.\n`;

  return markdown;
}

/**
 * Generate SUMMARY.md for GitBook
 */
function generateSummary(config: ExampleConfig): string {
  let markdown = `# Summary\n\n`;
  markdown += `## Introduction\n\n`;
  markdown += `- [Overview](README.md)\n`;
  markdown += `- [Getting Started](getting-started.md)\n\n`;

  markdown += `## FHEVM Fundamentals\n\n`;
  markdown += `- [What is FHEVM?](fundamentals/what-is-fhevm.md)\n`;
  markdown += `- [Encrypted Types](fundamentals/encrypted-types.md)\n`;
  markdown += `- [Permission System](fundamentals/permissions.md)\n`;
  markdown += `- [FHE Operations](fundamentals/operations.md)\n\n`;

  markdown += `## Examples\n\n`;
  markdown += `### ${config.category}\n\n`;
  markdown += `- [${config.title}](examples/${config.name}.md)\n\n`;

  markdown += `## Development\n\n`;
  markdown += `- [Development Guide](DEVELOPMENT.md)\n`;
  markdown += `- [Testing Guide](testing-guide.md)\n`;
  markdown += `- [Deployment Guide](deployment-guide.md)\n\n`;

  markdown += `## Resources\n\n`;
  markdown += `- [API Reference](api-reference.md)\n`;
  markdown += `- [Troubleshooting](troubleshooting.md)\n`;
  markdown += `- [Contributing](CONTRIBUTING.md)\n`;

  return markdown;
}

/**
 * Generate Getting Started guide
 */
function generateGettingStarted(): string {
  let markdown = `# Getting Started\n\n`;
  markdown += `This guide will help you set up your development environment and run your first FHEVM example.\n\n`;

  markdown += `## Prerequisites\n\n`;
  markdown += `- Node.js >= 20\n`;
  markdown += `- npm >= 7.0.0\n`;
  markdown += `- Git\n`;
  markdown += `- Code editor (VS Code recommended)\n\n`;

  markdown += `## Installation\n\n`;
  markdown += `### 1. Clone the Repository\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `git clone https://github.com/ImmanuelHickle/AnonymousQualityTesting.git\n`;
  markdown += `cd AnonymousQualityTesting\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### 2. Install Dependencies\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm install\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### 3. Compile Contracts\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm run compile\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### 4. Run Tests\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm run test\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `## Quick Start\n\n`;

  markdown += `### Local Development\n\n`;
  markdown += `1. Start a local Hardhat node:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npx hardhat node\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `2. In another terminal, deploy the contract:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npx hardhat --network localhost deploy\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `3. Interact with the contract:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npx hardhat --network localhost task:address\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `## Project Structure\n\n`;
  markdown += `\`\`\`\n`;
  markdown += `AnonymousQualityTesting/\n`;
  markdown += `├── contracts/              # Solidity smart contracts\n`;
  markdown += `├── test/                   # Test files\n`;
  markdown += `├── deploy/                 # Deployment scripts\n`;
  markdown += `├── tasks/                  # Hardhat tasks\n`;
  markdown += `├── scripts/                # Automation scripts\n`;
  markdown += `├── docs/                   # Documentation\n`;
  markdown += `├── hardhat.config.ts       # Hardhat configuration\n`;
  markdown += `└── package.json            # Dependencies\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `## Next Steps\n\n`;
  markdown += `- Explore the [Privacy-Preserving Quality Inspection](examples/privacy-quality-inspection.md) example\n`;
  markdown += `- Read the [Development Guide](DEVELOPMENT.md)\n`;
  markdown += `- Learn about [FHEVM Fundamentals](fundamentals/what-is-fhevm.md)\n`;

  return markdown;
}

/**
 * Main execution
 */
function main(): void {
  console.log('🚀 Starting documentation generation...\n');

  try {
    // Ensure directories exist
    ensureDir(DOCS_DIR);
    ensureDir(EXAMPLES_DIR);

    // Generate example documentation
    console.log(`📝 Generating documentation for: ${EXAMPLE_CONFIG.title}`);
    const exampleDoc = generateExampleDoc(EXAMPLE_CONFIG);
    const examplePath = path.join(EXAMPLES_DIR, `${EXAMPLE_CONFIG.name}.md`);
    fs.writeFileSync(examplePath, exampleDoc);
    console.log(`   ✅ Created: ${examplePath}`);

    // Generate SUMMARY.md
    console.log(`\n📋 Generating SUMMARY.md for GitBook`);
    const summary = generateSummary(EXAMPLE_CONFIG);
    const summaryPath = path.join(DOCS_DIR, 'SUMMARY.md');
    fs.writeFileSync(summaryPath, summary);
    console.log(`   ✅ Created: ${summaryPath}`);

    // Generate Getting Started
    console.log(`\n📖 Generating Getting Started guide`);
    const gettingStarted = generateGettingStarted();
    const gettingStartedPath = path.join(DOCS_DIR, 'getting-started.md');
    fs.writeFileSync(gettingStartedPath, gettingStarted);
    console.log(`   ✅ Created: ${gettingStartedPath}`);

    // Copy main README to docs
    console.log(`\n📄 Copying README.md to docs`);
    const readmePath = path.join(__dirname, '..', 'README.md');
    const docsReadmePath = path.join(DOCS_DIR, 'README.md');
    fs.copyFileSync(readmePath, docsReadmePath);
    console.log(`   ✅ Copied: ${docsReadmePath}`);

    console.log(`\n✅ Documentation generation complete!`);
    console.log(`\n📚 Documentation available in: ${DOCS_DIR}`);
    console.log(`\n💡 To view locally, you can use GitBook CLI or any markdown viewer.`);

  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateExampleDoc, generateSummary, generateGettingStarted };
