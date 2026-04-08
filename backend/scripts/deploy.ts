import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const FoodLedger = await ethers.getContractFactory("FoodLedger");
  const foodLedger = await FoodLedger.deploy();
  await foodLedger.waitForDeployment();

  const foodLedgerAddress = await foodLedger.getAddress();
  console.log("FoodLedger deployed to:", foodLedgerAddress);

  const RestaurantMembership = await ethers.getContractFactory(
    "RestaurantMembership",
  );
  const restaurantMembership = await RestaurantMembership.deploy();
  await restaurantMembership.waitForDeployment();

  const membershipAddress = await restaurantMembership.getAddress();
  console.log("RestaurantMembership deployed to:", membershipAddress);

  console.log(
    "\nSave both addresses — your frontend needs them to connect to the contracts.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
