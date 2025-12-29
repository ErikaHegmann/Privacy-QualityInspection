/**
 * FHEVM Category Project Generator
 *
 * Creates complete projects with multiple examples from a category:
 * 1. Basic - Fundamental FHE concepts
 * 2. Encryption - Data encryption examples
 * 3. Decryption - User and public decryption
 * 4. Advanced - Complex patterns (auctions, access control, etc.)
 *
 * Usage:
 *   ts-node scripts/create-fhevm-category.ts <category> <output-path>
 *   npm run create-category basic ./my-basic-examples
 */

import * as fs from "fs";
import * as path from "path";

interface CategoryConfig {
  name: string;
  title: string;
  description: string;
  examples: string[];
}

// Category configurations
const CATEGORIES: Record<string, CategoryConfig> = {
  basic: {
    name: "basic",
    title: "Basic FHEVM Examples",
    description: "Fundamental FHE concepts and operations",
    examples: [
      "fhe-counter",
      "encrypt-single",
      "encrypt-multiple",
      "user-decrypt-single",
      "user-decrypt-multiple",
    ],
  },
  encryption: {
    name: "encryption",
    title: "Encryption Patterns",
    description: "Various encryption mechanisms and patterns",
    examples: ["encrypt-single", "encrypt-multiple"],
  },
  decryption: {
    name: "decryption",
    title: "Decryption Patterns",
    description: "User and public decryption implementations",
    examples: ["user-decrypt-single", "user-decrypt-multiple", "public-decrypt"],
  },
  advanced: {
    name: "advanced",
    title: "Advanced FHEVM Patterns",
    description: "Complex FHE implementations and use cases",
    examples: ["access-control", "blind-auction", "privacy-quality-inspection"],
  },
};

/**
 * Get category configuration by name
 */
