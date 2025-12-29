/**
 * FHEVM Example Repository Generator
 *
 * Creates standalone, complete FHEVM example repositories by:
 * 1. Cloning the base Hardhat template
 * 2. Inserting a specific Solidity contract
 * 3. Adding corresponding test files
 * 4. Generating documentation and README
 * 5. Configuring deployment scripts
 *
 * Usage:
 *   ts-node scripts/create-fhevm-example.ts <example-name> <output-path>
 *   npm run create-example fhe-counter ./my-fhe-counter
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ExampleMetadata {
  name: string;
  title: string;
  description: string;
  concepts: string[];
  contractFile: string;
  testFile: string;
  category: string;
}

// Example configurations - maps example name to metadata
const EXAMPLES_MAP: Record<string, ExampleMetadata> = {
  "fhe-counter": {
    name: "fhe-counter",
    title: "FHE Counter",
    description: "Simple encrypted counter demonstrating FHE basics",
    concepts: ["Encrypted Types", "Arithmetic Operations", "Permissions"],
    contractFile: "contracts/FHECounter.sol",
    testFile: "test/FHECounter.ts",
    category: "Basic",
  },
  "encrypt-single": {
    name: "encrypt-single",
    title: "Encrypt Single Value",
    description: "Demonstrates FHE encryption mechanism for single values",
    concepts: ["Encryption Binding", "Input Proofs", "External Inputs"],
    contractFile: "contracts/EncryptSingleValue.sol",
    testFile: "test/EncryptSingleValue.ts",
    category: "Encryption",
  },
  "encrypt-multiple": {
    name: "encrypt-multiple",
    title: "Encrypt Multiple Values",
    description: "Handling multiple encrypted values in a single transaction",
    concepts: ["Multiple Handles", "Batch Operations", "Permissions"],
    contractFile: "contracts/EncryptMultipleValues.sol",
    testFile: "test/EncryptMultipleValues.ts",
    category: "Encryption",
  },
  "user-decrypt-single": {
    name: "user-decrypt-single",
    title: "User Decrypt Single Value",
    description: "User decryption with permission requirements",
    concepts: ["User Permissions", "Decryption Rights", "Privacy"],
    contractFile: "contracts/UserDecryptSingleValue.sol",
    testFile: "test/UserDecryptSingleValue.ts",
    category: "Decryption",
  },
  "user-decrypt-multiple": {
    name: "user-decrypt-multiple",
    title: "User Decrypt Multiple Values",
    description: "Decrypting multiple values with granular permissions",
    concepts: ["Multiple Decryption", "Permission Management"],
    contractFile: "contracts/UserDecryptMultipleValues.sol",
    testFile: "test/UserDecryptMultipleValues.ts",
    category: "Decryption",
  },
  "public-decrypt": {
    name: "public-decrypt",
    title: "Public Decryption",
    description: "Single value public decryption pattern",
    concepts: ["Public Decryption", "Relayer Pattern", "Async Decryption"],
    contractFile: "contracts/PublicDecrypt.sol",
    testFile: "test/PublicDecrypt.ts",
    category: "Decryption",
  },
  "access-control": {
    name: "access-control",
    title: "Access Control with FHE",
    description: "FHE.allow, FHE.allowTransient, and permission management",
    concepts: ["Access Control", "Permissions", "Role-Based Access"],
    contractFile: "contracts/AccessControl.sol",
    testFile: "test/AccessControl.ts",
    category: "Advanced",
  },
  "blind-auction": {
    name: "blind-auction",
    title: "Blind Auction",
    description: "Sealed-bid auction with confidential bids using FHE",
    concepts: ["Sealed Bids", "Encrypted Auctions", "Complex Logic"],
    contractFile: "contracts/BlindAuction.sol",
    testFile: "test/BlindAuction.ts",
    category: "Advanced",
  },
  "privacy-quality-inspection": {
    name: "privacy-quality-inspection",
    title: "Privacy-Preserving Quality Inspection",
    description: "Anonymous quality control system using encrypted data",
    concepts: [
      "Encrypted Data",
      "Permissions",
      "Comparisons",
      "Statistics",
    ],
    contractFile: "contracts/PrivacyQualityInspection.sol",
    testFile: "test/PrivacyQualityInspection.ts",
    category: "Advanced",
  },
};

/**
 * Get example metadata by name
 */
function getExampleMetadata(exampleName: string): ExampleMetadata {
  const metadata = EXAMPLES_MAP[exampleName];
  if (!metadata) {
    throw new Error(
      `Example '${exampleName}' not found. Available examples: ${Object.keys(EXAMPLES_MAP).join(", ")}`
    );
  }
  return metadata;
}

/**
 * Copy directory recursively
 */
function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    // Skip node_modules and artifacts
    if (["node_modules", "artifacts", "cache", "coverage"].includes(file)) {
      return;
    }

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

/**
 * Read file content
 */
function readFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Write file content
 */
function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

/**
 * Generate README for the example
 */
