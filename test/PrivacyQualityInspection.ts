import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { PrivacyQualityInspection, PrivacyQualityInspection__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  inspector1: HardhatEthersSigner;
  inspector2: HardhatEthersSigner;
  unauthorized: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PrivacyQualityInspection")) as PrivacyQualityInspection__factory;
  const contract = (await factory.deploy()) as PrivacyQualityInspection;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("PrivacyQualityInspection", function () {
  let signers: Signers;
  let contract: PrivacyQualityInspection;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      inspector1: ethSigners[1],
      inspector2: ethSigners[2],
      unauthorized: ethSigners[3],
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("✅ Should set the deployer as owner", async function () {
      const owner = await contract.owner();
      expect(owner).to.eq(signers.deployer.address);
    });

    it("✅ Should initialize inspection count to 0", async function () {
      const count = await contract.inspectionCount();
      expect(count).to.eq(0);
    });

    it("✅ Should authorize owner as initial inspector", async function () {
      const isAuthorized = await contract.authorizedInspectors(signers.deployer.address);
      expect(isAuthorized).to.be.true;
    });
  });

  describe("Inspector Authorization", function () {
    it("✅ Should authorize a new inspector", async function () {
      const tx = await contract.authorizeInspector(signers.inspector1.address);
      await tx.wait();

      const isAuthorized = await contract.authorizedInspectors(signers.inspector1.address);
      expect(isAuthorized).to.be.true;
    });

    it("❌ Should revert when non-owner attempts to authorize", async function () {
      await expect(
        contract.connect(signers.unauthorized).authorizeInspector(signers.inspector1.address),
      ).to.be.revertedWith("Not authorized");
    });

    it("❌ Should revert when trying to authorize with invalid address", async function () {
      await expect(contract.authorizeInspector(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid inspector address",
      );
    });

    it("❌ Should revert when trying to authorize an already authorized inspector", async function () {
      await contract.authorizeInspector(signers.inspector1.address);
      await expect(contract.authorizeInspector(signers.inspector1.address)).to.be.revertedWith(
        "Inspector already authorized",
      );
    });

    it("✅ Should revoke an authorized inspector", async function () {
      // Authorize first
      await contract.authorizeInspector(signers.inspector1.address);
      let isAuthorized = await contract.authorizedInspectors(signers.inspector1.address);
      expect(isAuthorized).to.be.true;

      // Revoke
      const tx = await contract.revokeInspector(signers.inspector1.address);
      await tx.wait();

      isAuthorized = await contract.authorizedInspectors(signers.inspector1.address);
      expect(isAuthorized).to.be.false;
    });

    it("❌ Should revert when trying to revoke non-authorized inspector", async function () {
      await expect(contract.revokeInspector(signers.inspector1.address)).to.be.revertedWith(
        "Inspector not authorized",
      );
    });
  });

  describe("Inspection Recording", function () {
    beforeEach(async function () {
      // Authorize inspector1
      await contract.authorizeInspector(signers.inspector1.address);
    });

    it("✅ Should record an inspection with encrypted data", async function () {
      const qualityScore = 85;
      const defectCount = 2;
      const productBatch = 1001;
      const productCategory = "Electronics";

      const tx = await contract
        .connect(signers.inspector1)
        .recordInspection(qualityScore, defectCount, productBatch, productCategory);

      await tx.wait();

      const inspectionCount = await contract.inspectionCount();
      expect(inspectionCount).to.eq(1);
    });

    it("❌ Should revert when unauthorized user tries to record inspection", async function () {
      const qualityScore = 85;
      const defectCount = 2;
      const productBatch = 1001;
      const productCategory = "Electronics";

      await expect(
        contract
          .connect(signers.unauthorized)
          .recordInspection(qualityScore, defectCount, productBatch, productCategory),
      ).to.be.revertedWith("Not authorized inspector");
    });

    it("❌ Should revert when quality score exceeds maximum", async function () {
      const qualityScore = 150; // > MAX_QUALITY_SCORE (100)
      const defectCount = 2;
      const productBatch = 1001;
      const productCategory = "Electronics";

      await expect(
        contract
          .connect(signers.inspector1)
          .recordInspection(qualityScore, defectCount, productBatch, productCategory),
      ).to.be.revertedWith("Quality score exceeds maximum");
    });

    it("❌ Should revert when product category is empty", async function () {
      const qualityScore = 85;
      const defectCount = 2;
      const productBatch = 1001;
      const productCategory = "";

      await expect(
        contract
          .connect(signers.inspector1)
          .recordInspection(qualityScore, defectCount, productBatch, productCategory),
      ).to.be.revertedWith("Product category required");
    });

    it("✅ Should get inspection information after recording", async function () {
      const qualityScore = 75;
      const defectCount = 3;
      const productBatch = 1002;
      const productCategory = "Automotive";

      const tx = await contract
        .connect(signers.inspector1)
        .recordInspection(qualityScore, defectCount, productBatch, productCategory);
      await tx.wait();

      const info = await contract.getInspectionInfo(0);

      expect(info.inspector).to.eq(signers.inspector1.address);
      expect(info.productCategory).to.eq(productCategory);
      expect(info.isVerified).to.be.false;
    });
  });

  describe("Inspection Verification", function () {
    beforeEach(async function () {
      // Authorize inspectors
      await contract.authorizeInspector(signers.inspector1.address);
      await contract.authorizeInspector(signers.inspector2.address);

      // Record an inspection
      await contract
        .connect(signers.inspector1)
        .recordInspection(80, 2, 1003, "Pharmaceutical");
    });

    it("✅ Should verify an inspection", async function () {
      const tx = await contract.connect(signers.inspector2).verifyInspection(0);
      await tx.wait();

      const info = await contract.getInspectionInfo(0);
      expect(info.isVerified).to.be.true;
    });

    it("❌ Should revert when trying to verify with invalid ID", async function () {
      await expect(contract.verifyInspection(999)).to.be.revertedWith("Invalid inspection ID");
    });

    it("❌ Should revert when inspector tries to verify own inspection", async function () {
      await expect(contract.connect(signers.inspector1).verifyInspection(0)).to.be.revertedWith(
        "Cannot verify own inspection",
      );
    });

    it("❌ Should revert when trying to verify already verified inspection", async function () {
      // Verify first time
      await contract.connect(signers.inspector2).verifyInspection(0);

      // Try to verify again
      await expect(contract.connect(signers.inspector2).verifyInspection(0)).to.be.revertedWith(
        "Already verified",
      );
    });

    it("❌ Should revert when unauthorized user tries to verify", async function () {
      await expect(contract.connect(signers.unauthorized).verifyInspection(0)).to.be.revertedWith(
        "Not authorized inspector",
      );
    });
  });

  describe("Inspector History", function () {
    beforeEach(async function () {
      // Authorize inspector
      await contract.authorizeInspector(signers.inspector1.address);

      // Record multiple inspections
      for (let i = 0; i < 3; i++) {
        await contract
          .connect(signers.inspector1)
          .recordInspection(75 + i * 5, i + 1, 2000 + i, "Food & Beverage");
      }
    });

    it("✅ Should get inspector history count", async function () {
      const count = await contract.getInspectorHistoryCount(signers.inspector1.address);
      expect(count).to.eq(3);
    });

    it("✅ Should get inspector inspections with pagination", async function () {
      const inspections = await contract.getInspectorInspections(signers.inspector1.address, 0, 2);
      expect(inspections.length).to.eq(2);
      expect(inspections[0]).to.eq(0);
      expect(inspections[1]).to.eq(1);
    });

    it("✅ Should get remaining inspections with pagination", async function () {
      const inspections = await contract.getInspectorInspections(signers.inspector1.address, 2, 10);
      expect(inspections.length).to.eq(1);
      expect(inspections[0]).to.eq(2);
    });

    it("❌ Should revert with offset out of bounds", async function () {
      await expect(
        contract.getInspectorInspections(signers.inspector1.address, 10, 5),
      ).to.be.revertedWith("Offset out of bounds");
    });
  });

  describe("Quality Metrics Calculation", function () {
    beforeEach(async function () {
      // Authorize inspectors
      await contract.authorizeInspector(signers.inspector1.address);
      await contract.authorizeInspector(signers.inspector2.address);

      // Record inspections with different quality scores and categories
      // Electronics: scores 85, 75, 95
      await contract.connect(signers.inspector1).recordInspection(85, 1, 3001, "Electronics");
      await contract.connect(signers.inspector1).recordInspection(75, 2, 3002, "Electronics");
      await contract.connect(signers.inspector2).recordInspection(95, 0, 3003, "Electronics");

      // Automotive: scores 65, 72, 88
      await contract.connect(signers.inspector1).recordInspection(65, 3, 4001, "Automotive");
      await contract.connect(signers.inspector2).recordInspection(72, 2, 4002, "Automotive");
    });

    it("✅ Should calculate category metrics", async function () {
      const tx = await contract.calculateCategoryMetrics("Electronics");
      await tx.wait();

      const hasMetrics = await contract.hasCategoryMetrics("Electronics");
      expect(hasMetrics).to.be.true;
    });

    it("❌ Should revert when non-owner calculates metrics", async function () {
      await expect(
        contract.connect(signers.inspector1).calculateCategoryMetrics("Electronics"),
      ).to.be.revertedWith("Not authorized");
    });

    it("✅ Should handle category without inspections gracefully", async function () {
      // This should not throw, just handle empty category
      const tx = await contract.calculateCategoryMetrics("NonExistentCategory");
      await tx.wait();

      const hasMetrics = await contract.hasCategoryMetrics("NonExistentCategory");
      expect(hasMetrics).to.be.false;
    });
  });

  describe("Contract Pause Functionality", function () {
    it("✅ Should pause contract as owner", async function () {
      const tx = await contract.pauseContract();
      await tx.wait();

      const isPaused = await contract.contractPaused();
      expect(isPaused).to.be.true;
    });

    it("✅ Should unpause contract as owner", async function () {
      await contract.pauseContract();
      const tx = await contract.unpauseContract();
      await tx.wait();

      const isPaused = await contract.contractPaused();
      expect(isPaused).to.be.false;
    });

    it("❌ Should revert pause when non-owner calls", async function () {
      await expect(contract.connect(signers.unauthorized).pauseContract()).to.be.revertedWith(
        "Not authorized",
      );
    });
  });

  describe("Contract Statistics", function () {
    beforeEach(async function () {
      // Authorize and record some inspections
      await contract.authorizeInspector(signers.inspector1.address);

      for (let i = 0; i < 2; i++) {
        await contract
          .connect(signers.inspector1)
          .recordInspection(80 + i * 5, i, 5000 + i, "TestCategory");
      }
    });

    it("✅ Should get contract statistics", async function () {
      const stats = await contract.getContractStats();

      expect(stats.totalInspections).to.eq(2);
      expect(stats.contractOwner).to.eq(signers.deployer.address);
    });
  });

  describe("Access Control", function () {
    it("✅ Owner should be authorized by default", async function () {
      const isAuthorized = await contract.authorizedInspectors(signers.deployer.address);
      expect(isAuthorized).to.be.true;
    });

    it("❌ Unauthorized user should not be able to record inspections", async function () {
      await expect(
        contract
          .connect(signers.unauthorized)
          .recordInspection(80, 2, 1000, "TestCategory"),
      ).to.be.revertedWith("Not authorized inspector");
    });

    it("❌ Unauthorized user should not be able to authorize others", async function () {
      await expect(
        contract
          .connect(signers.unauthorized)
          .authorizeInspector(signers.inspector1.address),
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Data Integrity", function () {
    beforeEach(async function () {
      await contract.authorizeInspector(signers.inspector1.address);
    });

    it("✅ Should generate consistent hash for inspection data", async function () {
      const qualityScore = 85;
      const defectCount = 2;
      const productBatch = 6001;
      const productCategory = "Consumer Electronics";

      const tx = await contract
        .connect(signers.inspector1)
        .recordInspection(qualityScore, defectCount, productBatch, productCategory);
      await tx.wait();

      const info = await contract.getInspectionInfo(0);
      expect(info.inspectionHash).to.not.eq(ethers.ZeroHash);
    });

    it("✅ Should maintain consistent timestamp for inspection", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const blockTimestamp = block?.timestamp || 0;

      const tx = await contract
        .connect(signers.inspector1)
        .recordInspection(80, 1, 6002, "TestCategory");
      await tx.wait();

      const info = await contract.getInspectionInfo(0);
      expect(info.timestamp).to.be.closeTo(blockTimestamp, 1); // Allow 1 second variance
    });
  });
});