function getCategoryConfig(categoryName: string): CategoryConfig {
  const config = CATEGORIES[categoryName];
  if (!config) {
    throw new Error(
      `Category '${categoryName}' not found. Available: ${Object.keys(CATEGORIES).join(", ")}`
    );
  }
  return config;
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copy file
 */
function copyFile(src: string, dest: string): void {
  ensureDir(path.dirname(dest));
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Write file
 */
function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

/**
 * Generate category README
 */
function generateCategoryReadme(config: CategoryConfig): string {
  let readme = `# ${config.title}\n\n`;
  readme += `${config.description}\n\n`;

  readme += `## Included Examples\n\n`;
  config.examples.forEach((example) => {
    readme += `- ${example}\n`;
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

  readme += `## Structure\n\n`;
  readme += `\`\`\`\n`;
  readme += `contracts/\n`;
  config.examples.forEach((example) => {
    readme += `  └── ${example.charAt(0).toUpperCase() + example.slice(1).replace(/-/g, "")}.sol\n`;
  });
  readme += `test/\n`;
  config.examples.forEach((example) => {
    readme += `  └── ${example.charAt(0).toUpperCase() + example.slice(1).replace(/-/g, "")}.ts\n`;
  });
  readme += `\`\`\`\n\n`;

  readme += `## Learning Path\n\n`;
  config.examples.forEach((example, idx) => {
    readme += `${idx + 1}. **${example}** - See corresponding contract and test files\n`;
  });
  readme += `\n`;

  readme += `## Running Individual Examples\n\n`;
  readme += `All examples in this category can be run independently:\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `# Compile all contracts\n`;
  readme += `npm run compile\n\n`;
  readme += `# Run all tests\n`;
  readme += `npm run test\n\n`;
  readme += `# Run specific test\n`;
  readme += `npx hardhat test test/ExampleName.ts\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Resources\n\n`;
  readme += `- [FHEVM Documentation](https://docs.zama.ai/fhevm)\n`;
  readme += `- [Solidity Reference](https://docs.soliditylang.org/)\n`;
  readme += `- [Hardhat Documentation](https://hardhat.org/)\n\n`;

  readme += `---\n\n`;
  readme += `**Built with FHEVM by Zama**\n`;

  return readme;
}

/**
 * Generate unified deployment script
 */
function generateDeployScript(examples: string[]): string {
  let script = `import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

`;

  examples.forEach((example) => {
    const contractName = example
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    script += `  // Deploy ${contractName}
  const deployed${contractName} = await deploy("${contractName}", {
    from: deployer,
    log: true,
  });
  console.log(\`${contractName} contract: \`, deployed${contractName}.address);

`;
  });

  script += `};
export default func;
func.id = "deploy_category_examples";
func.tags = ["examples"];
`;

  return script;
}

/**
 * Generate category metadata JSON
 */
function generateMetadataJson(config: CategoryConfig): string {
  return JSON.stringify(
    {
      name: config.name,
      title: config.title,
      description: config.description,
      exampleCount: config.examples.length,
      examples: config.examples,
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
    console.error("Usage: ts-node scripts/create-fhevm-category.ts <category> <output-path>");
    console.error("\nAvailable categories:");
    Object.entries(CATEGORIES).forEach(([name, config]) => {
      console.error(`  ${name.padEnd(15)} - ${config.title} (${config.examples.length} examples)`);
    });
    process.exit(1);
  }

  const [categoryName, outputPath] = args;

  console.log(`\n🚀 Creating FHEVM category project: ${categoryName}`);
  console.log(`📁 Output path: ${outputPath}\n`);

  try {
    // Get category configuration
    const config = getCategoryConfig(categoryName);
    console.log(`✅ Category: ${config.title}`);
    console.log(`📚 Examples: ${config.examples.length}`);

    // Create output directory
    if (fs.existsSync(outputPath)) {
      console.log(`⚠️  Output directory exists, clearing...`);
      fs.rmSync(outputPath, { recursive: true });
    }
    fs.mkdirSync(outputPath, { recursive: true });
    console.log(`✅ Created output directory`);

    // Create directory structure
    console.log(`📂 Creating directory structure...`);
    ensureDir(path.join(outputPath, "contracts"));
    ensureDir(path.join(outputPath, "test"));
    ensureDir(path.join(outputPath, "deploy"));
    ensureDir(path.join(outputPath, "tasks"));
    console.log(`✅ Directory structure created`);

    // Copy contract and test files for each example
    console.log(`📋 Copying example files...`);
    config.examples.forEach((example) => {
      const contractName = example
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

      // Copy contract
      const srcContract = path.join(
        __dirname,
        "..",
        `contracts/${contractName}.sol`
      );
      const destContract = path.join(outputPath, `contracts/${contractName}.sol`);
      copyFile(srcContract, destContract);

      // Copy test
      const srcTest = path.join(__dirname, "..", `test/${contractName}.ts`);
      const destTest = path.join(outputPath, `test/${contractName}.ts`);
      copyFile(srcTest, destTest);

      console.log(`   ✅ ${contractName}`);
    });

    // Copy configuration files from base template or create new ones
    console.log(`⚙️  Copying configuration files...`);
    const configFiles = [
      "package.json",
      "hardhat.config.ts",
      "tsconfig.json",
      ".eslintrc.yml",
      ".prettierrc.yml",
      ".gitignore",
    ];

    configFiles.forEach((file) => {
      const src = path.join(__dirname, "..", file);
      const dest = path.join(outputPath, file);
      copyFile(src, dest);
    });
    console.log(`✅ Configuration files copied`);

    // Generate README
    console.log(`📝 Generating README...`);
    const readme = generateCategoryReadme(config);
    writeFile(path.join(outputPath, "README.md"), readme);
    console.log(`✅ README generated`);

    // Generate unified deployment script
    console.log(`🚀 Generating deployment script...`);
    const deployScript = generateDeployScript(config.examples);
    writeFile(path.join(outputPath, "deploy/deploy.ts"), deployScript);
    console.log(`✅ Deployment script generated`);

    // Generate metadata file
    console.log(`📋 Creating metadata file...`);
    const metadata = generateMetadataJson(config);
    writeFile(path.join(outputPath, "category-metadata.json"), metadata);
    console.log(`✅ Metadata file created`);

    console.log(`\n✅ Category project created successfully!`);
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

// Run if called directly
if (require.main === module) {
  main();
}

export { getCategoryConfig, generateCategoryReadme, CATEGORIES };