function generateReadme(metadata: ExampleMetadata): string {
  let readme = `# ${metadata.title}\n\n`;
  readme += `${metadata.description}\n\n`;

  readme += `## Overview\n\n`;
  readme += `This is a standalone FHEVM example demonstrating:\n\n`;
  metadata.concepts.forEach((concept) => {
    readme += `- ${concept}\n`;
  });
  readme += `\n`;

  readme += `## Installation\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `npm install\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Compilation\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `npm run compile\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Testing\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `npm run test\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Local Deployment\n\n`;
  readme += `1. Start local node:\n`;
  readme += `\`\`\`bash\n`;
  readme += `npx hardhat node\n`;
  readme += `\`\`\`\n\n`;

  readme += `2. Deploy contract:\n`;
  readme += `\`\`\`bash\n`;
  readme += `npx hardhat --network localhost deploy\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Key Concepts\n\n`;
  metadata.concepts.forEach((concept) => {
    readme += `### ${concept}\n\n`;
    readme += `[See contract implementation and tests for details]\n\n`;
  });

  readme += `## Testing\n\n`;
  readme += `The test file demonstrates:\n`;
  readme += `- ✅ Correct usage patterns\n`;
  readme += `- ❌ Common pitfalls and error cases\n`;
  readme += `- Edge case handling\n\n`;

  readme += `## Resources\n\n`;
  readme += `- [FHEVM Documentation](https://docs.zama.ai/fhevm)\n`;
  readme += `- [Solidity Reference](https://docs.soliditylang.org/)\n`;
  readme += `- [Hardhat Documentation](https://hardhat.org/)\n\n`;

  readme += `---\n\n`;
  readme += `**Built with FHEVM by Zama**\n`;

  return readme;
}

/**
 * Generate example metadata JSON
 */
function generateMetadataJson(metadata: ExampleMetadata): string {
  return JSON.stringify(
    {
      name: metadata.name,
      title: metadata.title,
      description: metadata.description,
      concepts: metadata.concepts,
      category: metadata.category,
      createdAt: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Main function
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: ts-node scripts/create-fhevm-example.ts <example-name> <output-path>");
    console.error("\nAvailable examples:");
    Object.keys(EXAMPLES_MAP).forEach((name) => {
      const meta = EXAMPLES_MAP[name];
      console.error(`  ${name.padEnd(25)} - ${meta.title}`);
    });
    process.exit(1);
  }

  const [exampleName, outputPath] = args;

  console.log(`\n🚀 Creating FHEVM example: ${exampleName}`);
  console.log(`📁 Output path: ${outputPath}\n`);

  try {
    // Get example metadata
    const metadata = getExampleMetadata(exampleName);
    console.log(`✅ Example: ${metadata.title}`);

    // Create output directory
    if (fs.existsSync(outputPath)) {
      console.log(`⚠️  Output directory exists, clearing...`);
      fs.rmSync(outputPath, { recursive: true });
    }
    fs.mkdirSync(outputPath, { recursive: true });
    console.log(`✅ Created output directory`);

    // Copy base template
    const baseTemplatePath = path.join(__dirname, "..", "fhevm-hardhat-template");
    if (fs.existsSync(baseTemplatePath)) {
      console.log(`📋 Copying base template...`);
      copyDir(baseTemplatePath, outputPath);
      console.log(`✅ Template copied`);
    } else {
      console.log(
        `⚠️  Base template not found at ${baseTemplatePath}, creating minimal structure...`
      );
      createMinimalStructure(outputPath);
    }

    // Copy contract file
    const sourceContractPath = path.join(__dirname, "..", metadata.contractFile);
    const destContractPath = path.join(outputPath, "contracts", path.basename(metadata.contractFile));

    if (fs.existsSync(sourceContractPath)) {
      console.log(`📄 Copying contract: ${path.basename(metadata.contractFile)}`);
      const contractContent = readFile(sourceContractPath);
      writeFile(destContractPath, contractContent);
      console.log(`✅ Contract copied`);
    }

    // Copy test file
    const sourceTestPath = path.join(__dirname, "..", metadata.testFile);
    const destTestPath = path.join(outputPath, "test", path.basename(metadata.testFile));

    if (fs.existsSync(sourceTestPath)) {
      console.log(`🧪 Copying test: ${path.basename(metadata.testFile)}`);
      const testContent = readFile(sourceTestPath);
      writeFile(destTestPath, testContent);
      console.log(`✅ Test copied`);
    }

    // Generate README
    console.log(`📝 Generating README...`);
    const readme = generateReadme(metadata);
    writeFile(path.join(outputPath, "README.md"), readme);
    console.log(`✅ README generated`);

    // Generate metadata file
    console.log(`📋 Creating metadata file...`);
    const metadataJson = generateMetadataJson(metadata);
    writeFile(path.join(outputPath, "example-metadata.json"), metadataJson);
    console.log(`✅ Metadata file created`);

    console.log(`\n✅ Example repository created successfully!`);
    console.log(`\n📚 Next steps:`);
    console.log(`   1. cd ${outputPath}`);
    console.log(`   2. npm install`);
    console.log(`   3. npm run compile`);
    console.log(`   4. npm run test\n`);
  } catch (error) {
    console.error(`\n❌ Error:`, error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Create minimal project structure if base template not available
 */
function createMinimalStructure(outputPath: string): void {
  const dirs = [
    "contracts",
    "test",
    "deploy",
    "tasks",
  ];

  dirs.forEach((dir) => {
    fs.mkdirSync(path.join(outputPath, dir), { recursive: true });
  });

  // Create minimal package.json
  const packageJson = {
    name: "fhevm-example",
    version: "1.0.0",
    description: "FHEVM Example",
    scripts: {
      compile: "hardhat compile",
      test: "hardhat test",
      deploy: "hardhat deploy",
    },
    devDependencies: {
      "@fhevm/hardhat-plugin": "^0.3.0-1",
      hardhat: "^2.26.0",
      typescript: "^5.8.3",
    },
  };

  writeFile(
    path.join(outputPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Create minimal hardhat.config.ts
  const hardhatConfig = `import "@fhevm/hardhat-plugin";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: { chainId: 31337 },
    localhost: { url: "http://127.0.0.1:8545" },
  },
};

export default config;
`;

  writeFile(path.join(outputPath, "hardhat.config.ts"), hardhatConfig);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { getExampleMetadata, generateReadme, EXAMPLES_MAP };
