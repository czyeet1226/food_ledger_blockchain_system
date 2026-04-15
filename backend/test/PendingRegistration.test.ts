import { expect } from "chai";
import { ethers } from "hardhat";

describe("FoodLedger - Pending Registration", function () {
  it("should keep other pending registrations after approving one", async function () {
    const [admin, merchant1, merchant2] = await ethers.getSigners();

    const FoodLedger = await ethers.getContractFactory("FoodLedger");
    const contract = await FoodLedger.deploy();
    await contract.waitForDeployment();

    // Register two merchants
    await contract.connect(merchant1).registerAsMerchant("Shukee");
    await contract.connect(merchant2).registerAsMerchant("Jueitien");

    // Check pending list has 2
    let pending = await contract.getPendingMerchantRegistrations();
    console.log("Before approval - pending IDs:", pending.map(Number));
    expect(pending.length).to.equal(2);

    // Approve first merchant (Shukee, regId = 1)
    const shukeeRegId = await contract.merchantRegistrationId(
      merchant1.address,
    );
    console.log("Shukee regId:", Number(shukeeRegId));
    await contract
      .connect(admin)
      .approveMerchantRegistration(Number(shukeeRegId));

    // Check pending list should have 1 remaining
    pending = await contract.getPendingMerchantRegistrations();
    console.log("After approving Shukee - pending IDs:", pending.map(Number));
    expect(pending.length).to.equal(1);

    // The remaining should be Jueitien
    const reg = await contract.getMerchantRegistration(Number(pending[0]));
    console.log("Remaining pending merchant:", reg.name);
    expect(reg.name).to.equal("Jueitien");
  });
});
