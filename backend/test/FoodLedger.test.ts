import { expect } from "chai";
import { ethers } from "hardhat";

describe("FoodLedger", function () {
  it("Should deploy successfully", async function () {
    const FoodLedger = await ethers.getContractFactory("FoodLedger");
    const foodLedger = await FoodLedger.deploy();
    await foodLedger.waitForDeployment();

    expect(await foodLedger.getAddress()).to.be.properAddress;
  });
});
