import { ethers } from "hardhat";

async function main() {
  const FoodLedger = await ethers.getContractFactory("FoodLedger");
  const foodLedger = await FoodLedger.deploy();
  await foodLedger.waitForDeployment();

  console.log("FoodLedger deployed to:", await foodLedger.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
