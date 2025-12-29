import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the PrivacyQualityInspection contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the contract
 *
 *   npx hardhat --network localhost task:authorize --inspector 0xInspectorAddress
 *   npx hardhat --network localhost task:record --quality 85 --defects 2 --batch 1001 --category "Electronics"
 *   npx hardhat --network localhost task:inspection-count
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the PrivacyQualityInspection contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the contract
 *
 *   npx hardhat --network sepolia task:authorize --inspector 0xInspectorAddress
 *   npx hardhat --network sepolia task:record --quality 85 --defects 2 --batch 1001 --category "Electronics"
 *   npx hardhat --network sepolia task:inspection-count
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the PrivacyQualityInspection address").setAction(
  async function (_taskArguments: TaskArguments, hre) {
    const { deployments } = hre;

    const contract = await deployments.get("PrivacyQualityInspection");

    console.log("PrivacyQualityInspection address is " + contract.address);
  },
);

/**
 * Example:
 *   - npx hardhat --network localhost task:inspection-count
 *   - npx hardhat --network sepolia task:inspection-count
 */
task("task:inspection-count", "Gets the total inspection count")
  .addOptionalParam("address", "Optionally specify the contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyQualityInspection");
    console.log(`PrivacyQualityInspection: ${contractDeployment.address}`);

    const contract = await ethers.getContractAt("PrivacyQualityInspection", contractDeployment.address);

    const count = await contract.inspectionCount();
    console.log(`Total inspections: ${count}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:authorize --inspector 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
 *   - npx hardhat --network sepolia task:authorize --inspector 0xInspectorAddress
 */
task("task:authorize", "Authorizes an inspector")
  .addOptionalParam("address", "Optionally specify the contract address")
  .addParam("inspector", "The address of the inspector to authorize")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const inspectorAddress = taskArguments.inspector;
    if (!ethers.isAddress(inspectorAddress)) {
      throw new Error(`Invalid inspector address: ${inspectorAddress}`);
    }

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyQualityInspection");
    console.log(`PrivacyQualityInspection: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("PrivacyQualityInspection", contractDeployment.address);

    const tx = await contract.connect(signers[0]).authorizeInspector(inspectorAddress);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Inspector ${inspectorAddress} authorized successfully!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:revoke --inspector 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
 *   - npx hardhat --network sepolia task:revoke --inspector 0xInspectorAddress
 */
task("task:revoke", "Revokes an inspector's authorization")
  .addOptionalParam("address", "Optionally specify the contract address")
  .addParam("inspector", "The address of the inspector to revoke")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const inspectorAddress = taskArguments.inspector;
    if (!ethers.isAddress(inspectorAddress)) {
      throw new Error(`Invalid inspector address: ${inspectorAddress}`);
    }

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyQualityInspection");
    console.log(`PrivacyQualityInspection: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("PrivacyQualityInspection", contractDeployment.address);

    const tx = await contract.connect(signers[0]).revokeInspector(inspectorAddress);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Inspector ${inspectorAddress} revoked successfully!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:record --quality 85 --defects 2 --batch 1001 --category "Electronics"
 *   - npx hardhat --network sepolia task:record --quality 85 --defects 2 --batch 1001 --category "Electronics"
 */
task("task:record", "Records an inspection")
  .addOptionalParam("address", "Optionally specify the contract address")
  .addParam("quality", "The quality score (0-100)")
  .addParam("defects", "The number of defects")
  .addParam("batch", "The product batch number")
  .addParam("category", "The product category")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const quality = parseInt(taskArguments.quality);
    const defects = parseInt(taskArguments.defects);
    const batch = parseInt(taskArguments.batch);
    const category = taskArguments.category;

    if (!Number.isInteger(quality) || quality < 0 || quality > 100) {
      throw new Error(`Invalid quality score: ${taskArguments.quality}`);
    }
    if (!Number.isInteger(defects)) {
      throw new Error(`Invalid defects count: ${taskArguments.defects}`);
    }
    if (!Number.isInteger(batch)) {
      throw new Error(`Invalid batch number: ${taskArguments.batch}`);
    }

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyQualityInspection");
    console.log(`PrivacyQualityInspection: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("PrivacyQualityInspection", contractDeployment.address);

    const tx = await contract.connect(signers[0]).recordInspection(quality, defects, batch, category);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Inspection recorded successfully!`);
    console.log(`Quality: ${quality}, Defects: ${defects}, Batch: ${batch}, Category: ${category}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:verify --id 0
 *   - npx hardhat --network sepolia task:verify --id 0
 */
task("task:verify", "Verifies an inspection")
  .addOptionalParam("address", "Optionally specify the contract address")
  .addParam("id", "The inspection ID to verify")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const inspectionId = parseInt(taskArguments.id);
    if (!Number.isInteger(inspectionId) || inspectionId < 0) {
      throw new Error(`Invalid inspection ID: ${taskArguments.id}`);
    }

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyQualityInspection");
    console.log(`PrivacyQualityInspection: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("PrivacyQualityInspection", contractDeployment.address);

    const tx = await contract.connect(signers[0]).verifyInspection(inspectionId);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Inspection ${inspectionId} verified successfully!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:info --id 0
 *   - npx hardhat --network sepolia task:info --id 0
 */
task("task:info", "Gets inspection information")
  .addOptionalParam("address", "Optionally specify the contract address")
  .addParam("id", "The inspection ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const inspectionId = parseInt(taskArguments.id);
    if (!Number.isInteger(inspectionId) || inspectionId < 0) {
      throw new Error(`Invalid inspection ID: ${taskArguments.id}`);
    }

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyQualityInspection");
    console.log(`PrivacyQualityInspection: ${contractDeployment.address}`);

    const contract = await ethers.getContractAt("PrivacyQualityInspection", contractDeployment.address);

    const info = await contract.getInspectionInfo(inspectionId);

    console.log(`\nInspection #${inspectionId}:`);
    console.log(`Inspector: ${info.inspector}`);
    console.log(`Timestamp: ${new Date(Number(info.timestamp) * 1000).toLocaleString()}`);
    console.log(`Verified: ${info.isVerified}`);
    console.log(`Category: ${info.productCategory}`);
    console.log(`Hash: ${info.inspectionHash}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:calculate-metrics --category "Electronics"
 *   - npx hardhat --network sepolia task:calculate-metrics --category "Electronics"
 */
task("task:calculate-metrics", "Calculates quality metrics for a category")
  .addOptionalParam("address", "Optionally specify the contract address")
  .addParam("category", "The product category")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const category = taskArguments.category;

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivacyQualityInspection");
    console.log(`PrivacyQualityInspection: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("PrivacyQualityInspection", contractDeployment.address);

    const tx = await contract.connect(signers[0]).calculateCategoryMetrics(category);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Metrics calculated successfully for category: ${category}`);
  });
