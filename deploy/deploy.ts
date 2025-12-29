import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedQualityInspection = await deploy("PrivacyQualityInspection", {
    from: deployer,
    log: true,
  });

  console.log(`PrivacyQualityInspection contract: `, deployedQualityInspection.address);
};
export default func;
func.id = "deploy_privacy_quality_inspection"; // id required to prevent reexecution
func.tags = ["PrivacyQualityInspection"];
